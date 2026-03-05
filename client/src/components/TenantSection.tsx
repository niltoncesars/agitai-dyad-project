import { useState, useMemo } from "react";
import { MessageCircle, ChevronRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTenantStorage } from "@/hooks/useTenantStorage";

interface TenantSectionProps {
  tenantId: string;
  tenantName: string;
  tenantImage: string;
  rating: number;
  followers: number;
  isFollowing?: boolean;
  onFollowClick?: () => void;
  onChatClick?: () => void;
}

export function TenantSection({
  tenantId,
  tenantName,
  tenantImage,
  rating,
  followers,
  isFollowing = false,
  onFollowClick,
  onChatClick,
}: TenantSectionProps) {
  const [localIsFollowing, setLocalIsFollowing] = useState(isFollowing);
  const { getTenantLogo } = useTenantStorage();
  
  // Usar logo persistida se disponível, caso contrário usar a fornecida
  const displayImage = useMemo(() => {
    const persistedLogo = getTenantLogo(tenantId);
    return persistedLogo || tenantImage;
  }, [tenantId, tenantImage, getTenantLogo]);

  const handleFollowClick = () => {
    setLocalIsFollowing(!localIsFollowing);
    onFollowClick?.();
  };

  return (
    <div className="bg-[#4a4e8c] rounded-xl p-4 flex items-center justify-between gap-4 shadow-lg">
      {/* Left Section: Logo, Name, Rating, Followers */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Tenant Logo */}
        <div className="flex-shrink-0">
          {displayImage ? (
            <img
              src={displayImage}
              alt={tenantName}
              className="w-14 h-14 rounded-full object-cover border-2 border-white/20 shadow-sm"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white/50" />
            </div>
          )}
        </div>

        {/* Tenant Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-medium text-white truncate">{tenantName}</h3>
            <ChevronRight className="w-5 h-5 text-white/70 flex-shrink-0" />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-sm">★</span>
              <span className="text-white text-sm font-medium">{rating.toFixed(1)}</span>
            </div>
            <div className="w-px h-3 bg-white/30" />
            <span className="text-white/80 text-sm">
              {followers.toLocaleString("pt-BR")} Seguidores
            </span>
          </div>
        </div>
      </div>

      {/* Right Section: Buttons */}
      <div className="flex flex-col gap-2 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-4 rounded-lg border border-white text-white bg-transparent hover:bg-white/10 gap-1.5 font-medium transition-colors"
          onClick={handleFollowClick}
        >
          <span className="text-lg leading-none">+</span>
          <span>{localIsFollowing ? "Seguindo" : "Seguir"}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-4 rounded-lg border border-white text-white bg-transparent hover:bg-white/10 gap-1.5 font-medium transition-colors"
          onClick={onChatClick}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Chat</span>
        </Button>
      </div>
    </div>
  );
}
