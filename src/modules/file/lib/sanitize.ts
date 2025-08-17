export function sanitize(name: string) {
  return name.replace(/[^\w.\-]/g, '_');
}