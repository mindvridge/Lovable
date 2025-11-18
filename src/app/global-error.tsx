"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          fontFamily: "system-ui, sans-serif"
        }}>
          <div style={{
            maxWidth: "28rem",
            width: "100%",
            textAlign: "center"
          }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
              Application Error
            </h1>
            <p style={{ color: "#666", marginBottom: "1.5rem" }}>
              A critical error occurred. Please try refreshing the page.
            </p>
            <div style={{
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: "0.5rem",
              marginBottom: "1.5rem",
              textAlign: "left"
            }}>
              <code style={{ fontSize: "0.875rem", wordBreak: "break-all" }}>
                {error.message}
              </code>
            </div>
            <button
              onClick={reset}
              style={{
                padding: "0.5rem 1rem",
                background: "#000",
                color: "#fff",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                marginRight: "0.5rem"
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              style={{
                padding: "0.5rem 1rem",
                background: "#fff",
                color: "#000",
                border: "1px solid #ccc",
                borderRadius: "0.375rem",
                cursor: "pointer"
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
