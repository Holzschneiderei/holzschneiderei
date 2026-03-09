import type { AspectRatio, CarouselConfig } from '../../types/config';

type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

interface AdminCarouselProps {
  carousel: CarouselConfig;
  setCarousel: Setter<CarouselConfig>;
}

export default function AdminCarousel({ carousel, setCarousel }: AdminCarouselProps) {
  const update = <K extends keyof CarouselConfig>(key: K, val: CarouselConfig[K]) => {
    setCarousel((prev) => ({ ...prev, [key]: val }));
  };

  const aspectOptions: { value: AspectRatio; label: string }[] = [
    { value: "3:2", label: "3:2" },
    { value: "4:3", label: "4:3" },
    { value: "16:9", label: "16:9" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Slide-Dauer */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[12px] font-semibold text-text">Slide-Dauer</label>
          <span className="text-[11px] text-muted">{(carousel.interval / 1000).toFixed(0)}s</span>
        </div>
        <input
          type="range"
          min="3000"
          max="20000"
          step="1000"
          value={carousel.interval}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("interval", parseInt(e.target.value, 10))}
          className="w-full h-1.5 accent-brand cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-muted mt-0.5">
          <span>3s</span>
          <span>20s</span>
        </div>
      </div>

      {/* Drift-Dauer */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[12px] font-semibold text-text">Drift-Dauer</label>
          <span className="text-[11px] text-muted">{(carousel.driftDuration / 1000).toFixed(0)}s</span>
        </div>
        <input
          type="range"
          min="3000"
          max="20000"
          step="1000"
          value={carousel.driftDuration}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("driftDuration", parseInt(e.target.value, 10))}
          className="w-full h-1.5 accent-brand cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-muted mt-0.5">
          <span>3s</span>
          <span>20s</span>
        </div>
      </div>

      {/* Überblendung */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[12px] font-semibold text-text">{"\u00DC"}berblendung</label>
          <span className="text-[11px] text-muted">{(carousel.fadeDuration / 1000).toFixed(1)}s</span>
        </div>
        <input
          type="range"
          min="300"
          max="3000"
          step="100"
          value={carousel.fadeDuration}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("fadeDuration", parseInt(e.target.value, 10))}
          className="w-full h-1.5 accent-brand cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-muted mt-0.5">
          <span>0.3s</span>
          <span>3s</span>
        </div>
      </div>

      {/* Zoom */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[12px] font-semibold text-text">Zoom</label>
          <span className="text-[11px] text-muted">{Math.round((carousel.zoom - 1) * 100)}%</span>
        </div>
        <input
          type="range"
          min="1.02"
          max="1.20"
          step="0.01"
          value={carousel.zoom}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("zoom", parseFloat(e.target.value))}
          className="w-full h-1.5 accent-brand cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-muted mt-0.5">
          <span>2%</span>
          <span>20%</span>
        </div>
      </div>

      {/* Seitenverhältnis */}
      <div>
        <label className="block text-[12px] font-semibold text-text mb-1.5">Seitenverh{"\u00E4"}ltnis</label>
        <div className="flex rounded-sm border border-border overflow-hidden bg-field">
          {aspectOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update("aspectRatio", opt.value)}
              className={`flex-1 text-center py-1.5 text-[11px] font-bold font-body border-none cursor-pointer transition-colors ${
                carousel.aspectRatio === opt.value
                  ? 'bg-brand text-white'
                  : 'bg-field text-muted hover:bg-[rgba(31,59,49,0.06)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
