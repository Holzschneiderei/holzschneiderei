import type { CarouselImage, DriftDirection } from "../types/config";

/** Compute the translate % so the image edge meets the container edge at the end of the drift. */
export function driftTransform(zoom: number, direction: DriftDirection): string {
  const tx = ((zoom - 1) / (2 * zoom)) * 100;
  const pct = `${tx.toFixed(2)}%`;
  switch (direction) {
    case "left":  return `scale(${zoom}) translate(-${pct}, 0)`;
    case "right": return `scale(${zoom}) translate(${pct}, 0)`;
    case "up":    return `scale(${zoom}) translate(0, -${pct})`;
    case "down":  return `scale(${zoom}) translate(0, ${pct})`;
  }
}

/** Normalise a carousel image entry (string or object) to { src, drift }. */
export function normalizeImage(img: string | CarouselImage): { src: string; drift: DriftDirection } {
  if (typeof img === "string") return { src: img, drift: "left" };
  return { src: img.src, drift: img.drift ?? "left" };
}

/** Aspect ratio to CSS paddingBottom percentage. */
export function aspectRatioPadding(ratio: string): string {
  switch (ratio) {
    case "4:3":  return "75%";
    case "16:9": return "56.25%";
    default:     return "66.67%";  // 3:2
  }
}
