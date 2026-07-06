'use client';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#EA4335"
        d="M24 9.5c3.4 0 6.4 1.2 8.8 3.5l6.6-6.6C35.3 2.7 30 0.5 24 0.5 14.8 0.5 6.9 5.9 3.1 13.6l7.7 6C12.6 13.6 17.8 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.6c-.5 2.9-2.2 5.4-4.6 7.1l7.3 5.7C43.6 37.4 46.5 31.5 46.5 24.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.8 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.7-6C1.3 16.9 0.5 20.3 0.5 24s.8 7.1 2.6 10.6l7.7-6z"
      />
      <path
        fill="#34A853"
        d="M24 47.5c6 0 11.3-2 15-5.4l-7.3-5.7c-2 1.4-4.7 2.2-7.7 2.2-6.2 0-13.2-4.1-13.2-9.7l-7.7 6C6.9 42.1 14.8 47.5 24 47.5z"
      />
    </svg>
  );
}

export function GoogleButton({ label }: { label: string }) {
  const handleClick = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-input bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      <GoogleIcon />
      {label}
    </button>
  );
}
