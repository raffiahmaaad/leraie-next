/**
 * QRIS (Quick Response Code Indonesian Standard) Utilities
 * Based on EMV QR Code Specification and QRIS Technical Standard
 */

// TLV (Tag-Length-Value) Interface
interface TLV {
  tag: string;
  length: number;
  value: string;
}

// Parsed QRIS Data Interface
export interface QRISData {
  payloadFormat: string;
  pointOfInitiation: string;
  merchantAccountInfo: {
    globalUniqueId: string;
    merchantId: string;
    merchantCriteria: string;
  };
  merchantCategoryCode: string;
  transactionCurrency: string;
  transactionAmount?: string;
  countryCode: string;
  merchantName: string;
  merchantCity: string;
  postalCode?: string;
  additionalData?: {
    referenceLabel?: string;
    terminalLabel?: string;
  };
  crc: string;
  isStatic: boolean;
  isValid: boolean;
  rawData: string;
}

/**
 * Parse TLV format string into array of TLV objects
 */
export function parseTLV(data: string): TLV[] {
  const result: TLV[] = [];
  let index = 0;

  while (index < data.length) {
    if (index + 4 > data.length) break;

    const tag = data.substring(index, index + 2);
    const length = parseInt(data.substring(index + 2, index + 4), 10);
    
    if (isNaN(length) || index + 4 + length > data.length) break;
    
    const value = data.substring(index + 4, index + 4 + length);
    result.push({ tag, length, value });
    index += 4 + length;
  }

  return result;
}

/**
 * Encode TLV data back to string
 */
export function encodeTLV(tag: string, value: string): string {
  const length = value.length.toString().padStart(2, "0");
  return `${tag}${length}${value}`;
}

/**
 * Calculate CRC16-CCITT checksum
 */
export function calculateCRC16(data: string): string {
  const polynomial = 0x1021;
  let crc = 0xFFFF;

  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc <<= 1;
      }
    }
    crc &= 0xFFFF;
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Validate CRC of QRIS data
 */
export function validateCRC(qrisData: string): boolean {
  if (qrisData.length < 8) return false;
  
  // CRC is at the end, format: 6304XXXX
  const dataWithoutCRC = qrisData.slice(0, -4);
  const providedCRC = qrisData.slice(-4).toUpperCase();
  const calculatedCRC = calculateCRC16(dataWithoutCRC);
  
  return providedCRC === calculatedCRC;
}

/**
 * Parse QRIS string into structured data
 */
export function parseQRIS(qrisString: string): QRISData | null {
  try {
    const cleanData = qrisString.trim();
    const tlvList = parseTLV(cleanData);
    
    if (tlvList.length === 0) return null;

    const data: QRISData = {
      payloadFormat: "",
      pointOfInitiation: "",
      merchantAccountInfo: {
        globalUniqueId: "",
        merchantId: "",
        merchantCriteria: "",
      },
      merchantCategoryCode: "",
      transactionCurrency: "",
      countryCode: "",
      merchantName: "",
      merchantCity: "",
      crc: "",
      isStatic: true,
      isValid: false,
      rawData: cleanData,
    };

    for (const tlv of tlvList) {
      switch (tlv.tag) {
        case "00": // Payload Format Indicator
          data.payloadFormat = tlv.value;
          break;
        case "01": // Point of Initiation Method
          data.pointOfInitiation = tlv.value;
          data.isStatic = tlv.value === "11";
          break;
        case "26": // Merchant Account Information (QRIS Indonesia)
        case "51": // Alternative MAI
          const maiTlv = parseTLV(tlv.value);
          for (const mai of maiTlv) {
            switch (mai.tag) {
              case "00":
                data.merchantAccountInfo.globalUniqueId = mai.value;
                break;
              case "01":
              case "02":
              case "03":
                data.merchantAccountInfo.merchantId = mai.value;
                break;
            }
          }
          break;
        case "52": // Merchant Category Code
          data.merchantCategoryCode = tlv.value;
          break;
        case "53": // Transaction Currency
          data.transactionCurrency = tlv.value;
          break;
        case "54": // Transaction Amount
          data.transactionAmount = tlv.value;
          break;
        case "58": // Country Code
          data.countryCode = tlv.value;
          break;
        case "59": // Merchant Name
          data.merchantName = tlv.value;
          break;
        case "60": // Merchant City
          data.merchantCity = tlv.value;
          break;
        case "61": // Postal Code
          data.postalCode = tlv.value;
          break;
        case "62": // Additional Data Field
          const additionalTlv = parseTLV(tlv.value);
          data.additionalData = {};
          for (const add of additionalTlv) {
            switch (add.tag) {
              case "05":
                data.additionalData.referenceLabel = add.value;
                break;
              case "07":
                data.additionalData.terminalLabel = add.value;
                break;
            }
          }
          break;
        case "63": // CRC
          data.crc = tlv.value;
          break;
      }
    }

    data.isValid = validateCRC(cleanData);
    return data;
  } catch {
    return null;
  }
}

