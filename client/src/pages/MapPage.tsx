import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Layers, ZoomIn, ZoomOut, RotateCcw, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapView } from "@/components/Map";
import { BuyTicketModal } from "@/components/BuyTicketModal";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareButtons } from "@/components/ShareButtons";
import { events, cities, formatCurrency, formatNumber } from "@/lib/mock-data";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function MapPage() {
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const { user, isAuthenticated } = useAuth();

  const filteredEvents = events.filter((event) => {
    if (selectedCity !== "all" && event.city_id !== selectedCity) return false;
    if (selectedCategory !== "all" && event.category !== selectedCategory) return false;
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const categories = Array.from(new Set(events.map((e) => e.category)));
  const totalEvents = filteredEvents.length;
  const totalRevenue = filteredEvents.reduce((sum, event) => sum + (event.price * event.tickets_sold), 0);

  // Callback quando o mapa está pronto
  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    setMapLoading(false);
    
    // Definir o centro inicial para o Brasil
    map.setCenter({ lat: -14.2350, lng: -51.9253 });
    map.setZoom(4);
    
    // Adicionar marcadores iniciais
    addMarkersToMap(map, filteredEvents);
  };

  // Função para adicionar marcadores ao mapa
  const addMarkersToMap = (map: google.maps.Map, eventsToAdd: typeof events) => {
    // Limpar marcadores antigos
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];

    // Adicionar novos marcadores
    eventsToAdd.forEach((event) => {
      if (event.latitude && event.longitude && window.google) {
        try {
          const marker = new window.google.maps.marker.AdvancedMarkerElement({
            map,
            position: { lat: event.latitude, lng: event.longitude },
            title: event.title,
            content: createMarkerContent(event),
          });

          // Adicionar listener para clique no marcador
          marker.addListener("click", () => {
            setSelectedEvent(event);
          });

          markersRef.current.push(marker);
        } catch (err) {
          console.warn(`Erro ao adicionar marcador para evento ${event.id}:`, err);
        }
      }
    });
  };

  // Criar conteúdo customizado para o marcador
  const createMarkerContent = (event: any) => {
    const div = document.createElement("div");
    div.className = "w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors";
    div.innerHTML = '<span class="text-white text-xs font-bold">📍</span>';
    div.style.fontSize = "20px";
    return div;
  };

  // Atualizar marcadores quando filtros mudam
  useEffect(() => {
    if (mapRef.current && window.google) {
      addMarkersToMap(mapRef.current, filteredEvents);
    }
  }, [selectedCity, selectedCategory, searchQuery]);

  // Controles do mapa
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom((mapRef.current.getZoom() || 4) + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom((mapRef.current.getZoom() || 4) - 1);
    }
  };

  const handleResetMap = () => {
    if (mapRef.current) {
      mapRef.current.setCenter({ lat: -14.2350, lng: -51.9253 });
      mapRef.current.setZoom(4);
    }
  };

  const handleBuyClick = () => {
    if (!isAuthenticated) {
      toast.info("Faça login para comprar ingressos");
      window.location.href = getLoginUrl();
      return;
    }
    setShowBuyModal(true);
  };

  return (
    <DashboardLayout>
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Mapa Interativo de Eventos
          </span>
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {totalEvents} eventos • {formatCurrency(totalRevenue)} em receita
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
            />
          </div>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Todas as cidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as cidades</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Map and Event List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-lg">Mapa de Eventos</h3>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-lg hover:bg-muted"
                onClick={handleZoomIn}
                title="Ampliar"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-lg hover:bg-muted"
                onClick={handleZoomOut}
                title="Reduzir"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-lg hover:bg-muted"
                onClick={handleResetMap}
                title="Restaurar visualização"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="relative w-full h-[500px] bg-gradient-to-br from-blue-50 to-blue-100">
            {mapLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">Carregando mapa...</p>
                </div>
              </div>
            )}
            <MapView
              initialCenter={{ lat: -14.2350, lng: -51.9253 }}
              initialZoom={4}
              onMapReady={handleMapReady}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Event List */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Eventos ({filteredEvents.length})
            </h3>
          </div>
          <div className="h-[500px] overflow-y-auto">
            {filteredEvents.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <p>Nenhum evento encontrado</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer ${
                    selectedEvent?.id === event.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex gap-3">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{event.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="rounded-full text-xs">
                          {event.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {event.city_name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {event.date} • {event.time}
                        </span>
                        <span className="text-sm font-semibold text-blue-600">
                          {event.price === 0 ? "Gratuito" : formatCurrency(event.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Selected Event Details */}
      {selectedEvent && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <img
              src={selectedEvent.image}
              alt={selectedEvent.title}
              className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-900">{selectedEvent.title}</h3>
              <p className="text-sm text-gray-700 mt-1">{selectedEvent.description}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">{selectedEvent.city_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">{selectedEvent.date}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-700">{selectedEvent.time}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Ingressos vendidos</span>
                  <p className="text-lg font-bold text-gray-900">
                    {formatNumber(selectedEvent.tickets_sold)} / {formatNumber(selectedEvent.tickets_total)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-600">Preço</span>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedEvent.price === 0 ? "Gratuito" : formatCurrency(selectedEvent.price)}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <FavoriteButton
                    eventId={selectedEvent.id}
                    eventTitle={selectedEvent.title}
                    eventCity={selectedEvent.city_name}
                    eventCategory={selectedEvent.category}
                    eventPrice={selectedEvent.price.toString()}
                    eventDate={selectedEvent.date}
                    eventImageUrl={selectedEvent.image}
                    size="lg"
                    showLabel={false}
                  />
                  <ShareButtons
                    eventTitle={selectedEvent.title}
                    eventCity={selectedEvent.city_name}
                    eventDate={selectedEvent.date}
                    eventPrice={selectedEvent.price.toString()}
                  />
                  <Button
                    onClick={handleBuyClick}
                    className="gap-2"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Comprar Ingresso
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buy Ticket Modal */}
      {selectedEvent && (
        <BuyTicketModal
          isOpen={showBuyModal}
          onClose={() => setShowBuyModal(false)}
          event={selectedEvent}
        />
      )}
    </div>
    </DashboardLayout>
  );
}
