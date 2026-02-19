import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { signupApi } from '../services/api.js';

// Icons
const UserIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUserFromApi } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/organizer';

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!form.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const data = await signupApi({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setUserFromApi(data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center text-slate-900 font-sans bg-slate-50 relative overflow-hidden pt-20">
      <div className="absolute inset-0 bg-[url('/login2.jpg')] bg-cover bg-center contrast-125 brightness-110 saturate-125" />
      <div className="absolute inset-0 bg-black/10" />

      {/* Metallic Gradient Border Wrapper */}
      <div className="w-full max-w-sm animate-float p-[3px] rounded-3xl bg-gradient-to-br from-slate-900 via-slate-500 to-slate-900 shadow-2xl relative z-10">
        <div className="w-full h-full bg-gradient-to-br from-white/95 to-slate-100/90 backdrop-blur-md p-6 rounded-[21px] ring-1 ring-inset ring-white/50">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="GateOn Logo" className="h-16 w-16 object-cover rounded-full shadow-lg border-2 border-slate-900" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 font-display drop-shadow-sm">Create account</h1>
            <p className="mt-2 text-slate-700 font-medium drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              Start your journey with GateOn today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 font-medium text-sm px-4 py-3 rounded-xl flex items-center gap-2 animate-shake shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-900 ml-1 drop-shadow-sm">Full name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-brand transition-colors">
                  <UserIcon />
                </div>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-medium text-slate-900 shadow-inner placeholder:text-slate-500 focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-900 ml-1 drop-shadow-sm">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-brand transition-colors">
                  <EmailIcon />
                </div>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-medium text-slate-900 shadow-inner placeholder:text-slate-500 focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900 ml-1 drop-shadow-sm">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-brand transition-colors">
                    <LockIcon />
                  </div>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-medium text-slate-900 shadow-inner placeholder:text-slate-500 focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900 ml-1 drop-shadow-sm">Confirm</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-brand transition-colors">
                    <LockIcon />
                  </div>
                  <input
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-medium text-slate-900 shadow-inner placeholder:text-slate-500 focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-slate-400"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 font-medium ml-1 drop-shadow-sm">Password must be at least 6 characters</p>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 group hover:border-brand/20 transition-colors shadow-sm">
              <div className="mt-0.5">
                <input type="checkbox" required className="relative w-4 h-4 rounded text-brand border-slate-300 focus:ring-brand transition-all cursor-pointer shadow-sm" />
              </div>
              <label className="text-xs sm:text-sm text-slate-700 font-medium leading-snug cursor-pointer group-hover:text-slate-900 transition-colors drop-shadow-sm">
                I agree to the{' '}
                <Link to="#" className="font-bold text-brand hover:text-brand-dark transition-colors hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="#" className="font-bold text-brand hover:text-brand-dark transition-colors hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button type="submit" disabled={loading} className="w-full py-3.5 text-base font-bold shadow-lg shadow-brand/20 hover:shadow-brand/40 transform hover:-translate-y-0.5 transition-all duration-200">
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" state={{ from: location.state?.from }} className="font-bold text-brand hover:text-brand-dark transition-colors hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