/**
 * Convert static QRIS to dynamic QRIS with custom amount
 */
export function convertToDynamicQRIS(
  staticQRIS: string,
  amount: number,
  options?: {
    referenceLabel?: string;
    terminalLabel?: string;
  }
): string | null {
  try {
    const cleanData = staticQRIS.trim();
    const tlvList = parseTLV(cleanData);
    
    if (tlvList.length === 0) return null;

    let result = "";
    let hasAmount = false;
    let hasAdditionalData = false;

    for (const tlv of tlvList) {
      // Skip CRC (will be recalculated)
      if (tlv.tag === "63") continue;

      if (tlv.tag === "01") {
        // Change Point of Initiation to Dynamic (12)
        result += encodeTLV("01", "12");
      } else if (tlv.tag === "54") {
        // Replace transaction amount
        const amountStr = amount.toString();
        result += encodeTLV("54", amountStr);
        hasAmount = true;
      } else if (tlv.tag === "62") {
        // Update additional data if options provided
        let additionalValue = "";
        
        if (options?.referenceLabel) {
          additionalValue += encodeTLV("05", options.referenceLabel);
        }
        if (options?.terminalLabel) {
          additionalValue += encodeTLV("07", options.terminalLabel);
        }
        
        if (additionalValue) {
          result += encodeTLV("62", additionalValue);
        } else {
          result += encodeTLV(tlv.tag, tlv.value);
        }
        hasAdditionalData = true;
      } else {
        result += encodeTLV(tlv.tag, tlv.value);
      }
    }

    // Add amount if not present
    if (!hasAmount && amount > 0) {
      // Insert before country code (tag 58)
      const parts = result.split(/5802/);
      if (parts.length === 2) {
        const amountStr = amount.toString();
        result = parts[0] + encodeTLV("54", amountStr) + "5802" + parts[1];
      } else {
        // Just append before CRC
        const amountStr = amount.toString();
        result += encodeTLV("54", amountStr);
      }
    }

    // Add additional data if options provided and not present
    if (!hasAdditionalData && (options?.referenceLabel || options?.terminalLabel)) {
      let additionalValue = "";
      if (options?.referenceLabel) {
        additionalValue += encodeTLV("05", options.referenceLabel);
      }
      if (options?.terminalLabel) {
        additionalValue += encodeTLV("07", options.terminalLabel);
      }
      result += encodeTLV("62", additionalValue);
    }

    // Add CRC
    result += "6304";
    const crc = calculateCRC16(result);
    result += crc;

    return result;
  } catch {
    return null;
  }
}

/**
 * Format currency for display (Indonesian Rupiah)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Validate QRIS string format
 */
export function isValidQRIS(qrisString: string): boolean {
  if (!qrisString || typeof qrisString !== "string") return false;
  if (qrisString.length < 50) return false; // Too short
  if (!qrisString.startsWith("0002")) return false; // Should start with payload format
  if (!validateCRC(qrisString)) return false;
  
  const parsed = parseQRIS(qrisString);
  return parsed !== null && parsed.payloadFormat === "01";
}

/**
 * Get readable description of QRIS type
 */
export function getQRISTypeDescription(isStatic: boolean): string {
  return isStatic 
    ? "Static QRIS - dapat digunakan berulang (tanpa nominal)"
    : "Dynamic QRIS - sekali pakai (dengan nominal)";
}
