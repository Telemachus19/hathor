export function formatPriceEgp(price: string | number | null | undefined): string {
  if (price === null || price === undefined) {
    return '0.00';
  }
  const num = typeof price === 'number' ? price : parseFloat(String(price));
  if (isNaN(num)) {
    return '0.00';
  }
  return num.toFixed(2);
}
