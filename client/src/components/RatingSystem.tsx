import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RatingData {
  tenantId: string;
  rating: number;
  count: number;
}

interface RatingSystemProps {
  tenantId: string;
  tenantName: string;
  onRatingChange?: (rating: number) => void;
}

export function RatingSystem({ tenantId, tenantName, onRatingChange }: RatingSystemProps) {
  const [ratings, setRatings] = useState<RatingData | null>(null);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Carregar avaliações do localStorage
  useEffect(() => {
    const storedRatings = localStorage.getItem("tenant_ratings");
    const allRatings = storedRatings ? JSON.parse(storedRatings) : {};

    if (!allRatings[tenantId]) {
      // Inicializar com dados padrão
      allRatings[tenantId] = {
        tenantId,
        rating: Math.random() * 2 + 3.5, // Entre 3.5 e 5.5
        count: Math.floor(Math.random() * 1000) + 100,
      };
      localStorage.setItem("tenant_ratings", JSON.stringify(allRatings));
    }

    setRatings(allRatings[tenantId]);
  }, [tenantId]);

  const handleRating = (rating: number) => {
    if (!ratings) return;

    // Atualizar a avaliação no localStorage
    const storedRatings = localStorage.getItem("tenant_ratings");
    const allRatings = storedRatings ? JSON.parse(storedRatings) : {};

    const currentRating = allRatings[tenantId] || { rating: 0, count: 0 };
    const newAverage = (currentRating.rating * currentRating.count + rating) / (currentRating.count + 1);

    allRatings[tenantId] = {
      tenantId,
      rating: Math.round(newAverage * 10) / 10,
      count: currentRating.count + 1,
    };

    localStorage.setItem("tenant_ratings", JSON.stringify(allRatings));
    setRatings(allRatings[tenantId]);
    setUserRating(rating);
    setShowRatingModal(false);

    if (onRatingChange) {
      onRatingChange(rating);
    }
  };

  if (!ratings) {
    return <div className="h-6 bg-muted rounded animate-pulse" />;
  }

  const formattedRating = ratings.rating.toFixed(1);
  const formattedCount = ratings.count >= 1000 ? `${(ratings.count / 1000).toFixed(1)} mil` : ratings.count.toString();

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="font-semibold text-sm">{formattedRating}</span>
        <span className="text-xs text-muted-foreground">({formattedCount} avaliações)</span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="text-xs h-7 px-2 ml-2"
        onClick={() => setShowRatingModal(!showRatingModal)}
      >
        {userRating > 0 ? "Alterar" : "Avaliar"}
      </Button>

      {showRatingModal && (
        <div className="absolute bg-card border border-border rounded-lg shadow-lg p-4 z-50 mt-2 -ml-4">
          <p className="text-sm font-semibold mb-3">{tenantName}</p>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= (hoveredRating || userRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => setShowRatingModal(false)}
          >
            Fechar
          </Button>
        </div>
      )}
    </div>
  );
}
