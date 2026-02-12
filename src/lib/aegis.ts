/**
 * Aegis Authenticator Format
 * Import/Export for Aegis Authenticator plain-text JSON backup
 */

export interface AegisEntry {
  type: string;
  uuid: string;
  name: string;
  issuer: string;
  note: string;
  favorite: boolean;
  icon: string | null;
  info: {
    secret: string;
    algo: string;
    digits: number;
    period: number;
  };
}

export interface AegisVault {
  version: number;
  header: {
    slots: null;
    params: null;
  };
  db: {
    version: number;
    entries: AegisEntry[];
  };
}

export interface SimpleAccount {
  name: string;
  secret: string;
  issuer?: string;
}

/**
 * Generate a UUID v4
 */
function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Export accounts to Aegis Authenticator JSON format
 */
export function exportToAegisJSON(accounts: SimpleAccount[]): string {
  const vault: AegisVault = {
    version: 2,
    header: {
      slots: null,
      params: null,
    },
    db: {
      version: 2,
      entries: accounts.map((acc) => ({
        type: "totp",
        uuid: uuidv4(),
        name: acc.name,
        issuer: acc.issuer || acc.name,
        note: "",
        favorite: false,
        icon: null,
        info: {
          secret: acc.secret,
          algo: "SHA1",
          digits: 6,
          period: 30,
        },
      })),
    },
  };

  return JSON.stringify(vault, null, 2);
}

/**
 * Parse Aegis Authenticator JSON backup
 * Returns array of accounts or null if invalid
 */
export function parseAegisJSON(jsonString: string): SimpleAccount[] | null {
  try {
    const data = JSON.parse(jsonString);

    // Check if it's Aegis format
    if (!data.db?.entries || !Array.isArray(data.db.entries)) {
      return null;
    }

    const accounts: SimpleAccount[] = [];

    for (const entry of data.db.entries) {
      // Only import TOTP entries
      if (entry.type !== "totp") continue;

      const secret = entry.info?.secret;
      const name = entry.name || entry.issuer || "Imported Account";
      const issuer = entry.issuer || undefined;

      if (!secret) continue;

      accounts.push({
        name,
        secret: secret.replace(/\s/g, "").toUpperCase(),
        issuer,
      });
    }

    return accounts.length > 0 ? accounts : null;
  } catch {
    return null;
  }
}
