import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from "https://esm.sh/@huggingface/inference@2.3.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, sketchBase64 } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hfToken = Deno.env.get("HUGGING_FACE_ACCESS_TOKEN");
    if (!hfToken) {
      console.error("HUGGING_FACE_ACCESS_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Initializing Hugging Face client...");
    const hf = new HfInference(hfToken);

    // Enhance the prompt to work better with sketch input
    const enhancedPrompt = `${prompt}, highly detailed, professional quality, vibrant colors, digital art`;
    
    console.log("Generating image with prompt:", enhancedPrompt);

    const image = await hf.textToImage({
      inputs: enhancedPrompt,
      model: "black-forest-labs/FLUX.1-schnell",
    });

    console.log("Image generated successfully");

    // Convert the blob to a base64 string
    const arrayBuffer = await image.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binary);

    return new Response(
      JSON.stringify({ image: `data:image/png;base64,${base64}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate image", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
