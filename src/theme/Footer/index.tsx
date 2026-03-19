import React from 'react';
import {useColorMode} from '@docusaurus/theme-common';
import {BookOpen, Github, ExternalLink} from 'lucide-react';

/** Site-wide footer with docs, GitHub, and MDD HQ links. Adapts colors to the active theme. */
export default function Footer(): React.ReactElement {
  const {colorMode} = useColorMode();
  const isDark = colorMode === 'dark';

  const iconColor = isDark ? '#C5D9E8' : '#7B8FA3';
  const hoverColor = isDark ? '#C85A3A' : '#A84426';

  const iconStyle: React.CSSProperties = {
    color: iconColor,
    transition: 'color 0.2s ease',
  };

  return (
    <footer
      style={{
        borderTop: `1px solid ${isDark ? 'rgba(44,48,64,0.5)' : '#E8E1D0'}`,
        backgroundColor: isDark ? '#1A1F2E' : '#F8F6F7',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          color: '#7B8FA3',
        }}
      >
        &copy; {new Date().getFullYear()} MDD Docs
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
        <a
          href="/"
          title="Documentation"
          style={iconStyle}
          onMouseEnter={e => (e.currentTarget.style.color = hoverColor)}
          onMouseLeave={e => (e.currentTarget.style.color = iconColor)}
        >
          <BookOpen size={24} />
        </a>
        <a
          href="https://mdd-hq.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          title="MDD HQ"
          style={iconStyle}
          onMouseEnter={e => (e.currentTarget.style.color = hoverColor)}
          onMouseLeave={e => (e.currentTarget.style.color = iconColor)}
        >
          <ExternalLink size={24} />
        </a>
        <a
          href="https://github.com/pqsoccerboy17/my-mdd"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub"
          style={iconStyle}
          onMouseEnter={e => (e.currentTarget.style.color = hoverColor)}
          onMouseLeave={e => (e.currentTarget.style.color = iconColor)}
        >
          <Github size={24} />
        </a>
      </div>
    </footer>
  );
}
