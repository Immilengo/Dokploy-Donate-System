import { redirect } from 'next/navigation';

interface AuthRedirectProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function AuthRegisterRedirect({ searchParams }: AuthRedirectProps) {
  const query = new URLSearchParams();

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value === undefined) return;
      if (Array.isArray(value)) {
        value.forEach((item) => query.append(key, item));
      } else {
        query.append(key, value);
      }
    });
  }

  redirect(`/register${query.toString() ? `?${query.toString()}` : ''}`);
}
