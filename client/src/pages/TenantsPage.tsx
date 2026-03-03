import { useState } from "react";
import { Building2, Search, Plus, Eye, Edit, Trash2, Globe, Mail, Phone, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { events, formatCurrency } from "@/lib/mock-data";
import DashboardLayout from "@/components/DashboardLayout";

const tenants = [
  {
    id: "tenant-001",
    name: "Cultura Viva",
    email: "contato@culturaviva.com.br",
    phone: "(11) 99999-0001",
    city: "São Paulo",
    website: "www.culturaviva.com.br",
    status: "active",
    plan: "Enterprise",
    eventsCount: 0,
    totalRevenue: 0,
    joinedAt: "2023-01-15",
  },
  {
    id: "tenant-002",
    name: "EventPro Brasil",
    email: "contato@eventpro.com.br",
    phone: "(21) 99999-0002",
    city: "Rio de Janeiro",
    website: "www.eventpro.com.br",
    status: "active",
    plan: "Professional",
    eventsCount: 0,
    totalRevenue: 0,
    joinedAt: "2023-03-22",
  },
  {
    id: "tenant-003",
    name: "Tech Events MG",
    email: "contato@techevents.com.br",
    phone: "(31) 99999-0003",
    city: "Belo Horizonte",
    website: "www.techevents.com.br",
    status: "active",
    plan: "Starter",
    eventsCount: 0,
    totalRevenue: 0,
    joinedAt: "2023-06-10",
  },
  {
    id: "tenant-004",
    name: "Nordeste Eventos",
    email: "contato@nordesteeventos.com.br",
    phone: "(71) 99999-0004",
    city: "Salvador",
    website: "www.nordesteeventos.com.br",
    status: "inactive",
    plan: "Starter",
    eventsCount: 0,
    totalRevenue: 0,
    joinedAt: "2023-08-05",
  },
  {
    id: "tenant-005",
    name: "Sul Entretenimento",
    email: "contato@sulent.com.br",
    phone: "(41) 99999-0005",
    city: "Curitiba",
    website: "www.sulent.com.br",
    status: "active",
    plan: "Professional",
    eventsCount: 0,
    totalRevenue: 0,
    joinedAt: "2023-09-18",
  },
].map((tenant) => {
  const tenantEvents = events.filter((e) => e.organizer_id === tenant.id);
  return {
    ...tenant,
    eventsCount: tenantEvents.length,
    totalRevenue: tenantEvents.reduce((sum, e) => sum + e.price * e.tickets_sold, 0),
  };
});

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredTenants = tenants.filter((tenant) => {
    if (selectedStatus !== "all" && tenant.status !== selectedStatus) return false;
    if (
      searchQuery &&
      !tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !tenant.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Enterprise": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Professional": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Starter": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
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
                Tenants
              </span>
            </h1>
            <p className="text-muted-foreground mt-1">
              {filteredTenants.length} organizador{filteredTenants.length !== 1 ? "es" : ""} cadastrado{filteredTenants.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button className="gap-2 self-start sm:self-auto">
            <Plus className="w-4 h-4" />
            Novo Tenant
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Total de Tenants</p>
            <p className="text-2xl font-bold mt-1">{tenants.length}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Ativos</p>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {tenants.filter((t) => t.status === "active").length}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Enterprise</p>
            <p className="text-2xl font-bold mt-1 text-purple-600">
              {tenants.filter((t) => t.plan === "Enterprise").length}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Receita Total</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">
              {formatCurrency(tenants.reduce((sum, t) => sum + t.totalRevenue, 0))}
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
                placeholder="Buscar tenants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 p-0 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus("all")}
                className="rounded-lg"
              >
                Todos
              </Button>
              <Button
                variant={selectedStatus === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus("active")}
                className="rounded-lg"
              >
                Ativos
              </Button>
              <Button
                variant={selectedStatus === "inactive" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus("inactive")}
                className="rounded-lg"
              >
                Inativos
              </Button>
            </div>
          </div>
        </div>

        {/* Tenants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTenants.length === 0 ? (
            <div className="col-span-full p-8 text-center text-muted-foreground bg-card rounded-xl border border-border">
              Nenhum tenant encontrado
            </div>
          ) : (
            filteredTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{tenant.name}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getPlanColor(tenant.plan)}`}
                      >
                        {tenant.plan}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${tenant.status === "active" ? "bg-green-500" : "bg-gray-400"}`}
                    />
                    <span className="text-xs text-muted-foreground capitalize">
                      {tenant.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{tenant.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{tenant.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{tenant.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{tenant.website}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Eventos</p>
                    <p className="text-lg font-bold">{tenant.eventsCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Receita</p>
                    <p className="text-sm font-bold text-blue-600">{formatCurrency(tenant.totalRevenue)}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1 gap-1 rounded-lg">
                    <Eye className="w-3.5 h-3.5" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1 rounded-lg">
                    <Edit className="w-3.5 h-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
