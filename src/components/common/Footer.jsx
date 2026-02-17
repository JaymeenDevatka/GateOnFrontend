function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-surface-elevated mt-auto">
      <div className="container-page py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <p>© {new Date().getFullYear()} GateOn. All rights reserved.</p>
        <div className="flex gap-4">
          <button className="hover:text-slate-800">Help</button>
          <button className="hover:text-slate-800">Terms</button>
          <button className="hover:text-slate-800">Privacy</button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

