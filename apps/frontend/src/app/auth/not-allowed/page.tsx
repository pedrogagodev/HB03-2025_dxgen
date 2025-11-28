"use client";

import { Suspense } from "react";
import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";
import StatusIcon from "@/components/auth/StatusIcon";

function NotAllowedContent() {
  return (
    <AuthLayout>
      <AuthCard variant="error">
        <StatusIcon status="error" />

        <h1 className="mb-3 text-center text-5xl font-bold text-slate-200">
          Access Restricted
        </h1>

        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="mb-1 text-lg font-medium text-amber-400">
            Not on the allowlist
          </p>
          <p className="text-lg text-slate-300">
            You&apos;re not on the allowlist for this application.
          </p>
        </div>

        <div className="mb-6">
          <p className="mb-3 text-lg text-slate-400">Want to get access?</p>
          <ul className="space-y-2 text-lg text-slate-500">
            <li className="flex items-start">
              <span className="mr-2 text-emerald-500">1.</span>
              <span>
                Visit{" "}
                <a
                  href="/"
                  className="text-emerald-400 underline hover:text-emerald-300"
                >
                  our landing page
                </a>
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-emerald-500">2.</span>
              <span>Enter your email to join the waitlist</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-emerald-500">3.</span>
              <span>We&apos;ll review your request and notify you</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 border-t border-slate-700/50 pt-6">
          <p className="text-center text-lg text-slate-500">
            Close this tab and return to your terminal.
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

export default function NotAllowedPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <AuthCard variant="loading">
            <StatusIcon status="loading" />
            <h1 className="mb-2 text-center text-2xl font-bold text-slate-200">
              Loading...
            </h1>
          </AuthCard>
        </AuthLayout>
      }
    >
      <NotAllowedContent />
    </Suspense>
  );
}
