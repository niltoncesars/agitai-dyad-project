import { MapPin, Calendar, Ticket, TrendingUp, Users, DollarSign, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { events, cities, formatCurrency, formatNumber } from "@/lib/mock-data";
import DashboardLayout from "@/components/DashboardLayout";

// Função para formatar a data no formato desejado
function formatEventDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];
    
    return `${dayName}, ${dayNum} de ${monthName}`;
  } catch (error) {
    return 'Data não informada';
  }
}

export default function DashboardPage() {
  const totalRevenue = events.reduce((sum, e) => sum + e.price * e.tickets_sold, 0);
  const totalTickets = events.reduce((sum, e) => sum + e.tickets_sold, 0);
  const publishedEvents = events.filter((e) => e.status === "published").length;
  const avgRating = (events.reduce((sum, e) => sum + e.rating, 0) / events.length).toFixed(1);

  const recentEvents = events.slice(0, 5);
  const topEvents = [...events].sort((a, b) => b.tickets_sold - a.tickets_sold).slice(0, 3);

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao EventMap Enterprise — visão geral da plataforma
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                +12.5%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Receita Total</p>
            <p className="text-xl font-bold mt-0.5">{formatCurrency(totalRevenue)}</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                +8.3%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Ingressos Vendidos</p>
            <p className="text-xl font-bold mt-0.5">{formatNumber(totalTickets)}</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                +3
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Eventos Publicados</p>
            <p className="text-xl font-bold mt-0.5">{publishedEvents}</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                +0.2
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Avaliação Média</p>
            <p className="text-xl font-bold mt-0.5">{avgRating} / 5.0</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Events */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Eventos Recentes
              </h3>
              <Link href="/events">
                <Button variant="ghost" size="sm" className="gap-1 text-blue-600 hover:text-blue-700">
                  Ver todos
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentEvents.map((event) => (
                <div key={event.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm overflow-hidden whitespace-nowrap" style={{ textOverflow: 'ellipsis', maxWidth: '100%' }}>{event.title}</p>
                    <div className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                      📅 {formatEventDate(event.date)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="rounded-full text-xs">
                        {event.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.city_name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-blue-600">{formatCurrency(event.price)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatNumber(event.tickets_sold)} vendidos
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Events by Sales */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Top Eventos
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {topEvents.map((event, index) => (
                <div key={event.id} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground w-6 shrink-0">
                    #{index + 1}
                  </span>
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(event.tickets_sold)} ingressos
                    </p>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{
                          width: `${(event.tickets_sold / topEvents[0].tickets_sold) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="p-5 border-t border-border space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Acesso Rápido
              </p>
              <Link href="/map">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 rounded-lg">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Mapa Interativo
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Gerenciar Eventos
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Ver Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Cities Overview */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            Cobertura por Cidade
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {cities.map((city) => {
              const cityEvents = events.filter((e) => e.city_id === city.id);
              const cityRevenue = cityEvents.reduce((sum, e) => sum + e.price * e.tickets_sold, 0);
              return (
                <div key={city.id} className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="font-medium text-sm">{city.name}</p>
                  <p className="text-xs text-muted-foreground">{city.state}</p>
                  <p className="text-lg font-bold mt-1">{cityEvents.length}</p>
                  <p className="text-xs text-muted-foreground">evento{cityEvents.length !== 1 ? "s" : ""}</p>
                  {cityRevenue > 0 && (
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      {formatCurrency(cityRevenue)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
