"use client";

import { useState } from "react";
import {
  CardTypes,
  generateCards,
  luhnCheck,
  GeneratedCard,
  detectCardType,
  isValidBIN,
} from "@/lib/card";
import { Header } from "@/components";

export default function CardGenerator() {
  const [customBIN, setCustomBIN] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [customCVV, setCustomCVV] = useState("");
  const [quantity, setQuantity] = useState(5);
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [validateNumber, setValidateNumber] = useState("");
  const [validationResult, setValidationResult] = useState<boolean | null>(
    null,
  );
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = (i + 1).toString().padStart(2, "0");
    return { value: m, label: m };
  });

  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => {
    const y = (currentYear + i).toString();
    return { value: y.slice(2), label: y };
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerate = () => {
    if (quantity < 1 || quantity > 100) {
      showToast("Quantity must be between 1 and 100", "error");
      return;
    }

    // Validate custom BIN
    if (customBIN && !isValidBIN(customBIN)) {
      showToast("Invalid BIN format. Use 1-14 digits.", "error");
      return;
    }

    if (!customBIN) {
      showToast("Please enter a BIN number", "error");
      return;
    }

    const newCards = generateCards(quantity, {
      bin: customBIN,
      expiryMonth: expiryMonth || undefined,
      expiryYear: expiryYear || undefined,
      cvv: customCVV || undefined,
    });

    // Verify all cards pass Luhn
    const allValid = newCards.every((c) => c.isValid);
    if (!allValid) {
      showToast("Warning:Some cards may not be valid", "error");
    }

    setCards(newCards);
    showToast(`Generated ${newCards.length} valid cards`, "success");
  };

  const handleValidate = () => {
    const cleaned = validateNumber.replace(/\s/g, "");
    if (!cleaned || !/^\d+$/.test(cleaned)) {
      showToast("Please enter a valid card number", "error");
      return;
    }
    const isValid = luhnCheck(cleaned);
    setValidationResult(isValid);

    const detectedType = detectCardType(cleaned);
    const typeInfo = detectedType
      ? ` (${CardTypes[detectedType]?.name || detectedType})`
      : "";

    showToast(
      isValid ? `Valid card number${typeInfo}` : "Invalid card number",
      isValid ? "success" : "error",
    );
  };

  const copyCard = async (card: GeneratedCard) => {
    try {
      const cleanNumber = card.number; // No spaces
      const [month, year] = card.expiry.split("/");
      const text = `${cleanNumber}|${month}|${year}|${card.cvv}`;
      await navigator.clipboard.writeText(text);
      showToast("Card copied!", "success");
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  const copyAll = async () => {
    if (cards.length === 0) return showToast("No cards to copy", "error");
    try {
      const text = cards
        .map((c) => {
          const [month, year] = c.expiry.split("/");
          return `${c.number}|${month}|${year}|${c.cvv}`;
        })
        .join("\n");
      await navigator.clipboard.writeText(text);
      showToast(`Copied ${cards.length} cards`, "success");
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  const detectedType = customBIN ? detectCardType(customBIN) : null;

  return (
    <main style={{ minHeight: "100vh" }}>
      <Header title="Card Generator" />

      <div
        className="container"
        style={{ paddingTop: "40px", paddingBottom: "60px" }}
      >
        {/* Page Header */}
        <div className="page-header">
          <div
            className="page-header-icon"
            style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}
          >
            💳
          </div>
          <h1>Card Generator</h1>
          <p>Generate valid test credit card numbers with custom BIN</p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(320px, 400px) 1fr",
            gap: "32px",
            alignItems: "start",
          }}
        >
          {/* Sidebar */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              position: "sticky",
              top: "100px",
            }}
          >
            {/* Generate Card */}
            <div className="glass-card" style={{ padding: "28px" }}>
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
                  stroke="#f59e0b"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Generate Cards
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {/* BIN Input */}
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
                    BIN Number (1-14 digits)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 424242, 51234567"
                    value={customBIN}
                    onChange={(e) =>
                      setCustomBIN(
                        e.target.value.replace(/\D/g, "").slice(0, 14),
                      )
                    }
                    className="input"
                    maxLength={14}
                  />
                  {detectedType && (
                    <p
                      style={{
                        marginTop: "8px",
                        fontSize: "13px",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Detected:{" "}
                      <span style={{ color: "#10b981", fontWeight: "600" }}>
                        {CardTypes[detectedType].name}
                      </span>
                    </p>
                  )}
                </div>

                {/* Expiry Selectors */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
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
                      Month
                    </label>
                    <select
                      value={expiryMonth}
                      onChange={(e) => setExpiryMonth(e.target.value)}
                      className="input"
                    >
                      <option value="">Random</option>
                      {months.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
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
                      Year
                    </label>
                    <select
                      value={expiryYear}
                      onChange={(e) => setExpiryYear(e.target.value)}
                      className="input"
                    >
                      <option value="">Random</option>
                      {years.map((y) => (
                        <option key={y.value} value={y.value}>
                          {y.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CVV */}
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
                    CVV Pattern (x = random)
                  </label>
                  <input
                    type="text"
                    placeholder="Random (e.g., xxx, 12x, 000)"
                    value={customCVV}
                    onChange={(e) => setCustomCVV(e.target.value.slice(0, 4))}
                    className="input"
                    maxLength={4}
                  />
                  <p
                    style={{
                      marginTop: "6px",
                      fontSize: "12px",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Use &quot;x&quot; for random digits. E.g., &quot;12x&quot; →
                    120-129
                  </p>
                </div>

                {/* Quantity */}
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
                    Quantity (1-100)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="input"
                  />
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
                  Generate Cards
                </button>
              </div>
            </div>

            {/* Validator */}
            <div className="glass-card" style={{ padding: "28px" }}>
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
                  stroke="#06b6d4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Luhn Validator
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
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
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter card number to validate"
                    value={validateNumber}
                    onChange={(e) => {
                      setValidateNumber(e.target.value);
                      setValidationResult(null);
                    }}
                    className="input"
                  />
                </div>

                {validationResult !== null && (
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: validationResult
                        ? "rgba(16, 185, 129, 0.12)"
                        : "rgba(239, 68, 68, 0.12)",
                      border: `1px solid ${validationResult ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                      color: validationResult ? "#34d399" : "#f87171",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {validationResult ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      )}
                    </svg>
                    {validationResult
                      ? "✓ Valid Luhn checksum"
                      : "✕ Invalid Luhn checksum"}
                  </div>
                )}

                <button
                  onClick={handleValidate}
                  className="btn btn-secondary"
                  style={{ width: "100%" }}
                >
                  Validate
                </button>
              </div>
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
                  {cards.length}
                </span>
                {cards.length > 0 && cards.every((c) => c.isValid) && (
                  <span
                    style={{
                      marginLeft: "8px",
                      padding: "4px 12px",
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "#34d399",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    ✓ All Valid
                  </span>
                )}
              </h3>
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

            {cards.length === 0 ? (
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
                  💳
                </div>
                <h3 style={{ marginBottom: "12px" }}>No cards generated</h3>
                <p style={{ fontSize: "15px" }}>
                  Enter a BIN and click Generate
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                  gap: "20px",
                }}
              >
                {cards.map((card, idx) => (
                  <div
                    key={idx}
                    className="animate-fade-in"
                    style={{
                      borderRadius: "16px",
                      padding: "28px",
                      background: card.gradient,
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                      animationDelay: `${idx * 0.03}s`,
                    }}
                  >
                    {/* Card design elements */}
                    <div
                      style={{
                        position: "absolute",
                        top: "-50px",
                        right: "-50px",
                        width: "180px",
                        height: "180px",
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: "50%",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "-20px",
                        right: "40px",
                        width: "120px",
                        height: "120px",
                        background: "rgba(255,255,255,0.08)",
                        borderRadius: "50%",
                      }}
                    />

                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "28px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                              color: "rgba(255,255,255,0.8)",
                            }}
                          >
                            {card.typeName}
                          </span>
                          {card.isValid && (
                            <span
                              style={{
                                padding: "2px 8px",
                                fontSize: "10px",
                                fontWeight: "600",
                                background: "rgba(16, 185, 129, 0.3)",
                                color: "#6ee7b7",
                                borderRadius: "10px",
                              }}
                            >
                              VALID
                            </span>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "rgba(255,255,255,0.5)",
                          }}
                        >
                          #{idx + 1}
                        </span>
                      </div>

                      <div style={{ marginBottom: "28px" }}>
                        <span
                          style={{
                            fontSize: "22px",
                            fontFamily: "monospace",
                            fontWeight: "700",
                            letterSpacing: "2px",
                            color: "white",
                            textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          }}
                        >
                          {card.formattedNumber}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-end",
                        }}
                      >
                        <div style={{ display: "flex", gap: "32px" }}>
                          <div>
                            <span
                              style={{
                                fontSize: "9px",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                color: "rgba(255,255,255,0.5)",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              Valid Thru
                            </span>
                            <span
                              style={{
                                fontSize: "15px",
                                fontWeight: "600",
                                fontFamily: "monospace",
                                color: "white",
                              }}
                            >
                              {card.expiry}
                            </span>
                          </div>
                          <div>
                            <span
                              style={{
                                fontSize: "9px",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                color: "rgba(255,255,255,0.5)",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              CVV
                            </span>
                            <span
                              style={{
                                fontSize: "15px",
                                fontWeight: "600",
                                fontFamily: "monospace",
                                color: "white",
                              }}
                            >
                              {card.cvv}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => copyCard(card)}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background: "rgba(255,255,255,0.15)",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.2s",
                          }}
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
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Disclaimer */}
            {cards.length > 0 && (
              <div
                style={{
                  marginTop: "32px",
                  padding: "20px 24px",
                  borderRadius: "12px",
                  background: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#f59e0b"
                  style={{ flexShrink: 0, marginTop: "2px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <strong style={{ color: "#fbbf24", fontWeight: "600" }}>
                    For Testing Only
                  </strong>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "rgba(251, 191, 36, 0.8)",
                      marginTop: "4px",
                      lineHeight: "1.6",
                    }}
                  >
                    These are test numbers that pass Luhn validation but are not
                    connected to real accounts. Use only for development and
                    testing purposes.
                  </p>
                </div>
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
