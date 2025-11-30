import { ReactNode } from "react";
import { ShaderBackground } from "@/components/ui/shader-background";

interface LandingLayoutProps {
  children: ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <main className="relative">
      <div className="fixed inset-0">
        <ShaderBackground />
      </div>

      <div
        className="fixed inset-0 bg-black/30 pointer-events-none"
        style={{ backdropFilter: "blur(40px)" }}
      />

      {/* Content */}
      {children}
    </main>
  );
}
