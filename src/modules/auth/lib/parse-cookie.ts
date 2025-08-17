export const parseCookie = (cookieHeader?: string | string[]) => {
  const raw = Array.isArray(cookieHeader) ? cookieHeader.join('; ') : cookieHeader ?? '';
  return raw.split(';').reduce<Record<string, string>>((acc, pair) => {
    const [k, ...rest] = pair.trim().split('=');
    if (!k) return acc;
    acc[k] = decodeURIComponent(rest.join('=') ?? '');
    return acc;
  }, {});
};