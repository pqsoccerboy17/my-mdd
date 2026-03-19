import React from 'react';
import type {ReactNode} from 'react';
import {sourceProfiles} from './sourceData';
import type {SourceId} from './sourceData';

interface SyncSequenceProps {
  selectedSource: SourceId;
}

/** Step cards for the selected source's sync pipeline. Re-mounts on source change to trigger animation. */
export default function SyncSequence({selectedSource}: SyncSequenceProps): ReactNode {
  const profile = sourceProfiles.find((p) => p.id === selectedSource);
  const steps = profile?.steps ?? [];

  return (
    <div className="sync-sequence">
      <div className="sync-sequence__grid">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="sync-step-card"
            style={{ '--stagger-index': index } as React.CSSProperties}
          >
            <h4 className="sync-step-card__title">{step.title}</h4>
            <p className="sync-step-card__description">{step.description}</p>
            {step.tip && (
              <p className="sync-step-card__tip">{step.tip}</p>
            )}
            <div className="sync-step-card__tools">
              {step.tools.map((tool) => (
                <span key={tool} className="sync-step-card__chip">{tool}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
