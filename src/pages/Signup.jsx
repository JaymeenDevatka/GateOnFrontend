import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

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
    <div className="min-h-screen flex text-slate-800 font-sans">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-bl from-secondary-dark via-slate-900 to-brand-dark opacity-80" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-50" />

        {/* Animated Orbs */}
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-brand rounded-full blur-[128px] opacity-30 animate-pulse-slow" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-[128px] opacity-30 animate-pulse-slow animation-delay-2000" />

        <div className="relative z-10 m-auto max-w-lg px-8 text-center text-white">
          <h2 className="text-4xl font-bold font-display mb-6 tracking-tight">Join the Community</h2>
          <p className="text-lg text-slate-200 leading-relaxed opacity-90">
            Create an account to unlock exclusive events, manage your tickets, and connect with organizers.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        {/* Mobile Background */}
        <div className="absolute inset-0 lg:hidden bg-gradient-to-br from-brand/5 to-secondary/5 -z-10" />

        <div className="w-full max-w-md space-y-8 animate-fade-in py-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-slate-900 font-display">Create account</h1>
            <p className="mt-2 text-slate-500">
              Start your journey with GateOn today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Full name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-sm placeholder:text-slate-400 focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-sm placeholder:text-slate-400 focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-sm placeholder:text-slate-400 focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Confirm</label>
                <input
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-sm placeholder:text-slate-400 focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">Password must be at least 6 characters</p>

            <div className="flex items-start gap-2 text-sm text-slate-600">
              <input type="checkbox" required className="mt-1 w-4 h-4 rounded text-brand border-slate-300 focus:ring-brand transition-colors" />
              <label className="text-xs sm:text-sm">
                I agree to the{' '}
                <Link to="#" className="font-semibold text-brand hover:text-brand-dark transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="#" className="font-semibold text-brand hover:text-brand-dark transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button type="submit" className="w-full py-3 text-base shadow-lg shadow-brand/20">
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" state={{ from: location.state?.from }} className="font-semibold text-brand hover:text-brand-dark transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
