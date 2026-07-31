/**
 * Copy text, reporting whether it actually landed.
 *
 * `navigator.clipboard` only exists in a secure context, so it is missing the
 * moment someone opens the dev server on their phone over a LAN IP — and it
 * rejects outright when the document is not focused. Callers must not show a
 * "복사됨" state without checking the result.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the selection-based path
  }

  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.top = "0";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    el.remove();
    return ok;
  } catch {
    return false;
  }
}
