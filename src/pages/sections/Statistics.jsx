const stats = [
  { value: "73,166+", label: "Active Users" },
  { value: "4.5M+", label: "Orders Fulfilled" },
  { value: "3,725", label: "Services Available" },
  { value: "150+", label: "Countries Supported" },
];

const StatsDashboard = () => (
  <section className="bg-white dark:bg-[#0f0f1a] border-y border-gray-100 dark:border-white/5">
    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100 dark:divide-white/5">
      {stats.map(({ value, label }) => (
        <div key={label} className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-brand-600 to-brand-500 dark:from-brand-400 dark:to-brand-400 bg-clip-text text-transparent mb-1">
            {value}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</span>
        </div>
      ))}
    </div>
  </section>
);

export default StatsDashboard;