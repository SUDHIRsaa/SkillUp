import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { fetchQuestions } from '../../services/questionService';
import { fetchPerformance } from '../../services/performanceService';
import http from '../../services/http';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/toast/ToastProvider.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

export default function Aptitude() {
  const toast = useToast();
  const [count, setCount] = useState(() => Number(localStorage.getItem('daily_count') || 5));
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);
  const total = questions.length;


  const load = async (newCount = count) => {
    setLoading(true);
    try {
      const res = await http.get('/api/questions/daily', { params: { count: newCount }, validateStatus: () => true });
      if (res.status === 204) {
        setQuestions([]);
        setMessage('You have already completed today\'s aptitude.');
        setCompletedToday(true);
        setSubmitted(true);
      } else if (res.status === 200) {
        const daily = res.data || [];
        setQuestions(daily);
        setAnswers({});
        setCurrent(0);
        setSubmitted(false);
        setReviewMode(false);
        setStartedAt(Date.now());
        if (daily.length < newCount) {
          toast.info(`Only ${daily.length} question${daily.length===1?'':'s'} available today.`);
        }
      } else {
        throw new Error('Failed to load');
      }
    } catch (e) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(count); /* eslint-disable-next-line */ }, [count]);

  const correctCount = useMemo(() => questions.reduce((acc, q) => acc + (answers[q._id] === q.correctAnswer ? 1 : 0), 0), [answers, questions]);

  const onSelect = (qid, opt) => {
    setAnswers(a => ({ ...a, [qid]: opt }));
    // No auto-advance; let user click Next or use keyboard arrows
  };

  // Keyboard navigation: ArrowLeft/ArrowRight for prev/next, 1-9 to select option
  useEffect(() => {
    const onKey = (e) => {
      if (!questions[current]) return;
      if (e.key === 'ArrowRight') {
        setCurrent(c => Math.min(total - 1, c + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrent(c => Math.max(0, c - 1));
      } else {
        const idx = parseInt(e.key, 10);
        if (!Number.isNaN(idx) && idx >= 1 && idx <= (questions[current].options?.length || 0)) {
          const opt = questions[current].options[idx - 1];
          onSelect(questions[current]._id, opt);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [questions, current, total]);

  const onSubmit = async () => {
    const correct = correctCount;
    const elapsedSec = Math.round(((Date.now() - (startedAt || Date.now())) / 1000));
    const avgTime = total ? Math.round(elapsedSec / total) : 0;
    try {
      // detect if the loaded questions belong to a single topic and include it
      const topic = questions && questions.length && questions.every(q => q.topic === questions[0].topic) ? questions[0].topic : undefined;
      await http.post('/api/performance/attempt', { total, correct, avgTime, ...(topic ? { topic } : {}) });
      setMessage(`Submitted: ${correct}/${total} correct, avg ${avgTime}s/question`);
      setSubmitted(true);
      toast.success('Attempt submitted');
    } catch (e) {
      setMessage('Failed to submit stats');
      toast.error('Failed to submit stats');
    }
  };


  const onChangeCount = (e) => {
    const v = Number(e.target.value);
    setCount(v);
    localStorage.setItem('daily_count', String(v));
    // load will be triggered by useEffect
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Aptitude Practice</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 dark:text-gray-300">Daily count</label>
          <Select value={count} onChange={onChangeCount}>
            {Array.from({ length: 20 }).map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
          </Select>
          <Button onClick={onSubmit} disabled={loading || total===0 || Object.keys(answers).length < total}>Submit</Button>
        </div>
      </div>
      {message && <div className="mb-3 text-sm text-green-700 dark:text-green-400">{message} {submitted && <a className="underline" href="/profile">View history</a>}</div>}
      {completedToday && (
        <Card title="Aptitude Completed for Today">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800">🔒</span>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              You’ve finished today’s set. Come back tomorrow for new questions.
              <div className="mt-2"><a className="text-brand-600 underline" href="/profile">View your history</a></div>
            </div>
          </div>
        </Card>
      )}
      {loading && <div className="mb-4"><Spinner size={20} /></div>}
      {total > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
            <div>Question {current + 1} of {total}</div>
            <div>{Object.keys(answers).length}/{total} answered</div>
          </div>

          {/* Dots/steps indicator */}
          <div className="flex flex-wrap gap-2">
            {questions.map((q, i) => {
              const answered = answers[q._id] != null;
              const isCurrent = i === current;
              return (
                <button
                  key={q._id || i}
                  onClick={() => setCurrent(i)}
                  className={`w-8 h-8 rounded-full text-xs font-medium border transition-colors
                    ${isCurrent ? 'border-brand-600 text-white bg-brand-600' : answered ? 'border-green-500 text-green-700' : 'border-gray-300 text-gray-500 hover:border-brand-600'}`}
                  title={`Q${i+1}${answered ? ' • answered' : ''}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {questions[current] && (
            <Card title={`Q${current + 1}. ${questions[current].statement}`}>
              {questions[current].imageUrl && (
                <div className="mt-2">
                  <img src={questions[current].imageUrl} alt="Question" className="max-h-64 rounded border border-gray-200 dark:border-gray-700" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {questions[current].options?.map((opt, i) => {
                  const selected = answers[questions[current]._id] === opt;
                  return (
                    <label
                      key={i}
                      className={`flex items-center gap-3 border rounded px-3 py-2 cursor-pointer transition-all
                        ${selected ? 'border-brand-600 ring-2 ring-brand-200 bg-white dark:bg-gray-900' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-brand-500'}
                        text-gray-900 dark:text-gray-100`}
                    >
                      <input
                        type="radio"
                        name={`q-${questions[current]._id}`}
                        className="mr-1 accent-brand-600 sr-only"
                        onChange={() => onSelect(questions[current]._id, opt)}
                        checked={selected}
                      />
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs font-medium ${selected ? 'border-brand-600 text-brand-700' : 'border-gray-300 dark:border-gray-600'}`}>
                        {i + 1}
                      </span>
                      <span className={`flex-1 ${selected ? 'font-medium' : ''}`}>{opt}</span>
                    </label>
                  );
                })}
              </div>
              {/* Navigation */}
              <div className="mt-4 flex items-center justify-between">
                <Button variant="secondary" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>Prev</Button>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => setCurrent(c => Math.min(total - 1, c + 1))} disabled={current >= total - 1}>Next</Button>
                  {!reviewMode ? (
                    <Button onClick={() => setReviewMode(true)} disabled={Object.keys(answers).length < total}>Review</Button>
                  ) : (
                    <Button onClick={() => setReviewMode(false)}>Back to Questions</Button>
                  )}
                  <Button onClick={onSubmit} disabled={loading || total===0 || Object.keys(answers).length < total}>Submit</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Review mode */}
          {reviewMode && !submitted && (
            <Card title="Review your answers">
              <div className="space-y-2">
                {questions.map((q, idx) => (
                  <button
                    key={q._id || idx}
                    onClick={() => { setCurrent(idx); setReviewMode(false); }}
                    className={`w-full text-left border rounded p-2 ${answers[q._id] ? 'border-green-500' : 'border-gray-300'}`}
                  >
                    <div className="text-sm"><span className="font-medium">Q{idx+1}.</span> {q.statement}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Selected: {answers[q._id] ?? '—'}</div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Results after submit */}
          {submitted && (
            <Card title={`Results: ${correctCount}/${total}`}>
              <div className="space-y-3">
                {questions.map((q, idx) => {
                  const sel = answers[q._id];
                  const ok = sel === q.correctAnswer;
                  return (
                    <div key={q._id || idx} className="border rounded p-3 border-gray-200 dark:border-gray-700">
                      <div className="font-medium mb-1">Q{idx+1}. {q.statement}</div>
                      <div className="text-sm mb-1">
                        <span className={`font-medium ${ok ? 'text-green-600' : 'text-red-600'}`}>{ok ? 'Correct' : 'Incorrect'}</span>
                      </div>
                      <div className="text-sm">
                        Your answer: <span className="font-medium">{sel ?? '—'}</span>
                        {!ok && (
                          <> • Correct: <span className="font-medium">{q.correctAnswer}</span></>
                        )}
                      </div>
                      {q.explanation && (
                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}
    </Layout>
  );
}