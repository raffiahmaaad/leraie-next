// Card Generator Utilities with Custom BIN Support

export interface CardType {
  name: string;
  prefixes: string[];
  length: number;
  cvvLength: number;
  gradient: string;
}

export const CardTypes: Record<string, CardType> = {
  visa: {
    name: "Visa",
    prefixes: ["4"],
    length: 16,
    cvvLength: 3,
    gradient: "linear-gradient(135deg, #1a1f71, #2563eb)",
  },
  mastercard: {
    name: "Mastercard",
    prefixes: ["51", "52", "53", "54", "55"],
    length: 16,
    cvvLength: 3,
    gradient: "linear-gradient(135deg, #eb001b, #f79e1b)",
  },
  amex: {
    name: "American Express",
    prefixes: ["34", "37"],
    length: 15,
    cvvLength: 4,
    gradient: "linear-gradient(135deg, #006fcf, #00a7e1)",
  },
  discover: {
    name: "Discover",
    prefixes: ["6011", "65"],
    length: 16,
    cvvLength: 3,
    gradient: "linear-gradient(135deg, #ff6600, #ffaa00)",
  },
  jcb: {
    name: "JCB",
    prefixes: ["3528", "3529", "353", "354", "355", "356", "357", "358"],
    length: 16,
    cvvLength: 3,
    gradient: "linear-gradient(135deg, #0f4c81, #1a7f37)",
  },
  unionpay: {
    name: "UnionPay",
    prefixes: ["62"],
    length: 16,
    cvvLength: 3,
    gradient: "linear-gradient(135deg, #e21836, #00447c)",
  },
};

// Luhn algorithm check
export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length === 0) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// Calculate Luhn check digit
export function calculateLuhnCheckDigit(partialNumber: string): number {
  const digits = partialNumber.replace(/\D/g, "");
  let sum = 0;
  let isEven = true; // Start with true because we're adding a digit at the end

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return (10 - (sum % 10)) % 10;
}

// Generate random digits
function randomDigits(count: number): string {
  let result = "";
  for (let i = 0; i < count; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

// Detect card type from BIN
export function detectCardType(bin: string): string | null {
  const cleanBin = bin.replace(/\D/g, "");
  
  for (const [type, config] of Object.entries(CardTypes)) {
    for (const prefix of config.prefixes) {
      if (cleanBin.startsWith(prefix)) {
        return type;
      }
    }
  }
  return null;
}

// Format card number with spaces
export function formatCardNumber(number: string): string {
  const clean = number.replace(/\D/g, "");
  // American Express: 4-6-5 format
  if (clean.length === 15 && (clean.startsWith("34") || clean.startsWith("37"))) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 10)} ${clean.slice(10)}`;
  }
  // Standard: 4-4-4-4 format
  return clean.replace(/(.{4})/g, "$1 ").trim();
}

export interface GeneratedCard {
  number: string;
  formattedNumber: string;
  expiry: string;
  cvv: string;
  typeName: string;
  typeKey: string;
  gradient: string;
  isValid: boolean;
}

export interface GenerateCardOptions {
  bin?: string;           // Custom BIN (first 6-8 digits)
  expiryMonth?: string;   // Custom month (01-12)
  expiryYear?: string;    // Custom year (2 or 4 digits)
  cvv?: string;           // Custom CVV pattern (can include 'x' for random)
  cardType?: string;      // Card type key
}

// Generate expiry date
function generateExpiry(month?: string, year?: string): string {
  if (month && year) {
    // Validate and format month
    let m = parseInt(month, 10);
    if (isNaN(m) || m < 1) m = 1;
    if (m > 12) m = 12;
    
    // Format year to 2 digits
    let y = year.replace(/\D/g, "");
    if (y.length === 4) y = y.slice(2);
    if (y.length === 1) y = "2" + y;
    if (y.length === 0) y = (new Date().getFullYear() + 3).toString().slice(2);
    
    return `${m.toString().padStart(2, "0")}/${y}`;
  }
  
  // Random future date
  const now = new Date();
  const futureYear = now.getFullYear() + Math.floor(Math.random() * 5) + 1;
  const randomMonth = Math.floor(Math.random() * 12) + 1;
  return `${randomMonth.toString().padStart(2, "0")}/${futureYear.toString().slice(2)}`;
}

// Generate CVV based on pattern
function generateCVV(pattern?: string, length: number = 3): string {
  if (!pattern) {
    return randomDigits(length);
  }
  
  let cvv = "";
  for (const char of pattern) {
    if (char === "x" || char === "X") {
      cvv += Math.floor(Math.random() * 10).toString();
    } else if (/\d/.test(char)) {
      cvv += char;
    }
  }
  
  // Pad or trim to correct length
  while (cvv.length < length) {
    cvv += Math.floor(Math.random() * 10).toString();
  }
  return cvv.slice(0, length);
}

// Generate a single card with custom options
export function generateCard(options: GenerateCardOptions = {}): GeneratedCard {
  let cardType = options.cardType || "visa";
  let cardConfig = CardTypes[cardType];
  
  // If custom BIN provided, detect card type
  let bin = options.bin?.replace(/\D/g, "") || "";
  
  if (bin) {
    const detectedType = detectCardType(bin);
    if (detectedType) {
      cardType = detectedType;
      cardConfig = CardTypes[cardType];
    }
  } else {
    // Use random prefix from card type
    const prefixes = cardConfig.prefixes;
    bin = prefixes[Math.floor(Math.random() * prefixes.length)];
  }
  
  const targetLength = cardConfig.length;
  
  // Generate the card number
  // BIN + random digits + check digit
  const digitsNeeded = targetLength - bin.length - 1; // -1 for check digit
  
  let cardNumber: string;
  if (digitsNeeded > 0) {
    const middleDigits = randomDigits(digitsNeeded);
    const partialNumber = bin + middleDigits;
    const checkDigit = calculateLuhnCheckDigit(partialNumber);
    cardNumber = partialNumber + checkDigit.toString();
  } else {
    // BIN is already long enough, just add check digit
    const partialNumber = bin.slice(0, targetLength - 1);
    const checkDigit = calculateLuhnCheckDigit(partialNumber);
    cardNumber = partialNumber + checkDigit.toString();
  }
  
  // Verify Luhn
  const isValid = luhnCheck(cardNumber);
  
  // Generate expiry
  const expiry = generateExpiry(options.expiryMonth, options.expiryYear);
  
  // Generate CVV
  const cvv = generateCVV(options.cvv, cardConfig.cvvLength);
  
  return {
    number: cardNumber,
    formattedNumber: formatCardNumber(cardNumber),
    expiry,
    cvv,
    typeName: cardConfig.name,
    typeKey: cardType,
    gradient: cardConfig.gradient,
    isValid,
  };
}

// Generate multiple cards
export function generateCards(quantity: number, options: GenerateCardOptions = {}): GeneratedCard[] {
  const cards: GeneratedCard[] = [];
  for (let i = 0; i < quantity; i++) {
    cards.push(generateCard(options));
  }
  return cards;
}

// Validate BIN format
export function isValidBIN(bin: string): boolean {
  const clean = bin.replace(/\D/g, "");
  return clean.length >= 1 && clean.length <= 14 && /^\d+$/.test(clean);
}
