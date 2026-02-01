export default function StatCard({
    title,
    value,
    unit,
  }: {
    title: string;
    value: number;
    unit: string;
  }) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h4 className="text-gray-500">{title}</h4>
        <div className="text-3xl font-bold mt-2">
          {value} <span className="text-base font-normal">{unit}</span>
        </div>
        <span className="inline-flex items-center gap-2 mt-3 text-green-600 text-sm">
          ● Normal
        </span>
      </div>
    );
  }
  