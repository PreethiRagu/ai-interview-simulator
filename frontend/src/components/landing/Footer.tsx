import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-2 md:col-span-1">
          <div className="text-xl font-bold tracking-tighter mb-4">
            Interview<span className="text-indigo-500">AI</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Revolutionizing placement preparation with professional-grade AI simulations and behavioral analysis.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-slate-500">Domains</h4>
          <ul className="space-y-2 text-slate-400 text-sm">
            <li><Link href="#" className="hover:text-indigo-400 transition">Information Technology</Link></li>
            <li><Link href="#" className="hover:text-indigo-400 transition">Healthcare</Link></li>
            <li><Link href="#" className="hover:text-indigo-400 transition">Finance & Banking</Link></li>
            <li><Link href="#" className="hover:text-indigo-400 transition">Data Science</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-slate-500">Product</h4>
          <ul className="space-y-2 text-slate-400 text-sm">
            <li><Link href="#" className="hover:text-indigo-400 transition">Pricing</Link></li>
            <li><Link href="#" className="hover:text-indigo-400 transition">Features</Link></li>
            <li><Link href="#" className="hover:text-indigo-400 transition">Live Demo</Link></li>
            <li><Link href="#" className="hover:text-indigo-400 transition">Success Stories</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-slate-500">Legal</h4>
          <ul className="space-y-2 text-slate-400 text-sm">
            <li><Link href="#" className="hover:text-indigo-400 transition">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-indigo-400 transition">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-indigo-400 transition">Security</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col md:row justify-between items-center gap-4">
        <p className="text-slate-500 text-xs">
          © {new Date().getFullYear()} InterviewAI Inc. All rights reserved.
        </p>
        <div className="flex gap-6 grayscale opacity-50">
          {/* Add social icons here if needed */}
        </div>
      </div>
    </footer>
  );
};