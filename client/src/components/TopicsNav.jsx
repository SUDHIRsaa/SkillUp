import { TOPICS } from '../data/topics';
import { Link } from 'react-router-dom';

export default function TopicsNav() {
  return (
    <nav className="hidden md:flex gap-4 items-center">
      {TOPICS.map(t => (
        <Link key={t.slug} to={`/aptitude/topics?main=${t.slug}`} className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium">
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
