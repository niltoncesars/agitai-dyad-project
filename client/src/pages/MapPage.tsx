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
import L from "leaflet";

export default function MapPage() {
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<L.Marker[]>([]);
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
  const handleMapReady = (mapAdapter: any) => {
    mapRef.current = mapAdapter;
    setMapLoading(false);
    
    // Adicionar marcadores iniciais
    addMarkersToMap(mapAdapter.leafletInstance, filteredEvents);
  };

  // Função para adicionar marcadores ao mapa
  const addMarkersToMap = (map: L.Map, eventsToAdd: typeof events) => {
    // Limpar marcadores antigos
    markersRef.current.forEach((marker) => {
      marker.remove();
    });
    markersRef.current = [];

    // Adicionar novos marcadores
    eventsToAdd.forEach((event) => {
      if (event.latitude && event.longitude) {
        try {
          const marker = L.marker([event.latitude, event.longitude], {
            title: event.title,
          }).addTo(map);

          // Adicionar listener para clique no marcador
          marker.on("click", () => {
            setSelectedEvent(event);
          });

          markersRef.current.push(marker);
        } catch (err) {
          console.warn(`Erro ao adicionar marcador para evento ${event.id}:`, err);
        }
      }
    });
  };

  // Atualizar marcadores quando filtros mudam
  useEffect(() => {
    if (mapRef.current) {
      addMarkersToMap(mapRef.current.leafletInstance, filteredEvents);
    }
  }, [selectedCity, selectedCategory, searchQuery]);

  // Controles do mapa
  const handleZoomIn = () => {
    if (mapRef.current) {
      const zoom = mapRef.current.getZoom();
      mapRef.current.setZoom(zoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      const zoom = mapRef.current.getZoom();
      mapRef.current.setZoom(zoom - 1);
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
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
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
            <div className="relative w-full h-[500px]">
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
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Eventos ({filteredEvents.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[500px]">
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
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Event Details Panel */}
        {selectedEvent && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg animate-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <div className="h-64 md:h-full relative">
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <FavoriteButton eventId={selectedEvent.id} />
                </div>
              </div>
              <div className="p-6 lg:col-span-2 space-y-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-600 hover:bg-blue-700">{selectedEvent.category}</Badge>
                      <span className="text-sm text-muted-foreground">{selectedEvent.city_name}</span>
                    </div>
                    <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
                    <p className="text-muted-foreground mt-2 line-clamp-2">{selectedEvent.description}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-muted-foreground mb-1">A partir de</p>
                    <p className="text-3xl font-bold text-blue-600">{formatCurrency(selectedEvent.price)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-xl border border-border/50">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Data</p>
                    <p className="text-sm font-medium">{selectedEvent.date}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Horário</p>
                    <p className="text-sm font-medium">{selectedEvent.time}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Vendas</p>
                    <p className="text-sm font-medium">{formatNumber(selectedEvent.tickets_sold)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Receita</p>
                    <p className="text-sm font-medium">{formatCurrency(selectedEvent.price * selectedEvent.tickets_sold)}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <Button 
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl shadow-md shadow-blue-200"
                    onClick={handleBuyClick}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Comprar Ingressos
                  </Button>
                  <div className="w-full sm:w-auto border-l border-border pl-0 sm:pl-4">
                    <ShareButtons 
                      title={selectedEvent.title} 
                      text={selectedEvent.description}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <BuyTicketModal
        event={selectedEvent}
        open={showBuyModal}
        onOpenChange={setShowBuyModal}
      />
    </DashboardLayout>
  );
}
