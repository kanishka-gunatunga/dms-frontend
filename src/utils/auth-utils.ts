export function isAuthenticated(req: Request) {
  const cookies = req.headers.get("cookie");
  return cookies?.includes("authToken");
}

export function setAuthToken(res: Response, token: string) {
  res.headers.append(
    "Set-Cookie",
    `authToken=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`
  );
}

export function clearAuthToken(res: Response) {
  res.headers.append(
    "Set-Cookie",
    "authToken=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"
  );
}
