import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncSession = async (sess: Session | null) => {
      setSession(sess);
      setUser(sess?.user ?? null);

      if (!sess?.user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: sess.user.id,
        _role: "admin",
      });

      setIsAdmin(!error && Boolean(data));
      setLoading(false);
    };

    // Set listener BEFORE getSession to avoid races
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setTimeout(() => {
        void syncSession(sess);
      }, 0);
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      void syncSession(sess);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider value={{ user, session, isAdmin, loading, signOut }}>{children}</Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);