interface StatusIconProps {
  status: "success" | "error" | "loading";
}

export default function StatusIcon({ status }: StatusIconProps) {
  if (status === "loading") {
    return (
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-emerald-500"
            aria-label="Success icon"
            role="img"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
              className="animate-check-draw"
              style={{
                strokeDasharray: 50,
                strokeDashoffset: 50,
              }}
            />
          </svg>
        </div>
      </div>
    );
  }

  // error
  return (
    <div className="flex justify-center mb-6">
      <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center">
        <svg
          className="w-12 h-12 text-rose-500"
          aria-label="Error icon"
          role="img"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
    </div>
  );
}
