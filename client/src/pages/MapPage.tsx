import React, { useState, useEffect, useRef } from "react";
import { MapPin, Search, Layers, ZoomIn, ZoomOut, RotateCcw, ShoppingCart, Locate, Info, Heart, Users, Clock, MapPinIcon, Building2, Share2, Filter, X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CATEGORIES } from "@/lib/constants";
import { MapView } from "@/components/Map";
import { BuyTicketModal } from "@/components/BuyTicketModal";
import { FavoriteButton } from "@/components/FavoriteButton";
import { CheckInButton } from "@/components/CheckInButton";
import { ShareButtons } from "@/components/ShareButtons";
import { EventRatingSummary } from "@/components/EventRatingSummary";
import { EventReviews, ReviewStats } from "@/components/EventReviews";
import { TenantSection } from "@/components/TenantSection";
import { events, cities, formatCurrency, formatNumber } from "@/lib/mock-data";
import { formatFullDisplayDate } from "@/lib/date-utils";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { useTenantStorage } from "@/hooks/useTenantStorage";
import L from "leaflet";

const SETTINGS_KEY = "agitai_notification_settings";

// Função para formatar a data no formato desejado (agora usa o utilitário centralizado)
function formatEventDate(dateString: string): string {
  return formatFullDisplayDate(dateString);
}

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
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showRadius, setShowRadius] = useState(true);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [activeTab, setActiveTab] = useState<"reviews" | "info">("info");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; cityName: string } | null>(null);
  const [localStorageEvents, setLocalStorageEvents] = useState<any[]>([]);
  const [hiddenEventIds, setHiddenEventIds] = useState<string[]>([]);
  
  const mapRef = useRef<any>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const radiusLayersRef = useRef<L.LayerGroup | null>(null);
  
  const { user, isAuthenticated } = useAuthContext();
  const { getTenantLogo } = useTenantStorage();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);

  // Geolocalização do usuário
  useEffect(() => {
    const getGeoLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            
            // Encontrar a cidade mais próxima
            let nearestCity = cities[0];
            let minDistance = Infinity;
            
            cities.forEach((city) => {
              const distance = calculateDistance(latitude, longitude, city.latitude, city.longitude);
              if (distance < minDistance) {
                minDistance = distance;
                nearestCity = city;
              }
            });
            
            setUserLocation({
              latitude,
              longitude,
              cityName: nearestCity.name
            });
          },
          (error) => {
            console.log("Geolocalização não permitida ou indisponível");
            // Fallback para uma localização padrão para demonstração se necessário
            // Ou apenas manter null
          }
        );
      }
    };

    getGeoLocation();
  }, [cities]);

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

  const loadEventsAndVisibility = () => {
    // Carregar eventos locais
    const savedEvents = localStorage.getItem('agitai_events');
    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        const publishedEvents = parsed.filter((e: any) => e.status === 'published');
        setLocalStorageEvents(publishedEvents);
      } catch (error) {
        console.error('Erro ao carregar eventos do localStorage:', error);
      }
    }

    // Carregar IDs ocultos
    const savedHiddenIds = localStorage.getItem('agitai_hidden_events');
    if (savedHiddenIds) {
      try {
        setHiddenEventIds(JSON.parse(savedHiddenIds));
      } catch (error) {
        console.error('Erro ao carregar IDs ocultos do localStorage:', error);
      }
    }
  };

  // Carregar dados ao montar e quando houver atualizações
  useEffect(() => {
    loadEventsAndVisibility();
    window.addEventListener("visibility_updated", loadEventsAndVisibility);
    return () => window.removeEventListener("visibility_updated", loadEventsAndVisibility);
  }, []);

  // Combinar eventos estáticos com eventos do localStorage e filtrar ocultos
  const allEvents = [...events, ...localStorageEvents].filter(event => !hiddenEventIds.includes(event.id));

  const filteredEvents = allEvents.filter((event) => {
    if (selectedCity !== "all" && selectedCity !== "current" && event.city_id !== selectedCity) return false;
    if (selectedCity === "current" && userLocation) {
      const distance = calculateDistance(userLocation.latitude, userLocation.longitude, event.latitude, event.longitude);
      if (distance > 50) return false;
    }
    if (selectedSubcategories.length > 0) {
      // Verifica se alguma das categorias do evento está entre as selecionadas
      const eventCategories = Array.isArray(event.categories) ? event.categories : [event.category];
      
      const hasMatch = selectedSubcategories.some(subId => {
        // Encontrar o nome da subcategoria pelo ID
        for (const cat of CATEGORIES) {
          const sub = cat.subcategories.find(s => s.id === subId);
          if (sub && eventCategories.some(ecat => ecat === sub.name || ecat === cat.name)) return true;
        }
        return false;
      });
      if (!hasMatch) return false;
    }
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
      return dist <= loc.radius;
    });
  };

  const toggleSubcategory = (subId: string) => {
    setSelectedSubcategories(prev => 
      prev.includes(subId) 
        ? prev.filter(id => id !== subId) 
        : [...prev, subId]
    );
  };

  const clearFilters = () => setSelectedSubcategories([]);

  const getSelectedLabels = () => {
    if (selectedSubcategories.length === 0) return "Categorias";
    if (selectedSubcategories.length === 1) {
      for (const cat of CATEGORIES) {
        const sub = cat.subcategories.find(s => s.id === selectedSubcategories[0]);
        if (sub) return sub.name;
      }
    }
    return `${selectedSubcategories.length} selecionadas`;
  };
  const totalEvents = filteredEvents.length;
  const totalRevenue = filteredEvents.reduce((sum, e) => sum + (e.price * e.tickets_sold), 0);
  const eventsInRangeCount = filteredEvents.filter(isEventInRange).length;

  const handleMapReady = (mapInstance: any) => {
    mapRef.current = mapInstance;
    setMapLoading(false);
  };

  const updateRadiusOnMap = (map: any) => {
    if (radiusLayersRef.current) {
      map.removeLayer(radiusLayersRef.current);
    }

    if (!showRadius || !settings?.enableUpcomingEvents) return;

    radiusLayersRef.current = L.layerGroup();

    // Adicionar raio da localização principal
    if (settings.userLatitude && settings.userLongitude) {
      const circle = L.circle([settings.userLatitude, settings.userLongitude], {
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.1,
        radius: settings.upcomingEventsRadius * 1000,
        weight: 2,
      });
      circle.addTo(radiusLayersRef.current);

      const marker = L.circleMarker([settings.userLatitude, settings.userLongitude], {
        radius: 8,
        fillColor: "#3b82f6",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      });
      marker.addTo(radiusLayersRef.current);
    }

    // Adicionar raios dos locais favoritos
    settings.favoriteLocations.forEach((loc) => {
      const circle = L.circle([loc.latitude, loc.longitude], {
        color: "#ec4899",
        fillColor: "#ec4899",
        fillOpacity: 0.1,
        radius: loc.radius * 1000,
        weight: 2,
      });
      circle.addTo(radiusLayersRef.current);

      const marker = L.circleMarker([loc.latitude, loc.longitude], {
        radius: 6,
        fillColor: "#ec4899",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      });
      marker.addTo(radiusLayersRef.current);
    });

    radiusLayersRef.current.addTo(map);
  };

  const addMarkersToMap = (map: any, eventsToAdd: any[]) => {
    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current = [];

    eventsToAdd.forEach((event) => {
      const isInRange = isEventInRange(event);
      const marker = L.circleMarker([event.latitude, event.longitude], {
        radius: isInRange ? 10 : 8,
        fillColor: isInRange ? "#ef4444" : "#3b82f6",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      });

      marker.bindPopup(`<strong>${event.title}</strong><br>${event.city_name}`);
      marker.on("click", () => setSelectedEvent(event));
      marker.addTo(map);
      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.leafletInstance;
      updateRadiusOnMap(map);
      addMarkersToMap(map, filteredEvents);
    }
  }, [selectedCity, selectedSubcategories, searchQuery, settings, showRadius]);

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
                <SelectItem value="current">📍 Localização Atual {userLocation ? `(${userLocation.cityName})` : ""}</SelectItem>
                {cities.map((city) => <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-between h-10 rounded-xl border-border bg-background px-3 font-normal">
                  <div className="flex items-center gap-2 truncate">
                    <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{getSelectedLabels()}</span>
                  </div>
                  {selectedSubcategories.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1 rounded-sm bg-blue-100 text-blue-700 border-none">
                      {selectedSubcategories.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0 rounded-xl shadow-xl border-border" align="end">
                <div className="p-3 border-b border-border flex items-center justify-between bg-muted/30">
                  <span className="text-sm font-semibold">Filtrar por Categoria</span>
                  {selectedSubcategories.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters}
                      className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Limpar
                    </Button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto p-2 space-y-4">
                  {CATEGORIES.map((category) => (
                    <div key={category.id} className="space-y-1.5">
                      <div className="flex items-center gap-2 px-2 py-1">
                        <span className="text-sm">{category.emoji}</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {category.name}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {category.subcategories.map((sub) => {
                          const isSelected = selectedSubcategories.includes(sub.id);
                          return (
                            <button
                              key={sub.id}
                              onClick={() => toggleSubcategory(sub.id)}
                              className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-sm transition-colors ${
                                isSelected 
                                  ? "bg-blue-50 text-blue-700 font-medium" 
                                  : "hover:bg-muted text-foreground"
                              }`}
                            >
                              <span>{sub.name}</span>
                              {isSelected && <Check className="w-4 h-4" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
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
                          <img src={event.image} alt={event.title} className="rounded-lg object-cover flex-shrink-0" style={{ width: '60px', height: '60px' }} />
                          {isInRange && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border border-white rounded-full" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-medium text-sm overflow-hidden whitespace-nowrap flex-1 min-w-0 ${isInRange ? "text-blue-900" : ""}`} style={{ textOverflow: 'ellipsis' }}>{event.title}</h4>
                            <div className="flex gap-1 flex-shrink-0">
                              <CheckInButton eventId={event.id} eventTitle={event.title} />
                              <FavoriteButton eventId={event.id} size="sm" className="h-6 w-6 bg-transparent shadow-none p-0" />
                            </div>
                          </div>
                          <div className="text-[10px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                            📅 {formatEventDate(event.date)}
                          </div>
                          <div className="flex items-center flex-wrap gap-1.5 mt-1">
                            {(Array.isArray(event.categories) ? event.categories : [event.category]).map((cat: string) => (
                              <Badge key={cat} variant="secondary" className={`rounded-full text-[9px] px-1.5 h-4 ${isInRange ? "bg-blue-200 text-blue-800" : ""}`}>
                                {cat}
                              </Badge>
                            ))}
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

        {/* Event Details Panel - Novo Layout */}
        {selectedEvent && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg animate-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {/* Left Column: Image and Price/Tickets Info */}
              <div className="lg:col-span-1 space-y-4">
                <div className="relative rounded-xl overflow-hidden h-64">
                  <img src={selectedEvent.image} alt={selectedEvent.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <CheckInButton eventId={selectedEvent.id} eventTitle={selectedEvent.title} />
                    <FavoriteButton eventId={selectedEvent.id} />
                  </div>
                </div>
                
                {/* Tenant Section */}
                <TenantSection
                  tenantId={selectedEvent.organizer_id || "tenant-001"}
                  tenantName={selectedEvent.organizer_name}
                  tenantImage={getTenantLogo(selectedEvent.organizer_id || "tenant-001") || selectedEvent.organizer_image || "https://via.placeholder.com/64"}
                  rating={selectedEvent.rating || 4.7}
                  followers={selectedEvent.followers || 709}
                  onFollowClick={(isNowFollowing) => {
                    if (isNowFollowing) {
                      toast.success(`Seguindo ${selectedEvent.organizer_name}!`);
                    } else {
                      toast.error(`Deixando de seguir ${selectedEvent.organizer_name}`, {
                        style: {
                          background: "#f97316",
                          color: "#ffffff",
                          border: "none",
                        },
                      });
                    }
                  }}
                  onChatClick={() => toast.info(`Abrindo chat com ${selectedEvent.organizer_name}...`)}
                />
                
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
              
              {/* Right Column: Description, Rating, Buttons, and Tabs */}
              <div className="lg:col-span-2 space-y-4">
                {/* Title and Category */}
                <div>
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    {(Array.isArray(selectedEvent.categories) ? selectedEvent.categories : [selectedEvent.category]).map((cat: string) => (
                      <Badge key={cat} className="bg-blue-600 hover:bg-blue-700">{cat}</Badge>
                    ))}
                    {isEventInRange(selectedEvent) && <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">Proximo</Badge>}
                  </div>
                  <h2 className="text-2xl font-bold mb-3">{selectedEvent.title}</h2>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed">{selectedEvent.description}</p>

                {/* Rating Summary */}
                {reviewStats && (
                  <div className="flex items-center gap-3 py-3 border-y border-border">
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold">{reviewStats.averageRating}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= Math.round(reviewStats.averageRating) ? "text-yellow-400" : "text-gray-300"}>★</span>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatNumber(reviewStats.totalReviews)} avaliações</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11 rounded-lg text-base" onClick={handleBuyClick}>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Comprar Ingressos
                  </Button>
                  <Button variant="outline" className="w-full h-11 rounded-lg text-base gap-2">
                    <Share2 className="w-5 h-5" />
                    Compartilhar
                  </Button>
                </div>

                {/* Tabs */}
                <div className="border-b border-border">
                  <div className="flex w-full">
                    <button
                      onClick={() => setActiveTab("info")}
                      className={`flex-1 py-3 px-1 font-medium text-sm border-b-2 transition-colors text-center ${
                        activeTab === "info"
                          ? "border-b-red-500 text-foreground"
                          : "border-b-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Informações
                    </button>
                    <button
                      onClick={() => setActiveTab("reviews")}
                      className={`flex-1 py-3 px-1 font-medium text-sm border-b-2 transition-colors text-center ${
                        activeTab === "reviews"
                          ? "border-b-red-500 text-foreground"
                          : "border-b-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Avaliações
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="max-h-[400px] overflow-y-auto space-y-4">
                  {activeTab === "reviews" && (
                    <div className="space-y-4">
                      {reviewStats && (
                        <EventRatingSummary 
                          rating={reviewStats.averageRating} 
                          totalReviews={reviewStats.totalReviews}
                          ratingDistribution={reviewStats.ratingDistribution}
                        />
                      )}
                      <EventReviews 
                        eventId={selectedEvent.id} 
                        eventTitle={selectedEvent.title}
                        onStatsChange={setReviewStats}
                      />
                    </div>
                  )}
                  
                  {activeTab === "info" && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Data e Horário</p>
                          <p className="text-sm font-medium">{formatEventDate(selectedEvent.date)}</p>
                          <p className="text-sm text-muted-foreground">{selectedEvent.time} - {selectedEvent.endTime}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <MapPinIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Endereço</p>
                          <p className="text-sm font-medium">{selectedEvent.address}</p>
                        </div>
                      </div>
                      
                      {selectedEvent.artists && selectedEvent.artists.length > 0 && (
                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Artistas</p>
                            <p className="text-sm font-medium">{selectedEvent.artists.join(", ")}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Organizador</p>
                          <p className="text-sm font-medium">{selectedEvent.organizer_name}</p>
                          <p className="text-xs text-muted-foreground">CNPJ: {selectedEvent.cnpj}</p>
                        </div>
                      </div>
                    </div>
                  )}
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
