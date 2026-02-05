"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import jsQR from "jsqr";
import { Header } from "@/components";
import {
  parseQRIS,
  convertToDynamicQRIS,
  formatRupiah,
  QRISData,
} from "@/lib/qris";

type TabType = "qr-generator" | "qris-converter";
type InputMode = "text" | "image";

export default function QRISTools() {
  const [activeTab, setActiveTab] = useState<TabType>("qr-generator");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <main style={{ minHeight: "100vh" }}>
      <Header title="QRIS Tools" />

      <div
        className="container"
        style={{ paddingTop: "40px", paddingBottom: "60px" }}
      >
        {/* Page Header */}
        <div className="page-header">
          <div
            className="page-header-icon"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
          >
            📱
          </div>
          <h1>QR & QRIS Tools</h1>
          <p>Generate QR codes and convert QRIS static to dynamic</p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "32px",
            background: "var(--color-surface)",
            padding: "6px",
            borderRadius: "16px",
            width: "fit-content",
          }}
        >
          <button
            onClick={() => setActiveTab("qr-generator")}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              background:
                activeTab === "qr-generator"
                  ? "linear-gradient(135deg, #8b5cf6, #6366f1)"
                  : "transparent",
              color:
                activeTab === "qr-generator"
                  ? "white"
                  : "var(--color-text-secondary)",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "16px" }}>🔲</span>
            QR Generator
          </button>
          <button
            onClick={() => setActiveTab("qris-converter")}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              background:
                activeTab === "qris-converter"
                  ? "linear-gradient(135deg, #8b5cf6, #6366f1)"
                  : "transparent",
              color:
                activeTab === "qris-converter"
                  ? "white"
                  : "var(--color-text-secondary)",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "16px" }}>💳</span>
            QRIS Converter
          </button>
        </div>

        {/* Content */}
        {activeTab === "qr-generator" ? (
          <QRGenerator showToast={showToast} />
        ) : (
          <QRISConverter showToast={showToast} />
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="animate-fade-in"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            padding: "16px 24px",
            borderRadius: "12px",
            background:
              toast.type === "success"
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "linear-gradient(135deg, #ef4444, #dc2626)",
            color: "white",
            fontWeight: "500",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            zIndex: 100,
          }}
        >
          {toast.message}
        </div>
      )}
    </main>
  );
}

