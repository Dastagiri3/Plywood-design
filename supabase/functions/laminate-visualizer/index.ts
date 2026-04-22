import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const dataUrlPattern = /^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=\s]+$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const roomImage = typeof body?.roomImage === "string" ? body.roomImage : "";
    const laminateReferenceImage = typeof body?.laminateReferenceImage === "string" ? body.laminateReferenceImage : "";
    const laminateName = typeof body?.laminateName === "string" ? body.laminateName.trim() : "";
    const notes = typeof body?.notes === "string" ? body.notes.trim() : "";

    if (!roomImage || !dataUrlPattern.test(roomImage)) {
      return json({ error: "A room image is required." }, 400);
    }

    if (!laminateReferenceImage || !dataUrlPattern.test(laminateReferenceImage)) {
      return json({ error: "A laminate reference image is required." }, 400);
    }

    if (!laminateName) {
      return json({ error: "Laminate name is required." }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return json({ error: "AI access is not configured." }, 500);
    }

    const prompt = [
      `Create a photorealistic interior design edit using the provided room photo and laminate reference.`,
      `Apply the laminate finish named "${laminateName}" onto the most plausible cabinetry, wardrobe shutters, paneling, or wood-facing surfaces in the room.`,
      `Preserve the room layout, architecture, perspective, lighting, shadows, reflections, hardware, and all non-target materials.`,
      `Do not add new furniture or change the camera angle.`,
      `Keep it realistic for a hardware and plywood showroom preview.`,
      notes ? `Additional instruction: ${notes}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const aiResponse = await fetch(AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: roomImage } },
              { type: "image_url", image_url: { url: laminateReferenceImage } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return json({ error: "Too many preview requests right now. Please try again shortly." }, 429);
      }

      if (aiResponse.status === 402) {
        return json({ error: "AI usage credits need attention before generating more previews." }, 402);
      }

      const errorText = await aiResponse.text();
      console.error("laminate-visualizer ai error", aiResponse.status, errorText);
      return json({ error: "The preview could not be generated." }, 500);
    }

    const payload = await aiResponse.json();
    const imageUrl = payload?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl || typeof imageUrl !== "string") {
      console.error("laminate-visualizer missing image", JSON.stringify(payload));
      return json({ error: "The preview could not be generated." }, 500);
    }

    return json({ imageUrl });
  } catch (error) {
    console.error("laminate-visualizer error", error);
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});