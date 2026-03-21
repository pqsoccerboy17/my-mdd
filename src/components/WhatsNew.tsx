import Link from '@docusaurus/Link';
import { whatsNewItems } from '../data/whatsNew';

const categoryLabels: Record<string, string> = {
  docs: 'Docs',
  feature: 'Feature',
  data: 'Data',
};

/** Compact list of recent site highlights, displayed on the homepage. */
export default function WhatsNew() {
  return (
    <div className="whats-new">
      <h2 className="whats-new__heading">What's New</h2>
      <div className="whats-new__grid">
        {whatsNewItems.map((item) => (
          <Link key={item.title} to={item.href} className="whats-new__item">
            <div className="whats-new__item-header">
              <span className={`whats-new__badge whats-new__badge--${item.category}`}>
                {categoryLabels[item.category]}
              </span>
              <span className="whats-new__date">{item.date}</span>
            </div>
            <h3 className="whats-new__title">{item.title}</h3>
            <p className="whats-new__description">{item.description}</p>
          </Link>
        ))}
      </div>
      <div className="whats-new__footer">
        <Link to="/roadmap/changelog" className="whats-new__link">
          View full changelog
        </Link>
      </div>
    </div>
  );
}
