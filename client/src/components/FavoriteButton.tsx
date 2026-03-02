import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { useState } from "react";

interface FavoriteButtonProps {
  eventId: string;
  eventTitle: string;
  eventCity: string;
  eventCategory: string;
  eventPrice?: string;
  eventDate?: string;
  eventImageUrl?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function FavoriteButton({
  eventId,
  eventTitle,
  eventCity,
  eventCategory,
  eventPrice,
  eventDate,
  eventImageUrl,
  size = "md",
  showLabel = true,
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(false);

  // Check if favorited
  const { data: isFavorited } = trpc.favorites.isFavorited.useQuery(
    { eventId },
    { enabled: !!user }
  );

  // Add to favorites
  const addMutation = trpc.favorites.add.useMutation({
    onSuccess: () => {
      setIsFav(true);
      toast.success("Evento adicionado aos favoritos!");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar aos favoritos");
      console.error(error);
    },
  });

  // Remove from favorites
  const removeMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      setIsFav(false);
      toast.success("Evento removido dos favoritos!");
    },
    onError: (error) => {
      toast.error("Erro ao remover dos favoritos");
      console.error(error);
    },
  });

  const handleToggleFavorite = () => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }

    const currentFav = isFavorited ?? isFav;

    if (currentFav) {
      removeMutation.mutate({ eventId });
    } else {
      addMutation.mutate({
        eventId,
        eventTitle,
        eventCity,
        eventCategory,
        eventPrice,
        eventDate,
        eventImageUrl,
      });
    }
  };

  const currentFav = isFavorited ?? isFav;
  const isLoading = addMutation.isPending || removeMutation.isPending;

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`${sizeClasses[size]} p-0 hover:bg-red-50`}
      title={currentFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart
        size={iconSize[size]}
        className={`transition-all ${
          currentFav
            ? "fill-red-500 text-red-500"
            : "text-gray-400 hover:text-red-500"
        }`}
      />
      {showLabel && (
        <span className="ml-2 text-sm">
          {currentFav ? "Favoritado" : "Favoritar"}
        </span>
      )}
    </Button>
  );
}
