import { useState } from "react";
import type { CarouselConfig, CarouselImage } from "../../types/config";
import { normalizeImage } from "../../lib/carouselUtils";
import ImageCarousel from "./ImageCarousel";

type ImageEntry = string | CarouselImage;

interface ImageManagerProps {
  images: ImageEntry[];
  onChange: (images: ImageEntry[]) => void;
  carousel?: CarouselConfig;
  showPreview?: boolean;
}

const fieldCls =
  "w-full h-7 px-2 text-[12px] font-body text-text bg-field border border-border rounded-sm";

export default function ImageManager({
  images,
  onChange,
  carousel,
  showPreview = true,
}: ImageManagerProps) {
  const [newUrl, setNewUrl] = useState("");

  const carouselProps = carousel
    ? {
        interval: carousel.interval,
        driftDuration: carousel.driftDuration,
        fadeDuration: carousel.fadeDuration,
        zoom: carousel.zoom,
        aspectRatio: carousel.aspectRatio,
      }
    : {};

  const addImage = () => {
    const url = newUrl.trim();
    if (!url) return;
    onChange([...images, url]);
    setNewUrl("");
  };

  return (
    <>
      {/* Optional carousel preview */}
      {showPreview && images.length > 0 && (
        <div className="mb-2">
          <ImageCarousel images={images} className="max-w-[280px]" {...carouselProps} />
        </div>
      )}

      {/* Image list */}
      <div className="flex flex-col gap-1.5 mb-2">
        {images.map((img, i) => {
          const { src, drift } = normalizeImage(img);
          return (
            <div key={`${i}-${src}`} className="flex items-center gap-1.5 group">
              <img src={src} alt="" className="w-10 h-7 object-cover rounded-sm border border-border shrink-0" />
              <div className="flex gap-px shrink-0">
                {(["left", "right", "up", "down"] as const).map((dir) => (
                  <button
                    key={dir}
                    onClick={() => {
                      const updated = [...images];
                      updated[i] = { src, drift: dir };
                      onChange(updated);
                    }}
                    className={`w-5 h-5 flex items-center justify-center text-[9px] border rounded-sm cursor-pointer ${
                      drift === dir
                        ? "bg-brand text-white border-brand"
                        : "bg-transparent text-muted border-border hover:border-brand"
                    }`}
                    title={dir}
                  >
                    {dir === "left" ? "\u2190" : dir === "right" ? "\u2192" : dir === "up" ? "\u2191" : "\u2193"}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-muted truncate flex-1 min-w-0">{src}</span>
              <button
                onClick={() => onChange(images.filter((_, j) => j !== i))}
                className="text-[10px] text-error bg-transparent border-none cursor-pointer p-0.5 opacity-50 hover:opacity-100 shrink-0"
                aria-label="Bild entfernen"
              >
                {"\u2715"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Add URL row */}
      <div className="flex gap-1.5">
        <input
          type="url"
          value={newUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUrl(e.target.value)}
          placeholder="https://..."
          className={`${fieldCls} flex-1`}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && newUrl.trim()) {
              addImage();
            }
          }}
        />
        <button
          onClick={addImage}
          disabled={!newUrl.trim()}
          className={`h-7 px-3 text-[10px] font-bold font-body rounded-sm border-none cursor-pointer transition-colors ${
            newUrl.trim()
              ? 'bg-brand text-white hover:opacity-90'
              : 'bg-border text-muted cursor-default'
          }`}
        >
          +
        </button>
      </div>
    </>
  );
}
