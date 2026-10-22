export interface ReturnToNavigation {
  to: string;
  search?: Record<string, string>;
  hash?: string;
}

/**
 * Convierte un returnTo interno ya saneado en opciones de navegación.
 * Conserva query y hash sin convertirlos en parte del pathname.
 */
export function toReturnToNavigation(path: string): ReturnToNavigation {
  const base = 'https://internal.destinosmart.invalid';
  const url = new URL(path, base);
  if (
    url.protocol !== 'https:' ||
    url.origin !== base ||
    url.pathname.startsWith('//') ||
    /%2f|%5c|%00/i.test(url.pathname)
  ) {
    return { to: '/dashboard' };
  }
  const search: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    search[key] = value;
  });

  return {
    to: url.pathname || '/dashboard',
    ...(Object.keys(search).length > 0 ? { search } : {}),
    ...(url.hash ? { hash: url.hash.slice(1) } : {}),
  };
}
