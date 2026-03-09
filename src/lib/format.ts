export function fmtChf(n: number): string {
  return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}
