"use client";

import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";
import StatusIcon from "@/components/auth/StatusIcon";

export default function AuthSuccessPage() {
  return (
    <AuthLayout>
      <AuthCard variant="success">
        <StatusIcon status="success" />

        <h1 className="text-5xl font-bold text-center text-slate-200 mb-3">
          Authentication Successful!
        </h1>

        <p className="text-center text-slate-400 text-xl mb-6">
          You can close this tab and return to your terminal.
        </p>

        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
          <p className="text-emerald-400 text-lg font-medium mb-3">
            What's next?
          </p>
          <ul className="text-slate-300 text-lg space-y-2">
            <li className="flex items-start">
              <span className="text-emerald-500 mr-2">•</span>
              <span>
                Run{" "}
                <code className="bg-slate-800 px-2 py-0.5 rounded text-emerald-400 text-lg">
                  dxgen --help
                </code>{" "}
                to see all commands
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-500 mr-2">•</span>
              <span>
                Run{" "}
                <code className="bg-slate-800 px-2 py-0.5 rounded text-emerald-400 text-lg">
                  dxgen generate
                </code>{" "}
                to create docs
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <p className="text-center text-slate-500">
            Your authentication session has been saved securely.
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
