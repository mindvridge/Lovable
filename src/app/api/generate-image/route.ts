import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const { prompt, size = "1024x1024", quality = "standard" } = await request.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    // Enhance the prompt for better results
    const enhancedPrompt = `Professional, high-quality ${prompt}. Clean design, modern aesthetic, suitable for web use.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: size as "1024x1024" | "1792x1024" | "1024x1792",
      quality: quality as "standard" | "hd",
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("No image data in response");
    }

    const imageUrl = response.data[0]?.url;

    if (!imageUrl) {
      throw new Error("No image URL in response");
    }

    return NextResponse.json({
      url: imageUrl,
      revisedPrompt: response.data[0]?.revised_prompt,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image generation failed" },
      { status: 500 }
    );
  }
}
