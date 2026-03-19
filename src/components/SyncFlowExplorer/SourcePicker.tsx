import type {ReactNode} from 'react';
import {Database, FileText, Bell, GitBranch, Mail, Calendar} from 'lucide-react';
import clsx from 'clsx';
import {sources, syncCapabilities} from './sourceData';
import type {SourceId} from './sourceData';

const iconMap: Record<string, typeof Database> = {
  Database,
  FileText,
  Bell,
  GitBranch,
  Mail,
  Calendar,
};

interface SourcePickerProps {
  selectedSource: SourceId;
  onSelect: (id: SourceId) => void;
}

/** Horizontal row of data source selector buttons. Highlights the active source. */
export default function SourcePicker({selectedSource, onSelect}: SourcePickerProps): ReactNode {
  const syncSummary = (sourceId: SourceId) => {
    const modeEntry = syncCapabilities.find(c => c.category === 'Sync Mode');
    if (!modeEntry) return '';
    return modeEntry.entries[sourceId].note;
  };

  return (
    <div className="source-picker">
      {sources.map((source) => {
        const Icon = iconMap[source.icon];
        const isActive = source.id === selectedSource;

        return (
          <button
            key={source.id}
            type="button"
            className={clsx('source-picker__btn', isActive && 'source-picker__btn--active')}
            onClick={() => onSelect(source.id)}
          >
            <Icon className="source-picker__icon" size={24} />
            <span className="source-picker__label">{source.label}</span>
            <span className="source-picker__tagline">{source.tagline}</span>
            <span className="source-picker__stats">{syncSummary(source.id)}</span>
          </button>
        );
      })}
    </div>
  );
}
