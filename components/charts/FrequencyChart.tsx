// "use client";

// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
// } from "recharts";

// const data = [
//   { time: "10:00", F: 50.1 },
//   { time: "11:00", F: 49.9 },
//   { time: "12:00", F: 50.0 },
//   { time: "13:00", F: 50.2 },
// ];

// export default function FrequencyChart() {
//   return (
//     <div className="h-[260px]">
//       <ResponsiveContainer width="100%" height="100%">
//         <AreaChart data={data}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="time" stroke="#a1a1aa" />
//           <YAxis stroke="#a1a1aa" />
//           <Tooltip />
//           <Area
//             type="monotone"
//             dataKey="F"
//             stroke="#06b6d4"
//             fill="#164e63"
//           />
//         </AreaChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }
