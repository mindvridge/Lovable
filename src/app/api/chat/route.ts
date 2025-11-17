import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { Attachment } from "@/types";

const systemPrompt = `You are an expert React developer specialized in creating modern, responsive web applications. Your task is to generate high-quality React code based on user requests.

IMPORTANT RULES:
1. Generate ONLY a single React functional component named "App"
2. Use TypeScript syntax
3. Use Tailwind CSS classes for ALL styling (no inline styles or CSS modules)
4. Make all designs responsive and mobile-first
5. Follow accessibility best practices (ARIA labels, semantic HTML)
6. Include realistic placeholder content (not "Lorem ipsum")
7. Use modern React patterns (hooks, functional components)
8. Output ONLY the component code, wrapped in a code block
9. The component should be self-contained and render immediately

IMAGE GENERATION:
If the user requests image generation (logo, banner, hero image, etc.), respond with:
1. A brief description of what image will be generated
2. A special marker: [GENERATE_IMAGE: detailed prompt for DALL-E here]
3. Then provide the React code that will use the generated image

The image URL will be replaced with the actual generated image URL.

RESPONSE FORMAT:
Provide a brief explanation (2-3 sentences) of what you're creating, then output the code in a \`\`\`jsx code block.

Example output format:
I'll create a modern landing page with a hero section and feature cards.

\`\`\`jsx
function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Your component code here */}
    </div>
  );
}
\`\`\`

Remember: Generate clean, production-ready code that demonstrates best practices.`;

async function generateImage(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const openai = new OpenAI({ apiKey });
    const enhancedPrompt = `Professional, high-quality ${prompt}. Clean design, modern aesthetic, suitable for web use.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    if (!response.data || response.data.length === 0) {
      return null;
    }

    return response.data[0]?.url || null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, attachments } = await request.json();

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          message:
            "API key not configured. Please add your ANTHROPIC_API_KEY to .env.local",
          code: null,
        },
        { status: 500 }
      );
    }

    // Build the message content with attachments
    let userContent = messages[messages.length - 1].content;

    // Add context about attachments if present
    if (attachments && attachments.length > 0) {
      const attachmentInfo = attachments
        .map((att: Attachment) => {
          if (att.type === "url") {
            return `Reference URL: ${att.url}`;
          } else if (att.type === "image") {
            return `[User attached an image for design reference]`;
          }
          return "";
        })
        .join("\n");

      userContent = `${attachmentInfo}\n\nUser request: ${userContent}`;
    }

    const anthropic = new Anthropic({
      apiKey,
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        ...messages.slice(0, -1).map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    // Extract the text content
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in response");
    }

    let fullResponse = textContent.text;

    // Check for image generation markers and generate images
    const imageMarkerRegex = /\[GENERATE_IMAGE:\s*([^\]]+)\]/g;
    const imageMarkers = [...fullResponse.matchAll(imageMarkerRegex)];
    const generatedImages: { marker: string; url: string }[] = [];

    for (const match of imageMarkers) {
      const imagePrompt = match[1].trim();
      const imageUrl = await generateImage(imagePrompt);

      if (imageUrl) {
        generatedImages.push({
          marker: match[0],
          url: imageUrl,
        });

        // Replace marker in the response
        fullResponse = fullResponse.replace(
          match[0],
          `Generated image: ${imageUrl}`
        );
      }
    }

    // Extract code from the response
    let code = null;
    const codeMatch = fullResponse.match(/```(?:jsx|javascript|tsx|typescript)?\n([\s\S]*?)```/);

    if (codeMatch) {
      code = codeMatch[1].trim();

      // Replace placeholder image URLs with generated ones
      for (const img of generatedImages) {
        // Replace common placeholder patterns with the generated image
        code = code.replace(
          /https:\/\/via\.placeholder\.com\/[^\s"']+/g,
          img.url
        );
        code = code.replace(
          /https:\/\/placehold\.co\/[^\s"']+/g,
          img.url
        );
        code = code.replace(
          /\/placeholder\.(jpg|png|svg)/g,
          img.url
        );
      }
    }

    return NextResponse.json({
      message: fullResponse,
      code,
      generatedImages: generatedImages.map((img) => img.url),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        message: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
        code: null,
      },
      { status: 500 }
    );
  }
}
