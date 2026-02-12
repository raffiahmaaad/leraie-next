"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  generateTOTP,
  getRemainingSeconds,
  isValidSecret,
  formatSecret,
  parseOtpAuthUri,
} from "@/lib/totp";
import { Header } from "@/components";
import jsQR from "jsqr";

interface Account {
  id: string;
  name: string;
  secret: string;
  createdAt: number;
}

const STORAGE_KEY = "leraie_2fa_accounts";

export default function TwoFATools() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(30);
  const [newAccount, setNewAccount] = useState({ name: "", secret: "" });
  const [showSecret, setShowSecret] = useState(false);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editForm, setEditForm] = useState({ name: "", secret: "" });
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannerStatus, setScannerStatus] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAccounts(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load accounts:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    }
  }, [accounts, isLoaded]);

  const updateCodes = useCallback(async () => {
    const newCodes: Record<string, string> = {};
    for (const account of accounts) {
      try {
        newCodes[account.id] = await generateTOTP(account.secret);
      } catch (e) {
        newCodes[account.id] = "ERROR";
      }
    }
    setCodes(newCodes);
    setRemainingSeconds(getRemainingSeconds());
  }, [accounts]);

  useEffect(() => {
    updateCodes();
    const interval = setInterval(updateCodes, 1000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") updateCodes();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", updateCodes);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", updateCodes);
    };
  }, [updateCodes]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newAccount.name.trim();
    const secret = newAccount.secret.replace(/\s/g, "").toUpperCase();

    if (!name) return showToast("Please enter an account name", "error");
    if (!isValidSecret(secret))
      return showToast("Invalid secret key format", "error");
    if (accounts.some((acc) => acc.name.toLowerCase() === name.toLowerCase()))
      return showToast("Account already exists", "error");

    try {
      await generateTOTP(secret);
    } catch {
      return showToast("Failed to generate code. Check your secret.", "error");
    }

    setAccounts([
      ...accounts,
      { id: Date.now().toString(), name, secret, createdAt: Date.now() },
    ]);
    setNewAccount({ name: "", secret: "" });
    setShowSecret(false);
    showToast(`${name} added successfully`, "success");
  };

  const deleteAccount = (id: string) => {
    const account = accounts.find((acc) => acc.id === id);
    if (account && confirm(`Delete "${account.name}"?`)) {
      setAccounts(accounts.filter((acc) => acc.id !== id));
      showToast(`${account.name} deleted`, "success");
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast("Code copied!", "success");
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  const toggleSecretVisibility = (id: string) => {
    setVisibleSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startEdit = (account: Account) => {
    setEditingAccount(account);
    setEditForm({ name: account.name, secret: account.secret });
  };

  const cancelEdit = () => {
    setEditingAccount(null);
    setEditForm({ name: "", secret: "" });
  };

  const saveEdit = async () => {
    if (!editingAccount) return;

    const name = editForm.name.trim();
    const secret = editForm.secret.replace(/\s/g, "").toUpperCase();

    if (!name) return showToast("Please enter an account name", "error");
    if (!isValidSecret(secret))
      return showToast("Invalid secret key format", "error");

    // Check for duplicate names (excluding current account)
    if (
      accounts.some(
        (acc) =>
          acc.id !== editingAccount.id &&
          acc.name.toLowerCase() === name.toLowerCase(),
      )
    )
      return showToast("Account name already exists", "error");

    try {
      await generateTOTP(secret);
    } catch {
      return showToast("Failed to generate code. Check your secret.", "error");
    }

    setAccounts(
      accounts.map((acc) =>
        acc.id === editingAccount.id ? { ...acc, name, secret } : acc,
      ),
    );
    setEditingAccount(null);
    setEditForm({ name: "", secret: "" });
    showToast(`${name} updated successfully`, "success");
  };

  const exportBackupJSON = () => {
    if (accounts.length === 0)
      return showToast("No accounts to export", "error");
    const data = accounts.map((acc) => ({
      name: acc.name,
      secret: acc.secret,
      createdAt: new Date(acc.createdAt).toISOString(),
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `2fa-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("JSON backup downloaded!", "success");
  };

  const exportBackupTXT = () => {
    if (accounts.length === 0)
      return showToast("No accounts to export", "error");
    const lines = [
      `2FA Backup - ${new Date().toLocaleString()}`,
      `Total Accounts: ${accounts.length}`,
      "=".repeat(50),
      "",
      ...accounts
        .map((acc, i) => [
          `${i + 1}. ${acc.name}`,
          `   Secret Key: ${acc.secret}`,
          `   Created: ${new Date(acc.createdAt).toLocaleString()}`,
          "",
        ])
        .flat(),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `2fa-backup-${date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("TXT backup downloaded!", "success");
  };

  // === Import JSON ===
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(data)) {
          return showToast("Invalid backup file format", "error");
        }

        let added = 0;
        let skipped = 0;
        const newAccounts = [...accounts];

        for (const item of data) {
          const name = item.name?.trim();
          const secret = item.secret?.replace(/\s/g, "").toUpperCase();

          if (!name || !secret || !isValidSecret(secret)) {
            skipped++;
            continue;
          }

          // Skip duplicates (by name or secret)
          if (
            newAccounts.some(
              (acc) =>
                acc.name.toLowerCase() === name.toLowerCase() ||
                acc.secret === secret,
            )
          ) {
            skipped++;
            continue;
          }

          newAccounts.push({
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            name,
            secret,
            createdAt: item.createdAt
              ? new Date(item.createdAt).getTime()
              : Date.now(),
          });
          added++;
        }

        setAccounts(newAccounts);

        if (added > 0 && skipped > 0) {
          showToast(
            `Imported ${added} account(s), skipped ${skipped}`,
            "success",
          );
        } else if (added > 0) {
          showToast(`Imported ${added} account(s) successfully`, "success");
        } else {
          showToast(
            "No new accounts to import (all duplicates or invalid)",
            "error",
          );
        }
      } catch {
        showToast("Failed to parse backup file", "error");
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  // === QR Scanner ===
  const startQRScanner = async () => {
    setShowQRScanner(true);
    setScannerStatus("Requesting camera access...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;

      // Wait for ref to be available
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setScannerStatus("Point your camera at a QR code");
          startScanning();
        }
      }, 100);
    } catch {
      setScannerStatus("Camera access denied. Please allow camera permission.");
    }
  };

  const startScanning = () => {
    scanIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code?.data) {
        handleQRResult(code.data);
      }
    }, 250);
  };

  const handleQRResult = (data: string) => {
    const parsed = parseOtpAuthUri(data);
    if (!parsed) {
      setScannerStatus("Invalid QR code. Please scan a TOTP QR code.");
      return;
    }

    // Check for duplicates
    if (
      accounts.some(
        (acc) =>
          acc.name.toLowerCase() === parsed.name.toLowerCase() ||
          acc.secret === parsed.secret,
      )
    ) {
      stopQRScanner();
      showToast(`Account "${parsed.name}" already exists`, "error");
      return;
    }

    // Add the account
    setAccounts((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: parsed.name,
        secret: parsed.secret,
        createdAt: Date.now(),
      },
    ]);

    stopQRScanner();
    showToast(`"${parsed.name}" added from QR code!`, "success");
  };

  const stopQRScanner = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowQRScanner(false);
    setScannerStatus("");
  };

  const progress = (remainingSeconds / 30) * 100;

  return (
    <main style={{ minHeight: "100vh" }}>
      <Header title="2FA Generator" />

      <div
        className="container"
        style={{ paddingTop: "40px", paddingBottom: "60px" }}
      >
        {/* Page Header */}
        <div className="page-header">
          <div
            className="page-header-icon"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            🔐
          </div>
          <h1>2FA Generator</h1>
          <p>Manage your two-factor authentication codes securely</p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(280px, 360px) 1fr",
            gap: "32px",
            alignItems: "start",
          }}
        >
          {/* Sidebar - Add Account */}
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
                stroke="#6366f1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Account
            </h3>

            <form
              onSubmit={handleAddAccount}
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
                  Account Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Google, GitHub"
                  value={newAccount.name}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, name: e.target.value })
                  }
                  className="input"
                />
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
                  Secret Key
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showSecret ? "text" : "password"}
                    placeholder="Enter secret key"
                    value={newAccount.secret}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, secret: e.target.value })
                    }
                    className="input"
                    style={{ paddingRight: "48px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "var(--color-text-muted)",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {showSecret ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      ) : (
                        <>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <button
                type="submit"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Account
              </button>
            </form>

            {/* Divider */}
            <div
              style={{
                borderTop: "1px solid var(--color-border)",
                marginTop: "8px",
                paddingTop: "20px",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--color-text-muted)",
                  marginBottom: "14px",
                  textAlign: "center",
                }}
              >
                Or add account via
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={startQRScanner}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: "10px 14px", fontSize: "13px" }}
                  title="Scan QR code from camera"
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
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                  Scan QR
                </button>
                <button
                  onClick={() => importFileRef.current?.click()}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: "10px 14px", fontSize: "13px" }}
                  title="Import from JSON backup"
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  Import
                </button>
              </div>
            </div>

            {/* Hidden file input for import */}
            <input
              ref={importFileRef}
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              style={{ display: "none" }}
            />
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
                Your Accounts
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
                  {accounts.length}
                </span>
              </h3>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {accounts.length > 0 && (
                  <>
                    <button
                      onClick={exportBackupJSON}
                      className="btn btn-secondary"
                      style={{ padding: "8px 16px", fontSize: "13px" }}
                      title="Download backup as JSON file"
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      JSON
                    </button>
                    <button
                      onClick={exportBackupTXT}
                      className="btn btn-secondary"
                      style={{ padding: "8px 16px", fontSize: "13px" }}
                      title="Download backup as readable TXT file"
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      TXT
                    </button>
                  </>
                )}
              </div>
            </div>

            {!isLoaded ? (
              <div
                className="glass-card"
                style={{ padding: "80px", textAlign: "center" }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    margin: "0 auto",
                    border: "3px solid var(--color-primary)",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              </div>
            ) : accounts.length === 0 ? (
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
                  🔐
                </div>
                <h3 style={{ marginBottom: "12px" }}>No accounts yet</h3>
                <p style={{ fontSize: "15px" }}>
                  Add your first 2FA account to get started
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
                {accounts.map((account, idx) => (
                  <div
                    key={account.id}
                    className="glass-card animate-fade-in"
                    style={{
                      padding: "24px",
                      animationDelay: `${idx * 0.05}s`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "20px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                        }}
                      >
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "12px",
                            background:
                              "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))",
                            border: "1px solid var(--color-border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                          }}
                        >
                          🔑
                        </div>
                        <span style={{ fontSize: "18px", fontWeight: "600" }}>
                          {account.name}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => toggleSecretVisibility(account.id)}
                          className="btn-icon"
                          title="Show secret key"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => startEdit(account)}
                          className="btn-icon"
                          title="Edit account"
                          style={{ color: "var(--color-primary)" }}
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteAccount(account.id)}
                          className="btn-icon"
                          style={{ color: "var(--color-error)" }}
                          title="Delete account"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "24px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "20px",
                        }}
                      >
                        <span
                          onClick={() => copyCode(codes[account.id] || "")}
                          style={{
                            fontSize: "42px",
                            fontFamily: "monospace",
                            fontWeight: "700",
                            letterSpacing: "8px",
                            color: "white",
                            cursor: "pointer",
                            transition: "opacity 0.2s",
                          }}
                          title="Click to copy"
                          onMouseOver={(e) =>
                            (e.currentTarget.style.opacity = "0.8")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.opacity = "1")
                          }
                        >
                          {codes[account.id] || "------"}
                        </span>
                        <button
                          onClick={() => copyCode(codes[account.id] || "")}
                          className="btn btn-secondary"
                          style={{ padding: "10px 18px", fontSize: "14px" }}
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
                          Copy
                        </button>
                      </div>

                      {/* Timer */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            width: "56px",
                            height: "56px",
                          }}
                        >
                          <svg
                            width="56"
                            height="56"
                            style={{ transform: "rotate(-90deg)" }}
                          >
                            <circle
                              cx="28"
                              cy="28"
                              r="24"
                              fill="none"
                              stroke="rgba(99, 102, 241, 0.15)"
                              strokeWidth="4"
                            />
                            <circle
                              cx="28"
                              cy="28"
                              r="24"
                              fill="none"
                              stroke="url(#timerGrad)"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeDasharray={150.8}
                              strokeDashoffset={
                                150.8 - (progress / 100) * 150.8
                              }
                              style={{
                                transition: "stroke-dashoffset 0.3s ease",
                              }}
                            />
                            <defs>
                              <linearGradient
                                id="timerGrad"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                              >
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <span
                            style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "16px",
                              fontWeight: "700",
                            }}
                          >
                            {remainingSeconds}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          sec
                        </span>
                      </div>
                    </div>

                    {visibleSecrets.has(account.id) && (
                      <div
                        style={{
                          marginTop: "20px",
                          paddingTop: "20px",
                          borderTop: "1px solid var(--color-border)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "500",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          Secret Key:{" "}
                        </span>
                        <code
                          style={{
                            fontSize: "13px",
                            fontFamily: "monospace",
                            color: "var(--color-text-secondary)",
                            background: "var(--color-surface)",
                            padding: "4px 10px",
                            borderRadius: "6px",
                          }}
                        >
                          {formatSecret(account.secret)}
                        </code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingAccount && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={cancelEdit}
        >
          <div
            className="glass-card animate-fade-in"
            style={{
              padding: "32px",
              width: "100%",
              maxWidth: "420px",
              margin: "24px",
            }}
            onClick={(e) => e.stopPropagation()}
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
                stroke="#6366f1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Account
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
                  Account Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="input"
                  autoFocus
                />
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
                  Secret Key
                </label>
                <input
                  type="text"
                  value={editForm.secret}
                  onChange={(e) =>
                    setEditForm({ ...editForm, secret: e.target.value })
                  }
                  className="input"
                  style={{ fontFamily: "monospace" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button
                  onClick={cancelEdit}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
          onClick={stopQRScanner}
        >
          <div
            className="glass-card animate-fade-in"
            style={{
              padding: "32px",
              width: "100%",
              maxWidth: "480px",
              margin: "24px",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  margin: 0,
                }}
              >
                <svg
                  width="22"
                  height="22"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#6366f1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
                Scan QR Code
              </h3>
              <button
                onClick={stopQRScanner}
                className="btn-icon"
                style={{ color: "var(--color-text-muted)" }}
              >
                <svg
                  width="22"
                  height="22"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Video preview */}
            <div
              style={{
                position: "relative",
                width: "100%",
                borderRadius: "16px",
                overflow: "hidden",
                background: "#000",
                aspectRatio: "1",
                marginBottom: "16px",
              }}
            >
              <video
                ref={videoRef}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                playsInline
                muted
              />
              {/* Scan overlay corners */}
              <div
                style={{
                  position: "absolute",
                  inset: "15%",
                  border: "3px solid rgba(99, 102, 241, 0.7)",
                  borderRadius: "16px",
                  pointerEvents: "none",
                  boxShadow:
                    "0 0 0 9999px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(99, 102, 241, 0.15)",
                }}
              />
              {/* Scanning animation line */}
              <div
                style={{
                  position: "absolute",
                  left: "15%",
                  right: "15%",
                  height: "3px",
                  background:
                    "linear-gradient(90deg, transparent, #6366f1, transparent)",
                  animation: "scanLine 2s ease-in-out infinite",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Hidden canvas for frame capture */}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            <p
              style={{
                fontSize: "14px",
                color: "var(--color-text-secondary)",
                margin: "0 0 16px",
              }}
            >
              {scannerStatus}
            </p>

            <button
              onClick={stopQRScanner}
              className="btn btn-secondary"
              style={{ width: "100%" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"}`}
        >
          {toast.type === "success" ? "✓" : "✕"} {toast.message}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes scanLine {
          0% {
            top: 15%;
          }
          50% {
            top: 80%;
          }
          100% {
            top: 15%;
          }
        }
      `}</style>
    </main>
  );
}
