export function getRequestIdFromHeaders(headers: Headers) {
  return headers.get("x-request-id") ?? "unknown";
}
