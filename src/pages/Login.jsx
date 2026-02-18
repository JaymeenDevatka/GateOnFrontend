import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Icons
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

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (email.includes('@') && password.length >= 6) {
      login(email, password);
      navigate(from, { replace: true });
    } else {
      setError('Invalid email or password. Password must be at least 6 characters.');
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
            <div className="flex justify-center mb-6">
              <img src="/logo.png" alt="GateOn Logo" className="h-16 w-16 object-cover rounded-full shadow-lg border-2 border-slate-900" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 font-display drop-shadow-sm">Welcome back</h1>
            <p className="mt-2 text-slate-700 font-medium drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 font-medium text-sm px-4 py-3 rounded-xl flex items-center gap-2 animate-shake shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900 ml-1 drop-shadow-sm">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-brand transition-colors">
                    <EmailIcon />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-medium text-slate-900 shadow-inner placeholder:text-slate-500 focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900 ml-1 drop-shadow-sm">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-brand transition-colors">
                    <LockIcon />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-medium text-slate-900 shadow-inner placeholder:text-slate-500 focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer select-none group">
                <input type="checkbox" className="w-4 h-4 rounded text-brand border-slate-400 focus:ring-brand transition-colors cursor-pointer shadow-sm" />
                <span className="group-hover:text-slate-900 transition-colors drop-shadow-sm">Remember me</span>
              </label>
              <Link to="#" className="font-bold text-brand hover:text-brand-dark transition-colors hover:underline drop-shadow-sm">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full py-3.5 text-base font-bold shadow-lg shadow-brand/20 hover:shadow-brand/40 transform hover:-translate-y-0.5 transition-all duration-200">
              Sign in
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 shadow-[0_1px_0_rgba(255,255,255,0.8)]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-wide">
              <span className="bg-white/80 px-3 text-slate-600 drop-shadow-sm">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 font-bold text-sm shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-200 group"
          >
            <div className="group-hover:scale-110 transition-transform duration-200">
              <GoogleIcon />
            </div>
            Sign in with Google
          </button>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" state={{ from: location.state?.from }} className="font-bold text-brand hover:text-brand-dark transition-colors hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
