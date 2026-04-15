function sanitizeString(value) {
  // Prevent basic HTML/script injection being stored or echoed back.
  // React escapes by default, but sanitising at the API boundary reduces risk
  // if any client ever renders with dangerouslySetInnerHTML.
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeUnknown(input) {
  if (typeof input === "string") return sanitizeString(input);
  if (Array.isArray(input)) return input.map(sanitizeUnknown);
  if (input && typeof input === "object") {
    const out = {};
    for (const [k, v] of Object.entries(input)) out[k] = sanitizeUnknown(v);
    return out;
  }
  return input;
}

export function sanitizeBodyStrings(req, _res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeUnknown(req.body);
  }
  next();
}

