import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // For now, we'll use Claude to analyze the URL conceptually
    // In production, you'd integrate Firecrawl API or use Puppeteer
    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `I want to create a website inspired by ${url}. Based on the URL and common patterns for such websites, suggest:

1. Likely page structure and layout
2. Common color schemes for this type of site
3. Typical components and sections
4. Font recommendations
5. Key design patterns to implement

Respond in JSON format:
{
  "url": "${url}",
  "title": "suggested title",
  "description": "brief description of the website type",
  "structure": "layout description",
  "colors": ["#hex1", "#hex2", ...],
  "fonts": ["font1", "font2"],
  "components": ["component1", "component2", ...],
  "designPatterns": ["pattern1", "pattern2", ...]
}`,
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
      throw new Error("Could not parse scraping result");
    }

    const scrapingResult = JSON.parse(jsonMatch[0]);

    return NextResponse.json(scrapingResult);
  } catch (error) {
    console.error("Web scraping error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Web scraping failed" },
      { status: 500 }
    );
  }
}
