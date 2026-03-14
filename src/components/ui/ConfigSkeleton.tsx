/**
 * Skeleton placeholder shown while the CMS configuration is loading.
 * Mimics the PhaseTypen layout (heading + subheading + product cards).
 */
export default function ConfigSkeleton() {
  return (
    <div className="wz-shell min-h-screen flex flex-col bg-[var(--wz-bg,transparent)] text-text overflow-y-auto font-body text-base leading-relaxed tracking-[0.06em] antialiased">
      <main className="flex-1 flex justify-center px-4 py-4 pb-20 cq-main-md cq-main-lg cq-main-xl">
        <div className="w-full max-w-[520px] cq-card-md cq-card-lg cq-card-xl">
          {/* Heading area */}
          <div className="text-center mb-6">
            <div className="sk-bone sk-bone--lg mx-auto mb-2" style={{ width: "70%" }} />
            <div className="sk-bone sk-bone--md mx-auto mb-5" style={{ width: "55%" }} />
            <div className="sk-bone sk-bone--sm mx-auto" style={{ width: "80%" }} />
            <div className="sk-bone sk-bone--sm mx-auto mt-1" style={{ width: "60%" }} />
          </div>

          {/* Product cards (3 placeholders) */}
          <div className="flex flex-col gap-3 mt-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="sk-card">
                <div className="sk-card__icon" />
                <div className="sk-card__body">
                  <div className="sk-bone sk-bone--md" style={{ width: "40%" }} />
                  <div className="sk-bone sk-bone--sm mt-1" style={{ width: "65%" }} />
                </div>
              </div>
            ))}
          </div>

          {/* CTA button placeholder */}
          <div className="sk-bone sk-bone--btn mx-auto mt-8" style={{ width: "50%" }} />
        </div>
      </main>
    </div>
  );
}
