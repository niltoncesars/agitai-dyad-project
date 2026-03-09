import React, { useState, useEffect } from "react";
import CreateEventFormModal from "../components/CreateEventFormModal";
import { Calendar, Search, MapPin, Tag, Filter, Plus, Eye, EyeOff, Edit, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { events, cities, formatCurrency } from "@/lib/mock-data";
import { formatDisplayDate } from "@/lib/date-utils";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

export default function EventsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [localEvents, setLocalEvents] = useState<any[]>([]);
  const [hiddenEventIds, setHiddenEventIds] = useState<string[]>([]);

  // Carregar eventos e IDs ocultos do localStorage ao montar o componente
  useEffect(() => {
    const savedEvents = localStorage.getItem('agitai_events');
    if (savedEvents) {
      try {
        setLocalEvents(JSON.parse(savedEvents));
      } catch (error) {
        console.error('Erro ao carregar eventos do localStorage:', error);
      }
    }

    const savedHiddenIds = localStorage.getItem('agitai_hidden_events');
    if (savedHiddenIds) {
      try {
        setHiddenEventIds(JSON.parse(savedHiddenIds));
      } catch (error) {
        console.error('Erro ao carregar IDs ocultos do localStorage:', error);
      }
    }
  }, []);

  // Salvar eventos no localStorage sempre que localEvents mudar
  useEffect(() => {
    localStorage.setItem('agitai_events', JSON.stringify(localEvents));
  }, [localEvents]);

  // Salvar IDs ocultos no localStorage sempre que hiddenEventIds mudar
  useEffect(() => {
    localStorage.setItem('agitai_hidden_events', JSON.stringify(hiddenEventIds));
    // Disparar evento para atualizar o mapa se necessário
    window.dispatchEvent(new Event("visibility_updated"));
  }, [hiddenEventIds]);

  const handleCreateEvent = (eventData: any) => {
    console.log("Novo evento a ser criado:", eventData);
    
    // Determinar o status baseado no isDraft
    const status = eventData.isDraft ? "draft" : "published";
    
    // Encontrar a cidade correspondente ao nome fornecido ou usar os dados manuais
    const selectedCityObj = cities.find(c => c.name === eventData.city);
    
    // Criar novo evento
    const newEvent = {
      id: editingEvent ? editingEvent.id : (events.length + localEvents.length + 1).toString(),
      title: eventData.title || "Novo Evento",
      organizer_name: eventData.organizer || "Organizador",
      categories: Array.isArray(eventData.categories) ? eventData.categories : (eventData.category ? [eventData.category] : ["Outro"]),
      category: Array.isArray(eventData.categories) && eventData.categories.length > 0 ? eventData.categories[0] : (eventData.category || "Outro"),
      city_id: selectedCityObj ? selectedCityObj.id : "custom",
      city_name: eventData.city || (selectedCityObj ? selectedCityObj.name : "Cidade não informada"),
      date: eventData.date || new Date().toISOString(),
      price: eventData.lotes && eventData.lotes.length > 0 ? parseFloat(eventData.lotes[0].price) || 0 : 0,
      tickets_sold: editingEvent ? editingEvent.tickets_sold : 0,
      tickets_total: eventData.lotes && eventData.lotes.length > 0 ? parseInt(eventData.lotes[0].quantity) || 1000 : 1000,
      status: status,
      image: eventData.coverImage || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60",
      latitude: selectedCityObj ? selectedCityObj.latitude : -8.0539, // Default to Recife if not found (near Itamaracá)
      longitude: selectedCityObj ? selectedCityObj.longitude : -34.8808,
      // Preservar campos extras para edição
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      gateTime: eventData.gateTime,
      censorship: eventData.censorship,
      locationName: eventData.locationName,
      address: eventData.address,
      state: eventData.state,
      lotes: eventData.lotes,
      selectedTickets: eventData.selectedTickets,
      bannerImage: eventData.bannerImage
    };
    
    // Se está editando um evento existente, atualizar o evento local
    if (editingEvent) {
      const updatedEvents = localEvents.map(event => event.id === editingEvent.id ? { ...newEvent, id: editingEvent.id } : event);
      setLocalEvents(updatedEvents);
      toast.success(`Evento '${newEvent.title}' atualizado com sucesso!`);
    } else {
      // Adicionar novo evento à lista local
      const newEvents = [...localEvents, newEvent];
      setLocalEvents(newEvents);
      toast.success(`Evento '${newEvent.title}' criado como ${status === "draft" ? "rascunho" : "publicado"} com sucesso!`);
    }
    
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleToggleVisibility = (eventId: string, eventTitle: string) => {
    setHiddenEventIds(prev => {
      const isCurrentlyHidden = prev.includes(eventId);
      if (isCurrentlyHidden) {
        toast.success(`Evento '${eventTitle}' agora está visível para os usuários.`);
        return prev.filter(id => id !== eventId);
      } else {
        toast.info(`Evento '${eventTitle}' agora está oculto para os usuários.`);
        return [...prev, eventId];
      }
    });
  };

  const handleToggleAllVisibility = () => {
    const allEventIds = [...events, ...localEvents].map(e => e.id);
    const areAllHidden = allEventIds.every(id => hiddenEventIds.includes(id));

    if (areAllHidden) {
      // Se todos estão ocultos, tornar todos visíveis
      setHiddenEventIds([]);
      toast.success("Todos os eventos agora estão visíveis para os usuários.");
    } else {
      // Se algum está visível, ocultar todos
      setHiddenEventIds(allEventIds);
      toast.info("Todos os eventos foram ocultos para os usuários.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const categories = Array.from(new Set(events.map((e) => e.category)));

  // Combinar eventos estáticos com eventos criados localmente e aplicar estado de visibilidade
  const allEvents = [...events, ...localEvents].map(event => ({
    ...event,
    isHidden: hiddenEventIds.includes(event.id)
  }));
  
  const filteredEvents = allEvents.filter((event) => {
    if (selectedCity !== "all" && event.city_id !== selectedCity) return false;
    
    // Filtro de categoria atualizado para verificar ambas as categorias
    if (selectedCategory !== "all") {
      const eventCategories = Array.isArray(event.categories) ? event.categories : [event.category];
      if (!eventCategories.includes(selectedCategory)) return false;
    }
    
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
    <React.Fragment>
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
          <Button className="gap-2 self-start sm:self-auto" onClick={() => setIsModalOpen(true)}>
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
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-xs gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={handleToggleAllVisibility}
                        title={hiddenEventIds.length === [...events, ...localEvents].length ? "Exibir todos os eventos" : "Ocultar todos os eventos"}
                      >
                        {hiddenEventIds.length === [...events, ...localEvents].length ? (
                          <><Eye className="w-3.5 h-3.5" /> Exibir Todos</>
                        ) : (
                          <><EyeOff className="w-3.5 h-3.5" /> Ocultar Todos</>
                        )}
                      </Button>
                      <span>Ações</span>
                    </div>
                  </th>
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
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(event.categories) ? event.categories : [event.category]).map((cat: string) => (
                            <Badge key={cat} variant="secondary" className="rounded-full text-[10px] px-2 py-0">
                              {cat}
                            </Badge>
                          ))}
                        </div>
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
                          {formatDisplayDate(event.date)}
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

                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-8 w-8 rounded-lg ${event.isHidden ? "text-muted-foreground" : "text-blue-600"}`}
                            onClick={() => handleToggleVisibility(event.id, event.title)}
                            title={event.isHidden ? "Exibir Evento" : "Ocultar Evento"}
                          >
                            {event.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg"
                            onClick={() => handleEditEvent(event)}
                          >
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
      <CreateEventFormModal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      onSubmit={handleCreateEvent}
      editingEvent={editingEvent}
    />
    </React.Fragment>
  );
}
