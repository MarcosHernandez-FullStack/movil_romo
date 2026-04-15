/*EN CASO DE USAR LOGIN CON JWT, PARA DECODIFICAR EN TOKEN */
export function decodeJwt(token: string): any | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string): boolean {
  const data = decodeJwt(token);
  if (!data?.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return data.exp < now;
}
