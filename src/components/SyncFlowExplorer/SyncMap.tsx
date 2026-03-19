import type {ReactNode} from 'react';
import clsx from 'clsx';
import {syncCapabilities, sources} from './sourceData';
import type {SourceId, SyncMode} from './sourceData';

interface SyncMapProps {
  selectedSource: SourceId;
}

const dotClass = (mode: SyncMode): string =>
  clsx('sync-map__dot', `sync-map__dot--${mode === 'bidirectional' ? 'full' : mode === 'one-way' ? 'partial' : 'none'}`);

/** Comparison table showing sync details across all data sources. Highlights the active source column. */
export default function SyncMap({selectedSource}: SyncMapProps): ReactNode {
  return (
    <div className="sync-map">
      <table className="sync-map__table">
        <thead>
          <tr>
            <th className="sync-map__th">Category</th>
            {sources.map((source) => (
              <th
                key={source.id}
                className={clsx(
                  'sync-map__th',
                  source.id === selectedSource && 'sync-map__th--active',
                )}
              >
                {source.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {syncCapabilities.map((capability) => (
            <tr key={capability.category}>
              <td className="sync-map__td">{capability.category}</td>
              {sources.map((source) => {
                const entry = capability.entries[source.id];
                return (
                  <td
                    key={source.id}
                    className={clsx(
                      'sync-map__td',
                      source.id === selectedSource && 'sync-map__td--active',
                    )}
                  >
                    <span className="sync-map__status">
                      <span className={dotClass(entry.mode)} />
                      {entry.note}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
