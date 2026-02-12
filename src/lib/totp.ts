/**
 * TOTP (Time-based One-Time Password) Implementation
 * Based on RFC 6238 and RFC 4226
 * Uses Web Crypto API for HMAC-SHA1
 * by Leraie.
 */

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Decode a Base32 encoded string to Uint8Array
 */
export function base32Decode(encoded: string): Uint8Array {
  // Remove spaces and convert to uppercase
  encoded = encoded.replace(/\s/g, "").toUpperCase();
  // Remove padding
  encoded = encoded.replace(/=+$/, "");

  if (encoded.length === 0) {
    return new Uint8Array(0);
  }

  const output: number[] = [];
  let buffer = 0;
  let bitsLeft = 0;

  for (const char of encoded) {
    const val = BASE32_CHARS.indexOf(char);
    if (val === -1) {
      throw new Error(`Invalid Base32 character: ${char}`);
    }

    buffer = (buffer << 5) | val;
    bitsLeft += 5;

    if (bitsLeft >= 8) {
      bitsLeft -= 8;
      output.push((buffer >> bitsLeft) & 0xff);
    }
  }

  return new Uint8Array(output);
}

/**
 * Convert a number to a byte array (big-endian)
 */
function numberToBytes(num: number, byteLength = 8): Uint8Array {
  const bytes = new Uint8Array(byteLength);
  for (let i = byteLength - 1; i >= 0; i--) {
    bytes[i] = num & 0xff;
    num = Math.floor(num / 256);
  }
  return bytes;
}

/**
 * Compute HMAC-SHA1 using Web Crypto API
 */
async function hmacSha1(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const keyBuffer = key.buffer.slice(key.byteOffset, key.byteOffset + key.byteLength) as ArrayBuffer;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const messageBuffer = message.buffer.slice(message.byteOffset, message.byteOffset + message.byteLength) as ArrayBuffer;
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageBuffer);
  return new Uint8Array(signature);
}

/**
 * Dynamic truncation as per RFC 4226
 */
function dynamicTruncation(hmac: Uint8Array, digits = 6): string {
  const offset = hmac[hmac.length - 1] & 0x0f;

  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binary % Math.pow(10, digits);
  return otp.toString().padStart(digits, "0");
}

export interface TOTPOptions {
  digits?: number;
  period?: number;
  timestamp?: number;
}

/**
 * Generate a TOTP code
 */
export async function generateTOTP(
  secret: string,
  options: TOTPOptions = {}
): Promise<string> {
  const { digits = 6, period = 30, timestamp = Date.now() } = options;

  const key = base32Decode(secret);
  const counter = Math.floor(timestamp / 1000 / period);
  const counterBytes = numberToBytes(counter);
  const hmac = await hmacSha1(key, counterBytes);

  return dynamicTruncation(hmac, digits);
}

/**
 * Get remaining seconds until next TOTP code
 */
export function getRemainingSeconds(period = 30, timestamp = Date.now()): number {
  return period - (Math.floor(timestamp / 1000) % period);
}

/**
 * Validate a secret key format
 */
export function isValidSecret(secret: string): boolean {
  if (!secret || typeof secret !== "string") {
    return false;
  }

  const cleaned = secret.replace(/\s/g, "").toUpperCase().replace(/=+$/, "");

  if (cleaned.length === 0) {
    return false;
  }

  for (const char of cleaned) {
    if (BASE32_CHARS.indexOf(char) === -1) {
      return false;
    }
  }

  return true;
}

/**
 * Format a secret key for display (groups of 4)
 */
export function formatSecret(secret: string): string {
  const cleaned = secret.replace(/\s/g, "").toUpperCase();
  return cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
}

/**
 * Parse an otpauth:// URI into account name and secret
 * Format: otpauth://totp/Label?secret=XXX&issuer=YYY
 */
export function parseOtpAuthUri(uri: string): {
  name: string;
  secret: string;
  issuer?: string;
} | null {
  try {
    if (!uri.startsWith("otpauth://totp/")) return null;

    const url = new URL(uri);
    const secret = url.searchParams.get("secret");
    if (!secret) return null;

    const cleanedSecret = secret.replace(/\s/g, "").toUpperCase();
    if (!isValidSecret(cleanedSecret)) return null;

    const issuer = url.searchParams.get("issuer") || undefined;

    // Label is the path after /totp/ — may be "Issuer:user@email" or just "Label"
    let label = decodeURIComponent(url.pathname.replace(/^\/totp\//, ""));
    // If label contains "Issuer:", strip the issuer prefix
    if (label.includes(":")) {
      label = label.split(":").slice(1).join(":").trim();
    }

    const name = label || issuer || "Imported Account";

    return { name, secret: cleanedSecret, issuer };
  } catch {
    return null;
  }
}
