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
            <path d="M442.9 144C415.6 144 389.9 157.1 373.9 179.2L339.5 226.8C335 233 327.8 236.7 320.1 236.7C312.4 236.7 305.2 233 300.7 226.8L266.3 179.2C250.3 157.1 224.6 144 197.3 144C150.3 144 112.2 182.1 112.2 229.1C112.2 279 144.2 327.5 180.3 371.4C221.4 421.4 271.7 465.4 306.2 491.7C309.4 494.1 314.1 495.9 320.2 495.9C326.3 495.9 331 494.1 334.2 491.7C368.7 465.4 419 421.3 460.1 371.4C496.3 327.5 528.2 279 528.2 229.1C528.2 182.1 490.1 144 443.1 144zM335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1C576 297.7 533.1 358 496.9 401.9C452.8 455.5 399.6 502 363.1 529.8C350.8 539.2 335.6 543.9 320 543.9C304.4 543.9 289.2 539.2 276.9 529.8C240.4 502 187.2 455.5 143.1 402C106.9 358.1 64 297.7 64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1L320 171.8L335 151.1z"/>
          </svg>
        )}
      </div>
    </button>
  );
}
