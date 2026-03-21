import React, {type ReactNode, useState, useEffect, useCallback, useRef} from 'react';
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import {useColorMode} from '@docusaurus/theme-common';
import BackToTopButton from '@theme/BackToTopButton';
import DocRootLayoutSidebar from '@theme/DocRoot/Layout/Sidebar';
import DocRootLayoutMain from '@theme/DocRoot/Layout/Main';
import type {Props} from '@theme/DocRoot/Layout';
import ShortcutHint from '@site/src/components/ShortcutHint';

import styles from './styles.module.css';

export default function DocRootLayout({children}: Props): ReactNode {
  const sidebar = useDocsSidebar();
  const [hiddenSidebarContainer, setHiddenSidebarContainer] = useState(false);
  const {setColorMode, colorMode} = useColorMode();
  const [showHint, setShowHint] = useState(false);

  const colorModeRef = useRef(colorMode);
  colorModeRef.current = colorMode;

  const toggleSidebar = useCallback(() => {
    setHiddenSidebarContainer((prev) => !prev);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && !e.shiftKey && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }

      if (e.metaKey && e.shiftKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        setColorMode(colorModeRef.current === 'dark' ? 'light' : 'dark');
      }

      if (e.metaKey && e.key === '/') {
        e.preventDefault();
        setShowHint(true);
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [toggleSidebar, setColorMode]);

  return (
    <div className={styles.docsWrapper}>
      <BackToTopButton />
      <div className={styles.docRoot}>
        {sidebar && (
          <DocRootLayoutSidebar
            sidebar={sidebar.items}
            hiddenSidebarContainer={hiddenSidebarContainer}
            setHiddenSidebarContainer={setHiddenSidebarContainer}
          />
        )}
        <DocRootLayoutMain hiddenSidebarContainer={hiddenSidebarContainer}>
          {children}
        </DocRootLayoutMain>
      </div>
      <ShortcutHint visible={showHint} onDismiss={() => setShowHint(false)} />
    </div>
  );
}
