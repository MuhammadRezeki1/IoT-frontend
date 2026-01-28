import { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div
      className="
        rounded-xl
        bg-white/5
        backdrop-blur-md
        p-4
        soft-glow
        animate-fade-up
      "
    >
      {title && (
        <h2 className="mb-3 text-lg font-semibold text-white">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
