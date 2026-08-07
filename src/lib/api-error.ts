export function extractApiError(status: number, raw: string): string {
  if (raw) {
    try {
      let data: any = JSON.parse(raw);
      if (Array.isArray(data)) data = data[0] ?? {};
      const msg = data?.message ?? data?.error ?? data?.hint;
      if (typeof msg === "string" && msg.trim()) return msg;
    } catch {
      const text = raw.trim();
      if (text && text.length < 300 && !text.startsWith("<")) return text;
    }
  }
  if (status === 404) return "We could not find that record. Please check your details and try again.";
  if (status === 429) return "Too many requests — please wait a moment and try again.";
  if (status >= 500) return "The server had a problem. Please try again shortly.";
  return `Request failed (${status})`;
}
