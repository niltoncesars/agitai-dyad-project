import { useState } from "react";
import { Ticket, Search, Download, Filter, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { events, formatCurrency } from "@/lib/mock-data";
import DashboardLayout from "@/components/DashboardLayout";

// Generate mock ticket data from events
const tickets = events.flatMap((event) => {
  const count = Math.min(5, Math.floor(event.tickets_sold / 50000) + 1);
  return Array.from({ length: count }, (_, i) => ({
    id: `tkt-${event.id}-${i + 1}`,
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.date,
    eventCity: event.city_name,
    eventImage: event.image,
    buyerName: ["João Silva", "Maria Santos", "Pedro Oliveira", "Ana Costa", "Carlos Lima"][i % 5],
    buyerEmail: [`joao${i}@email.com`, `maria${i}@email.com`, `pedro${i}@email.com`, `ana${i}@email.com`, `carlos${i}@email.com`][i % 5],
    quantity: Math.floor(Math.random() * 3) + 1,
    price: event.price,
    total: event.price * (Math.floor(Math.random() * 3) + 1),
    status: ["confirmed", "pending", "cancelled"][Math.floor(Math.random() * 3)] as "confirmed" | "pending" | "cancelled",
    purchasedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));
});

export default function TicketsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredTickets = tickets.filter((ticket) => {
    if (selectedStatus !== "all" && ticket.status !== selectedStatus) return false;
    if (
      searchQuery &&
      !ticket.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !ticket.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !ticket.buyerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const totalRevenue = filteredTickets
    .filter((t) => t.status === "confirmed")
    .reduce((sum, t) => sum + t.total, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle className="w-3.5 h-3.5 text-green-600" />;
      case "pending": return <Clock className="w-3.5 h-3.5 text-yellow-600" />;
      case "cancelled": return <XCircle className="w-3.5 h-3.5 text-red-600" />;
      default: return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-700 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed": return "Confirmado";
      case "pending": return "Pendente";
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
                Ingressos
              </span>
            </h1>
            <p className="text-muted-foreground mt-1">
              {filteredTickets.length} ingresso{filteredTickets.length !== 1 ? "s" : ""} encontrado{filteredTickets.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button variant="outline" className="gap-2 self-start sm:self-auto">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Ticket className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-muted-foreground">Total de Ingressos</p>
            </div>
            <p className="text-2xl font-bold">{tickets.length}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-muted-foreground">Confirmados</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {tickets.filter((t) => t.status === "confirmed").length}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {tickets.filter((t) => t.status === "pending").length}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-muted-foreground">Receita Confirmada</p>
            </div>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                type="text"
                placeholder="Buscar por evento, comprador..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 p-0 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ingresso</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Comprador</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Qtd.</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Preço Unit.</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Data</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Nenhum ingresso encontrado
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={ticket.eventImage}
                            alt={ticket.eventTitle}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                          <div>
                            <p className="font-medium text-sm line-clamp-1">{ticket.eventTitle}</p>
                            <p className="text-xs text-muted-foreground">{ticket.eventCity}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <p className="text-sm font-medium">{ticket.buyerName}</p>
                        <p className="text-xs text-muted-foreground">{ticket.buyerEmail}</p>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-sm font-medium">{ticket.quantity}x</span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-sm">{formatCurrency(ticket.price)}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-bold">{formatCurrency(ticket.total)}</span>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {new Date(ticket.purchasedAt).toLocaleDateString("pt-BR")}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-medium ${getStatusStyle(ticket.status)}`}
                        >
                          {getStatusIcon(ticket.status)}
                          {getStatusLabel(ticket.status)}
                        </span>
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
