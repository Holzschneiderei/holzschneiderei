import { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface PropertyTabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export default function PropertyTabs({ tabs, defaultTab }: PropertyTabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? '');

  const activeTab = tabs.find(t => t.id === active);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex rounded-sm border border-border overflow-hidden bg-field" role="tablist">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === active}
            onClick={() => setActive(tab.id)}
            className={[
              'flex-1 text-center py-1.5 text-[10px] font-bold font-body border-none cursor-pointer transition-colors',
              tab.id === active
                ? 'bg-brand text-white'
                : 'bg-field text-muted hover:bg-[rgba(31,59,49,0.06)]',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab && (
        <div role="tabpanel">{activeTab.content}</div>
      )}
    </div>
  );
}
