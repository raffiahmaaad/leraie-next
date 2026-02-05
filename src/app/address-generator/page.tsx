"use client";

import { useState } from "react";
import { AddressData, generateAddress, GeneratedAddress } from "@/lib/address";
import { Header } from "@/components";

type FormatType = "full" | "compact" | "json";

export default function AddressGenerator() {
  const [country, setCountry] = useState("US");
  const [quantity, setQuantity] = useState(5);
  const [includeName, setIncludeName] = useState(true);
  const [includePhone, setIncludePhone] = useState(true);
  const [includeEmail, setIncludeEmail] = useState(true);
  const [addresses, setAddresses] = useState<GeneratedAddress[]>([]);
  const [format, setFormat] = useState<FormatType>("full");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const countries = Object.entries(AddressData).map(([code, data]) => ({
    code,
    name: data.name,
    flag: data.flag,
  }));

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerate = () => {
    if (quantity < 1 || quantity > 50) {
      showToast("Quantity must be between 1 and 50", "error");
      return;
    }
    const newAddresses: GeneratedAddress[] = [];
    for (let i = 0; i < quantity; i++) {
      newAddresses.push(
        generateAddress(country, { includeName, includePhone, includeEmail }),
      );
    }
    setAddresses(newAddresses);
    showToast(`Generated ${newAddresses.length} addresses`, "success");
  };

  const formatAddress = (addr: GeneratedAddress): string => {
    switch (format) {
      case "compact":
        return [
          addr.fullName,
          `${addr.number} ${addr.street}`,
          addr.city,
          `${addr.state} ${addr.zip}`,
          addr.country,
        ]
          .filter(Boolean)
          .join(", ");
      case "json":
        return JSON.stringify(addr, null, 2);
      default:
        const lines = [];
        if (addr.fullName) lines.push(addr.fullName);
        lines.push(`${addr.number} ${addr.street}`);
        lines.push(`${addr.city}, ${addr.state} ${addr.zip}`);
        lines.push(addr.country);
        if (addr.phone) lines.push(`📞 ${addr.phone}`);
        if (addr.email) lines.push(`✉️ ${addr.email}`);
        return lines.join("\n");
    }
  };

  const copyAddress = async (addr: GeneratedAddress) => {
    try {
      await navigator.clipboard.writeText(formatAddress(addr));
      showToast("Address copied!", "success");
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  const copyAll = async () => {
    if (addresses.length === 0)
      return showToast("No addresses to copy", "error");
    try {
      const text = addresses.map(formatAddress).join("\n\n---\n\n");
      await navigator.clipboard.writeText(text);
      showToast(`Copied ${addresses.length} addresses`, "success");
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  return (
    <main style={{ minHeight: "100vh" }}>
      <Header title="Address Generator" />

      <div
        className="container"
        style={{ paddingTop: "40px", paddingBottom: "60px" }}
      >
        {/* Page Header */}
        <div className="page-header">
          <div
            className="page-header-icon"
            style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
          >
            📍
          </div>
          <h1>Address Generator</h1>
          <p>Generate realistic random addresses for testing</p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(280px, 360px) 1fr",
            gap: "32px",
            alignItems: "start",
          }}
        >
          {/* Sidebar */}
          <div
            className="glass-card"
            style={{ padding: "28px", position: "sticky", top: "100px" }}
          >
            <h3
              style={{
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#10b981"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Options
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="input"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Quantity (1-50)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="input"
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "12px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Include Fields
                </label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {[
                    {
                      label: "Full Name",
                      checked: includeName,
                      onChange: setIncludeName,
                    },
                    {
                      label: "Phone Number",
                      checked: includePhone,
                      onChange: setIncludePhone,
                    },
                    {
                      label: "Email Address",
                      checked: includeEmail,
                      onChange: setIncludeEmail,
                    },
                  ].map((item) => (
                    <label
                      key={item.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => item.onChange(e.target.checked)}
                      />
                      <span style={{ fontSize: "14px" }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                className="btn btn-primary"
                style={{ width: "100%" }}
              >
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Generate Addresses
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <h3 style={{ fontSize: "18px" }}>
                Results
                <span
                  style={{
                    marginLeft: "10px",
                    padding: "4px 12px",
                    background: "var(--color-surface)",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {addresses.length}
                </span>
              </h3>

              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    display: "flex",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {(["full", "compact", "json"] as FormatType[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      style={{
                        padding: "8px 16px",
                        fontSize: "13px",
                        fontWeight: "500",
                        textTransform: "capitalize",
                        background:
                          format === f
                            ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                            : "transparent",
                        color:
                          format === f
                            ? "white"
                            : "var(--color-text-secondary)",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button
                  onClick={copyAll}
                  className="btn btn-secondary"
                  style={{ padding: "8px 16px", fontSize: "13px" }}
                >
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
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy All
                </button>
              </div>
            </div>

            {addresses.length === 0 ? (
              <div
                className="glass-card"
                style={{ padding: "80px 40px", textAlign: "center" }}
              >
                <div
                  style={{
                    fontSize: "64px",
                    marginBottom: "24px",
                    opacity: 0.4,
                  }}
                >
                  📍
                </div>
                <h3 style={{ marginBottom: "12px" }}>No addresses generated</h3>
                <p style={{ fontSize: "15px" }}>
                  Configure your options and click Generate
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className="glass-card animate-fade-in"
                    style={{
                      padding: "24px",
                      animationDelay: `${idx * 0.03}s`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <span
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background:
                              "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))",
                            border: "1px solid var(--color-border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: "600",
                          }}
                        >
                          {idx + 1}
                        </span>
                        {addr.fullName && (
                          <span style={{ fontWeight: "600", fontSize: "16px" }}>
                            {addr.fullName}
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          padding: "5px 12px",
                          fontSize: "12px",
                          fontWeight: "500",
                          background: "var(--color-surface)",
                          borderRadius: "20px",
                        }}
                      >
                        {addr.flag} {addr.country}
                      </span>
                    </div>

                    {format === "json" ? (
                      <pre
                        style={{
                          fontSize: "13px",
                          fontFamily: "monospace",
                          background: "rgba(0,0,0,0.3)",
                          padding: "16px",
                          borderRadius: "10px",
                          overflow: "auto",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {formatAddress(addr)}
                      </pre>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "16px",
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "var(--color-text-muted)",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Street
                          </span>
                          <p
                            style={{
                              fontSize: "15px",
                              color: "white",
                              marginTop: "4px",
                            }}
                          >
                            {addr.number} {addr.street}
                          </p>
                        </div>
                        <div>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "var(--color-text-muted)",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            City
                          </span>
                          <p
                            style={{
                              fontSize: "15px",
                              color: "white",
                              marginTop: "4px",
                            }}
                          >
                            {addr.city}
                          </p>
                        </div>
                        <div>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "var(--color-text-muted)",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            State / Zip
                          </span>
                          <p
                            style={{
                              fontSize: "15px",
                              color: "white",
                              marginTop: "4px",
                            }}
                          >
                            {addr.state} {addr.zip}
                          </p>
                        </div>
                        {addr.phone && (
                          <div>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "600",
                                color: "var(--color-text-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Phone
                            </span>
                            <p
                              style={{
                                fontSize: "15px",
                                color: "white",
                                marginTop: "4px",
                              }}
                            >
                              {addr.phone}
                            </p>
                          </div>
                        )}
                        {addr.email && (
                          <div style={{ gridColumn: "1 / -1" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "600",
                                color: "var(--color-text-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Email
                            </span>
                            <p
                              style={{
                                fontSize: "15px",
                                color: "white",
                                marginTop: "4px",
                              }}
                            >
                              {addr.email}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      style={{
                        marginTop: "16px",
                        paddingTop: "16px",
                        borderTop: "1px solid var(--color-border)",
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        onClick={() => copyAddress(addr)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "13px",
                          color: "var(--color-text-secondary)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px 8px",
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Copy Address
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div
          className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"}`}
        >
          {toast.type === "success" ? "✓" : "✕"} {toast.message}
        </div>
      )}
    </main>
  );
}
