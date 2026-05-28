export const StatCard = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-slate-900 p-6 rounded-2xl border border-white/10">
    <h3 className="text-slate-400 text-sm mb-2">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);