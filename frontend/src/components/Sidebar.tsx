import Link from "next/link";

export const Sidebar = () => {
  return (
    <div className="h-full bg-slate-900 border-r border-white/10 p-6">
      <h2 className="text-xl font-bold text-white mb-8">AI Simulator</h2>
      <nav className="space-y-4">
        <NavLink href="/dashboard" label="Dashboard" />
        <NavLink href="/interview" label="Start Interview" />
        <NavLink href="/history" label="Interview History" />
      </nav>
    </div>
  );
};

const NavLink = ({ href, label }: { href: string; label: string }) => (
  <Link 
    href={href} 
    className="block p-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
  >
    {label}
  </Link>
);