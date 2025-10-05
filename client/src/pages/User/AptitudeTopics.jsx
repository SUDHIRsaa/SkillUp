import { useState } from 'react';
import Layout from '../../components/Layout';
import { TOPICS } from '../../data/topics';
import { useNavigate } from 'react-router-dom';

function TopicCard({ topic }) {
  const navigate = useNavigate();
  // Dark navy card (matches attached image). Do not show subtopic names here — only title and count.
  const pal = { bg: 'bg-slate-800', accent: 'text-white', note: 'text-gray-300', pillBg: 'bg-white/6' };
  return (
    <div className="cursor-pointer rounded-2xl overflow-hidden shadow-sm transform hover:scale-102 transition-transform" style={{ minWidth: 280 }} onClick={() => navigate(`/aptitude/topics/${topic.slug}`)}>
      <div className={`relative p-8 ${pal.bg} rounded-2xl h-48 flex flex-col justify-between`}>
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <div className={`text-xl font-extrabold ${pal.accent}`}>{topic.label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AptitudeTopics() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">Topics</h1>
          <p className="text-gray-400 mt-2 max-w-2xl mx-auto">Choose a subject card to open its subtopics and formulas.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {TOPICS.map((t) => (
            <TopicCard key={t.slug} topic={t} />
          ))}
        </div>
      </div>
    </Layout>
  );
}