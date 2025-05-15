import { Review } from "../types/types";

export function calculateDiff(reviews: Review[]): string {
  let totalDiff = 0;

  for (let i = 0; i < reviews?.length; i++) {
    totalDiff += reviews[i]?.difficulty;
  }

  const averageDiff = totalDiff / reviews?.length;
  return averageDiff.toFixed(1);
}
