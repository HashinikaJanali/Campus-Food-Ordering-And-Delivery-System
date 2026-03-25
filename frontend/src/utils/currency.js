export function formatRs(amount) {
  const n = Number(amount) || 0;
  // Format with two decimal places and thousand separators
  return `Rs. ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
