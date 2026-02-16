function Button({ variant = 'primary', className = '', children, ...props }) {
  const base = 'inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transform-gpu';

  const variants = {
    primary: 'bg-gradient-to-r from-brand to-brand-dark text-white shadow-lg shadow-brand/30 hover:shadow-xl hover:shadow-brand/40 hover:-translate-y-0.5',
    secondary: 'bg-white text-slate-800 border border-slate-200 shadow-sm hover:border-brand/30 hover:shadow-md hover:-translate-y-0.5',
    outline: 'bg-transparent border-2 border-slate-200 text-slate-600 hover:border-brand hover:text-brand hover:bg-brand/5',
    ghost: 'text-slate-600 hover:bg-brand/5 hover:text-brand',
    glass: 'bg-white/70 backdrop-blur-md border border-white/50 text-slate-800 shadow-sm hover:bg-white/90 hover:shadow-md hover:-translate-y-0.5'
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
