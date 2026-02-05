"use client";

import Link from "next/link";

const tools = [
  {
    name: "2FA Generator",
    description:
      "Generate and manage Time-based One-Time Passwords (TOTP) for secure two-factor authentication.",
    icon: "🔐",
    href: "/2fa-tools",
    status: "available" as const,
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    shadow: "rgba(99, 102, 241, 0.3)",
  },
  {
    name: "Address Generator",
    description:
      "Create realistic random addresses for testing with support for 24+ countries worldwide.",
    icon: "📍",
    href: "/address-generator",
    status: "available" as const,
    gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
    shadow: "rgba(16, 185, 129, 0.3)",
  },
  {
    name: "Card Generator",
    description:
      "Generate valid test credit card numbers with Luhn algorithm verification for development.",
    icon: "💳",
    href: "/card-generator",
    status: "available" as const,
    gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
    shadow: "rgba(245, 158, 11, 0.3)",
  },
  {
    name: "PDF Tools",
    description:
      "Merge, split, compress, and convert PDF files directly in your browser without uploads.",
    icon: "📄",
    href: "/pdf-tools",
    status: "coming-soon" as const,
    gradient: "linear-gradient(135deg, #ec4899, #8b5cf6)",
    shadow: "rgba(236, 72, 153, 0.3)",
  },
  {
    name: "Image Tools",
    description:
      "Resize, compress, convert, and edit images locally without uploading to any server.",
    icon: "🖼️",
    href: "/image-tools",
    status: "coming-soon" as const,
    gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
    shadow: "rgba(6, 182, 212, 0.3)",
  },
  {
    name: "QRIS Tools",
    description:
      "Convert static QRIS to dynamic, generate custom QR codes, and decode QRIS data.",
    icon: "📱",
    href: "/qris-tools",
    status: "available" as const,
    gradient: "linear-gradient(135deg, #8b5cf6, #6366f1)",
    shadow: "rgba(139, 92, 246, 0.3)",
  },
];

const features = [
  {
    icon: "🔒",
    title: "Privacy First",
    description:
      "All processing happens locally in your browser. Your data never leaves your device.",
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  },
  {
    icon: "⚡",
    title: "Lightning Fast",
    description:
      "No uploads, no waiting. Tools work instantly using modern browser APIs.",
    gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
  },
  {
    icon: "💎",
    title: "100% Free",
    description:
      "No subscriptions, no hidden fees, no limits. All tools are completely free forever.",
    gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
  },
];

export default function Home() {
  return (
    <main>
      {/* Header */}
      <header
        className="glass"
        style={{ position: "sticky", top: 0, zIndex: 50 }}
      >
        <div className="container" style={{ padding: "16px 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Link
              href="/"
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "20px",
                  boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
                }}
              >
                L
              </div>
              <span style={{ fontSize: "20px", fontWeight: "700" }}>
                Leraie Tools
              </span>
            </Link>
            <a
              href="https://github.com/leraie"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--color-text-secondary)",
              }}
            >
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span style={{ fontWeight: "500" }}>GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: "100px 0 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Floating orbs */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "20%",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "15%",
            width: "350px",
            height: "350px",
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "float 6s ease-in-out infinite 2s",
          }}
        />

        <div
          className="container"
          style={{ position: "relative", textAlign: "center" }}
        >
          {/* Badge */}
          <div
            className="animate-fade-in"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 20px",
              background: "rgba(22, 22, 31, 0.8)",
              border: "1px solid var(--color-border)",
              borderRadius: "100px",
              marginBottom: "32px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                background: "#10b981",
                borderRadius: "50%",
                animation: "pulse 2s infinite",
              }}
            />
            <span
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "var(--color-text-secondary)",
              }}
            >
              Free & Open Source
            </span>
          </div>

          {/* Heading */}
          <h1
            className="animate-fade-in delay-1"
            style={{ marginBottom: "24px" }}
          >
            Developer Tools
            <br />
            <span className="gradient-text">Made Simple</span>
          </h1>

          {/* Description */}
          <p
            className="animate-fade-in delay-2"
            style={{
              fontSize: "18px",
              maxWidth: "600px",
              margin: "0 auto 40px",
              lineHeight: "1.7",
            }}
          >
            A collection of free, fast, and privacy-focused tools for
            developers. No sign-up required. Everything runs locally in your
            browser.
          </p>

          {/* CTA Buttons */}
          <div
            className="animate-fade-in delay-3"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <Link href="/2fa-tools" className="btn btn-primary">
              Get Started
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <a href="#tools" className="btn btn-secondary">
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              Explore Tools
            </a>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ marginBottom: "16px" }}>All Tools</h2>
            <p style={{ fontSize: "16px" }}>
              Choose from our growing collection of developer tools
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "24px",
            }}
          >
            {tools.map((tool, index) => {
              const isAvailable = tool.status === "available";

              const cardContent = (
                <div
                  className={`tool-card ${!isAvailable ? "disabled" : ""} animate-fade-in`}
                  style={
                    {
                      "--card-gradient": tool.gradient,
                      "--card-shadow": tool.shadow,
                      animationDelay: `${index * 0.1}s`,
                    } as React.CSSProperties
                  }
                >
                  <span
                    className={`tool-card-badge ${isAvailable ? "available" : "coming-soon"}`}
                  >
                    {isAvailable ? "Available" : "Coming Soon"}
                  </span>

                  <div
                    className="tool-card-icon"
                    style={{
                      background: tool.gradient,
                      boxShadow: `0 8px 24px ${tool.shadow}`,
                    }}
                  >
                    {tool.icon}
                  </div>

                  <h3>{tool.name}</h3>
                  <p>{tool.description}</p>

                  {isAvailable && (
                    <div className="tool-card-arrow">
                      Open Tool
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
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              );

              if (isAvailable) {
                return (
                  <Link
                    key={tool.name}
                    href={tool.href}
                    style={{ textDecoration: "none" }}
                  >
                    {cardContent}
                  </Link>
                );
              }

              return <div key={tool.name}>{cardContent}</div>;
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="section"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ marginBottom: "16px" }}>Why Leraie Tools?</h2>
            <p style={{ fontSize: "16px" }}>
              Built with performance and privacy in mind
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "32px",
            }}
          >
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="feature-card animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div
                  className="feature-card-icon"
                  style={{ background: feature.gradient }}
                >
                  <span style={{ fontSize: "28px" }}>{feature.icon}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div
            className="glass-card"
            style={{
              padding: "60px 40px",
              textAlign: "center",
              background:
                "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%)",
            }}
          >
            <h2 style={{ marginBottom: "16px" }}>Ready to Get Started?</h2>
            <p
              style={{
                fontSize: "17px",
                maxWidth: "500px",
                margin: "0 auto 32px",
              }}
            >
              All tools are completely free and work right in your browser. No
              installation needed.
            </p>
            <Link href="/2fa-tools" className="btn btn-primary">
              Try 2FA Generator Now
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "32px 0",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                L
              </div>
              <span style={{ fontWeight: "600" }}>Leraie Tools</span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
              © {new Date().getFullYear()} Leraie Tools. Built with ❤️ using
              Next.js
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
