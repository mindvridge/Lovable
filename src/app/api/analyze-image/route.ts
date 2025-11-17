import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, mimeType = "image/png" } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Anthropic API key not configured" },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
              },
            },
            {
              type: "text",
              text: `Analyze this design image and extract:
1. Primary colors (as hex codes)
2. Layout structure (e.g., single column, grid, sidebar)
3. Visual style (e.g., modern, minimal, corporate, playful)
4. Key UI components present (e.g., navbar, hero section, cards)
5. Typography style suggestions

Respond in JSON format:
{
  "colors": ["#hex1", "#hex2", ...],
  "layout": "description",
  "style": "description",
  "components": ["component1", "component2", ...],
  "typography": "description",
  "suggestions": ["suggestion1", "suggestion2", ...]
}`,
            },
          ],
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in response");
    }

    // Parse the JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse analysis result");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Image analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image analysis failed" },
      { status: 500 }
    );
  }
}
