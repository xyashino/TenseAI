import { getEnv } from "./env";

export function getCorsHeaders(requestOrigin?: string | null): HeadersInit {
  const allowedOrigin = requestOrigin || getEnv("PUBLIC_SITE_URL") || "*";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  };
}

export function createOptionsResponse(requestOrigin?: string | null): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(requestOrigin),
  });
}
