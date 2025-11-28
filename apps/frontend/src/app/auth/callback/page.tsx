"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";
import StatusIcon from "@/components/auth/StatusIcon";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const tokens = {
      access_token: params.get("access_token"),
      refresh_token: params.get("refresh_token"),
      expires_in: params.get("expires_in"),
      token_type: params.get("token_type"),
    };

    const port = searchParams.get("port") || "54321";

    if (!tokens.access_token) {
      router.push(
        `/auth/error?message=${encodeURIComponent("No access token received from OAuth provider")}`,
      );
      return;
    }

    fetch(`http://localhost:${port}/callback/tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tokens),
    })
      .then((res) => {
        if (res.ok) {
          const pollStatus = async () => {
            const maxAttempts = 30; // 30 seconds max
            let attempts = 0;

            while (attempts < maxAttempts) {
              try {
                const statusRes = await fetch(`http://localhost:${port}/callback/status`);
                if (statusRes.ok) {
                  const statusData = await statusRes.json();

                  if (statusData.status === "success") {
                    router.push("/auth/success");
                    return;
                  } else if (statusData.status === "not_allowed") {
                    router.push("/auth/not-allowed");
                    return;
                  } else if (statusData.status === "error") {
                    router.push(
                      `/auth/error?message=${encodeURIComponent(statusData.message || "Authentication failed")}`,
                    );
                    return;
                  }
                }
              } catch (error) {
                // Ignore polling errors and continue
              }

              attempts++;
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            }

            router.push(
              `/auth/error?message=${encodeURIComponent("Authentication timeout")}`,
            );
          };

          pollStatus();
        } else {
          router.push(
            `/auth/error?message=${encodeURIComponent("Token validation failed")}`,
          );
        }
      })
      .catch((err) => {
        router.push(`/auth/error?message=${encodeURIComponent(err.message)}`);
      });
  }, [router, searchParams]);

  return (
    <AuthLayout>
      <AuthCard variant="loading">
        <StatusIcon status="loading" />
        <h1 className="text-2xl font-bold text-center text-slate-200 mb-2">
          Completing Authentication
        </h1>
        <p className="text-center text-slate-400 text-sm">
          Please wait while we process your credentials...
        </p>
      </AuthCard>
    </AuthLayout>
  );
}

export default function AuthCallbackPage() {
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
      <AuthCallbackContent />
    </Suspense>
  );
}
