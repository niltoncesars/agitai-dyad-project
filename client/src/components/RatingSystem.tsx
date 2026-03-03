import { useState, useEffect } from "react";
import { Star, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Review {
  id: string;
  rating: number;
  comment: string;
  timestamp: number;
}

interface RatingData {
  tenantId: string;
  rating: number;
  count: number;
  reviews: Review[];
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
  const [userComment, setUserComment] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  // Carregar avaliações do localStorage
  useEffect(() => {
    const loadRatings = () => {
      const storedRatings = localStorage.getItem("tenant_ratings");
      const allRatings = storedRatings ? JSON.parse(storedRatings) : {};

      if (!allRatings[tenantId] || !allRatings[tenantId].reviews) {
        // Inicializar com dados padrão se não existir ou se estiver no formato antigo
        const mockReviews: Review[] = [
          {
            id: `rev-1-${tenantId}`,
            rating: 5,
            comment: "Excelente organização! Eventos sempre de qualidade.",
            timestamp: Date.now() - 86400000,
          },
          {
            id: `rev-2-${tenantId}`,
            rating: 4,
            comment: "Bom atendimento, mas poderia melhorar a comunicação.",
            timestamp: Date.now() - 172800000,
          },
        ];

        allRatings[tenantId] = {
          tenantId,
          rating: 4.5,
          count: 2,
          reviews: mockReviews,
        };
        localStorage.setItem("tenant_ratings", JSON.stringify(allRatings));
      }

      setRatings(allRatings[tenantId]);
    };

    loadRatings();
  }, [tenantId]);

  const handleRating = () => {
    if (!ratings || userRating === 0) return;

    const storedRatings = localStorage.getItem("tenant_ratings");
    const allRatings = storedRatings ? JSON.parse(storedRatings) : {};

    const currentData = allRatings[tenantId] || { rating: 0, count: 0, reviews: [] };
    const currentReviews = Array.isArray(currentData.reviews) ? currentData.reviews : [];
    
    const newAverage = (currentData.rating * currentData.count + userRating) / (currentData.count + 1);

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      rating: userRating,
      comment: userComment,
      timestamp: Date.now(),
    };

    allRatings[tenantId] = {
      tenantId,
      rating: Math.round(newAverage * 10) / 10,
      count: currentData.count + 1,
      reviews: [newReview, ...currentReviews],
    };

    localStorage.setItem("tenant_ratings", JSON.stringify(allRatings));
    setRatings(allRatings[tenantId]);
    setUserRating(0);
    setUserComment("");
    setShowRatingModal(false);

    if (onRatingChange) {
      onRatingChange(userRating);
    }
  };

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Agora";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`;
    return `${Math.floor(seconds / 86400)}d atrás`;
  };

  if (!ratings) {
    return <div className="h-6 bg-muted rounded animate-pulse" />;
  }

  const formattedRating = (ratings.rating || 0).toFixed(1);
  const reviewCount = Array.isArray(ratings.reviews) ? ratings.reviews.length : ratings.count || 0;
  const formattedCount = reviewCount >= 1000 ? `${(reviewCount / 1000).toFixed(1)} mil` : reviewCount.toString();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm">{formattedRating}</span>
            <span className="text-xs text-muted-foreground">({formattedCount} avaliações)</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => setShowRatingModal(!showRatingModal)}
          >
            Avaliar
          </Button>

          {Array.isArray(ratings.reviews) && ratings.reviews.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2 gap-1"
              onClick={() => setShowReviews(!showReviews)}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {ratings.reviews.length}
            </Button>
          )}
        </div>
      </div>

      {showRatingModal && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3 border border-border">
          <p className="text-sm font-semibold">{tenantName}</p>

          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setUserRating(star)}
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

          <Textarea
            placeholder="Deixe um comentário sobre sua experiência (opcional)..."
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
            className="min-h-20 text-sm resize-none"
          />

          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={handleRating}
              disabled={userRating === 0}
            >
              Enviar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setShowRatingModal(false);
                setUserRating(0);
                setUserComment("");
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {showReviews && Array.isArray(ratings.reviews) && ratings.reviews.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-border max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">Comentários ({ratings.reviews.length})</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowReviews(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {ratings.reviews.map((review) => (
              <div key={review.id} className="bg-card rounded-lg p-3 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{timeAgo(review.timestamp)}</span>
                </div>

                {review.comment && (
                  <p className="text-sm text-foreground/90 leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
