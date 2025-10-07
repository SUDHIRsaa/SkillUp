import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useToast } from '../components/toast/ToastProvider.jsx';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const { login, register, setAuth } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const emailValid = /^(?:[^\s@]+)@(?:[^\s@]+)\.(?:[^\s@]+)$/.test(form.email || '');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (mode === 'register') {
        // Redirect to the full signup page so the user can provide college/year/major
        // The inline register flow here omitted profile fields which caused missing
        // college/year/major in the created account. Send user to /signup instead.
        navigate('/signup');
        return;
      } else if (mode === 'login') {
        const res = await login({ email: form.email, phone: form.phone, password: form.password });
        setAuth(res.user, res.token);
        toast.success('Welcome back!');
        navigate(res.user.role === 'admin' || res.user.role === 'moderator' ? '/admin' : '/dashboard');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong';
      setMessage(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };


  const [showPwd, setShowPwd] = useState(false);

  return (
    <Layout>
      <div className="max-w-lg mx-auto pt-4 pb-10">
        <div className="flex flex-col items-center gap-3 mb-6">
          <span className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow" />
          <div className="text-3xl md:text-4xl font-extrabold">Welcome Back</div>
          <div className="text-gray-500 dark:text-gray-400">Sign in to your account to continue learning</div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          {!!message && <div className="mb-3 text-sm text-red-500">{message}</div>}
          <form onSubmit={onSubmit} className="space-y-4">
            {mode === 'register' && (
              <Input label="Full name" name="name" placeholder="Full name" value={form.name} onChange={onChange} />
            )}
            <Input label="Email Address" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={onChange} error={!emailValid && form.email ? 'Invalid email format' : ''} />
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <Input name="password" type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={onChange} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 flex items-center" onClick={() => setShowPwd(s=>!s)} aria-label="Toggle password">
                  {showPwd ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" variant="gradient" className="flex-1" loading={submitting} disabled={submitting}>
                {mode === 'register' ? 'Create Account' : 'Sign In'}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-sm text-center">
            {mode === 'register' ? (
              <>
                Already have an account? <a className="text-brand-500 hover:text-brand-600" href="/login" onClick={(e)=>{e.preventDefault(); setMode('login');}}>Sign in here</a>
              </>
            ) : (
              <>
                Don't have an account? <a className="text-brand-500 hover:text-brand-600" href="/signup">Sign up here</a>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
