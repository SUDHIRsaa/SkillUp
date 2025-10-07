import { useState } from 'react';
import Layout from '../components/Layout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useToast } from '../components/toast/ToastProvider.jsx';
import { checkAvailability as apiCheck } from '../services/authService';

export default function Signup() {
  const { register, setAuth } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    year: '',
    major: '',
    phone: ''
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const [avail, setAvail] = useState({ email: null, username: null, phone: null });
  const [checking, setChecking] = useState({ email: false, username: false, phone: false });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  if (name === 'email') checkEmail(value);
  if (name === 'username') checkUsername(value);
  if (name === 'phone') checkPhone(value);
  };

  const emailValid = /^(?:[^\s@]+)@(?:[^\s@]+)\.(?:[^\s@]+)$/.test(form.email || '');
  const phoneDigits = (form.phone || '').replace(/\D/g, '');
  const phoneValid = phoneDigits.length >= 10 && phoneDigits.length <= 15;
  const usernameValid = (form.username || '').length >= 3 && /^[a-zA-Z0-9_]+$/.test(form.username || '');
  const passwordValid = (form.password || '').length >= 8 && /[A-Z]/.test(form.password || '') && /[a-z]/.test(form.password || '') && /[0-9]/.test(form.password || '');
  const canSubmit = form.email && emailValid && phoneValid && form.password && form.confirmPassword && form.password === form.confirmPassword;

  const passwordStrength = () => {
    const p = form.password || '';
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score; // 0-5
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    if (!emailValid) {
      setMessage('Please enter a valid email');
      return;
    }
    if (!phoneValid) {
      setMessage('Please enter a valid phone number (10-15 digits)');
      return;
    }
    setSubmitting(true);
    // Final availability check to avoid unexpected 400 from server
    try {
      const checkParams = {};
      if (form.email) checkParams.email = form.email;
      if (form.username) checkParams.username = form.username;
      if (form.phone) checkParams.phone = form.phone;
      if (Object.keys(checkParams).length) {
        const avail = await apiCheck(checkParams);
        // api returns { available: boolean } when single param, or boolean when multiple? Normalize
        if (avail && typeof avail.available === 'boolean') {
          if (!avail.available) {
            setMessage('Email/Username/Phone already in use. Please choose different values.');
            setSubmitting(false);
            return;
          }
        } else if (avail && typeof avail === 'object') {
          // if backend returns { available: false } or similar
          if (avail.available === false) {
            setMessage('Email/Username/Phone already in use. Please choose different values.');
            setSubmitting(false);
            return;
          }
        }
      }
    } catch (err) {
      // ignore availability check errors (we'll let the register attempt show server message)
    }
    const payload = {
      name: `${form.firstName} ${form.lastName}`.trim() || form.username,
      username: form.username,
      email: form.email,
      phone: form.phone,
      password: form.password,
      profile: { college: form.college, year: form.year, major: form.major, username: form.username }
    };
    const attempt = async () => {
      try {
        const res = await register(payload);
        return res;
      } catch (err) {
        // Network-level error (no response) → signal retry by returning null
        const isNetwork = !err?.response;
        if (isNetwork) return null;
        throw err;
      }
    };

    try {
      let res = await attempt();
      if (!res) {
        toast.info('Network hiccup. Retrying...');
        await new Promise(r => setTimeout(r, 800));
        res = await attempt();
      }
      if (res) {
        // Persist auth so profile fields are immediately available
        if (res?.token && res?.user) setAuth(res.user, res.token);
        toast.success('Account created! You are now signed in.');
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || (err?.message?.includes('Network') ? 'Network error. Please try again.' : 'Failed to create account');
      setMessage(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const strength = passwordStrength();
  const strengthLabel = ['Very Weak','Weak','Fair','Good','Strong','Very Strong'][strength];
  const strengthPercent = (strength/5)*100;

  // Debounced availability checks
  const debounce = (fn, delay=400) => {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  };
  const checkEmail = debounce(async (val) => {
    if (!val || !emailValid) return setAvail(a=>({ ...a, email: null }));
    setChecking(s=>({ ...s, email: true }));
    try { const res = await apiCheck({ email: val }); setAvail(a=>({ ...a, email: res.available })); }
    finally { setChecking(s=>({ ...s, email: false })); }
  });
  const checkUsername = debounce(async (val) => {
    if (!val || !usernameValid) return setAvail(a=>({ ...a, username: null }));
    setChecking(s=>({ ...s, username: true }));
    try { const res = await apiCheck({ username: val }); setAvail(a=>({ ...a, username: res.available })); }
    finally { setChecking(s=>({ ...s, username: false })); }
  });
  const checkPhone = debounce(async (val) => {
    const digits = (val||'').replace(/\D/g, '');
    if (!digits || !phoneValid) return setAvail(a=>({ ...a, phone: null }));
    setChecking(s=>({ ...s, phone: true }));
    try { const res = await apiCheck({ phone: digits }); setAvail(a=>({ ...a, phone: res.available })); }
    finally { setChecking(s=>({ ...s, phone: false })); }
  });

  return (
    <Layout>
      <div className="max-w-3xl mx-auto pt-4 pb-10">
        <div className="flex flex-col items-center gap-3 mb-6">
          <span className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow" />
          <div className="text-3xl md:text-4xl font-extrabold">Create Your Account</div>
          <div className="text-gray-500 dark:text-gray-400 text-center">Join thousands of students improving their coding skills</div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          {!!message && <div className="mb-3 text-sm text-red-500">{message}</div>}
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" placeholder="Enter your first name" value={form.firstName} onChange={onChange} />
            <Input label="Last Name" name="lastName" placeholder="Enter your last name" value={form.lastName} onChange={onChange} />
            <div className="md:col-span-2">
              <Input label="Username" name="username" placeholder="Choose a unique username" value={form.username} onChange={onChange} error={!usernameValid && form.username ? '3+ chars. Letters, numbers, underscore only.' : avail.username === false ? 'Username already taken' : ''} hint={avail.username === true ? 'Username available' : checking.username ? 'Checking…' : ''} />
            </div>
            <div className="md:col-span-2">
              <Input label="Email Address" name="email" type="email" placeholder="Enter your email" value={form.email} onChange={onChange} error={!emailValid && form.email ? 'Invalid email format' : avail.email === false ? 'Email already registered' : ''} hint={avail.email === true ? 'Email available' : checking.email ? 'Checking…' : ''} />
            </div>
            <div>
              <div className="relative">
                <Input label="Password" name="password" type={showPwd ? 'text' : 'password'} placeholder="Create a password" value={form.password} onChange={onChange} error={!passwordValid && form.password ? 'Min 8 chars with upper, lower, number.' : ''} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 flex items-center" onClick={() => setShowPwd(s=>!s)}>
                  {showPwd ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                </button>
              </div>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-brand-500 to-brand-700" style={{ width: `${strengthPercent}%` }} />
              </div>
              <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">{strengthLabel}</div>
              <ul className="mt-2 text-xs space-y-1 text-gray-600 dark:text-gray-300">
                <li className={passwordValid ? 'text-green-500' : ''}>• At least 8 characters with upper, lower and number</li>
              </ul>
            </div>
            <div>
              <div className="relative">
                <Input label="Confirm Password" name="confirmPassword" type={showPwd2 ? 'text' : 'password'} placeholder="Confirm your password" value={form.confirmPassword} onChange={onChange} error={form.confirmPassword && form.password !== form.confirmPassword ? 'Passwords do not match' : ''} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 flex items-center" onClick={() => setShowPwd2(s=>!s)}>
                  {showPwd2 ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                </button>
              </div>
            </div>

            <div className="md:col-span-2 mt-2 text-sm font-medium">Academic Information</div>

            <Input label="College/University" name="college" placeholder="Enter your college name" value={form.college} onChange={onChange} />
            <div>
              <label className="block text-sm font-medium mb-1">Year of Study</label>
              <select name="year" value={form.year} onChange={onChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-600 focus:ring-brand-600 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
                <option value="">Select year</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>Graduate</option>
              </select>
            </div>
            <Input label="Branch/Major" name="major" placeholder="e.g., Computer Science" value={form.major} onChange={onChange} />
            <div>
              <Input label="Phone Number" name="phone" placeholder="Enter your phone number" value={form.phone} onChange={onChange} error={!phoneValid && form.phone ? 'Enter 10–15 digits' : avail.phone === false ? 'Phone already registered' : ''} hint={avail.phone === true ? 'Phone available' : checking.phone ? 'Checking…' : ''} />
            </div>

            <div className="md:col-span-2 pt-2">
              <Button type="submit" variant="gradient" className="w-full" loading={submitting} disabled={!canSubmit || submitting}>Create Account</Button>
            </div>
          </form>
          <div className="mt-4 text-sm text-center">Already have an account? <a className="text-brand-500 hover:text-brand-600" href="/login">Sign in here</a></div>
        </div>
      </div>
    </Layout>
  );
}
