import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/authService';
import { useToast } from '../../components/toast/ToastProvider.jsx';

export default function ProfileEdit() {
  const { user, setAuth } = useAuth();
  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '', college: '', year: '', major: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (user) setForm({
      name: user.name || '', username: user.username || '', email: user.email || '', phone: user.phone || '',
      college: user.college || '', year: user.year || '', major: user.major || ''
    });
  }, [user]);

  const emailValid = /^(?:[^\s@]+)@(?:[^\s@]+)\.(?:[^\s@]+)$/.test(form.email || '');
  const phoneDigits = (form.phone || '').replace(/\D/g, '');
  const phoneValid = !form.phone || (phoneDigits.length >= 10 && phoneDigits.length <= 15);
  const usernameValid = !form.username || ((form.username || '').length >= 3 && /^[a-zA-Z0-9_]+$/.test(form.username));

  const canSave = form.name && emailValid && phoneValid && usernameValid;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    try {
      setLoading(true);
      const updated = await updateProfile(form);
      // Update local auth user snapshot
      setAuth({ ...user, ...updated });
      toast.success('Profile updated');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card title="Edit Profile">
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" name="name" value={form.name} onChange={onChange} />
            <Input label="Username" name="username" value={form.username} onChange={onChange} error={!usernameValid && form.username ? '3+ chars; letters, numbers, underscore' : ''} />
            <Input label="Email" name="email" type="email" value={form.email} onChange={onChange} error={!emailValid && form.email ? 'Invalid email' : ''} />
            <Input label="Phone" name="phone" value={form.phone} onChange={onChange} error={!phoneValid && form.phone ? 'Enter 10–15 digits' : ''} />
            <Input label="College" name="college" value={form.college} onChange={onChange} />
            <Input label="Year" name="year" value={form.year} onChange={onChange} />
            <Input label="Major" name="major" value={form.major} onChange={onChange} />
            <div className="md:col-span-2 pt-2">
              <Button type="submit" variant="gradient" loading={loading} disabled={!canSave || loading}>Save Changes</Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
