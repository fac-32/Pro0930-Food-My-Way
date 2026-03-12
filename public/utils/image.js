export function getOptimizedImageUrl(url, { width, height } = {}) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("/upload/")) return url;

  const [prefix, rest] = url.split("/upload/");
  if (!rest) return url;

  const firstSegment = rest.split("/")[0];
  const hasTransform = /(^|,)(w_|h_|c_|f_|q_)/.test(firstSegment);
  if (hasTransform) return url;

  const parts = ["f_auto", "q_auto"];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (width || height) parts.push("c_fill");

  return `${prefix}/upload/${parts.join(",")}/${rest}`;
}
