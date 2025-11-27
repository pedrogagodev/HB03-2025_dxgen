interface AuthCardProps {
  children: React.ReactNode;
  variant?: "success" | "error" | "loading";
}

export default function AuthCard({
  children,
  variant = "loading",
}: AuthCardProps) {
  const borderColor = {
    success: "border-emerald-500/50",
    error: "border-rose-500/50",
    loading: "border-slate-500/50",
  }[variant];

  return (
    <div
      className={`
      max-w-xl w-full
      backdrop-blur-xl bg-white/5
      border ${borderColor}
      rounded-2xl
      p-8
      shadow-2xl
      animate-fade-in
    `}
    >
      {children}
    </div>
  );
}
