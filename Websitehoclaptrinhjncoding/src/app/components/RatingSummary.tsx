import { Star } from 'lucide-react';
import type { RatingSummary as RatingSummaryType } from '@/app/lib/api';

interface RatingSummaryProps {
  data: RatingSummaryType | null;
  loading?: boolean;
}

/**
 * RatingSummary Component (FE-REVIEW-04)
 * Displays:
 * - Average rating with stars
 * - Rating distribution bars (5 stars -> 1 star)
 * - Total reviews count
 */
export function RatingSummary({ data, loading }: RatingSummaryProps) {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-16 bg-muted rounded mb-4" />
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="h-4 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-muted-foreground text-sm">
        Chưa có đánh giá nào.
      </div>
    );
  }

  const { averageRating, totalReviews, distribution } = data;

  // Convert distribution object to array for easier mapping
  const distributionArray = [
    { stars: 5, count: distribution.fiveStars, label: '5 sao' },
    { stars: 4, count: distribution.fourStars, label: '4 sao' },
    { stars: 3, count: distribution.threeStars, label: '3 sao' },
    { stars: 2, count: distribution.twoStars, label: '2 sao' },
    { stars: 1, count: distribution.oneStar, label: '1 sao' },
  ];

  // Calculate max count for percentage calculation
  const maxCount = Math.max(...distributionArray.map((d) => d.count), 1);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
        Tổng quan đánh giá
      </h3>

      {/* Average Rating Display */}
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center mt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i <= Math.round(averageRating)
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {totalReviews.toLocaleString()} đánh giá
          </div>
        </div>

        {/* Distribution Bars */}
        <div className="flex-1 space-y-2">
          {distributionArray.map(({ stars, count }) => {
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            const barWidth = totalReviews > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={stars} className="flex items-center gap-3">
                <div className="w-12 text-sm text-muted-foreground flex items-center gap-1">
                  <span>{stars}</span>
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                </div>
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <div className="w-16 text-sm text-muted-foreground text-right">
                  {percentage.toFixed(0)}% ({count})
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RatingSummary;
