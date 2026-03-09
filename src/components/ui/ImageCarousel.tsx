import { useState, useEffect, useCallback, useRef } from "react";

interface ImageCarouselProps {
  images: string[];
  altPrefix?: string;
  interval?: number;
  className?: string;
}

export default function ImageCarousel({ images, altPrefix = "", interval = 4000, className = "" }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [paused, setPaused] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const count = images.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => {
    setCurrent((i) => (i + 1) % count);
    setAnimKey((k) => k + 1);
  }, [count]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    timerRef.current = setInterval(advance, interval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [advance, interval, count, paused]);

  if (!count) return null;

  return (
    <div
      className={`relative overflow-hidden rounded ${className}`}
      aria-roledescription="Karussell"
      aria-label={altPrefix || "Bildergalerie"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative w-full" style={{ paddingBottom: "66.67%" }}>
        {images.map((src, i) => (
          <img
            src={src}
            alt={altPrefix ? `${altPrefix} – Bild ${i + 1} von ${count}` : ""}
            onLoad={() => setLoaded((prev) => ({ ...prev, [i]: true }))}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: i === current && loaded[i] ? 1 : 0,
              transition: "opacity 1.2s ease-in-out",
              animation: i === current && loaded[i] && count > 1
                ? "carousel-drift 6s ease-out both"
                : "none",
              animationPlayState: paused ? "paused" : "running",
            }}
            key={`${src}-${i === current ? animKey : "idle"}`}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
        {!loaded[current] && (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-subtle">
            <div className="w-5 h-5 border-2 border-border border-t-brand rounded-full animate-spin" />
          </div>
        )}
      </div>
      {count > 1 && (
        <div className="flex items-center justify-center gap-1 mt-2.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Bild ${i + 1} von ${count}`}
              className={`relative w-6 h-6 flex items-center justify-center border-none cursor-pointer bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2`}
            >
              <span className={`block w-2 h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-brand scale-125"
                  : "bg-border group-hover:bg-muted"
              }`} />
            </button>
          ))}
          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Diashow fortsetzen" : "Diashow pausieren"}
            className="w-6 h-6 flex items-center justify-center border-none cursor-pointer bg-transparent p-0 ml-1 text-muted hover:text-brand transition-colors focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
          >
            {paused ? (
              <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden="true"><path d="M0 0l10 6-10 6z"/></svg>
            ) : (
              <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden="true"><rect x="0" y="0" width="3.5" height="12"/><rect x="6.5" y="0" width="3.5" height="12"/></svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
