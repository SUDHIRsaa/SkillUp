// Helper to calculate accuracy
export function calculateAccuracy(correct, total) {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}