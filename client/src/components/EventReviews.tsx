import { useState, useEffect } from "react";
import { Star, Heart, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  timestamp: number;
  likes: number;
  liked?: boolean;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface EventReviewsProps {
  eventId: string;
  eventTitle: string;
  onStatsChange?: (stats: ReviewStats) => void;
}

export function EventReviews({ eventId, eventTitle, onStatsChange }: EventReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [userName, setUserName] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Calcular estatísticas das avaliações
  const calculateStats = (reviewsList: Review[]): ReviewStats => {
    if (reviewsList.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    reviewsList.forEach((review) => {
      totalRating += review.rating;
      distribution[review.rating as keyof typeof distribution]++;
    });

    return {
      averageRating: Number((totalRating / reviewsList.length).toFixed(1)),
      totalReviews: reviewsList.length,
      ratingDistribution: distribution,
    };
  };

  // Carregar avaliações do localStorage
  useEffect(() => {
    const storedReviews = localStorage.getItem(`event_reviews_${eventId}`);
    if (storedReviews) {
      const parsedReviews = JSON.parse(storedReviews);
      setReviews(parsedReviews);
      const stats = calculateStats(parsedReviews);
      onStatsChange?.(stats);
    } else {
      // Adicionar algumas avaliações de exemplo
      const mockReviews: Review[] = [
        {
          id: "rev-1",
          userName: "João Silva",
          rating: 5,
          comment: "Evento incrível! A organização foi perfeita e os artistas foram sensacionais. Voltarei com certeza!",
          timestamp: Date.now() - 86400000,
          likes: 42,
          liked: false,
        },
        {
          id: "rev-2",
          userName: "Maria Santos",
          rating: 4,
          comment: "Muito bom! Apenas achei que poderia ter mais espaço para circular. Mas no geral foi ótimo.",
          timestamp: Date.now() - 172800000,
          likes: 18,
          liked: false,
        },
        {
          id: "rev-3",
          userName: "Carlos Oliveira",
          rating: 5,
          comment: "Perfeito! Melhor evento do ano. Recomendo para todos os amigos.",
          timestamp: Date.now() - 259200000,
          likes: 67,
          liked: false,
        },
      ];
      setReviews(mockReviews);
      localStorage.setItem(`event_reviews_${eventId}`, JSON.stringify(mockReviews));
      const stats = calculateStats(mockReviews);
      onStatsChange?.(stats);
    }
  }, [eventId, onStatsChange]);

  const handleSubmitReview = () => {
    if (!userName || !userRating || !userComment) return;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      userName,
      rating: userRating,
      comment: userComment,
      timestamp: Date.now(),
      likes: 0,
      liked: false,
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`event_reviews_${eventId}`, JSON.stringify(updatedReviews));

    // Atualizar estatísticas
    const stats = calculateStats(updatedReviews);
    onStatsChange?.(stats);

    // Limpar formulário
    setUserName("");
    setUserRating(0);
    setUserComment("");
    setShowReviewForm(false);
  };

  const handleLike = (reviewId: string) => {
    const updatedReviews = reviews.map((review) => {
      if (review.id === reviewId) {
        return {
          ...review,
          likes: review.liked ? review.likes - 1 : review.likes + 1,
          liked: !review.liked,
        };
      }
      return review;
    });

    setReviews(updatedReviews);
    localStorage.setItem(`event_reviews_${eventId}`, JSON.stringify(updatedReviews));
  };

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Agora";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d atrás`;
    return `${Math.floor(seconds / 2592000)}mês atrás`;
  };

  return (
    <div className="space-y-6">
      {/* Review Form */}
      <div className="bg-muted/50 rounded-lg p-4 border border-border">
        {!showReviewForm ? (
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => setShowReviewForm(true)}
          >
            <MessageCircle className="w-4 h-4" />
            Deixe sua avaliação
          </Button>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-semibold">{eventTitle}</p>

            {/* Name Input */}
            <input
              type="text"
              placeholder="Seu nome"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {/* Rating Stars */}
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

            {/* Comment Textarea */}
            <Textarea
              placeholder="Compartilhe sua experiência..."
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              className="min-h-20 text-sm resize-none"
            />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 gap-1"
                onClick={handleSubmitReview}
                disabled={!userName || !userRating || !userComment}
              >
                <Send className="w-4 h-4" />
                Enviar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setShowReviewForm(false);
                  setUserName("");
                  setUserRating(0);
                  setUserComment("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        <p className="text-sm font-semibold">Avaliações ({reviews.length})</p>

        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {reviews.map((review) => (
              <div key={review.id} className="bg-card rounded-lg p-4 border border-border/50 space-y-2">
                {/* Header: Name and Rating */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{review.userName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{timeAgo(review.timestamp)}</span>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                <p className="text-sm text-foreground/90 leading-relaxed">{review.comment}</p>

                {/* Like Button */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-2 gap-1 text-xs ${
                      review.liked ? "text-red-500" : "text-muted-foreground"
                    }`}
                    onClick={() => handleLike(review.id)}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${review.liked ? "fill-red-500" : ""}`}
                    />
                    {review.likes > 0 && <span>{review.likes}</span>}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
