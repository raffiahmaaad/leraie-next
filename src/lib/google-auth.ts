/**
 * Google Authenticator Migration Format
 * Encodes/decodes the protobuf-based otpauth-migration:// URI format
 * Used for bulk import/export with Google Authenticator app
 */

import { base32Decode } from "./totp";

// Base32 chars for encoding
const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(data: Uint8Array): string {
  let result = "";
  let buffer = 0;
  let bitsLeft = 0;

  for (const byte of data) {
    buffer = (buffer << 8) | byte;
    bitsLeft += 8;

    while (bitsLeft >= 5) {
      bitsLeft -= 5;
      result += BASE32_CHARS[(buffer >> bitsLeft) & 0x1f];
    }
  }

  if (bitsLeft > 0) {
    result += BASE32_CHARS[(buffer << (5 - bitsLeft)) & 0x1f];
  }

  return result;
}

// ============================================================
// Minimal Protobuf Encoder/Decoder for Google Auth Migration
// ============================================================

// Wire types
const WIRE_VARINT = 0;
const WIRE_LENGTH_DELIMITED = 2;

// --- Encoder ---

function encodeVarint(value: number): number[] {
  const bytes: number[] = [];
  let v = value >>> 0; // Treat as unsigned
  while (v > 0x7f) {
    bytes.push((v & 0x7f) | 0x80);
    v >>>= 7;
  }
  bytes.push(v & 0x7f);
  return bytes;
}

function encodeTag(fieldNumber: number, wireType: number): number[] {
  return encodeVarint((fieldNumber << 3) | wireType);
}

function encodeBytes(fieldNumber: number, data: Uint8Array): number[] {
  return [
    ...encodeTag(fieldNumber, WIRE_LENGTH_DELIMITED),
    ...encodeVarint(data.length),
    ...Array.from(data),
  ];
}

function encodeString(fieldNumber: number, value: string): number[] {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  return encodeBytes(fieldNumber, data);
}

function encodeInt32(fieldNumber: number, value: number): number[] {
  if (value === 0) return []; // Don't encode default values
  return [...encodeTag(fieldNumber, WIRE_VARINT), ...encodeVarint(value)];
}

function encodeMessage(fieldNumber: number, data: number[]): number[] {
  return [
    ...encodeTag(fieldNumber, WIRE_LENGTH_DELIMITED),
    ...encodeVarint(data.length),
    ...data,
  ];
}

// --- Decoder ---

interface DecoderState {
  data: Uint8Array;
  pos: number;
}

function decodeVarint(state: DecoderState): number {
  let result = 0;
  let shift = 0;
  while (state.pos < state.data.length) {
    const byte = state.data[state.pos++];
    result |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) break;
    shift += 7;
  }
  return result >>> 0;
}

function decodeTag(state: DecoderState): { fieldNumber: number; wireType: number } {
  const value = decodeVarint(state);
  return {
    fieldNumber: value >>> 3,
    wireType: value & 0x07,
  };
}

function decodeLengthDelimited(state: DecoderState): Uint8Array {
  const length = decodeVarint(state);
  const data = state.data.slice(state.pos, state.pos + length);
  state.pos += length;
  return data;
}

function decodeString(data: Uint8Array): string {
  return new TextDecoder().decode(data);
}

// ============================================================
// Google Authenticator OTP Parameters
// ============================================================

export interface GoogleAuthOtpParam {
  secret: string; // Base32 encoded
  name: string;
  issuer: string;
  algorithm: number; // 0=unspecified, 1=SHA1, 2=SHA256, 3=SHA512
  digits: number; // 0=unspecified, 1=six, 2=eight
  type: number; // 0=unspecified, 1=HOTP, 2=TOTP
}

/**
 * Encode accounts into Google Authenticator migration protobuf format
 */
function encodeOtpParam(param: GoogleAuthOtpParam): number[] {
  const secretBytes = base32Decode(param.secret);
  const data: number[] = [
    ...encodeBytes(1, secretBytes), // secret (bytes)
    ...encodeString(2, param.name), // name
    ...encodeString(3, param.issuer), // issuer
    ...encodeInt32(4, param.algorithm), // algorithm
    ...encodeInt32(5, param.digits), // digits
    ...encodeInt32(6, param.type), // type
  ];
  return data;
}

function encodeMigrationPayload(
  params: GoogleAuthOtpParam[],
  batchIndex: number = 0,
  batchSize: number = 1,
  batchId: number = 0,
): Uint8Array {
  let data: number[] = [];

  // Encode each otp_parameters as embedded message (field 1)
  for (const param of params) {
    const paramData = encodeOtpParam(param);
    data = [...data, ...encodeMessage(1, paramData)];
  }

  // version = 1 (field 2)
  data = [...data, ...encodeInt32(2, 1)];
  // batch_size (field 3)
  data = [...data, ...encodeInt32(3, batchSize)];
  // batch_index (field 4)
  if (batchIndex > 0) {
    data = [...data, ...encodeInt32(4, batchIndex)];
  }
  // batch_id (field 5)
  if (batchId > 0) {
    data = [...data, ...encodeInt32(5, batchId)];
  }

  return new Uint8Array(data);
}

