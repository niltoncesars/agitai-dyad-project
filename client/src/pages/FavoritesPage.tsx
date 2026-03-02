import { Heart, MapPin, Calendar, Tag, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ShareButtons } from "@/components/ShareButtons";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/mock-data";
import { useEffect, useState } from "react";

export default function FavoritesPage() {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);

  // Get user's favorite events
  const { data: favoritesList, isLoading, refetch } = trpc.favorites.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Remove from favorites
  const removeMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      toast.success("Evento removido dos favoritos!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao remover dos favoritos");
      console.error(error);
    },
  });

  useEffect(() => {
    if (favoritesList) {
      setFavorites(favoritesList);
    }
  }, [favoritesList]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Faça login para ver seus favoritos</h1>
          <p className="text-muted-foreground mb-6">
            Salve seus eventos favoritos e acesse-os a qualquer momento
          </p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            size="lg"
          >
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-6xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/map">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Mapa
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 fill-red-500 text-red-500" />
            <h1 className="text-4xl font-bold">Meus Favoritos</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            {favorites.length} evento{favorites.length !== 1 ? "s" : ""} salvo{favorites.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground">Carregando favoritos...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Nenhum favorito ainda</h2>
            <p className="text-muted-foreground mb-6">
              Clique no ícone de coração em qualquer evento para adicionar aos favoritos
            </p>
            <Link href="/map">
              <Button size="lg">Explorar Eventos</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((event) => (
              <div
                key={event.id}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Event Image */}
                <div className="relative w-full h-48 bg-gradient-to-br from-blue-100 to-blue-50 overflow-hidden">
                  {event.eventImageUrl ? (
                    <img
                      src={event.eventImageUrl}
                      alt={event.eventTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Tag className="w-12 h-12 text-blue-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-red-500 hover:bg-red-600 gap-1">
                      <Heart className="w-3 h-3 fill-current" />
                      Favoritado
                    </Badge>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2 text-gray-900">
                      {event.eventTitle}
                    </h3>
                  </div>

                  {/* Category and City */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="rounded-full">
                      {event.eventCategory}
                    </Badge>
                    <Badge variant="outline" className="rounded-full gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.eventCity}
                    </Badge>
                  </div>

                  {/* Date and Price */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    {event.eventDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{event.eventDate}</span>
                      </div>
                    )}
                    {event.eventPrice && (
                      <div className="text-lg font-bold text-blue-600">
                        {parseFloat(event.eventPrice) === 0
                          ? "Gratuito"
                          : formatCurrency(parseFloat(event.eventPrice))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link href="/map" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Ver no Mapa
                      </Button>
                    </Link>
                    <ShareButtons
                      eventTitle={event.eventTitle}
                      eventCity={event.eventCity}
                      eventDate={event.eventDate}
                      eventPrice={event.eventPrice}
                      className="w-full"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        removeMutation.mutate({ eventId: event.eventId });
                      }}
                      disabled={removeMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
