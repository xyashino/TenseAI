export const HttpStatus = {
  OK: 200,
  CREATED: 201,
} as const;

export function successResponse<T>(data: T, status = HttpStatus.OK): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
