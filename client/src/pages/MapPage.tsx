import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Layers, ZoomIn, ZoomOut, RotateCcw, ShoppingCart, Locate, Info, Heart, Users, Clock, MapPinIcon, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapView } from "@/components/Map";
import { BuyTicketModal } from "@/components/BuyTicketModal";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareButtons } from "@/components/ShareButtons";
import { EventRatingSummary } from "@/components/EventRatingSummary";
import { EventReviews } from "@/components/EventReviews";
import { events, cities, formatCurrency, formatNumber } from "@/lib/mock-data";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import L from "leaflet";

const SETTINGS_KEY = "agitai_notification_settings";

interface FavoriteLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

interface NotificationSettings {
  enableUpcomingEvents: boolean;
  enablePriceChanges: boolean;
  enableFavoriteUpdates: boolean;
  upcomingEventsRadius: number;
  upcomingEventsDaysBefore: number;
  userLatitude: number | null;
  userLongitude: number | null;
  locationName: string;
  favoriteLocations: FavoriteLocation[];
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MapPage() {
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showRadius, setShowRadius] = useState(true);
  
  const mapRef = useRef<any>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const radiusLayersRef = useRef<L.LayerGroup | null>(null);
  
  const { user, isAuthenticated } = useAuthContext();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({
          ...parsed,
          favoriteLocations: parsed.favoriteLocations || []
        });
      }
    } catch {}
  }, []);

  const filteredEvents = events.filter((event) => {
    if (selectedCity !== "all" && event.city_id !== selectedCity) return false;
    if (selectedCategory !== "all" && event.category !== selectedCategory) return false;
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const isEventInRange = (event: any) => {
    if (!settings?.enableUpcomingEvents) return false;
    
    // Verificar localização principal
    if (settings.userLatitude && settings.userLongitude) {
      const dist = calculateDistance(settings.userLatitude, settings.userLongitude, event.latitude, event.longitude);
      if (dist <= settings.upcomingEventsRadius) return true;
    }

    // Verificar locais favoritos
    return settings.favoriteLocations.some(loc => {
      const dist = calculateDistance(loc.latitude, loc.longitude, event.latitude, event.longitude);
      return dist <= (loc.radius || settings.upcomingEventsRadius);
    });
  };

  const eventsInRangeCount = filteredEvents.filter(isEventInRange).length;
  const categories = Array.from(new Set(events.map((e) => e.category)));
  const totalEvents = filteredEvents.length;
  const totalRevenue = filteredEvents.reduce((sum, event) => sum + (event.price * event.tickets_sold), 0);

  const handleMapReady = (mapAdapter: any) => {
    mapRef.current = mapAdapter;
    setMapLoading(false);
    const map = mapAdapter.leafletInstance;
    radiusLayersRef.current = L.layerGroup().addTo(map);
    updateRadiusOnMap(map);
    addMarkersToMap(map, filteredEvents);
  };

  const updateRadiusOnMap = (map: L.Map) => {
    if (!radiusLayersRef.current) return;
    radiusLayersRef.current.clearLayers();

    if (!showRadius || !settings?.enableUpcomingEvents) return;

    // Raio principal
    if (settings.userLatitude && settings.userLongitude) {
      const center: [number, number] = [settings.userLatitude, settings.userLongitude];
      L.circle(center, {
        radius: settings.upcomingEventsRadius * 1000,
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.1,
        weight: 1,
        dashArray: "5, 5"
      }).addTo(radiusLayersRef.current).bindPopup("Sua Localização Principal");

      const userIcon = L.divIcon({
        className: "custom-user-icon",
        html: `<div class="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg animate-pulse"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      L.marker(center, { icon: userIcon }).addTo(radiusLayersRef.current);
    }

    // Raios favoritos
    settings.favoriteLocations.forEach(loc => {
      const center: [number, number] = [loc.latitude, loc.longitude];
      L.circle(center, {
        radius: (loc.radius || settings.upcomingEventsRadius) * 1000,
        color: "#ec4899",
        fillColor: "#ec4899",
        fillOpacity: 0.1,
        weight: 1,
        dashArray: "5, 5"
      }).addTo(radiusLayersRef.current).bindPopup(`Local Favorito: ${loc.name}`);

      const favIcon = L.divIcon({
        className: "custom-fav-icon",
        html: `<div class="w-4 h-4 bg-pink-600 border-2 border-white rounded-full shadow-lg"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      L.marker(center, { icon: favIcon }).addTo(radiusLayersRef.current);
    });
  };

  const addMarkersToMap = (map: L.Map, eventsToAdd: typeof events) => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    eventsToAdd.forEach((event) => {
      if (event.latitude && event.longitude) {
        const isInRange = isEventInRange(event);
        const markerColor = isInRange ? "#ef4444" : "#3b82f6";
        
        const customIcon = L.divIcon({
          className: "custom-event-icon",
          html: `<div class="relative">
            <div class="w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white" style="background-color: ${markerColor}">
              <div class="w-2 h-2 bg-white rounded-full"></div>
            </div>
            ${isInRange ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border border-white rounded-full"></div>' : ''}
          </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([event.latitude, event.longitude], {
          icon: customIcon,
          title: event.title,
        }).addTo(map);

        marker.on("click", () => setSelectedEvent(event));
        markersRef.current.push(marker);
      }
    });
  };

  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.leafletInstance;
      updateRadiusOnMap(map);
      addMarkersToMap(map, filteredEvents);
    }
  }, [selectedCity, selectedCategory, searchQuery, settings, showRadius]);

  const handleZoomIn = () => mapRef.current?.setZoom(mapRef.current.getZoom() + 1);
  const handleZoomOut = () => mapRef.current?.setZoom(mapRef.current.getZoom() - 1);
  const handleResetMap = () => {
    mapRef.current?.setCenter({ lat: -14.2350, lng: -51.9253 });
    mapRef.current?.setZoom(4);
  };

  const handleFocusUser = () => {
    if (mapRef.current && settings?.userLatitude && settings?.userLongitude) {
      mapRef.current.setCenter({ lat: settings.userLatitude, lng: settings.userLongitude });
      mapRef.current.setZoom(10);
    } else {
      toast.info("Configure sua localização nas configurações.");
    }
  };

  const handleBuyClick = () => {
    if (!isAuthenticated) {
      toast.info("Faça login para comprar ingressos");
      window.location.href = "/login";
      return;
    }
    setShowBuyModal(true);
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Mapa Interativo de Eventos
              </span>
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              {totalEvents} eventos • {formatCurrency(totalRevenue)} em receita
            </p>
          </div>
          
          {settings?.enableUpcomingEvents && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <MapPin className="w-4 h-4 text-blue-600" />
              <div className="text-xs">
                <p className="font-semibold text-blue-900">Monitoramento de Raio Ativo</p>
                <p className="text-blue-700">{eventsInRangeCount} eventos próximos aos seus locais salvos</p>
              </div>
            </div>
          )}
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
                className="bg-transparent text-sm outline-none w-full"
              />
            </div>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Todas as cidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {cities.map((city) => <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Map and Event List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Mapa de Eventos</h3>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant={showRadius ? "secondary" : "ghost"} 
                  size="sm" 
                  className="gap-2 px-3 h-9"
                  onClick={() => setShowRadius(!showRadius)}
                >
                  <Locate className={`w-4 h-4 ${showRadius ? "text-blue-600" : ""}`} />
                  <span className="text-xs hidden sm:inline">Ver Raios</span>
                </Button>
                <div className="w-px h-6 bg-border mx-1 self-center" />
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleZoomIn}><ZoomIn className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleZoomOut}><ZoomOut className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleResetMap}><RotateCcw className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="relative w-full h-[500px]">
              {mapLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              )}
              <MapView
                initialCenter={{ lat: -14.2350, lng: -51.9253 }}
                initialZoom={4}
                onMapReady={handleMapReady}
                className="w-full h-full"
              />
              {settings?.userLatitude && (
                <button
                  onClick={handleFocusUser}
                  className="absolute bottom-6 right-6 z-[400] bg-white text-blue-600 p-3 rounded-full shadow-xl border border-blue-100 hover:bg-blue-50 transition-all"
                >
                  <Locate className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Eventos ({filteredEvents.length})
              </h3>
              {eventsInRangeCount > 0 && (
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-2 py-0.5">
                  {eventsInRangeCount} próximos
                </Badge>
              )}
            </div>
            <div className="flex-1 overflow-y-auto max-h-[500px]">
              {filteredEvents.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Info className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p>Nenhum evento encontrado</p>
                </div>
              ) : (
                filteredEvents.map((event) => {
                  const isInRange = isEventInRange(event);
                  return (
                    <div
                      key={event.id}
                      className={`p-4 border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer relative ${
                        selectedEvent?.id === event.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                      }`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex gap-3">
                        <div className="relative">
                          <img src={event.image} alt={event.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                          {isInRange && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border border-white rounded-full" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-medium text-sm truncate ${isInRange ? "text-blue-900" : ""}`}>{event.title}</h4>
                            <FavoriteButton eventId={event.id} size="sm" className="h-6 w-6 bg-transparent shadow-none p-0" />
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className={`rounded-full text-[10px] px-1.5 h-4 ${isInRange ? "bg-blue-200 text-blue-800" : ""}`}>
                              {event.category}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-2 h-2" />
                              {event.city_name}
                            </span>
                            {isInRange && <span className="text-[10px] font-bold text-red-500 ml-auto">Próximo</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Event Details Panel */}
        {selectedEvent && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg animate-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {/* Left Column: Image and Basic Info */}
              <div className="lg:col-span-1 space-y-4">
                <div className="relative rounded-xl overflow-hidden h-64">
                  <img src={selectedEvent.image} alt={selectedEvent.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 z-10"><FavoriteButton eventId={selectedEvent.id} /></div>
                </div>
                
                {/* Event Info Cards */}
                <div className="space-y-3">
                  <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Preco</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(selectedEvent.price)}</p>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Ingressos</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Vendidos</span>
                        <span className="font-semibold">{formatNumber(selectedEvent.tickets_sold)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total</span>
                        <span className="font-semibold">{formatNumber(selectedEvent.tickets_total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Middle Column: Event Details */}
              <div className="lg:col-span-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-600 hover:bg-blue-700">{selectedEvent.category}</Badge>
                    {isEventInRange(selectedEvent) && <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">Proximo</Badge>}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{selectedEvent.title}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">{selectedEvent.description}</p>
                </div>
                
                {/* Event Details */}
                <div className="space-y-3 bg-muted/50 rounded-lg p-4 border border-border/50">
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Data e Horario</p>
                      <p className="text-sm font-medium">{selectedEvent.date}</p>
                      <p className="text-sm">{selectedEvent.time} - {selectedEvent.endTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Endereco</p>
                      <p className="text-sm font-medium">{selectedEvent.address}</p>
                    </div>
                  </div>
                  
                  {selectedEvent.artists && selectedEvent.artists.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Users className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Artistas</p>
                        <p className="text-sm font-medium">{selectedEvent.artists.join(", ")}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Organizador</p>
                      <p className="text-sm font-medium">{selectedEvent.organizer_name}</p>
                      <p className="text-xs text-muted-foreground">CNPJ: {selectedEvent.cnpj}</p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10 rounded-lg" onClick={handleBuyClick}>
                    <ShoppingCart className="w-4 h-4 mr-2" />Comprar Ingressos
                  </Button>
                  <ShareButtons title={selectedEvent.title} text={selectedEvent.description} />
                </div>
              </div>
              
              {/* Right Column: Ratings and Reviews */}
              <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto">
                <EventRatingSummary rating={selectedEvent.rating || 0} totalReviews={selectedEvent.rating ? Math.floor(Math.random() * 1000) + 100 : 0} />
                <div className="border-t border-border pt-4">
                  <EventReviews eventId={selectedEvent.id} eventTitle={selectedEvent.title} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <BuyTicketModal event={selectedEvent} open={showBuyModal} onOpenChange={setShowBuyModal} />
    </DashboardLayout>
  );
}
