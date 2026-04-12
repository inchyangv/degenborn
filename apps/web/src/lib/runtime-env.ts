/**
 * Runtime env helpers for both server and client code.
 * Sanitizes whitespace/newline contamination from provider env values.
 */

export type DataSource = "moralis" | "covalent" | "rpc" | "fixture";

const DEFAULT_APP_URL = "http://localhost:3000";
const DATA_SOURCES: DataSource[] = ["moralis", "covalent", "rpc", "fixture"];

function clean(value: string | undefined | null): string {
  return (value ?? "").trim();
}

export function getAppUrl(): string {
  const envUrl = clean(process.env.NEXT_PUBLIC_APP_URL);
  if (envUrl) return envUrl.replace(/\/+$/, "");

  if (typeof window !== "undefined" && window.location?.origin) {
    return clean(window.location.origin).replace(/\/+$/, "");
  }

  return DEFAULT_APP_URL;
}

export function getDataSource(defaultSource: DataSource = "moralis"): DataSource {
  const raw = clean(process.env.DATA_SOURCE).toLowerCase();
  if (DATA_SOURCES.includes(raw as DataSource)) {
    return raw as DataSource;
  }
  return defaultSource;
}

