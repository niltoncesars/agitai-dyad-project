import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

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
    <button
      onClick={handleToggleFavorite}
      title={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className="flex items-center justify-center transition-all hover:scale-110"
    >
      {/* Fundo circular cinza claro */}
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
        {/* Ícone com contorno azulado (desativado) ou preenchimento vermelho (ativo) */}
        <Heart
          size={iconSize[size]}
          className={`transition-all ${
            isFavorited
              ? "text-red-500 fill-red-500"
              : "text-blue-400 stroke-2"
          }`}
          strokeWidth={isFavorited ? 0 : 2}
        />
      </div>
    </button>
  );
}
