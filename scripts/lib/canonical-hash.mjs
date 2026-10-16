import { createHash } from 'node:crypto';

/**
 * Must match Kepler's canonical hash exactly: the app recomputes it from the
 * inline family and drops any family whose `sha256` differs. Object keys sort
 * by default string order (UTF-16 code units), arrays keep their order, there
 * is no whitespace, and primitives are written as JSON.stringify writes them.
 */
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value);
}

export function canonicalHash(value) {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}
