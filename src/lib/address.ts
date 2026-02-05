// Address data for 24 countries
export interface CityData {
  city: string;
  state: string;
  zip: string;
}

export interface CountryData {
  name: string;
  flag: string;
  format: string;
  streets: string[];
  cities: CityData[];
  phoneFormat: string;
  emailDomains: string[];
  firstNames: string[];
  lastNames: string[];
}

export const AddressData: Record<string, CountryData> = {
  US: {
    name: "United States",
    flag: "🇺🇸",
    format: "{number} {street}\\n{city}, {state} {zip}\\n{country}",
    streets: [
      "Fifth Avenue", "Broadway", "Wall Street", "Madison Avenue", "Park Avenue",
      "Sunset Boulevard", "Hollywood Boulevard", "Rodeo Drive", "Mulholland Drive",
      "Michigan Avenue", "Magnificent Mile", "State Street", "Lake Shore Drive"
    ],
    cities: [
      { city: "New York", state: "New York", zip: "10001" },
      { city: "Los Angeles", state: "California", zip: "90001" },
      { city: "Chicago", state: "Illinois", zip: "60601" },
      { city: "Houston", state: "Texas", zip: "77001" },
      { city: "Phoenix", state: "Arizona", zip: "85001" },
      { city: "Philadelphia", state: "Pennsylvania", zip: "19101" },
      { city: "San Antonio", state: "Texas", zip: "78201" },
      { city: "San Diego", state: "California", zip: "92101" },
      { city: "Dallas", state: "Texas", zip: "75201" },
      { city: "San Jose", state: "California", zip: "95101" }
    ],
    phoneFormat: "+1 (XXX) XXX-XXXX",
    emailDomains: ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"],
    firstNames: ["James", "John", "Robert", "Michael", "William", "David", "Mary", "Patricia", "Jennifer", "Linda"],
    lastNames: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]
  },
  ID: {
    name: "Indonesia",
    flag: "🇮🇩",
    format: "{street} No. {number}\\n{city}, {state} {zip}\\n{country}",
    streets: [
      "Jalan Sudirman", "Jalan Thamrin", "Jalan Gatot Subroto", "Jalan Rasuna Said",
      "Jalan Malioboro", "Jalan Braga", "Jalan Asia Afrika", "Jalan Diponegoro"
    ],
    cities: [
      { city: "Jakarta Selatan", state: "DKI Jakarta", zip: "12910" },
      { city: "Jakarta Pusat", state: "DKI Jakarta", zip: "10110" },
      { city: "Bandung", state: "Jawa Barat", zip: "40111" },
      { city: "Surabaya", state: "Jawa Timur", zip: "60111" },
      { city: "Yogyakarta", state: "DI Yogyakarta", zip: "55111" },
      { city: "Denpasar", state: "Bali", zip: "80111" },
      { city: "Medan", state: "Sumatera Utara", zip: "20111" },
      { city: "Semarang", state: "Jawa Tengah", zip: "50111" }
    ],
    phoneFormat: "+62 8XX-XXXX-XXXX",
    emailDomains: ["gmail.com", "yahoo.co.id", "outlook.com"],
    firstNames: ["Budi", "Agus", "Andi", "Dedi", "Eko", "Siti", "Dewi", "Rina", "Ani", "Sri"],
    lastNames: ["Santoso", "Wijaya", "Susanto", "Hidayat", "Saputra", "Pratama", "Nugroho", "Putra", "Setiawan", "Wibowo"]
  },
  SG: {
    name: "Singapore",
    flag: "🇸🇬",
    format: "{number} {street}\\nSingapore {zip}",
    streets: [
      "Orchard Road", "Marina Bay Sands", "Raffles Place", "Clarke Quay",
      "Sentosa Gateway", "Harbourfront", "Jurong East", "Tampines Central"
    ],
    cities: [
      { city: "Singapore", state: "Central", zip: "018956" },
      { city: "Singapore", state: "Orchard", zip: "238823" },
      { city: "Singapore", state: "Marina Bay", zip: "018960" },
      { city: "Singapore", state: "Jurong", zip: "609602" },
      { city: "Singapore", state: "Tampines", zip: "529510" }
    ],
    phoneFormat: "+65 XXXX XXXX",
    emailDomains: ["gmail.com", "yahoo.com.sg", "outlook.com"],
    firstNames: ["Wei", "Jia", "Ming", "Hui", "Xin", "Yi", "Jun", "Zhi", "Kai", "Hao"],
    lastNames: ["Tan", "Lim", "Lee", "Ng", "Wong", "Goh", "Chua", "Ong", "Koh", "Teo"]
  },
  JP: {
    name: "Japan",
    flag: "🇯🇵",
    format: "〒{zip}\\n{state} {city}\\n{street} {number}",
    streets: [
      "Ginza", "Shibuya", "Shinjuku", "Harajuku", "Roppongi",
      "Akihabara", "Asakusa", "Ikebukuro", "Ueno", "Odaiba"
    ],
    cities: [
      { city: "Shibuya-ku", state: "Tokyo", zip: "150-0001" },
      { city: "Shinjuku-ku", state: "Tokyo", zip: "160-0001" },
      { city: "Minato-ku", state: "Tokyo", zip: "105-0001" },
      { city: "Kita-ku", state: "Osaka", zip: "530-0001" },
      { city: "Nakagyo-ku", state: "Kyoto", zip: "604-0001" }
    ],
    phoneFormat: "+81 XX-XXXX-XXXX",
    emailDomains: ["gmail.com", "yahoo.co.jp", "outlook.jp"],
    firstNames: ["Hiroshi", "Kenji", "Takeshi", "Daisuke", "Yuki", "Sakura", "Hana", "Aoi", "Mei", "Rin"],
    lastNames: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato"]
  },
  GB: {
    name: "United Kingdom",
    flag: "🇬🇧",
    format: "{number} {street}\\n{city}\\n{state}\\n{zip}",
    streets: [
      "Oxford Street", "Regent Street", "Bond Street", "Piccadilly",
      "Abbey Road", "Baker Street", "Kings Road", "Carnaby Street"
    ],
    cities: [
      { city: "London", state: "Greater London", zip: "SW1A" },
      { city: "Manchester", state: "Greater Manchester", zip: "M1" },
      { city: "Birmingham", state: "West Midlands", zip: "B1" },
      { city: "Liverpool", state: "Merseyside", zip: "L1" },
      { city: "Edinburgh", state: "Scotland", zip: "EH1" }
    ],
    phoneFormat: "+44 XXXX XXXXXX",
    emailDomains: ["gmail.com", "outlook.co.uk", "yahoo.co.uk"],
    firstNames: ["Oliver", "George", "Harry", "Jack", "Leo", "Olivia", "Amelia", "Isla", "Ava", "Emily"],
    lastNames: ["Smith", "Jones", "Williams", "Brown", "Taylor", "Davies", "Wilson", "Evans", "Thomas", "Johnson"]
  }
};

