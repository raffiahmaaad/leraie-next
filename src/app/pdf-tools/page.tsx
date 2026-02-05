import Link from "next/link";
import { Header } from "@/components";

export default function PDFTools() {
  const features = [
    { icon: "📑", text: "Merge multiple PDFs" },
    { icon: "✂️", text: "Split PDF by pages" },
    { icon: "📦", text: "Compress PDF files" },
    { icon: "🔄", text: "Convert to/from PDF" },
    { icon: "🔒", text: "Add password protection" },
  ];

  return (
    <main style={{ minHeight: "100vh" }}>
      <Header title="PDF Tools" />

      <div
        className="container"
        style={{ paddingTop: "60px", paddingBottom: "80px" }}
      >
        <div
          style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}
        >
          {/* Icon */}
          <div
            style={{
              width: "100px",
              height: "100px",
              margin: "0 auto 32px",
              borderRadius: "28px",
              background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              boxShadow: "0 16px 48px rgba(236, 72, 153, 0.3)",
            }}
          >
            📄
          </div>

          <h1 style={{ marginBottom: "16px" }}>PDF Tools</h1>
          <p style={{ fontSize: "18px", marginBottom: "40px" }}>
            Merge, split, compress, and convert PDF files directly in your
            browser.
          </p>

          {/* Coming Soon Badge */}
          <div
            className="glass-card"
            style={{ padding: "40px", marginBottom: "40px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "#f59e0b",
                  animation: "pulse 2s infinite",
                }}
              />
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: "600",
                  color: "#fbbf24",
                }}
              >
                Coming Soon
              </span>
            </div>
            <p style={{ color: "var(--color-text-secondary)" }}>
              We&apos;re working hard to bring you powerful PDF tools. Check
              back soon!
            </p>
          </div>

          {/* Features list */}
          <div style={{ textAlign: "left", marginBottom: "40px" }}>
            <p
              style={{
                fontWeight: "600",
                marginBottom: "16px",
                color: "var(--color-text-muted)",
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Planned Features
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {features.map((f) => (
                <div
                  key={f.text}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 18px",
                    background: "var(--color-surface)",
                    borderRadius: "12px",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{f.icon}</span>
                  <span style={{ color: "var(--color-text-secondary)" }}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link href="/" className="btn btn-secondary">
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
