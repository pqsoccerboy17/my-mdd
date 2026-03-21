import {useEffect} from 'react';
import type {ReactNode} from 'react';

const shortcuts = [
  {keys: ['Cmd', 'B'], action: 'Toggle sidebar'},
  {keys: ['Cmd', 'K'], action: 'Search'},
  {keys: ['Cmd', 'Shift', 'L'], action: 'Toggle theme'},
  {keys: ['Cmd', '/'], action: 'Show shortcuts'},
];

interface ShortcutHintProps {
  visible: boolean;
  onDismiss: () => void;
}

/** Floating shortcut reference card. Auto-dismisses after 4 seconds. */
export default function ShortcutHint({visible, onDismiss}: ShortcutHintProps): ReactNode {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div className="shortcut-hint" onClick={onDismiss} role="presentation">
      <div className="shortcut-hint__card">
        <div className="shortcut-hint__title">Keyboard Shortcuts</div>
        {shortcuts.map((s) => (
          <div key={s.action} className="shortcut-hint__row">
            <span className="shortcut-hint__keys">
              {s.keys.map((k) => (
                <kbd key={k} className="shortcut-hint__kbd">{k}</kbd>
              ))}
            </span>
            <span className="shortcut-hint__action">{s.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
