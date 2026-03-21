import React from 'react';

/** Multi-column site footer with doc links, project links, and external links. */
export default function Footer(): React.ReactElement {
  return (
    <footer className="site-footer">
      <div className="site-footer__columns">
        <div className="site-footer__column">
          <h4 className="site-footer__heading">Docs</h4>
          <a href="/overview/what-is-mdd" className="site-footer__link">
            Overview
          </a>
          <a href="/features/task-manager" className="site-footer__link">
            Features
          </a>
          <a href="/ai-pipeline/overview" className="site-footer__link">
            AI Pipeline
          </a>
          <a href="/api/overview" className="site-footer__link">
            API Reference
          </a>
        </div>
        <div className="site-footer__column">
          <h4 className="site-footer__heading">Project</h4>
          <a href="/guides/getting-started" className="site-footer__link">
            Getting Started
          </a>
          <a href="/roadmap/visual-planner" className="site-footer__link">
            Visual Roadmap
          </a>
          <a href="/roadmap/changelog" className="site-footer__link">
            Changelog
          </a>
          <a href="/guides/testing" className="site-footer__link">
            Testing
          </a>
        </div>
        <div className="site-footer__column">
          <h4 className="site-footer__heading">Links</h4>
          <a
            href="https://mdd-hq.vercel.app"
            className="site-footer__link"
            target="_blank"
            rel="noopener noreferrer"
          >
            MDD HQ
          </a>
          <a
            href="https://github.com/pqsoccerboy17/my-mdd"
            className="site-footer__link"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
      <div className="site-footer__bottom">
        &copy; 2026 MDD Docs
      </div>
    </footer>
  );
}
