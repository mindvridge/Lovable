import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

interface FirecrawlResponse {
  success: boolean;
  data: {
    content: string;
    markdown: string;
    metadata: {
      title?: string;
      description?: string;
      ogImage?: string;
    };
    html?: string;
  };
}

async function scrapeWithFirecrawl(url: string): Promise<FirecrawlResponse | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.firecrawl.dev/v0/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        pageOptions: {
          onlyMainContent: true,
          includeHtml: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Firecrawl API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Firecrawl error:", error);
    return null;
  }
}

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

    // Try to scrape with Firecrawl first
    const firecrawlData = await scrapeWithFirecrawl(url);

    const anthropic = new Anthropic({ apiKey });

    let analysisPrompt: string;

    if (firecrawlData && firecrawlData.success) {
      // Use actual scraped content for analysis
      analysisPrompt = `Analyze this website content and extract design patterns:

URL: ${url}
Title: ${firecrawlData.data.metadata.title || "Unknown"}
Description: ${firecrawlData.data.metadata.description || "None"}

HTML Content (truncated):
${firecrawlData.data.html?.substring(0, 5000) || "Not available"}

Markdown Content:
${firecrawlData.data.markdown?.substring(0, 3000) || firecrawlData.data.content.substring(0, 3000)}

Based on this actual website content, provide:
1. Page structure and layout analysis
2. Color scheme (extract from HTML/CSS if visible, or infer from content)
3. Components and sections identified
4. Font recommendations based on the site's style
5. Key design patterns

Respond in JSON format:
{
  "url": "${url}",
  "title": "${firecrawlData.data.metadata.title || ""}",
  "description": "analysis of the website",
  "structure": "detailed layout description based on content",
  "colors": ["#hex1", "#hex2", ...],
  "fonts": ["font1", "font2"],
  "components": ["component1", "component2", ...],
  "designPatterns": ["pattern1", "pattern2", ...],
  "actualContent": "summary of main content found"
}`;
    } else {
      // Fallback to AI-based inference
      analysisPrompt = `I want to create a website inspired by ${url}. Based on the URL and common patterns for such websites, suggest:

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
  "designPatterns": ["pattern1", "pattern2", ...],
  "note": "Analysis based on URL pattern (Firecrawl API not configured)"
}`;
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: analysisPrompt,
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

    return NextResponse.json({
      ...scrapingResult,
      scrapedWithFirecrawl: firecrawlData !== null && firecrawlData.success,
    });
  } catch (error) {
    console.error("Web scraping error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Web scraping failed" },
      { status: 500 }
    );
  }
}
