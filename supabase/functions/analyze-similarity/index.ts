import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { sketchBase64, generatedImageBase64 } = await req.json();

    if (!sketchBase64 || !generatedImageBase64) {
      return new Response(
        JSON.stringify({ error: "Both sketch and generated image are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are an image similarity analyst. Compare the first image (original sketch) with the second image (AI-generated result). Rate the accuracy on these criteria:

1. **Composition Match** (0-100): How well does the generated image preserve the layout, positioning, and arrangement of elements from the sketch?
2. **Shape Accuracy** (0-100): How accurately are the shapes and forms from the sketch reproduced?
3. **Detail Preservation** (0-100): How well are fine details and specific elements from the sketch maintained?
4. **Overall Similarity** (0-100): Overall accuracy score.

Respond ONLY with valid JSON in this exact format:
{"composition": <number>, "shape": <number>, "detail": <number>, "overall": <number>, "summary": "<one sentence describing the match quality>"}`
              },
              {
                type: "image_url",
                image_url: { url: sketchBase64 }
              },
              {
                type: "image_url",
                image_url: { url: generatedImageBase64 }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to analyze similarity" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log("Similarity analysis raw:", content);

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: "Failed to parse similarity score" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const scores = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(scores),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing similarity:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze similarity" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
