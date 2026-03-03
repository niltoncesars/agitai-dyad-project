import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  MapPin,
  Heart,
  ArrowLeft,
  Locate,
  Info,
  CheckCircle2,
  Plus,
  Trash2,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";

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

const defaultSettings: NotificationSettings = {
  enableUpcomingEvents: true,
  enablePriceChanges: true,
  enableFavoriteUpdates: true,
  upcomingEventsRadius: 50,
  upcomingEventsDaysBefore: 7,
  userLatitude: null,
  userLongitude: null,
  locationName: "",
  favoriteLocations: [],
};

function loadSettings(): NotificationSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { 
        ...defaultSettings, 
        ...parsed,
        favoriteLocations: parsed.favoriteLocations || []
      };
    }
  } catch {}
  return defaultSettings;
}

function saveSettings(settings: NotificationSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export default function NotificationSettingsPage() {
  const { user, isAuthenticated } = useAuthContext();
  const [, setLocation] = useLocation();
  const [settings, setSettings] = useState<NotificationSettings>(loadSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [newLocName, setNewLocName] = useState("");

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="min-h-[80vh] flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bell className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold mb-3">
              Faça login para configurar notificações
            </h1>
            <p className="text-muted-foreground mb-6">
              Para personalizar o raio de distância e receber alertas de eventos
              próximos, você precisa estar logado.
            </p>
            <Button
              size="lg"
              className="gap-2"
              onClick={() => setLocation("/login")}
            >
              Fazer Login
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      saveSettings(settings);
      setIsSaving(false);
      toast.success("Configurações salvas com sucesso!");
    }, 500);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada pelo navegador.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        let locationName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=pt-BR`
          );
          const data = await res.json();
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || "";
            const state = data.address.state || "";
            locationName = [city, state].filter(Boolean).join(", ");
          }
        } catch {}

        setSettings((prev) => ({
          ...prev,
          userLatitude: lat,
          userLongitude: lng,
          locationName,
        }));
        setIsLocating(false);
        toast.success(`Localização detectada: ${locationName}`);
      },
      (error) => {
        setIsLocating(false);
        toast.error("Não foi possível obter sua localização.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const addFavoriteLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada.");
      return;
    }

    if (!newLocName.trim()) {
      toast.error("Dê um nome ao seu local favorito.");
      return;
    }

    toast.info("Obtendo localização para o novo local...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLoc: FavoriteLocation = {
          id: Date.now().toString(),
          name: newLocName,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          radius: settings.upcomingEventsRadius,
        };

        setSettings(prev => ({
          ...prev,
          favoriteLocations: [...prev.favoriteLocations, newLoc]
        }));
        setNewLocName("");
        toast.success(`Local "${newLocName}" adicionado aos favoritos!`);
      },
      () => toast.error("Falha ao obter localização.")
    );
  };

  const removeFavoriteLocation = (id: string) => {
    setSettings(prev => ({
      ...prev,
      favoriteLocations: prev.favoriteLocations.filter(loc => loc.id !== id)
    }));
    toast.success("Local favorito removido.");
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 mb-4 -ml-2"
              onClick={() => setLocation("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Configurações de Notificação</h1>
                <p className="text-sm text-muted-foreground">Logado como {user?.name}</p>
              </div>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-blue-600 hover:bg-blue-700">
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        {/* Localização Atual */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <Locate className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Localização Principal</h2>
              <p className="text-sm text-muted-foreground">Localização base para alertas automáticos.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button variant="outline" onClick={handleGetLocation} disabled={isLocating} className="gap-2">
              <MapPin className="w-4 h-4" />
              {isLocating ? "Detectando..." : "Atualizar Localização Atual"}
            </Button>
            {settings.locationName && (
              <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-green-700 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{settings.locationName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Locais Favoritos */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Locais Favoritos</h2>
              <p className="text-sm text-muted-foreground">Adicione outros locais para monitorar eventos próximos (ex: Trabalho, Casa de Praia).</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Nome do local (ex: Escritório)" 
                value={newLocName}
                onChange={(e) => setNewLocName(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={addFavoriteLocation} className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Local
              </Button>
            </div>

            <div className="grid gap-3 mt-4">
              {settings.favoriteLocations.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-border rounded-xl text-muted-foreground">
                  <Navigation className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Nenhum local favorito adicionado ainda.</p>
                </div>
              ) : (
                settings.favoriteLocations.map((loc) => (
                  <div key={loc.id} className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{loc.name}</p>
                        <p className="text-xs text-muted-foreground">{loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeFavoriteLocation(loc.id)}
                      className="text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Configurações Gerais de Raio */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Preferências de Alerta</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label>Raio de busca padrão</Label>
              <span className="font-bold text-blue-600">{settings.upcomingEventsRadius} km</span>
            </div>
            <input
              type="range"
              min="5"
              max="300"
              step="5"
              value={settings.upcomingEventsRadius}
              onChange={(e) => setSettings(prev => ({ ...prev, upcomingEventsRadius: parseInt(e.target.value) }))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="space-y-0.5">
                <Label className="text-blue-900">Notificações Ativas</Label>
                <p className="text-xs text-blue-700">Alertar sobre eventos em todos os locais salvos.</p>
              </div>
              <Switch 
                checked={settings.enableUpcomingEvents}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableUpcomingEvents: checked }))}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
