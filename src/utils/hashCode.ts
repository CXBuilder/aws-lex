import { safeStringify } from './safeStringify';

/**
 * Generate a hash code for an object
 * Source: https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 */
export function hashCode(input: unknown): number {
  const text = safeStringify(input);
  let hash = 0;
  if (text.length === 0) {
    return hash;
  }
  for (let i = 0; i < text.length; i++) {
    const chr = text.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
