export default function AdminStatCard({ title, value, description }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      {description && <p className="text-xs text-gray-400">{description}</p>}
    </div>
  );
}
