import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/ui/Skeleton';
import { ArrowRightIcon, TrophyIcon, BoltIcon, AcademicCapIcon, EyeIcon, CodeBracketIcon, UsersIcon, BookOpenIcon } from '@heroicons/react/24/solid';

export default function Home() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);
  return (
    <Layout>
      <section className="text-center py-14">
        {loading ? (
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-10 md:h-16 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full mx-auto mt-4" />
            <Skeleton className="h-4 w-5/6 mx-auto mt-2" />
            <div className="flex items-center justify-center gap-4 mt-8">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              SkillUp: Practice. Code. Compete.
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Daily aptitude drills and competitive leaderboards to track and improve your skills.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button as="a" href={user ? '/dashboard' : '/signup'} variant="gradient" trailingIcon={ArrowRightIcon}>Get Started</Button>
              <Button variant="secondary" as="a" href="/leaderboard" leadingIcon={EyeIcon}>See Leaderboards</Button>
            </div>
          </>
        )}
      </section>

  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 justify-items-center">
        {loading ? (
          <>
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </>
        ) : (
          <>
            <Card title="Daily Aptitude Practice" className="w-full max-w-sm">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Solve a set of aptitude questions every day, with your own daily limit. Track your progress and accuracy over time. <br/>
                <span className="font-medium text-brand-600">Set your daily count and questions will auto-load. Your stats and leaderboard rank are based on aptitude performance only.</span>
              </p>
              <Button className="mt-3" as="a" href="/aptitude">Start Practicing</Button>
            </Card>
            <Card title="Topic-wise Learning" className="w-full max-w-sm">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Learn and practice aptitude questions organized by topics like Mathematics, Logic, Verbal Ability, and Time Management. Important formulas and practice MCQs are provided per topic.
              </p>
              <Button className="mt-3" variant="secondary" as="a" href="/aptitude/topics">Explore Topics</Button>
            </Card>
            <Card title="Leaderboards" className="w-full max-w-sm">
              <p className="text-sm text-gray-600 dark:text-gray-300">Compete globally and with your college. Track rank, accuracy, and speed.</p>
              <Button className="mt-3" variant="secondary" as="a" href="/leaderboard">View Leaderboards</Button>
            </Card>
          </>
        )}
      </div>

      <section className="mt-16 text-center">
        <h2 className="text-3xl font-extrabold">Everything You Need to Succeed</h2>
        <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Our comprehensive platform provides all the tools and resources you need to excel in technical interviews and competitive programming.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 text-left">
            <div className="h-12 w-12 rounded-xl bg-blue-600/10 text-blue-500 grid place-items-center mb-4"><BookOpenIcon className="h-6 w-6"/></div>
            <div className="text-lg font-semibold mb-1">Aptitude Tests</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Practice logical, quantitative and verbal ability questions.</div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 text-left">
            <div className="h-12 w-12 rounded-xl bg-violet-600/10 text-violet-500 grid place-items-center mb-4"><BookOpenIcon className="h-6 w-6"/></div>
            <div className="text-lg font-semibold mb-1">Skills Library</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Curated lessons and practice resources to complement your aptitude practice.</div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 text-left">
            <div className="h-12 w-12 rounded-xl bg-green-600/10 text-green-500 grid place-items-center mb-4"><TrophyIcon className="h-6 w-6"/></div>
            <div className="text-lg font-semibold mb-1">Leaderboards</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Compete with peers and track progress on college/global boards.</div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 text-left">
            <div className="h-12 w-12 rounded-xl bg-orange-600/10 text-orange-500 grid place-items-center mb-4"><UsersIcon className="h-6 w-6"/></div>
            <div className="text-lg font-semibold mb-1">Community</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Join a community of learners and participate in contests.</div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Why SkillUp?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title={<span className="inline-flex items-center gap-2"><BoltIcon className="h-5 w-5 text-accent-500"/> Daily Streaks</span>}>
            <p className="text-sm text-gray-600 dark:text-gray-300">Build consistency with streaks and weekly targets that keep you motivated.</p>
          </Card>
          <Card title={<span className="inline-flex items-center gap-2"><AcademicCapIcon className="h-5 w-5 text-accent-500"/> Real Judge</span>}>
            <p className="text-sm text-gray-600 dark:text-gray-300">Run code in multiple languages with real-time results and test cases.</p>
          </Card>
          <Card title={<span className="inline-flex items-center gap-2"><TrophyIcon className="h-5 w-5 text-accent-500"/> Rank Up</span>}>
            <p className="text-sm text-gray-600 dark:text-gray-300">Climb leaderboards globally and among peers from your college.</p>
          </Card>
        </div>
      </section>

      {/* FAQ and Testimonials removed as per requirements */}

      {/* FAQ removed as per requirements */}
    </Layout>
  );
}
