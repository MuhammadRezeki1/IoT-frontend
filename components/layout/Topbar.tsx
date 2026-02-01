import { Bell, User } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
      <h1 className="text-xl font-bold">Dashboard</h1>

      <div className="flex items-center gap-4">
        <Bell />
        <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white">
          <User size={18} />
        </div>
      </div>
    </header>
  );
}