// Helper functions
export function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomDigits(count: number): string {
  let result = "";
  for (let i = 0; i < count; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

export function randomLetter(): string {
  return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

export function generateHouseNumber(): string {
  const num = Math.floor(Math.random() * 200) + 1;
  if (Math.random() < 0.1) {
    return `${num}${randomItem(["A", "B", "C"])}`;
  }
  return num.toString();
}

export function generateZipCode(zip: string, countryName: string): string {
  if (!zip) return "";
  
  if (countryName === "United Kingdom") {
    return `${zip} ${randomDigits(1)}${randomLetter()}${randomLetter()}`;
  }
  
  return zip;
}

export function generatePhone(format: string): string {
  let phone = format;
  while (phone.includes("X")) {
    phone = phone.replace("X", Math.floor(Math.random() * 10).toString());
  }
  return phone;
}

export function generateEmail(firstName: string, lastName: string, domains: string[]): string {
  const domain = randomItem(domains);
  const patterns = [
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${Math.floor(Math.random() * 100)}`,
    `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}`
  ];
  
  let email = randomItem(patterns);
  email = email.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  email = email.replace(/[^a-z0-9._]/g, "");
  
  return `${email}@${domain}`;
}

export interface GeneratedAddress {
  street: string;
  number: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  countryCode: string;
  flag: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  email?: string;
}

export interface GenerateOptions {
  includeName?: boolean;
  includePhone?: boolean;
  includeEmail?: boolean;
}

export function generateAddress(countryCode: string, options: GenerateOptions = {}): GeneratedAddress {
  const countryData = AddressData[countryCode];
  if (!countryData) throw new Error("Country not found");

  const street = randomItem(countryData.streets);
  const cityData = randomItem(countryData.cities);
  const houseNumber = generateHouseNumber();
  const zip = generateZipCode(cityData.zip, countryData.name);

  const address: GeneratedAddress = {
    street,
    number: houseNumber,
    city: cityData.city,
    state: cityData.state,
    zip,
    country: countryData.name,
    countryCode,
    flag: countryData.flag
  };

  if (options.includeName) {
    address.firstName = randomItem(countryData.firstNames);
    address.lastName = randomItem(countryData.lastNames);
    address.fullName = `${address.firstName} ${address.lastName}`;
  }

  if (options.includePhone) {
    address.phone = generatePhone(countryData.phoneFormat);
  }

  if (options.includeEmail && options.includeName) {
    address.email = generateEmail(address.firstName!, address.lastName!, countryData.emailDomains);
  } else if (options.includeEmail) {
    const firstName = randomItem(countryData.firstNames);
    const lastName = randomItem(countryData.lastNames);
    address.email = generateEmail(firstName, lastName, countryData.emailDomains);
  }

  return address;
}
