import { useState, useEffect, useCallback } from "react";

export default function ImageCarousel({ images, interval = 4000, className = "" }) {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState({});
  const count = images.length;

  const advance = useCallback(() => {
    setCurrent((i) => (i + 1) % count);
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(advance, interval);
    return () => clearInterval(id);
  }, [advance, interval, count]);

  if (!count) return null;

  return (
    <div className={`relative overflow-hidden rounded ${className}`}>
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {images.map((src, i) => {
          const active = i === current && loaded[i];
          return (
            <img
              key={src}
              src={src}
              alt=""
              onLoad={() => setLoaded((prev) => ({ ...prev, [i]: true }))}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                opacity: active ? 1 : 0,
                transform: active ? "scale(1)" : "scale(1.04)",
                transition: "opacity 0.8s ease-in-out, transform 0.8s ease-in-out",
              }}
              loading={i === 0 ? "eager" : "lazy"}
            />
          );
        })}
        {!loaded[current] && (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(31,59,49,0.04)]">
            <div className="w-5 h-5 border-2 border-border border-t-brand rounded-full animate-spin" />
          </div>
        )}
      </div>
      {count > 1 && (
        <div className="flex justify-center gap-1.5 mt-2.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Bild ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full border-none cursor-pointer transition-all duration-300 ${
                i === current
                  ? "bg-brand scale-125"
                  : "bg-border hover:bg-muted"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
