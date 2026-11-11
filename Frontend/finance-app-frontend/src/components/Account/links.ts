export function signInHref(next: string) {
  return `/login?next=${encodeURIComponent(next)}`
}

export const primaryButton =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50'
