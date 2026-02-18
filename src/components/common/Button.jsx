function Button({ variant = 'primary', className = '', children, ...props }) {
  const base = 'inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transform-gpu font-display';

  const variants = {
    primary: 'bg-gradient-to-r from-brand to-brand-dark text-white shadow-lg shadow-brand/30 hover:shadow-glow hover:-translate-y-1 hover:brightness-110',
    secondary: 'bg-white text-slate-800 border-2 border-slate-200 hover:border-brand hover:text-brand hover:shadow-card-hover hover:-translate-y-0.5',
    outline: 'bg-transparent border-2 border-slate-300 text-slate-700 hover:border-brand hover:text-brand hover:bg-brand-light/30 hover:shadow-glow-sm',
    ghost: 'text-slate-600 hover:bg-brand-light/50 hover:text-brand-dark',
    glass: 'bg-white/90 backdrop-blur-md border border-slate-200 text-slate-800 shadow-card hover:bg-white hover:shadow-glow-sm hover:-translate-y-0.5',
    glow: 'bg-gradient-to-r from-brand via-brand-glow to-secondary text-white shadow-glow hover:shadow-glow-lg hover:-translate-y-1 hover:scale-105'
  };

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
