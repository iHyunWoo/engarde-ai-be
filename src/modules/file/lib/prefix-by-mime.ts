export function prefixByMime(contentType: string) {
  const ct = contentType.toLowerCase();
  if (ct.startsWith('video/')) return 'videos';
  if (ct.startsWith('image/')) return 'images';
  return 'files';
}