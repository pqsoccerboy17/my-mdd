import {useState} from 'react';
import type {ReactNode} from 'react';
import SourcePicker from './SourcePicker';
import SyncMap from './SyncMap';
import SyncSequence from './SyncSequence';
import type {SourceId} from './sourceData';

/** Root component for the multi-source data sync comparison and flow explorer. */
export default function SyncFlowExplorer(): ReactNode {
  const [selectedSource, setSelectedSource] = useState<SourceId>('notion');

  return (
    <div className="sync-flow">
      <SourcePicker selectedSource={selectedSource} onSelect={setSelectedSource} />

      <h3 className="sync-flow__heading">Sync Details</h3>
      <SyncMap selectedSource={selectedSource} />

      <h3 className="sync-flow__heading">Sync Pipeline</h3>
      <SyncSequence key={selectedSource} selectedSource={selectedSource} />
    </div>
  );
}
