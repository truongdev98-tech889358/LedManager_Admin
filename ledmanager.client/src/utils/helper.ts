import { CurrencyEnum, LocalStorageEnum } from "@/configs/constants";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";

export const formatCurrency = (amount: number, targetCurrency?: string) => {
  if (amount === 0) {
    const currency = targetCurrency ?? getCurrencyStorage();
    switch (currency) {
      case "USD":
        return "0 $";
      case "KRW":
        return "0 ₩";
      case "VND":
        return "0 ₫";
      default:
        return "0 ₫";
    }
  }
  const currency = targetCurrency ?? getCurrencyStorage();
  switch (currency) {
    case "VND":
      return amount
        .toLocaleString("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 })
        .replace(/\.00$/, "");
    case "USD":
      return amount
        .toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })
        .replace(/\.00$/, "");
    case "KRW":
      return amount
        .toLocaleString("kr", { style: "currency", currency: "KRW", minimumFractionDigits: 0 })
        .replace(/\.00$/, "");
    default:
      return amount.toLocaleString("vi-VN") + " ₫";
  }
};

export const formatDuration = (minutes: number) => {
  if (minutes <= 0 || !Number.isFinite(minutes)) return "";

  const lang = getLangCode();
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const dic = {
    vi: {
      hour: "g",
      minute: "p",
    },
    en: {
      hour: "h",
      minute: "m",
    },
    ko: {
      hour: "시간",
      minute: "분",
    },
  }[lang];

  const hourPart = hours > 0 ? `${hours}${dic?.hour}` : "";

  const minutePart = mins > 0 ? `${mins}${dic?.minute}` : "";

  return [hourPart, minutePart].filter(Boolean).join(" ");
};

export const getAirport = (code: string | null) => {
  if (!code) {
    return null;
  }
  return {
    name: code,
  };
};
export function formatDateTime(
  date: string | Date,
  timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone, // mặc định theo local user
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = new Date(date);

  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
    timeZone,
  });
}

export const getLangCode = () => {
  const langStorage = localStorage.getItem(LocalStorageEnum.I18NLng);
  const lang = langStorage ? (langStorage === "kr" ? "ko" : langStorage.split("-")[0]) : "vi";
  return lang;
};

function generateCodeVerifier(length: number) {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function base64URLEncode(str: ArrayBuffer): string {
  let base64 = btoa(String.fromCharCode.apply(null, [...new Uint8Array(str)]));
  base64 = base64.replace(/\+/g, "-");
  base64 = base64.replace(/\//g, "_");
  base64 = base64.replace(/=+$/, "");
  return base64;
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

const codeVerifier = localStorage.getItem("codeVerifier") || generateCodeVerifier(128);
localStorage.setItem("codeVerifier", codeVerifier);

const codeChallengePromise = sha256(codeVerifier).then((buffer) => base64URLEncode(buffer));

export const Utility = {
  RedirectUri: "https://airticket2-be.brightsoftsolution.com/auth/callback",
  CodeChallengeMethod: "S256",
  CodeVerifier: codeVerifier,
  CodeChallenge: codeChallengePromise,
  IdentityServerUri: "https://airticket2.brightsoftsolution.com/identity",
};

export const simpleString = (input: string) => {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
};

export const toSlug = (input: string) => {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};


export const hasCMSEditorPermission = (roles: string[]) => {
  return roles.includes("CMSEditor");
};

export const formatNumber = (value: string | number, isRoundNumber = false) => {
  return (isRoundNumber ? Math.round(Number(value ?? 0)) : Number(value ?? 0)).toLocaleString(
    "en-US",
  );
};

export const toClientTime = (time: any) => {
  return dayjs(time).add(new Date().getTimezoneOffset() * -1, "m");
};
export const formatCurrencyVND = (amount: number) => {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    minimumFractionDigits: 0,
    useGrouping: true,
  });

  return formatter.format(amount).replace(/\.00$/, "") + " VND";
};

export const getUserFromStorage = () => {
  const token = localStorage.getItem(LocalStorageEnum.AccessToken);
  if (!token) return null;
  return jwtDecode(token) as any;
};

export const getCurrencyStorage = () => {
  return (localStorage.getItem(LocalStorageEnum.Currency) as CurrencyEnum) ?? CurrencyEnum.VND;
};

export const formatBaggage = (baggage: string | undefined | null, t: any): string => {
  if (!baggage || baggage === "N/A" || baggage.trim() === "") {
    return t("flightPriceSummary.notIncluded") || "N/A";
  }

  // Handle case where it's already "0" or "No baggage"
  if (baggage === "0" || baggage === "0PC") {
    return t("flightPriceSummary.notIncluded") || "0 PC";
  }

  let raw = baggage.trim();

  // If match 1PC 2PC or 2PC 1PC, prioritize 2PC
  const pcMatches = [...raw.matchAll(/(\d+)\s*PC/gi)];
  if (pcMatches.length > 1) {
    const maxPC = Math.max(...pcMatches.map((m) => parseInt(m[1])));
    raw = `${maxPC}PC`;
  }

  // 1. Remove redundant leading count (e.g., "1 2PC", "1/20KG", "2 1PC")
  // Rule: If string starts with a number, followed by a non-digit separator, then another number,
  // we remove the first number and the separator.
  // This avoids stripping "20KG" or "1PC" but catches "1 2PC" or "2 20KG".
  raw = raw.replace(/^(\d+)[\s/x*-]+(?=\d)/, "");

  const hasPC = /(PC|Pieces?|Items?|Kiện)/i.test(raw);
  const hasKG = /KG/i.test(raw);

  // 2. Process based on unit types
  if (hasPC && !hasKG) {
    // Pure piece-based: "2PC" -> "2 Kiện"
    const count = raw.replace(/(PCs?|Pieces?|Items?|Kiện)/gi, "").trim();
    return t("flightPriceSummary.baggagePiece", { count, defaultValue: `${count} kiện` });
  }

  // 3. If has KG (Mixed or Pure KG), remove PC info as per request "7 KG 1 PC" -> "7kg"
  if (hasKG) {
    // Remove variations of "1 PC", "1 Piece", "1 Item", "1 Kiện", including "1xPC" etc.
    raw = raw.replace(/(\d+)?\s*[xX]?\s*(PCs?|Pieces?|Items?|Kiện)/gi, "").trim();
  }
  
  let val = raw
    .replace(/KGS?/gi, "kg")
    .replace(/\s+/g, " ")
    .trim();

  // Final safety check for any remaining double numbers at start
  if (/^\d+\s+\d+/.test(val)) {
    val = val.replace(/^\d+\s+/, "");
  }

  return val;
};
