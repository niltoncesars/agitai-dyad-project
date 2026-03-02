import { Bell, ArrowLeft, MapPin, TrendingUp, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function NotificationSettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Get preferences
  const { data: preferences, isLoading: isLoadingPrefs } = trpc.notifications.getPreferences.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Update preferences mutation
  const updateMutation = trpc.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Preferências atualizadas com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar preferências");
      console.error(error);
    },
  });

  const [formData, setFormData] = useState({
    enableUpcomingEvents: true,
    enablePriceChanges: true,
    enableFavoriteUpdates: true,
    upcomingEventsRadius: 50,
    upcomingEventsDaysBefore: 7,
  });

  useEffect(() => {
    if (preferences) {
      setFormData({
        enableUpcomingEvents: preferences.enableUpcomingEvents,
        enablePriceChanges: preferences.enablePriceChanges,
        enableFavoriteUpdates: preferences.enableFavoriteUpdates,
        upcomingEventsRadius: preferences.upcomingEventsRadius,
        upcomingEventsDaysBefore: preferences.upcomingEventsDaysBefore,
      });
    }
  }, [preferences]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Bell className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Faça login para gerenciar notificações</h1>
          <p className="text-muted-foreground mb-6">
            Configure suas preferências de notificações para receber alertas personalizados
          </p>
          <Link href="/">
            <Button size="lg">Voltar para Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateMutation.mutateAsync(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-2xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold">Preferências de Notificações</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Customize como você deseja receber notificações sobre eventos e mudanças de preço
          </p>
        </div>

        {/* Settings Form */}
        {isLoadingPrefs ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground">Carregando preferências...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Upcoming Events Section */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-1">Eventos Próximos</h2>
                  <p className="text-muted-foreground">
                    Receba alertas quando houver eventos ocorrendo perto de você
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <Label htmlFor="enableUpcomingEvents" className="cursor-pointer">
                    Ativar notificações de eventos próximos
                  </Label>
                  <Switch
                    id="enableUpcomingEvents"
                    checked={formData.enableUpcomingEvents}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, enableUpcomingEvents: checked })
                    }
                  />
                </div>

                {formData.enableUpcomingEvents && (
                  <>
                    <div>
                      <Label htmlFor="radius" className="text-sm">
                        Raio de busca: {formData.upcomingEventsRadius} km
                      </Label>
                      <Input
                        id="radius"
                        type="range"
                        min="10"
                        max="200"
                        step="10"
                        value={formData.upcomingEventsRadius}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            upcomingEventsRadius: parseInt(e.target.value),
                          })
                        }
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Você receberá notificações de eventos em um raio de {formData.upcomingEventsRadius} km
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="daysBefore" className="text-sm">
                        Notificar com antecedência: {formData.upcomingEventsDaysBefore} dia{formData.upcomingEventsDaysBefore !== 1 ? "s" : ""}
                      </Label>
                      <Input
                        id="daysBefore"
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={formData.upcomingEventsDaysBefore}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            upcomingEventsDaysBefore: parseInt(e.target.value),
                          })
                        }
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Você será notificado {formData.upcomingEventsDaysBefore} dia{formData.upcomingEventsDaysBefore !== 1 ? "s" : ""} antes do evento
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Price Changes Section */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-1">Mudanças de Preço</h2>
                  <p className="text-muted-foreground">
                    Seja notificado quando o preço dos ingressos mudar
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <Label htmlFor="enablePriceChanges" className="cursor-pointer">
                  Ativar notificações de mudança de preço
                </Label>
                <Switch
                  id="enablePriceChanges"
                  checked={formData.enablePriceChanges}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, enablePriceChanges: checked })
                  }
                />
              </div>
            </div>

            {/* Favorite Updates Section */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-1">Atualizações de Favoritos</h2>
                  <p className="text-muted-foreground">
                    Receba alertas sobre eventos que você favoritou
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <Label htmlFor="enableFavoriteUpdates" className="cursor-pointer">
                  Ativar notificações de eventos favoritos
                </Label>
                <Switch
                  id="enableFavoriteUpdates"
                  checked={formData.enableFavoriteUpdates}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, enableFavoriteUpdates: checked })
                  }
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="submit"
                size="lg"
                disabled={isLoading || updateMutation.isPending}
                className="flex-1"
              >
                {isLoading || updateMutation.isPending ? "Salvando..." : "Salvar Preferências"}
              </Button>
              <Link href="/" className="flex-1">
                <Button variant="outline" size="lg" className="w-full">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
