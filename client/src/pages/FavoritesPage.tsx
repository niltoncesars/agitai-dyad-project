import { useState, useEffect } from "react";
import { Heart, Search, Calendar, MapPin, Trash2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { events, formatCurrency } from "@/lib/mock-data";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "wouter";
import { toast } from "sonner";

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadFavorites = () => {
    const favorites = JSON.parse(localStorage.getItem("agitai_favorites") || "[]");
    setFavoriteIds(favorites);
  };

  useEffect(() => {
    loadFavorites();
    // Ouvir atualizações de favoritos
    window.addEventListener("favorites_updated", loadFavorites);
    return () => window.removeEventListener("favorites_updated", loadFavorites);
  }, []);

  const favoriteEvents = events.filter((event) => 
    favoriteIds.includes(event.id) &&
    (searchQuery === "" || event.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRemoveFavorite = (eventId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavorites = favoriteIds.filter(id => id !== eventId);
    localStorage.setItem("agitai_favorites", JSON.stringify(newFavorites));
    setFavoriteIds(newFavorites);
    toast.success("Removido dos favoritos");
    window.dispatchEvent(new Event("favorites_updated"));
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meus Favoritos</h1>
            <p className="text-muted-foreground mt-1">
              {favoriteEvents.length} eventos salvos na sua lista
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar favoritos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card"
            />
          </div>
        </div>

        {favoriteEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-dashed border-border/60">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Sua lista está vazia</h3>
            <p className="text-muted-foreground text-center max-w-xs mt-2">
              Explore o mapa e clique no coração para salvar os eventos que você mais gosta.
            </p>
            <Link href="/map">
              <Button className="mt-6 bg-blue-600 hover:bg-blue-700">
                Explorar Eventos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favoriteEvents.map((event) => (
              <Link key={event.id} href={`/map`}>
                <div className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleRemoveFavorite(event.id, e)}
                      className="absolute top-2 right-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-red-500 shadow-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-blue-600/90 backdrop-blur-sm border-none">
                        {event.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg line-clamp-1 text-blue-600">
                        {event.title}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3.5 w-3.5 mr-2 text-red-500" />
                        {event.date}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.city_name} - {event.address.split(',')[0]}
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                      <p className="font-bold text-blue-600">
                        {event.price === 0 ? "Gratuito" : formatCurrency(event.price)}
                      </p>
                      <Link href={`/map?event=${event.id}`}>
                        <Button variant="outline" size="sm" className="text-xs h-8 border-blue-600 text-blue-600 hover:bg-blue-50">
                          Ver no Mapa
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
