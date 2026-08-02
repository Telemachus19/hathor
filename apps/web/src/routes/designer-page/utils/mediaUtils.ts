export function isMediaVideo(item: any): boolean {
  if (!item) return false;
  if (typeof item === "object") {
    if (item.type === "video") return true;
    const url = item.url || item.src || "";
    return !!(url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com"));
  }
  if (typeof item === "string") {
    return !!(item.match(/\.(mp4|webm|ogg|mov)$/i) || item.includes("youtube.com") || item.includes("youtu.be") || item.includes("vimeo.com"));
  }
  return false;
}

export function getMediaUrl(item: any): string {
  if (!item) return "";
  if (typeof item === "object") return item.url || item.src || "";
  return String(item);
}

export function getMediaPoster(item: any): string {
  if (typeof item === "object" && item.poster) return item.poster;
  return "";
}
