import { Star, Info } from "lucide-react";

interface EventRatingSummaryProps {
  rating: number;
  totalReviews: number;
  ratingDistribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export function EventRatingSummary({ rating, totalReviews, ratingDistribution }: EventRatingSummaryProps) {
  // Distribuição padrão se não for fornecida
  const distribution = ratingDistribution || {
    5: Math.floor(totalReviews * 0.5),
    4: Math.floor(totalReviews * 0.25),
    3: Math.floor(totalReviews * 0.15),
    2: Math.floor(totalReviews * 0.07),
    1: Math.floor(totalReviews * 0.03),
  };

  const maxCount = Math.max(...Object.values(distribution));

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-bold">Resumo</h3>
        <div className="flex items-center gap-1 text-muted-foreground cursor-help" title="Como funcionam as avaliações">
          <span className="text-sm">Como funcionam as avaliações</span>
          <Info className="w-4 h-4" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="flex items-start gap-6">
          {/* Rating Score */}
          <div className="flex flex-col items-center gap-2 min-w-fit">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{rating.toFixed(1)}</span>
              <Star className="w-8 h-8 fill-black text-black" />
            </div>
            <span className="text-sm text-muted-foreground">{formatCount(totalReviews)} avaliações</span>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = distribution[stars as keyof typeof distribution];
              const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

              return (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 min-w-fit">
                    <span className="text-sm font-medium">{stars}</span>
                    <Star className="w-4 h-4 fill-black text-black" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
