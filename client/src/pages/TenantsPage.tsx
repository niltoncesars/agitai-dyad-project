import { useState, useRef, useEffect } from "react";
import { Building2, Search, Plus, Eye, Edit, Trash2, Globe, Mail, Phone, MapPin, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { events, formatCurrency } from "@/lib/mock-data";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { useTenantStorage, TenantData } from "@/hooks/useTenantStorage";
import { EditTenantDialog } from "@/components/EditTenantDialog";

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
    logo: null as string | null,
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
    logo: null as string | null,
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
    logo: null as string | null,
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
    logo: null as string | null,
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
    logo: null as string | null,
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTenantForEdit, setSelectedTenantForEdit] = useState<any>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  
  // Usar hook de persistência de dados
  const { tenantData, isLoaded, updateTenant, updateTenantLogo, getTenantLogo } = useTenantStorage();
  
  const handleEditClick = (tenant: any) => {
    setSelectedTenantForEdit(tenant);
    setIsEditDialogOpen(true);
  };

  const handleSaveTenant = (id: string, updates: Partial<TenantData>) => {
    updateTenant(id, updates);
    toast.success("Tenant atualizado com sucesso!", {
      style: {
        background: "#10b981",
        color: "#ffffff",
        border: "none",
      },
    });
  };

  const handleLogoUpload = (tenantId: string, file: File | null) => {
    if (!file) {
      toast.error("Nenhum arquivo foi selecionado.");
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de arquivo inválido. Apenas PNG, JPG e GIF são permitidos.");
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande. O tamanho máximo é 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      updateTenantLogo(tenantId, base64);
      toast.success("Logo atualizada com sucesso!");
    };
    reader.readAsDataURL(file);
  };

  // Combinar dados iniciais com dados do storage
  const allTenants = tenants.map(tenant => {
    const storedData = tenantData[tenant.id];
    return storedData ? { ...tenant, ...storedData } : tenant;
  });

  const filteredTenants = allTenants.filter((tenant) => {
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
          <Button className="gap-2 self-start sm:self-auto" onClick={() => console.log("Novo Tenant clicado")}>
            <Plus className="w-4 h-4" />
            Novo Tenant
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Total de Tenants</p>
            <p className="text-2xl font-bold mt-1">{tenants.length}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Ativos</p>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {allTenants.filter((t) => t.status === "active").length}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Enterprise</p>
            <p className="text-2xl font-bold mt-1 text-purple-600">
              {allTenants.filter((t) => t.plan === "Enterprise").length}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Receita Total</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">
              {formatCurrency(allTenants.reduce((sum, t) => sum + t.totalRevenue, 0))}
            </p>
          </div>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTenants.length === 0 ? (
            <div className="col-span-full p-8 text-center text-muted-foreground bg-card rounded-xl border border-border">
              Nenhum tenant encontrado
            </div>
          ) : (
            filteredTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 border border-border overflow-hidden">
                        {getTenantLogo(tenant.id) ? (
                          <img
                            src={getTenantLogo(tenant.id)}
                            alt={tenant.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <button
                        onClick={() => fileInputRefs.current[tenant.id]?.click()}
                        className="absolute -top-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 shadow-md transition-colors"
                        title="Editar logo"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <input
                        ref={(ref) => {
                          if (ref) fileInputRefs.current[tenant.id] = ref;
                        }}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handleLogoUpload(tenant.id, file);
                        }}
                        style={{ display: "none" }}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        {tenant.name}
                        <Badge
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPlanColor(tenant.plan)}`}
                        >
                          {tenant.plan}
                        </Badge>
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" /> {tenant.email}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" /> {tenant.phone}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {tenant.city}
                      </p>
                      {tenant.website && (
                        <a
                          href={tenant.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                        >
                          <Globe className="w-3 h-3" /> {tenant.website}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={tenant.status === "active" ? "default" : "secondary"}
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                    >
                      {tenant.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => handleEditClick(tenant)}
                    >
                      <Edit className="w-3 h-3" /> Editar
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
                  <div>
                    <p>Eventos:</p>
                    <p className="font-semibold text-foreground">{tenant.eventsCount}</p>
                  </div>
                  <div className="text-right">
                    <p>Receita:</p>
                    <p className="font-semibold text-foreground">
                      {formatCurrency(tenant.totalRevenue)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedTenantForEdit && (
        <EditTenantDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          tenant={selectedTenantForEdit}
          onSave={handleSaveTenant}
        />
      )}
    </DashboardLayout>
  );
}
