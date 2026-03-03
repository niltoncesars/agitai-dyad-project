import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Bell,
  MapPin,
  TrendingUp,
  Heart,
  Save,
  ArrowLeft,
  Locate,
  Info,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const SETTINGS_KEY = "agitai_notification_settings";

interface NotificationSettings {
  enableUpcomingEvents: boolean;
  enablePriceChanges: boolean;
  enableFavoriteUpdates: boolean;
  upcomingEventsRadius: number;
  upcomingEventsDaysBefore: number;
  userLatitude: number | null;
  userLongitude: number | null;
  locationName: string;
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
};

function loadSettings(): NotificationSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
  } catch {}
  return defaultSettings;
}

function saveSettings(settings: NotificationSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Raios pré-definidos para referência visual
const radiusPresets = [
  { value: 10, label: "10 km", desc: "Bairro" },
  { value: 25, label: "25 km", desc: "Cidade" },
  { value: 50, label: "50 km", desc: "Região" },
  { value: 100, label: "100 km", desc: "Metropolitana" },
  { value: 200, label: "200 km", desc: "Estado" },
];

export default function NotificationSettingsPage() {
  const { user, isAuthenticated } = useAuthContext();
  const [, setLocation] = useLocation();
  const [settings, setSettings] = useState<NotificationSettings>(loadSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [saved, setSaved] = useState(false);

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
      setSaved(true);
      toast.success("Configurações salvas com sucesso!");
      setTimeout(() => setSaved(false), 3000);
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

        // Tentar obter nome da localização via API reversa
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
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Permissão de localização negada. Habilite nas configurações do navegador.");
        } else {
          toast.error("Não foi possível obter sua localização.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Configurações de Notificação</h1>
              <p className="text-sm text-muted-foreground">
                Logado como <span className="font-medium">{user?.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Seção: Localização do Usuário */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <Locate className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-1">Sua Localização</h2>
              <p className="text-sm text-muted-foreground">
                Defina sua localização para receber notificações de eventos no raio configurado.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="gap-2 w-full sm:w-auto"
              onClick={handleGetLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                  Detectando localização...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  Detectar minha localização
                </>
              )}
            </Button>

            {settings.locationName && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  Localização atual: <strong>{settings.locationName}</strong>
                </span>
              </div>
            )}

            {!settings.locationName && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                <Info className="h-4 w-4 shrink-0" />
                <span>
                  Nenhuma localização definida. Clique no botão acima para detectar automaticamente.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Seção: Eventos Próximos com Raio */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-1">Eventos Próximos</h2>
              <p className="text-sm text-muted-foreground">
                Receba alertas quando houver eventos ocorrendo dentro do raio configurado.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <Label htmlFor="enableUpcoming" className="cursor-pointer text-sm font-medium">
                Ativar notificações de eventos próximos
              </Label>
              <Switch
                id="enableUpcoming"
                checked={settings.enableUpcomingEvents}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, enableUpcomingEvents: checked }))
                }
              />
            </div>

            {settings.enableUpcomingEvents && (
              <>
                {/* Raio de distância */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Raio de distância</Label>
                    <span className="text-2xl font-bold text-blue-600">
                      {settings.upcomingEventsRadius} km
                    </span>
                  </div>

                  <input
                    type="range"
                    min="5"
                    max="300"
                    step="5"
                    value={settings.upcomingEventsRadius}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        upcomingEventsRadius: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5 km</span>
                    <span>150 km</span>
                    <span>300 km</span>
                  </div>

                  {/* Presets rápidos */}
                  <div className="flex flex-wrap gap-2">
                    {radiusPresets.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            upcomingEventsRadius: preset.value,
                          }))
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          settings.upcomingEventsRadius === preset.value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-background border-border text-muted-foreground hover:border-blue-300 hover:text-blue-600"
                        }`}
                      >
                        {preset.label} ({preset.desc})
                      </button>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    Você receberá notificações de eventos em um raio de{" "}
                    <strong>{settings.upcomingEventsRadius} km</strong> da sua localização.
                  </p>
                </div>

                {/* Antecedência */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Notificar com antecedência</Label>
                    <span className="text-lg font-bold text-blue-600">
                      {settings.upcomingEventsDaysBefore} dia{settings.upcomingEventsDaysBefore !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={settings.upcomingEventsDaysBefore}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        upcomingEventsDaysBefore: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 dia</span>
                    <span>15 dias</span>
                    <span>30 dias</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Seção: Mudanças de Preço / Lote */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-1">Mudanças de Preço e Lote</h2>
              <p className="text-sm text-muted-foreground">
                Seja notificado quando o lote de ingressos estiver prestes a mudar e o preço aumentar.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <Label htmlFor="enablePrice" className="cursor-pointer text-sm font-medium">
              Ativar notificações de mudança de preço/lote
            </Label>
            <Switch
              id="enablePrice"
              checked={settings.enablePriceChanges}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, enablePriceChanges: checked }))
              }
            />
          </div>
        </div>

        {/* Seção: Atualizações de Favoritos */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-1">Atualizações de Favoritos</h2>
              <p className="text-sm text-muted-foreground">
                Receba alertas sobre novidades dos eventos que você favoritou.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <Label htmlFor="enableFavorites" className="cursor-pointer text-sm font-medium">
              Ativar notificações de eventos favoritos
            </Label>
            <Switch
              id="enableFavorites"
              checked={settings.enableFavoriteUpdates}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, enableFavoriteUpdates: checked }))
              }
            />
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 sticky bottom-6">
          <Button
            size="lg"
            className="flex-1 gap-2"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </>
            ) : saved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Salvo!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Configurações
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setLocation("/dashboard")}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