// QR Generator Component
function QRGenerator({
  showToast,
}: {
  showToast: (message: string, type: "success" | "error") => void;
}) {
  const [inputText, setInputText] = useState("");
  const [qrSize, setQrSize] = useState(256);
  const [qrColor, setQrColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = useCallback(
    (format: "png" | "svg") => {
      if (!inputText.trim()) {
        showToast("Please enter text to generate QR code", "error");
        return;
      }

      if (format === "svg") {
        const svg = qrRef.current?.querySelector("svg");
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "qrcode.svg";
        link.click();
        URL.revokeObjectURL(url);
        showToast("QR Code downloaded as SVG", "success");
      } else {
        const svg = qrRef.current?.querySelector("svg");
        if (!svg) return;

        const canvas = document.createElement("canvas");
        canvas.width = qrSize * 2;
        canvas.height = qrSize * 2;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        img.onload = () => {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = "qrcode.png";
          link.click();
          showToast("QR Code downloaded as PNG", "success");
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
      }
    },
    [inputText, qrSize, bgColor, showToast]
  );

  const copyToClipboard = async () => {
    if (!inputText.trim()) return;

    try {
      const svg = qrRef.current?.querySelector("svg");
      if (!svg) return;

      const canvas = document.createElement("canvas");
      canvas.width = qrSize * 2;
      canvas.height = qrSize * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();

      await new Promise<void>((resolve) => {
        img.onload = () => {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve();
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
      });

      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          showToast("QR Code copied to clipboard", "success");
        }
      });
    } catch {
      showToast("Failed to copy QR code", "error");
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "32px",
        alignItems: "start",
      }}
    >
      {/* Settings Panel */}
      <div className="glass-card" style={{ padding: "28px" }}>
        <h3
          style={{
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#8b5cf6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          QR Settings
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "var(--color-text-secondary)" }}>
              Text or URL
            </label>
            <textarea
              placeholder="Enter text, URL, or any content..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input"
              style={{ minHeight: "100px", resize: "vertical" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "var(--color-text-secondary)" }}>
              Size: {qrSize}px
            </label>
            <input type="range" min="128" max="512" step="32" value={qrSize} onChange={(e) => setQrSize(Number(e.target.value))} style={{ width: "100%" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "var(--color-text-secondary)" }}>QR Color</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input type="color" value={qrColor} onChange={(e) => setQrColor(e.target.value)} style={{ width: "48px", height: "48px", border: "none", borderRadius: "8px", cursor: "pointer" }} />
                <input type="text" value={qrColor} onChange={(e) => setQrColor(e.target.value)} className="input" style={{ flex: 1 }} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "var(--color-text-secondary)" }}>Background</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ width: "48px", height: "48px", border: "none", borderRadius: "8px", cursor: "pointer" }} />
                <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="input" style={{ flex: 1 }} />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "var(--color-text-secondary)" }}>Error Correction Level</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["L", "M", "Q", "H"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setErrorLevel(level)}
                  style={{
                    flex: 1, padding: "10px", border: errorLevel === level ? "2px solid #8b5cf6" : "1px solid var(--color-border)",
                    borderRadius: "8px", background: errorLevel === level ? "rgba(139, 92, 246, 0.1)" : "var(--color-surface)",
                    color: errorLevel === level ? "#8b5cf6" : "var(--color-text-secondary)", fontWeight: "600", cursor: "pointer", transition: "all 0.2s ease",
                  }}
                >
                  {level}
                  <span style={{ display: "block", fontSize: "10px", fontWeight: "400", marginTop: "2px" }}>
                    {level === "L" && "7%"}{level === "M" && "15%"}{level === "Q" && "25%"}{level === "H" && "30%"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="glass-card" style={{ padding: "28px" }}>
        <h3 style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#8b5cf6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview
        </h3>

        <div ref={qrRef} style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px", background: inputText.trim() ? bgColor : "var(--color-surface)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
          {inputText.trim() ? (
            <QRCodeSVG value={inputText} size={qrSize} fgColor={qrColor} bgColor={bgColor} level={errorLevel} />
          ) : (
            <div style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
              <span style={{ fontSize: "48px", opacity: 0.4 }}>🔲</span>
              <p style={{ marginTop: "12px" }}>Enter text to generate QR code</p>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button onClick={() => downloadQR("png")} disabled={!inputText.trim()} className="btn btn-primary" style={{ flex: 1 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PNG
          </button>
          <button onClick={() => downloadQR("svg")} disabled={!inputText.trim()} className="btn btn-secondary" style={{ flex: 1 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download SVG
          </button>
          <button onClick={copyToClipboard} disabled={!inputText.trim()} className="btn btn-secondary">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// QRIS Converter Component
function QRISConverter({
  showToast,
}: {
  showToast: (message: string, type: "success" | "error") => void;
}) {
  const [inputMode, setInputMode] = useState<InputMode>("image");
  const [qrisInput, setQrisInput] = useState("");
  const [parsedData, setParsedData] = useState<QRISData | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<Array<{ amount: number; qrisCode: string }>>([]);
  const [newAmount, setNewAmount] = useState("");
  const [referenceLabel, setReferenceLabel] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const quickAmounts = [10000, 20000, 50000, 100000, 150000, 200000, 500000, 1000000];

  useEffect(() => {
    if (inputMode === "text" && qrisInput.trim()) {
      const parsed = parseQRIS(qrisInput.trim());
      setParsedData(parsed);
      setGeneratedCodes([]);
    } else if (inputMode === "text") {
      setParsedData(null);
      setGeneratedCodes([]);
    }
  }, [qrisInput, inputMode]);

  const scanQRFromImage = useCallback(async (imageUrl: string) => {
    setIsScanning(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = imageUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get canvas context");

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        setQrisInput(code.data);
        const parsed = parseQRIS(code.data);
        setParsedData(parsed);
        setGeneratedCodes([]);
        if (parsed?.isValid) {
          showToast("QRIS scanned successfully!", "success");
        } else {
          showToast("QR code found but not a valid QRIS format", "error");
        }
      } else {
        showToast("No QR code found in image", "error");
        setParsedData(null);
      }
    } catch (error) {
      console.error("Scan error:", error);
      showToast("Failed to scan QR code from image", "error");
    } finally {
      setIsScanning(false);
    }
  }, [showToast]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setUploadedImage(imageUrl);
      scanQRFromImage(imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setUploadedImage(imageUrl);
      scanQRFromImage(imageUrl);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const imageUrl = event.target?.result as string;
              setUploadedImage(imageUrl);
              scanQRFromImage(imageUrl);
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [scanQRFromImage]);

  const handleAddAmount = () => {
    if (!parsedData?.isValid) {
      showToast("Please upload a valid QRIS image first", "error");
      return;
    }
    const amountNum = parseInt(newAmount.replace(/\D/g, ""), 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }
    if (generatedCodes.some((c) => c.amount === amountNum)) {
      showToast("This amount already exists", "error");
      return;
    }
    const result = convertToDynamicQRIS(qrisInput.trim(), amountNum, { referenceLabel: referenceLabel || undefined });
    if (result) {
      setGeneratedCodes([...generatedCodes, { amount: amountNum, qrisCode: result }]);
      setNewAmount("");
      showToast(`QRIS for ${formatRupiah(amountNum)} created!`, "success");
    } else {
      showToast("Failed to generate QRIS", "error");
    }
  };

  const handleQuickAmount = (amount: number) => {
    if (!parsedData?.isValid) {
      showToast("Please upload a valid QRIS image first", "error");
      return;
    }
    if (generatedCodes.some((c) => c.amount === amount)) {
      showToast("This amount already exists", "error");
      return;
    }
    const result = convertToDynamicQRIS(qrisInput.trim(), amount, { referenceLabel: referenceLabel || undefined });
    if (result) {
      setGeneratedCodes([...generatedCodes, { amount, qrisCode: result }]);
      showToast(`QRIS for ${formatRupiah(amount)} created!`, "success");
    }
  };

  const removeCode = (amount: number) => {
    setGeneratedCodes(generatedCodes.filter((c) => c.amount !== amount));
  };

  const downloadQR = (amount: number) => {
    const ref = qrRefs.current[amount];
    const svg = ref?.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `qris-${amount}.png`;
      link.click();
      showToast("QRIS downloaded!", "success");
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const copyQRIS = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast("QRIS code copied!", "success");
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  const clearAll = () => {
    setUploadedImage(null);
    setQrisInput("");
    setParsedData(null);
    setGeneratedCodes([]);
    setNewAmount("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatAmountInput = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue) {
      return new Intl.NumberFormat("id-ID").format(parseInt(numericValue, 10));
    }
    return "";
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(320px, 420px) 1fr",
        gap: "32px",
        alignItems: "start",
      }}
    >
      {/* Left Column - Upload + Settings */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Upload Panel */}
        <div className="glass-card" style={{ padding: "28px" }}>
          <h3 style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#8b5cf6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upload QRIS
          </h3>

          {/* Mode Toggle */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", background: "var(--color-surface)", padding: "4px", borderRadius: "10px" }}>
            <button
              onClick={() => setInputMode("image")}
              style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: inputMode === "image" ? "#8b5cf6" : "transparent", color: inputMode === "image" ? "white" : "var(--color-text-secondary)", fontWeight: "600", cursor: "pointer", transition: "all 0.2s ease", fontSize: "13px" }}
            >
              📷 Upload Gambar
            </button>
            <button
              onClick={() => setInputMode("text")}
              style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: inputMode === "text" ? "#8b5cf6" : "transparent", color: inputMode === "text" ? "white" : "var(--color-text-secondary)", fontWeight: "600", cursor: "pointer", transition: "all 0.2s ease", fontSize: "13px" }}
            >
              📝 Paste Text
            </button>
          </div>

          {inputMode === "image" ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ border: "2px dashed var(--color-border)", borderRadius: "16px", padding: "24px", textAlign: "center", cursor: "pointer", transition: "all 0.2s ease", background: uploadedImage ? "rgba(139, 92, 246, 0.05)" : "transparent", position: "relative", minHeight: "160px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
            >
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
              {isScanning ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: "40px", height: "40px", margin: "0 auto 12px", border: "4px solid var(--color-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>Scanning QR code...</p>
                </div>
              ) : uploadedImage ? (
                <div style={{ width: "100%" }}>
                  <img src={uploadedImage} alt="Uploaded QRIS" style={{ maxWidth: "140px", maxHeight: "140px", borderRadius: "12px", margin: "0 auto", display: "block" }} />
                  <p style={{ marginTop: "10px", fontSize: "12px", color: "var(--color-text-muted)" }}>Click to change</p>
                </div>
              ) : (
                <>
                  <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.2))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "24px" }}>📷</span>
                  </div>
                  <p style={{ fontWeight: "600", marginBottom: "6px", fontSize: "14px" }}>Upload QRIS Image</p>
                  <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Drag & drop, click, or paste (Ctrl+V)</p>
                </>
              )}
            </div>
          ) : (
            <textarea
              placeholder="Paste QRIS code here..."
              value={qrisInput}
              onChange={(e) => setQrisInput(e.target.value)}
              className="input"
              style={{ minHeight: "120px", resize: "vertical", fontFamily: "monospace", fontSize: "11px" }}
            />
          )}

          {qrisInput.trim() && (
            <div style={{ marginTop: "16px", padding: "14px", borderRadius: "12px", background: parsedData?.isValid ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", border: `1px solid ${parsedData?.isValid ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>{parsedData?.isValid ? "✅" : "❌"}</span>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "14px", color: parsedData?.isValid ? "#10b981" : "#ef4444" }}>
                    {parsedData?.isValid ? "Valid QRIS" : "Invalid QRIS"}
                  </div>
                  {parsedData?.isValid && (
                    <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>{parsedData.merchantName}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {(uploadedImage || qrisInput) && (
            <button onClick={clearAll} className="btn btn-secondary" style={{ width: "100%", marginTop: "16px", fontSize: "13px" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear & Upload New
            </button>
          )}
        </div>

        {/* Generate Payment Panel */}
        <div className="glass-card" style={{ padding: "28px" }}>
          <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#8b5cf6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Generate Payment
          </h3>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "10px", fontSize: "13px", fontWeight: "500", color: "var(--color-text-secondary)" }}>Quick Amounts</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {quickAmounts.map((amount) => {
                const isGenerated = generatedCodes.some((c) => c.amount === amount);
                return (
                  <button
                    key={amount}
                    onClick={() => handleQuickAmount(amount)}
                    disabled={!parsedData?.isValid || isGenerated}
                    style={{ padding: "10px 6px", borderRadius: "8px", border: isGenerated ? "2px solid #10b981" : "1px solid var(--color-border)", background: isGenerated ? "rgba(16, 185, 129, 0.1)" : "var(--color-surface)", color: isGenerated ? "#10b981" : parsedData?.isValid ? "var(--color-text)" : "var(--color-text-muted)", fontWeight: "600", fontSize: "11px", cursor: parsedData?.isValid && !isGenerated ? "pointer" : "not-allowed", transition: "all 0.2s ease", opacity: parsedData?.isValid ? 1 : 0.5 }}
                  >
                    {amount >= 1000000 ? `${amount / 1000000}jt` : `${amount / 1000}rb`}
                    {isGenerated && " ✓"}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "var(--color-text-secondary)" }}>Custom Amount</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", fontWeight: "600", fontSize: "13px" }}>Rp</span>
                <input type="text" placeholder="Nominal..." value={newAmount} onChange={(e) => setNewAmount(formatAmountInput(e.target.value))} className="input" style={{ paddingLeft: "42px", fontSize: "14px" }} disabled={!parsedData?.isValid} />
              </div>
              <button onClick={handleAddAmount} disabled={!parsedData?.isValid || !newAmount} className="btn btn-primary" style={{ padding: "12px 16px" }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500", color: "var(--color-text-secondary)" }}>Reference Label (Optional)</label>
            <input type="text" placeholder="e.g., INV-001" value={referenceLabel} onChange={(e) => setReferenceLabel(e.target.value)} className="input" style={{ fontSize: "14px" }} maxLength={25} disabled={!parsedData?.isValid} />
          </div>
        </div>
      </div>

      {/* Right Column - Generated QR Codes */}
      <div className="glass-card" style={{ padding: "28px", position: "sticky", top: "100px", minHeight: "400px" }}>
        <h3 style={{ marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#8b5cf6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Generated QR Codes
          </div>
          {generatedCodes.length > 0 && (
            <span style={{ padding: "4px 12px", background: "linear-gradient(135deg, #8b5cf6, #6366f1)", borderRadius: "20px", fontSize: "12px", fontWeight: "600", color: "white" }}>
              {generatedCodes.length}
            </span>
          )}
        </h3>

        {generatedCodes.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", textAlign: "center", color: "var(--color-text-muted)" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "rgba(139, 92, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
              <span style={{ fontSize: "36px", opacity: 0.5 }}>💳</span>
            </div>
            <p style={{ fontWeight: "500", marginBottom: "8px" }}>No QR codes generated yet</p>
            <p style={{ fontSize: "13px" }}>{parsedData?.isValid ? "Select an amount to generate payment QR" : "Upload a QRIS image first"}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", maxHeight: "calc(100vh - 250px)", overflowY: "auto", paddingRight: "8px" }}>
            {generatedCodes.sort((a, b) => a.amount - b.amount).map(({ amount, qrisCode }) => (
              <div key={amount} className="animate-fade-in" style={{ padding: "16px", background: "var(--color-surface)", borderRadius: "16px", border: "1px solid var(--color-border)", textAlign: "center" }}>
                <div style={{ marginBottom: "12px", padding: "8px 12px", background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.15))", borderRadius: "10px" }}>
                  <div style={{ fontSize: "18px", fontWeight: "700", background: "linear-gradient(135deg, #8b5cf6, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {formatRupiah(amount)}
                  </div>
                </div>
                <div ref={(el) => { qrRefs.current[amount] = el; }} style={{ background: "#FFFFFF", padding: "12px", borderRadius: "12px", marginBottom: "12px", display: "inline-block" }}>
                  <QRCodeSVG value={qrisCode} size={140} fgColor="#000000" bgColor="#FFFFFF" level="M" />
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => downloadQR(amount)} className="btn btn-primary" style={{ flex: 1, fontSize: "12px", padding: "8px" }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button onClick={() => copyQRIS(qrisCode)} className="btn btn-secondary" style={{ padding: "8px" }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button onClick={() => removeCode(amount)} className="btn btn-secondary" style={{ padding: "8px", color: "var(--color-error)" }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
