/**
 * Skeleton placeholder shown while the CMS configuration is loading.
 * Mimics the PhaseTypen layout: heading, 3 vertical product cards, CTA button.
 */
export default function ConfigSkeleton() {
  return (
    <div className="wz-shell min-h-screen flex flex-col bg-[var(--wz-bg,transparent)] text-text overflow-y-auto font-body text-base leading-relaxed tracking-[0.06em] antialiased">
      <main className="flex-1 flex justify-center px-4 py-4 pb-20 cq-main-md cq-main-lg cq-main-xl">
        <div className="w-full max-w-[520px] cq-card-md cq-card-lg cq-card-xl relative">

          {/* Heading area */}
          <div className="text-center mb-6">
            <div className="sk-bone sk-bone--xl mx-auto mb-3" style={{ width: "75%" }} />
            <div className="sk-bone sk-bone--lg mx-auto mb-5" style={{ width: "60%" }} />
            <div className="sk-bone sk-bone--sm mx-auto" style={{ width: "70%" }} />
            <div className="sk-bone sk-bone--sm mx-auto mt-1" style={{ width: "50%" }} />
          </div>

          {/* 3 vertical product cards in a responsive grid */}
          <div className="grid gap-4 grid-cols-1 cq-products-3 mt-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="sk-product-card">
                <div className="sk-product-card__icon" />
                <div className="sk-bone sk-bone--md mx-auto" style={{ width: "60%" }} />
                <div className="sk-bone sk-bone--sm mx-auto mt-1.5" style={{ width: "80%" }} />
                <div className="sk-bone sk-bone--sm mx-auto mt-1" style={{ width: "55%" }} />
              </div>
            ))}
          </div>

          {/* CTA button */}
          <div className="sk-bone sk-bone--btn mx-auto mt-8" style={{ width: "55%", maxWidth: "280px" }} />

          {/* Floating loading label */}
          <div className="sk-overlay">
            <div className="sk-toast">
              <div className="sk-spinner" />
              <span>Konfigurator wird geladen</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
