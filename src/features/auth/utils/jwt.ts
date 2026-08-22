/**
 * Backend's AuthResponse doesn't include the user id as a top-level field --
 * it's only present as the `sub` claim on the JWT it issues alongside it.
 * Decode it from there instead of asking the backend to duplicate the value.
 */
export function getJwtSubject(token: string): string | null {
  const payload = token.split(".")[1]
  if (!payload) return null

  try {
    const base64 = payload.replaceAll("-", "+").replaceAll("_", "/")
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    )
    const claims: unknown = JSON.parse(json)

    return typeof claims === "object" &&
      claims !== null &&
      "sub" in claims &&
      typeof claims.sub === "string"
      ? claims.sub
      : null
  } catch {
    return null
  }
}
