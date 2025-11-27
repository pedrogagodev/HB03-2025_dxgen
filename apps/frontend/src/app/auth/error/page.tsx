"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";
import StatusIcon from "@/components/auth/StatusIcon";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorMessage =
    searchParams.get("message") || "An unknown error occurred";
  const errorCode = searchParams.get("code");

  return (
    <AuthLayout>
      <AuthCard variant="error">
        <StatusIcon status="error" />

        <h1 className="text-5xl font-bold text-center text-slate-200 mb-3">
          Authentication Failed
        </h1>

        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 mb-6">
          <p className="text-rose-400 text-lg font-medium mb-1">Error:</p>
          <p className="text-slate-300 text-lg">{errorMessage}</p>
          {errorCode && (
            <p className="text-slate-500 text-lg mt-2">Code: {errorCode}</p>
          )}
        </div>

        <div className="mb-6">
          <p className="text-slate-400 text-lg mb-3">
            Common solutions to try:
          </p>
          <ul className="text-slate-500 text-lg space-y-2">
            <li className="flex items-start">
              <span className="text-emerald-500 mr-2">•</span>
              <span>Check your internet connection</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-500 mr-2">•</span>
              <span>Make sure you approved the GitHub authorization</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-500 mr-2">•</span>
              <span>Try running the login command again</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <p className="text-center text-slate-500 text-lg mb-2">
            Close this tab and run:
          </p>
          <p className="text-center">
            <code className="bg-slate-800 px-3 py-1.5 rounded text-emerald-400 text-lg">
              dxgen login
            </code>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <AuthCard variant="loading">
            <StatusIcon status="loading" />
            <h1 className="text-2xl font-bold text-center text-slate-200 mb-2">
              Loading...
            </h1>
          </AuthCard>
        </AuthLayout>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
