import type { AspectRatio, CarouselConfig } from '../../types/config';
import RangeField from '../ui/RangeField';
import SegmentedControl from '../ui/SegmentedControl';
import AdminField from '../ui/AdminField';

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
      <RangeField label="Slide-Dauer" value={carousel.interval} onChange={(v) => update("interval", v)}
        min={3000} max={20000} step={1000} format={(v) => `${(v / 1000).toFixed(0)}s`}
        minLabel="3s" maxLabel="20s" />

      <RangeField label="Drift-Dauer" value={carousel.driftDuration} onChange={(v) => update("driftDuration", v)}
        min={3000} max={20000} step={1000} format={(v) => `${(v / 1000).toFixed(0)}s`}
        minLabel="3s" maxLabel="20s" />

      <RangeField label={"\u00DCberblendung"} value={carousel.fadeDuration} onChange={(v) => update("fadeDuration", v)}
        min={300} max={3000} step={100} format={(v) => `${(v / 1000).toFixed(1)}s`}
        minLabel="0.3s" maxLabel="3s" />

      <RangeField label="Zoom" value={carousel.zoom} onChange={(v) => update("zoom", v)}
        min={1.02} max={1.20} step={0.01} format={(v) => `${Math.round((v - 1) * 100)}%`}
        minLabel="2%" maxLabel="20%" />

      <AdminField label={"Seitenverh\u00E4ltnis"}>
        <SegmentedControl options={aspectOptions} value={carousel.aspectRatio} onChange={(v) => update("aspectRatio", v)} />
      </AdminField>
    </div>
  );
}
