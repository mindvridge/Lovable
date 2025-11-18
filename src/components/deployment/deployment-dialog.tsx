"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Github, Globe, Download, FileJson } from "lucide-react";
import { useChatStore } from "@/store/chat-store";

interface DeploymentDialogProps {
  open: boolean;
  onClose: () => void;
}

export function DeploymentDialog({ open, onClose }: DeploymentDialogProps) {
  const { currentCode, files } = useChatStore();
  const [deploying, setDeploying] = useState(false);
  const [projectName, setProjectName] = useState("my-website");

  const downloadAsZip = async () => {
    // For now, download as HTML
    alert("ZIP download feature coming soon! Use 'Download HTML' for now.");
  };

  const downloadAsNextJS = () => {
    const packageJson = {
      name: projectName,
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      },
      dependencies: {
        react: "^19.0.0",
        "react-dom": "^19.0.0",
        next: "^16.0.0",
        tailwindcss: "^4.0.0",
      },
      devDependencies: {
        "@types/node": "^20",
        "@types/react": "^19",
        "@types/react-dom": "^19",
        typescript: "^5.9.3",
      },
    };

    const readme = `# ${projectName}

Generated with AI Website Builder

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the project.

## Deploy

Deploy easily with:
- [Vercel](https://vercel.com/new)
- [Netlify](https://netlify.com)
- [GitHub Pages](https://pages.github.com)
`;

    const appTsx = `export default function Home() {
  return (
    <main>
      ${currentCode || "/* Add your code here */"}
    </main>
  );
}
`;

    // Create downloadable files info
    const filesToDownload = [
      { name: "package.json", content: JSON.stringify(packageJson, null, 2) },
      { name: "README.md", content: readme },
      { name: "app/page.tsx", content: appTsx },
    ];

    // Download each file separately
    filesToDownload.forEach((file) => {
      const blob = new Blob([file.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const deployToVercel = () => {
    // Open Vercel deployment guide
    window.open(
      "https://vercel.com/docs/getting-started-with-vercel",
      "_blank"
    );
    alert(
      "To deploy to Vercel:\n\n1. Push your code to GitHub\n2. Import your repository on Vercel\n3. Vercel will auto-detect Next.js and deploy!"
    );
  };

  const deployToNetlify = () => {
    window.open("https://app.netlify.com/start", "_blank");
    alert(
      "To deploy to Netlify:\n\n1. Push your code to GitHub\n2. Connect your repository on Netlify\n3. Configure build settings and deploy!"
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Deploy Your Website</DialogTitle>
          <DialogDescription>
            Choose how you want to export or deploy your project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Project Name
            </label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="my-awesome-website"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Download Options */}
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={downloadAsNextJS}
            >
              <FileJson className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Next.js Project</div>
                <div className="text-xs text-muted-foreground">
                  Download project files
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={downloadAsZip}
            >
              <Download className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">ZIP Archive</div>
                <div className="text-xs text-muted-foreground">
                  Coming soon
                </div>
              </div>
            </Button>

            {/* Deployment Options */}
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={deployToVercel}
            >
              <Globe className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Deploy to Vercel</div>
                <div className="text-xs text-muted-foreground">
                  One-click hosting
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={deployToNetlify}
            >
              <Globe className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Deploy to Netlify</div>
                <div className="text-xs text-muted-foreground">
                  Fast & simple
                </div>
              </div>
            </Button>
          </div>

          <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
            <div className="font-semibold">Deployment Steps:</div>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Download project files or create GitHub repository</li>
              <li>Push code to GitHub (if not already done)</li>
              <li>Connect GitHub to Vercel or Netlify</li>
              <li>Configure build settings (auto-detected for Next.js)</li>
              <li>Deploy and get your live URL!</li>
            </ol>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
