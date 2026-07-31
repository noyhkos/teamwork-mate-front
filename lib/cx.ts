/** Join class names, dropping falsy entries. No dependency needed at this size. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
