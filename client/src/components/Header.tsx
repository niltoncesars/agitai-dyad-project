import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Search,
  Settings,
  Menu,
  MapPin,
  Ticket,
  Clock,
  X,
  Check,
  Trash2,
  LogOut,
  User,
  Heart,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";
import { useLocation } from "wouter";
import { events } from "@/lib/mock-data";
import { useAuthContext } from "@/contexts/AuthContext";

export interface Notification {
  id: string;
  type: "event_nearby" | "ticket_batch" | "general";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  eventId?: string;
  icon?: "map" | "ticket" | "clock" | "heart";
}

const SETTINGS_KEY = "agitai_notification_settings";

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

function timeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Agora";
  if (minutes < 60) return `${minutes}min atrás`;
  if (hours < 24) return `${hours}h atrás`;
  return `${days}d atrás`;
}

export default function Header() {
  const [, setLocation] = useLocation();
  const { toggleSidebar } = useSidebar();
  const { user, isAuthenticated, logout } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem("agitai_notifications");
      if (saved) {
        return JSON.parse(saved).map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }));
      }
    } catch {}
    return [];
  });

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    localStorage.setItem("agitai_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lógica de monitoramento de locais favoritos
  useEffect(() => {
    const checkNearbyEvents = () => {
      try {
        const settingsStr = localStorage.getItem(SETTINGS_KEY);
        if (!settingsStr) return;
        const settings = JSON.parse(settingsStr);
        if (!settings.enableUpcomingEvents) return;

        const locations = [];
        if (settings.userLatitude && settings.userLongitude) {
          locations.push({ name: "sua localização", lat: settings.userLatitude, lng: settings.userLongitude });
        }
        if (settings.favoriteLocations) {
          settings.favoriteLocations.forEach((loc: any) => {
            locations.push({ name: loc.name, lat: loc.latitude, lng: loc.longitude });
          });
        }

        if (locations.length === 0) return;

        const randomEvent = events[Math.floor(Math.random() * events.length)];
        
        // Verificar se o evento está próximo a qualquer um dos locais
        const nearbyLocation = locations.find(loc => {
          const dist = calculateDistance(loc.lat, loc.lng, randomEvent.latitude, randomEvent.longitude);
          return dist <= (settings.upcomingEventsRadius || 50);
        });

        if (nearbyLocation) {
          const newNotif: Notification = {
            id: `notif-${Date.now()}`,
            type: "event_nearby",
            title: "Evento próximo detectado!",
            message: `"${randomEvent.title}" está próximo a ${nearbyLocation.name}. Confira!`,
            timestamp: new Date(),
            read: false,
            eventId: randomEvent.id,
            icon: "heart",
          };
          setNotifications(prev => [newNotif, ...prev].slice(0, 20));
        }
      } catch (err) {
        console.error("Erro ao processar notificações de locais:", err);
      }
    };

    const interval = setInterval(checkNearbyEvents, 45000); // Checar a cada 45s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const removeNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const clearAll = () => setNotifications([]);

  const getNotifIcon = (icon?: string) => {
    switch (icon) {
      case "map": return <MapPin className="h-4 w-4 text-blue-500" />;
      case "ticket": return <Ticket className="h-4 w-4 text-orange-500" />;
      case "clock": return <Clock className="h-4 w-4 text-purple-500" />;
      case "heart": return <Heart className="h-4 w-4 text-pink-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const searchResults = searchQuery.length >= 2
    ? events.filter(e => 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.city_name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={toggleSidebar}>
          <Menu className="h-5 w-5 text-muted-foreground" />
        </Button>

        <div className="relative flex-1 max-w-md" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos, cidades..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            className="pl-9 h-9 bg-muted/50 border-border/50 rounded-lg text-sm"
          />
        </div>
        {showSearch && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
            {searchResults.map((event) => (
              <button key={event.id} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                onClick={() => { setLocation("/map"); setSearchQuery(""); setShowSearch(false); }}>
                <img src={event.image} alt={event.title} className="w-8 h-8 rounded-md object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.city_name}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <div className="relative" ref={notifRef}>
          <Button variant="ghost" size="icon" className="h-9 w-9 relative" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell className="h-5 w-5 text-muted-foreground" />
            {unreadCount > 0 && <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-background" />}
          </Button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h3 className="font-semibold text-sm">Notificações</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={markAllAsRead}>Lidas</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-muted-foreground hover:text-red-600" onClick={clearAll}>Limpar</Button>
                </div>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Nenhuma notificação</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-4 border-b border-border/50 flex gap-3 group hover:bg-muted/30 transition-colors ${!n.read ? "bg-blue-50/30" : ""}`}>
                      <div className="h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                        {getNotifIcon(n.icon)}
                      </div>
                      <div className="flex-1 min-w-0" onClick={() => markAsRead(n.id)}>
                        <p className="text-sm font-semibold mb-0.5">{n.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-1.5">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(n.timestamp)}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeNotification(n.id)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setLocation("/notification-settings")}>
          <Settings className="h-5 w-5 text-muted-foreground" />
        </Button>

        <div className="relative ml-1" ref={userMenuRef}>
          <Button variant="ghost" className="p-0 h-9 w-9 rounded-full overflow-hidden" onClick={() => setShowUserMenu(!showUserMenu)}>
            <Avatar className="h-9 w-9 border-2 border-border/50">
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold text-xs">
                {isAuthenticated ? user?.initials : "V"}
              </AvatarFallback>
            </Avatar>
          </Button>

          {showUserMenu && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-border bg-muted/30">
                <p className="text-sm font-semibold truncate">{isAuthenticated ? user?.name : "Visitante"}</p>
                <p className="text-xs text-muted-foreground truncate">{isAuthenticated ? user?.email : "Faça login para salvar favoritos"}</p>
              </div>
              <div className="p-1">
                {isAuthenticated ? (
                  <>
                    <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-sm px-3" onClick={() => { setLocation("/notification-settings"); setShowUserMenu(false); }}>
                      <Settings className="h-4 w-4" /> Configurações
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-sm px-3 text-red-600 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" /> Sair
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-sm px-3" onClick={() => { setLocation("/login"); setShowUserMenu(false); }}>
                    <User className="h-4 w-4" /> Fazer Login
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
