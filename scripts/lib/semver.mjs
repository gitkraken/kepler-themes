// Semantic Versioning 2.0.0, the semver.org regular expression (Kepler uses the same one).
const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

export function isSemver(value) {
  return typeof value === 'string' && value.length <= 64 && SEMVER.test(value);
}

export function parseSemver(value) {
  const match = typeof value === 'string' ? SEMVER.exec(value) : null;
  if (!match) throw new Error(`Not a semantic version: ${String(value)}`);
  return {
    core: [BigInt(match[1]), BigInt(match[2]), BigInt(match[3])],
    prerelease: match[4] === undefined ? [] : match[4].split('.'),
  };
}

const NUMERIC = /^\d+$/;

function compareIdentifiers(a, b) {
  const aNumeric = NUMERIC.test(a);
  const bNumeric = NUMERIC.test(b);
  if (aNumeric && bNumeric) {
    const x = BigInt(a);
    const y = BigInt(b);
    return x < y ? -1 : x > y ? 1 : 0;
  }
  // Numeric identifiers always have lower precedence than alphanumeric ones.
  if (aNumeric) return -1;
  if (bNumeric) return 1;
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Negative, zero or positive by semver precedence; build metadata is ignored. */
export function comparePrecedence(a, b) {
  const x = parseSemver(a);
  const y = parseSemver(b);
  for (let i = 0; i < 3; i++) {
    if (x.core[i] !== y.core[i]) return x.core[i] < y.core[i] ? -1 : 1;
  }
  // A version without a prerelease outranks the same core with one.
  if (x.prerelease.length === 0 && y.prerelease.length === 0) return 0;
  if (x.prerelease.length === 0) return 1;
  if (y.prerelease.length === 0) return -1;
  const shared = Math.min(x.prerelease.length, y.prerelease.length);
  for (let i = 0; i < shared; i++) {
    const result = compareIdentifiers(x.prerelease[i], y.prerelease[i]);
    if (result !== 0) return result;
  }
  return Math.sign(x.prerelease.length - y.prerelease.length);
}
