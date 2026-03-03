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
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";
import { useLocation } from "wouter";
import { events } from "@/lib/mock-data";
import { useAuthContext } from "@/contexts/AuthContext";

// Tipos de notificação
export interface Notification {
  id: string;
  type: "event_nearby" | "ticket_batch" | "general";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  eventId?: string;
  icon?: "map" | "ticket" | "clock";
}

// Gerar notificações simuladas baseadas nos eventos reais
function generateMockNotifications(): Notification[] {
  const now = new Date();
  return [
    {
      id: "notif-001",
      type: "event_nearby",
      title: "Evento próximo a você!",
      message: `"${events[0].title}" está acontecendo em ${events[0].city_name}. Não perca!`,
      timestamp: new Date(now.getTime() - 5 * 60 * 1000),
      read: false,
      eventId: events[0].id,
      icon: "map",
    },
    {
      id: "notif-002",
      type: "ticket_batch",
      title: "Lote prestes a mudar!",
      message: `Os ingressos do "${events[1].title}" estão no 2° lote. Restam apenas 50 unidades antes da mudança de preço!`,
      timestamp: new Date(now.getTime() - 15 * 60 * 1000),
      read: false,
      eventId: events[1].id,
      icon: "ticket",
    },
    {
      id: "notif-003",
      type: "event_nearby",
      title: "Novo evento na sua região",
      message: `"${events[2].title}" foi adicionado em ${events[2].city_name}. Confira os detalhes!`,
      timestamp: new Date(now.getTime() - 30 * 60 * 1000),
      read: false,
      eventId: events[2].id,
      icon: "map",
    },
    {
      id: "notif-004",
      type: "ticket_batch",
      title: "Últimos ingressos do 1° lote!",
      message: `"${events[3].title}" tem apenas 20 ingressos restantes no lote atual. O próximo lote terá aumento de 30%.`,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      read: true,
      eventId: events[3].id,
      icon: "ticket",
    },
    {
      id: "notif-005",
      type: "event_nearby",
      title: "Evento começando em breve!",
      message: `"${events[4].title}" começa em 2 horas em ${events[4].city_name}. Prepare-se!`,
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      read: true,
      eventId: events[4].id,
      icon: "clock",
    },
    {
      id: "notif-006",
      type: "general",
      title: "Bem-vindo ao EventMap!",
      message: "Explore eventos próximos e salve seus favoritos para não perder nenhuma oportunidade.",
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      read: true,
      icon: "map",
    },
  ];
}

// Formatar tempo relativo
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
        const parsed = JSON.parse(saved);
        return parsed.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }));
      }
    } catch {}
    return generateMockNotifications();
  });

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Persistir notificações no localStorage
  useEffect(() => {
    localStorage.setItem("agitai_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simular nova notificação a cada 60s
  useEffect(() => {
    const interval = setInterval(() => {
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      const types: Notification["type"][] = ["event_nearby", "ticket_batch"];
      const type = types[Math.floor(Math.random() * types.length)];

      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        type,
        title:
          type === "event_nearby"
            ? "Evento próximo a você!"
            : "Lote prestes a mudar!",
        message:
          type === "event_nearby"
            ? `"${randomEvent.title}" está acontecendo em ${randomEvent.city_name}. Confira!`
            : `Os ingressos do "${randomEvent.title}" estão prestes a mudar de lote. Garanta o seu agora!`,
        timestamp: new Date(),
        read: false,
        eventId: randomEvent.id,
        icon: type === "event_nearby" ? "map" : "ticket",
      };

      setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotifIcon = (icon?: string) => {
    switch (icon) {
      case "map":
        return <MapPin className="h-4 w-4 text-blue-500" />;
      case "ticket":
        return <Ticket className="h-4 w-4 text-orange-500" />;
      case "clock":
        return <Clock className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Busca global
  const searchResults =
    searchQuery.length >= 2
      ? events
          .filter(
            (e) =>
              e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              e.city_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              e.category.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 5)
      : [];

  const userInitials = user?.initials || "?";
  const userName = user?.name || "Visitante";

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setLocation("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 gap-3">
      {/* Menu hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5 text-muted-foreground" />
      </Button>

      {/* Barra de busca */}
      <div className="relative flex-1 max-w-md" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos, cidades, tenants..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearch(true);
            }}
            onFocus={() => setShowSearch(true)}
            className="pl-9 h-9 bg-muted/50 border-border/50 rounded-lg text-sm"
          />
        </div>

        {/* Resultados da busca */}
        {showSearch && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
            {searchResults.map((event) => (
              <button
                key={event.id}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                onClick={() => {
                  setLocation("/map");
                  setSearchQuery("");
                  setShowSearch(false);
                }}
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-8 h-8 rounded-md object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.category} · {event.city_name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ações à direita */}
      <div className="flex items-center gap-1">
        {/* Notificações */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background" />
            )}
          </Button>

          {/* Dropdown de notificações */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
              {/* Header do dropdown */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">Notificações</h3>
                  {unreadCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="h-5 px-1.5 text-xs rounded-full bg-red-100 text-red-600"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-blue-600 hover:text-blue-700"
                      onClick={markAllAsRead}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Marcar todas
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground hover:text-red-600"
                      onClick={clearAll}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Lista de notificações */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma notificação
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border/30 last:border-b-0 ${
                        !notif.read ? "bg-blue-50/50" : ""
                      }`}
                      onClick={() => {
                        markAsRead(notif.id);
                        if (notif.eventId) {
                          setLocation("/map");
                          setShowNotifications(false);
                        }
                      }}
                    >
                      <div
                        className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                          notif.type === "event_nearby"
                            ? "bg-blue-100"
                            : notif.type === "ticket_batch"
                            ? "bg-orange-100"
                            : "bg-gray-100"
                        }`}
                      >
                        {getNotifIcon(notif.icon)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm leading-tight ${
                              !notif.read ? "font-semibold" : "font-medium"
                            }`}
                          >
                            {notif.title}
                          </p>
                          <button
                            className="text-muted-foreground/50 hover:text-red-500 transition-colors shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notif.id);
                            }}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {timeAgo(notif.timestamp)}
                        </p>
                      </div>

                      {!notif.read && (
                        <div className="mt-2 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-border px-4 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-blue-600 hover:text-blue-700"
                    onClick={() => {
                      setLocation("/notification-settings");
                      setShowNotifications(false);
                    }}
                  >
                    Configurações de Notificação
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Configurações */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setLocation("/notification-settings")}
        >
          <Settings className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Avatar do usuário com dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="ml-1 focus:outline-none"
          >
            <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-transparent hover:ring-blue-300 transition-all">
              <AvatarFallback
                className="text-xs font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                }}
              >
                {isAuthenticated ? userInitials : "?"}
              </AvatarFallback>
            </Avatar>
          </button>

          {/* Dropdown do usuário */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold">{userName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left text-sm"
                      onClick={() => {
                        setLocation("/notification-settings");
                        setShowUserMenu(false);
                      }}
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      Configurações
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left text-sm text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-1">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left text-sm"
                    onClick={() => {
                      setLocation("/login");
                      setShowUserMenu(false);
                    }}
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Fazer Login
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
