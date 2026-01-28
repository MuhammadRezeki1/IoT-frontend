"use client";

interface PowerData {
  phase: string;
  power: number;
}

const data: PowerData[] = [
  { phase: "Phase R", power: 420 },
  { phase: "Phase S", power: 380 },
  { phase: "Phase T", power: 450 },
];

export default function PowerBarChart() {
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.phase}>
          <div className="mb-1 flex justify-between text-sm">
            <span>{item.phase}</span>
            <span>{item.power} W</span>
          </div>
          <div className="h-3 w-full rounded bg-gray-200">
            <div
              className="h-3 rounded bg-blue-500"
              style={{ width: `${item.power / 5}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