/**
 * Decode migration protobuf into OTP parameters
 */
function decodeOtpParam(data: Uint8Array): GoogleAuthOtpParam {
  const state: DecoderState = { data, pos: 0 };
  const param: GoogleAuthOtpParam = {
    secret: "",
    name: "",
    issuer: "",
    algorithm: 1,
    digits: 1,
    type: 2,
  };

  while (state.pos < state.data.length) {
    const { fieldNumber, wireType } = decodeTag(state);

    if (wireType === WIRE_LENGTH_DELIMITED) {
      const fieldData = decodeLengthDelimited(state);
      switch (fieldNumber) {
        case 1: // secret (bytes → base32)
          param.secret = base32Encode(fieldData);
          break;
        case 2: // name
          param.name = decodeString(fieldData);
          break;
        case 3: // issuer
          param.issuer = decodeString(fieldData);
          break;
      }
    } else if (wireType === WIRE_VARINT) {
      const value = decodeVarint(state);
      switch (fieldNumber) {
        case 4:
          param.algorithm = value;
          break;
        case 5:
          param.digits = value;
          break;
        case 6:
          param.type = value;
          break;
      }
    } else {
      // Skip unknown wire types
      if (wireType === WIRE_LENGTH_DELIMITED) {
        decodeLengthDelimited(state);
      } else {
        decodeVarint(state);
      }
    }
  }

  return param;
}

function decodeMigrationPayload(data: Uint8Array): GoogleAuthOtpParam[] {
  const state: DecoderState = { data, pos: 0 };
  const params: GoogleAuthOtpParam[] = [];

  while (state.pos < state.data.length) {
    const { fieldNumber, wireType } = decodeTag(state);

    if (wireType === WIRE_LENGTH_DELIMITED) {
      const fieldData = decodeLengthDelimited(state);
      if (fieldNumber === 1) {
        // otp_parameters
        params.push(decodeOtpParam(fieldData));
      }
      // Skip other length-delimited fields
    } else if (wireType === WIRE_VARINT) {
      decodeVarint(state); // Skip version, batch_size, batch_index, batch_id
    }
  }

  return params;
}

// ============================================================
// Public API
// ============================================================

const ACCOUNTS_PER_QR = 10; // Google Authenticator typically uses ~10 per QR

export interface SimpleAccount {
  name: string;
  secret: string;
  issuer?: string;
}

/**
 * Generate Google Authenticator migration URIs (one per batch)
 * Returns array of otpauth-migration:// URIs to be rendered as QR codes
 */
export function generateGoogleAuthMigrationURIs(
  accounts: SimpleAccount[],
): string[] {
  if (accounts.length === 0) return [];

  const batchId = Math.floor(Math.random() * 1000000);
  const totalBatches = Math.ceil(accounts.length / ACCOUNTS_PER_QR);
  const uris: string[] = [];

  for (let i = 0; i < totalBatches; i++) {
    const batchAccounts = accounts.slice(
      i * ACCOUNTS_PER_QR,
      (i + 1) * ACCOUNTS_PER_QR,
    );

    const params: GoogleAuthOtpParam[] = batchAccounts.map((acc) => ({
      secret: acc.secret,
      name: acc.issuer ? `${acc.issuer}:${acc.name}` : acc.name,
      issuer: acc.issuer || acc.name,
      algorithm: 1, // SHA1
      digits: 1, // 6 digits
      type: 2, // TOTP
    }));

    const payload = encodeMigrationPayload(params, i, totalBatches, batchId);
    const base64 = btoa(String.fromCharCode(...payload));
    const uri = `otpauth-migration://offline?data=${encodeURIComponent(base64)}`;
    uris.push(uri);
  }

  return uris;
}

/**
 * Parse a Google Authenticator migration URI
 * Returns array of accounts decoded from the protobuf payload
 */
export function parseGoogleAuthMigrationURI(
  uri: string,
): SimpleAccount[] | null {
  try {
    if (!uri.startsWith("otpauth-migration://offline")) return null;

    const url = new URL(uri);
    const data = url.searchParams.get("data");
    if (!data) return null;

    const binaryStr = atob(data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const params = decodeMigrationPayload(bytes);

    return params
      .filter((p) => p.secret && p.type === 2) // Only TOTP
      .map((p) => {
        // Parse name: may be "Issuer:label" format
        let name = p.name;
        let issuer = p.issuer;
        if (name.includes(":")) {
          const parts = name.split(":");
          if (!issuer) issuer = parts[0].trim();
          name = parts.slice(1).join(":").trim();
        }
        return {
          name: name || issuer || "Imported Account",
          secret: p.secret,
          issuer: issuer || undefined,
        };
      });
  } catch {
    return null;
  }
}
