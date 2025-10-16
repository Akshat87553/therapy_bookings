const rawBase: string = import.meta.env.VITE_API_BASE ?? '';
const normalizedBase = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

export const apiBaseUrl = normalizedBase;

export const apiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return normalizedBase ? `${normalizedBase}${normalizedPath}` : normalizedPath;
};
