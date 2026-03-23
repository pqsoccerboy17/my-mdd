import type { ReactNode } from 'react';
import { Map, BookOpen } from 'lucide-react';
import clsx from 'clsx';

export type Section = 'planner' | 'changelog';

const sections: { id: Section; label: string; Icon: typeof Map }[] = [
  { id: 'planner', label: 'Planner', Icon: Map },
  { id: 'changelog', label: 'Changelog', Icon: BookOpen },
];

interface SectionTabsProps {
  active: Section;
  onChange: (section: Section) => void;
}

export default function SectionTabs({ active, onChange }: SectionTabsProps): ReactNode {
  return (
    <div className="roadmap-section-tabs" role="tablist" aria-label="Roadmap section">
      {sections.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={clsx(
            'roadmap-section-tabs__btn',
            id === active && 'roadmap-section-tabs__btn--active',
          )}
          onClick={() => onChange(id)}
          role="tab"
          aria-selected={id === active}
        >
          <Icon size={18} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
