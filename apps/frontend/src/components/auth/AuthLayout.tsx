export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0.8),transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-size-[50px_50px] opacity-20 pointer-events-none" />

      <div className="fixed inset-x-0 bottom-0 h-[500px] bg-linear-to-t from-teal-950/50 via-emerald-900/20 to-transparent pointer-events-none" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {children}
      </div>
    </div>
  );
}
