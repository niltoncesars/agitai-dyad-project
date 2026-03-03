import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  eventId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function FavoriteButton({
  eventId,
  size = "md",
  className,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  // Carregar estado inicial do localStorage
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("agitai_favorites") || "[]");
    setIsFavorited(favorites.includes(eventId));
  }, [eventId]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const favorites = JSON.parse(localStorage.getItem("agitai_favorites") || "[]");
    let newFavorites;

    if (isFavorited) {
      newFavorites = favorites.filter((id: string) => id !== eventId);
      toast.success("Removido dos favoritos");
    } else {
      newFavorites = [...favorites, eventId];
      toast.success("Adicionado aos favoritos!");
    }

    localStorage.setItem("agitai_favorites", JSON.stringify(newFavorites));
    setIsFavorited(!isFavorited);

    // Disparar evento customizado para atualizar outras partes da UI
    window.dispatchEvent(new Event("favorites_updated"));
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
      className={cn(
        "rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm transition-all",
        isFavorited ? "text-red-500" : "text-gray-400 hover:text-red-500",
        className
      )}
      title={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart
        size={iconSize[size]}
        className={cn("transition-transform active:scale-125", isFavorited && "fill-current")}
      />
    </Button>
  );
}
