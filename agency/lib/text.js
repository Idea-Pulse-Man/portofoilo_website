/**
 * Splits a line into words for word-by-word animation.
 * Words wrapped in *stars* (one or several) come back with `accent: true`.
 */
export function splitWords(text) {
  let accent = false;

  return text.split(" ").map((raw) => {
    if (raw.startsWith("*")) accent = true;
    const word = { text: raw.replaceAll("*", ""), accent };
    if (raw.slice(1).includes("*")) accent = false;
    return word;
  });
}
