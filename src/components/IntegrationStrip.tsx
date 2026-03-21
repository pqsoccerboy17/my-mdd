import Link from '@docusaurus/Link';
import { Database, RefreshCw, GitBranch, Bell, BookOpen, Mail, Calendar } from 'lucide-react';
import type { ReactNode } from 'react';

interface Integration {
  icon: ReactNode;
  label: string;
  href: string;
}

const integrations: Integration[] = [
  { icon: <Database size={28} />, label: 'Supabase', href: '/integrations/supabase' },
  { icon: <RefreshCw size={28} />, label: 'Notion', href: '/integrations/notion-sync' },
  { icon: <GitBranch size={28} />, label: 'GitHub', href: '/integrations/github-sync' },
  { icon: <Bell size={28} />, label: 'Apple Reminders', href: '/integrations/apple-reminders' },
  { icon: <BookOpen size={28} />, label: 'Granola', href: '/integrations/granola-sync' },
  { icon: <Mail size={28} />, label: 'Email', href: '/integrations/email-sync' },
  { icon: <Calendar size={28} />, label: 'Calendar', href: '/integrations/calendar-sync' },
];

/** Horizontal row of integration icons linking to their doc pages. */
export default function IntegrationStrip() {
  return (
    <div className="integration-strip">
      {integrations.map(({ icon, label, href }) => (
        <Link key={label} to={href} className="integration-strip__item">
          <span className="integration-strip__icon">{icon}</span>
          <span className="integration-strip__label">{label}</span>
        </Link>
      ))}
    </div>
  );
}
