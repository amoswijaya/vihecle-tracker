import "dotenv/config";

function get(name: string, fallback?: string) {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing env ${name}`);
  return v;
}

export const env = {
  NODE_ENV: get("NODE_ENV", "development"),
  PORT: Number(get("PORT", "8080")),
  DATABASE_URL: get("DATABASE_URL"),
  JWT_ACCESS_SECRET: get("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: get("JWT_REFRESH_SECRET"),
  ACCESS_TOKEN_EXPIRES_IN: get("ACCESS_TOKEN_EXPIRES_IN", "15m"),
  REFRESH_TOKEN_EXPIRES_IN: get("REFRESH_TOKEN_EXPIRES_IN", "7d"),
  COOKIE_SECURE: get("COOKIE_SECURE", "false") === "true",
  COOKIE_DOMAIN: get("COOKIE_DOMAIN", "localhost"),
};
