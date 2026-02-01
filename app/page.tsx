"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (userId === "user" && password === "123") {
        router.push("/dashboard");
      } else {
        setError("User ID atau Password salah");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ================= LEFT BRANDING ================= */}
      <div className="
        md:w-1/2
        flex items-center justify-center
        bg-linear-to-br from-[#0f4c81] to-[#1a9b8e]
        text-white
        relative
        overflow-hidden
      ">
        {/* Decorative shapes */}
        <div className="absolute w-72 h-72 rounded-full bg-white/10 -top-20 -left-20" />
        <div className="absolute w-96 h-96 rounded-full bg-white/5 -bottom-37.5 -right-37.5" />

        <div className="relative z-10 text-center px-8">
          <h1 className="text-5xl font-bold tracking-wide">WELCOME</h1>
          <div className="w-24 h-0.75 bg-white mx-auto my-6" />
          <p className="text-white/80 text-base leading-relaxed max-w-md mx-auto">
            Platform monitoring energi listrik berbasis IoT dengan
            visualisasi data real-time dan analisis rule-based untuk
            efisiensi konsumsi daya.
          </p>
        </div>
      </div>

      {/* ================= RIGHT FORM ================= */}
      <div className="md:w-1/2 flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-105 bg-white shadow-lg rounded-lg p-8">
          {/* Tabs */}
          <div className="flex justify-end mb-8">
            <div className="flex bg-gray-100 rounded-full p-1">
              <button className="
                px-5 py-1.5 rounded-full
                bg-[#1a9b8e] text-white
                text-sm font-semibold
              ">
                LOGIN
              </button>
             
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* USER ID */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 tracking-widest mb-1">
                USER ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="
                  w-full
                  border border-gray-200
                  rounded-md
                  px-4 py-3
                  text-gray-700
                  focus:outline-none
                  focus:ring-2 focus:ring-[#1a9b8e]
                "
                required
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 tracking-widest mb-1">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="
                    w-full
                    border border-gray-200
                    rounded-md
                    px-4 py-3
                    pr-10
                    focus:outline-none
                    focus:ring-2 focus:ring-[#1a9b8e]
                  "
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                mt-4
                bg-linear-to-r from-[#0f4c81] to-[#1a9b8e]
                text-white
                font-bold
                uppercase
                py-3
                rounded-md
                transition
                hover:brightness-110
                disabled:opacity-60
              "
            >
              {loading ? "Loading..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
