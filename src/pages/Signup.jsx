import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

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
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
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

    login(form.email, form.password, form.name);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex text-slate-800 font-sans bg-slate-50">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-bl from-secondary-dark via-slate-900 to-brand-dark opacity-90" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-50" />

        {/* Animated Background Elements */}
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-brand/30 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-[100px] animate-pulse-slow animation-delay-2000" />

        <div className="relative z-10 m-auto max-w-lg px-10 text-center text-white">
          <div className="mb-8 flex justify-center">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
              <img src="/logo.png" alt="GateOn Logo" className="h-16 w-16 object-contain drop-shadow-lg" />
            </div>
          </div>
          <h2 className="text-5xl font-bold font-display mb-6 tracking-tight leading-tight">
            Join the <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-light to-brand-light">Community</span>
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed font-light">
            Create an account to unlock exclusive events, manage your tickets, and connect with organizers. It takes less than a minute.
          </p>
        </div>
        {/* Footer info */}
        <div className="absolute bottom-8 left-0 right-0 text-center text-slate-500 text-xs">
          © {new Date().getFullYear()} GateOn Inc. All rights reserved.
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-8 animate-fade-in py-8 bg-white/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-200/50 shadow-xl">
          <div className="text-center">
            <div className="lg:hidden flex justify-center mb-6">
              <img src="/logo.png" alt="GateOn Logo" className="h-12 w-12 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 font-display">Create account</h1>
            <p className="mt-2 text-slate-500">
              Start your journey with GateOn today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2 animate-shake">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Full name</label>
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
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-sm placeholder:text-slate-400 focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-brand/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
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
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-sm placeholder:text-slate-400 focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-brand/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
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
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-sm placeholder:text-slate-400 focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-brand/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Confirm</label>
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
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-sm placeholder:text-slate-400 focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-brand/50"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 ml-1">Password must be at least 6 characters</p>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-brand/20 transition-colors">
              <div className="mt-0.5">
                <input type="checkbox" required className="relative w-4 h-4 rounded text-brand border-slate-300 focus:ring-brand transition-all cursor-pointer" />
              </div>
              <label className="text-xs sm:text-sm text-slate-600 leading-snug cursor-pointer group-hover:text-slate-700 transition-colors">
                I agree to the{' '}
                <Link to="#" className="font-semibold text-brand hover:text-brand-dark transition-colors hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="#" className="font-semibold text-brand hover:text-brand-dark transition-colors hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button type="submit" className="w-full py-3.5 text-base font-bold shadow-lg shadow-brand/20 hover:shadow-brand/40 transform hover:-translate-y-0.5 transition-all duration-200">
              Create account
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
