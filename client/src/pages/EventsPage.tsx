import { useState } from "react";
import { Calendar, Search, MapPin, Tag, Filter, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { events, cities, formatCurrency } from "@/lib/mock-data";
import DashboardLayout from "@/components/DashboardLayout";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const categories = Array.from(new Set(events.map((e) => e.category)));

  const filteredEvents = events.filter((event) => {
    if (selectedCity !== "all" && event.city_id !== selectedCity) return false;
    if (selectedCategory !== "all" && event.category !== selectedCategory) return false;
    if (selectedStatus !== "all" && event.status !== selectedStatus) return false;
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-700 border-green-200";
      case "draft": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "published": return "Publicado";
      case "draft": return "Rascunho";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Eventos
              </span>
            </h1>
            <p className="text-muted-foreground mt-1">
              {filteredEvents.length} evento{filteredEvents.length !== 1 ? "s" : ""} encontrado{filteredEvents.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button className="gap-2 self-start sm:self-auto">
            <Plus className="w-4 h-4" />
            Novo Evento
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Total de Eventos</p>
            <p className="text-2xl font-bold mt-1">{events.length}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Publicados</p>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {events.filter(e => e.status === "published").length}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Total de Ingressos</p>
            <p className="text-2xl font-bold mt-1">
              {events.reduce((sum, e) => sum + e.tickets_sold, 0).toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Receita Total</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">
              {formatCurrency(events.reduce((sum, e) => sum + e.price * e.tickets_sold, 0))}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                type="text"
                placeholder="Buscar eventos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 p-0 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Todas as cidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Evento</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Categoria</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Cidade</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Data</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Ingressos</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Preço</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      Nenhum evento encontrado
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => (
                    <tr key={event.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                          <div>
                            <p className="font-medium text-sm line-clamp-1">{event.title}</p>
                            <p className="text-xs text-muted-foreground">{event.organizer_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <Badge variant="secondary" className="rounded-full text-xs">
                          {event.category}
                        </Badge>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {event.city_name}
                        </div>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(event.date).toLocaleDateString("pt-BR")}
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="text-sm">
                          <span className="font-medium">{event.tickets_sold.toLocaleString("pt-BR")}</span>
                          <span className="text-muted-foreground"> / {event.tickets_total.toLocaleString("pt-BR")}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${(event.tickets_sold / event.tickets_total) * 100}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium">
                          {event.price === 0 ? "Gratuito" : formatCurrency(event.price)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getStatusColor(event.status)}`}>
                          {getStatusLabel(event.status)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
