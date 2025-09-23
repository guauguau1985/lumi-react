export function gcd(a: number, b: number): number {
  while (b !== 0) [a, b] = [b, a % b];
  return Math.abs(a);
}

export function simplify(n: number, d: number) {
  const g = gcd(n, d) || 1;
  return { n: n / g, d: d / g };
}

export function isEquivalent(aN: number, aD: number, bN: number, bD: number) {
  const A = simplify(aN, aD);
  const B = simplify(bN, bD);
  return A.n === B.n && A.d === B.d;
}
