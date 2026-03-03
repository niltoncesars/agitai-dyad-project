import { TrendingUp, TrendingDown, Users, Ticket, DollarSign, MapPin, BarChart3, PieChart } from "lucide-react";
import { events, cities, formatCurrency, formatNumber } from "@/lib/mock-data";
import DashboardLayout from "@/components/DashboardLayout";

export default function AnalyticsPage() {
  const totalRevenue = events.reduce((sum, e) => sum + e.price * e.tickets_sold, 0);
  const totalTickets = events.reduce((sum, e) => sum + e.tickets_sold, 0);
  const avgRating = events.reduce((sum, e) => sum + e.rating, 0) / events.length;
  const avgOccupancy = events.reduce((sum, e) => sum + (e.tickets_sold / e.tickets_total) * 100, 0) / events.length;

  // Revenue by category
  const revenueByCategory = events.reduce((acc, event) => {
    const key = event.category;
    if (!acc[key]) acc[key] = { revenue: 0, tickets: 0, count: 0 };
    acc[key].revenue += event.price * event.tickets_sold;
    acc[key].tickets += event.tickets_sold;
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, { revenue: number; tickets: number; count: number }>);

  const categoryData = Object.entries(revenueByCategory)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  // Revenue by city
  const revenueByCity = events.reduce((acc, event) => {
    const key = event.city_name;
    if (!acc[key]) acc[key] = { revenue: 0, tickets: 0, count: 0 };
    acc[key].revenue += event.price * event.tickets_sold;
    acc[key].tickets += event.tickets_sold;
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, { revenue: number; tickets: number; count: number }>);

  const cityData = Object.entries(revenueByCity)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const maxCategoryRevenue = Math.max(...categoryData.map((c) => c.revenue));
  const maxCityRevenue = Math.max(...cityData.map((c) => c.revenue));

  const categoryColors = [
    "bg-blue-600", "bg-purple-600", "bg-green-600", "bg-orange-600",
    "bg-pink-600", "bg-cyan-600", "bg-yellow-600",
  ];

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Analytics
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral de desempenho e métricas da plataforma
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                +12.5%
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Receita Total</p>
            <p className="text-xl font-bold mt-0.5">{formatCurrency(totalRevenue)}</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                +8.3%
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Ingressos Vendidos</p>
            <p className="text-xl font-bold mt-0.5">{formatNumber(totalTickets)}</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                +2.1%
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Taxa de Ocupação</p>
            <p className="text-xl font-bold mt-0.5">{avgOccupancy.toFixed(1)}%</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex items-center gap-1 text-red-500 text-xs font-medium">
                <TrendingDown className="w-3.5 h-3.5" />
                -0.3%
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Avaliação Média</p>
            <p className="text-xl font-bold mt-0.5">{avgRating.toFixed(1)} / 5.0</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Category */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-5">
              <PieChart className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Receita por Categoria</h3>
            </div>
            <div className="space-y-3">
              {categoryData.map((cat, index) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${categoryColors[index % categoryColors.length]}`} />
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold">{formatCurrency(cat.revenue)}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({((cat.revenue / totalRevenue) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${categoryColors[index % categoryColors.length]}`}
                      style={{ width: `${(cat.revenue / maxCategoryRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by City */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Top 5 Cidades por Receita</h3>
            </div>
            <div className="space-y-3">
              {cityData.map((city, index) => (
                <div key={city.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-5 text-center">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium">{city.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold">{formatCurrency(city.revenue)}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {city.count} evento{city.count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{
                        width: `${(city.revenue / maxCityRevenue) * 100}%`,
                        opacity: 1 - index * 0.15,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Events Performance Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Desempenho dos Eventos
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Evento</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Categoria</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Ingressos</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Ocupação</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Receita</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Avaliação</th>
                </tr>
              </thead>
              <tbody>
                {events
                  .sort((a, b) => b.price * b.tickets_sold - a.price * a.tickets_sold)
                  .map((event) => {
                    const occupancy = (event.tickets_sold / event.tickets_total) * 100;
                    return (
                      <tr key={event.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-8 h-8 rounded-lg object-cover shrink-0"
                            />
                            <p className="text-sm font-medium line-clamp-1">{event.title}</p>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">{event.category}</span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-sm font-medium">{formatNumber(event.tickets_sold)}</span>
                        </td>
                        <td className="p-4 text-right hidden lg:table-cell">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-muted rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${occupancy > 90 ? "bg-green-600" : occupancy > 70 ? "bg-blue-600" : "bg-yellow-600"}`}
                                style={{ width: `${occupancy}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-10 text-right">
                              {occupancy.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-sm font-bold text-blue-600">
                            {formatCurrency(event.price * event.tickets_sold)}
                          </span>
                        </td>
                        <td className="p-4 text-right hidden md:table-cell">
                          <span className="text-sm font-medium">
                            ⭐ {event.rating.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
