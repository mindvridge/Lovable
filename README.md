# AI Website Builder

A Lovable.ai-style platform for building websites through natural language conversations with AI. Describe what you want to build, and watch as AI generates React code in real-time.

## Features

- **AI-Powered Code Generation**: Chat with AI to generate React + TypeScript + Tailwind CSS code
- **Real-time Preview**: See your website come to life instantly as code is generated
- **Image Generation**: Create images with DALL-E 3 by describing what you need
- **Design Analysis**: Upload reference images for AI to analyze colors, layout, and style
- **Website Analysis**: Reference existing websites to inspire your design
- **Code Editor**: Monaco Editor integration for manual code editing
- **Responsive Design**: All generated code follows mobile-first, responsive design principles

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Code Editor**: Monaco Editor
- **AI Services**:
  - Anthropic Claude (claude-sonnet-4-20250514) for code generation
  - OpenAI DALL-E 3 for image generation
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Custom shadcn/ui-style components

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- API keys for:
  - Anthropic Claude API
  - OpenAI API (for image generation)
  - Supabase project (optional, for data persistence)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-website-builder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Supabase for data persistence
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Basic Code Generation
1. Type your request in the chat panel (e.g., "Create a modern landing page for a SaaS product")
2. The AI will generate React code with Tailwind CSS styling
3. View the live preview in the Preview panel
4. Switch to Code view to see and edit the generated code

### Image Attachments
- Click the image icon to upload reference designs
- The AI will analyze the image for colors, layout, and style
- Your generated code will be inspired by the uploaded design

### URL References
- Click the link icon to add a reference URL
- The AI will analyze the website structure and apply similar patterns

### Code Editing
- Switch to Code view or Split view
- Edit code directly in the Monaco Editor
- Changes are reflected in the preview in real-time

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # AI chat endpoint
│   │   ├── generate-image/ # DALL-E image generation
│   │   ├── analyze-image/  # Vision API for design analysis
│   │   └── scrape-website/ # URL analysis
│   ├── globals.css        # Global styles with CSS variables
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application page
├── components/
│   ├── chat/              # Chat interface components
│   ├── editor/            # Monaco Editor wrapper
│   ├── preview/           # Live preview component
│   └── ui/                # Reusable UI components
├── lib/
│   ├── utils.ts           # Utility functions
│   └── supabase.ts        # Supabase client
├── store/
│   └── chat-store.ts      # Zustand state management
└── types/
    └── index.ts           # TypeScript type definitions
```

## API Endpoints

- `POST /api/chat` - Send messages to AI and receive generated code
- `POST /api/generate-image` - Generate images with DALL-E 3
- `POST /api/analyze-image` - Analyze uploaded images for design patterns
- `POST /api/scrape-website` - Analyze website URLs for design inspiration

## Supabase Setup (Optional)

If you want to persist projects and enable user authentication:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema in `src/lib/supabase-schema.sql`
3. Add your Supabase credentials to `.env.local`
4. Enable Row Level Security (RLS) for data protection

## Future Enhancements

- [ ] User authentication with Supabase Auth
- [ ] Project saving and loading
- [ ] Multi-file project support
- [ ] Component library and templates
- [ ] GitHub integration for code export
- [ ] Vercel/Netlify deployment integration
- [ ] Real-time collaboration
- [ ] Version history

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning and development.

## Acknowledgments

- Inspired by [Lovable.ai](https://lovable.ai)
- Built with [Next.js](https://nextjs.org/)
- AI powered by [Anthropic Claude](https://anthropic.com/)
- Image generation by [OpenAI DALL-E](https://openai.com/)
