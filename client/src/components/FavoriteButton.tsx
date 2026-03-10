// Heart import removed to use custom Font Awesome SVGs
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
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isFavorited ? 'bg-red-50' : 'bg-gray-200'}`}>
        {/* Ícone customizado do Font Awesome */}
        {isFavorited ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width={iconSize[size] + 4} height={iconSize[size] + 4} className="fill-red-500 transition-all">
            <path d="M305 151.1L320 171.8L335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1z"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width={iconSize[size] + 4} height={iconSize[size] + 4} className="fill-blue-400 transition-all">
            <path d="M128 128C128 92.7 156.7 64 192 64L448 64C483.3 64 512 92.7 512 128L512 545.1C512 570.7 483.5 585.9 462.2 571.7L320 476.8L177.8 571.7C156.5 585.9 128 570.6 128 545.1L128 128zM192 112C183.2 112 176 119.2 176 128L176 515.2L293.4 437C309.5 426.3 330.5 426.3 346.6 437L464 515.2L464 128C464 119.2 456.8 112 448 112L192 112z"/>
          </svg>
        )}
      </div>
    </button>
  );
}
