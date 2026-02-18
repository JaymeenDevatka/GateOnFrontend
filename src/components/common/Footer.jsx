function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="container-page py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
        <p className="font-medium">© {new Date().getFullYear()} GateOn. All rights reserved.</p>
        <div className="flex gap-6">
          <button className="hover:text-brand transition-colors font-medium">Help</button>
          <button className="hover:text-brand transition-colors font-medium">Terms</button>
          <button className="hover:text-brand transition-colors font-medium">Privacy</button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
