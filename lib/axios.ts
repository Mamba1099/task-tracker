import axios from "axios";

const configuredApiUrl = process.env.NEXT_URL?.trim();

if (!configuredApiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL must be configured");
}

const api = axios.create({
  baseURL: `${configuredApiUrl.replace(/\/+$/, "").replace(/\/api\/v1$/, "")}/api`,
  headers: { "Content-Type": "application/json" },
});

export default api;
