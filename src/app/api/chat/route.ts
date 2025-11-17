import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
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

    const fullResponse = textContent.text;

    // Extract code from the response
    const codeMatch = fullResponse.match(/```(?:jsx|javascript|tsx|typescript)?\n([\s\S]*?)```/);
    let code = null;

    if (codeMatch) {
      code = codeMatch[1].trim();
    }

    return NextResponse.json({
      message: fullResponse,
      code,
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
