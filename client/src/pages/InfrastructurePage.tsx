import { Server, Database, Globe, Shield, Cpu, HardDrive, Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";

const services = [
  {
    id: "api",
    name: "API Gateway",
    description: "Gerenciamento de requisições e roteamento",
    status: "operational",
    uptime: "99.98%",
    latency: "45ms",
    icon: Globe,
    region: "us-east-1",
    lastIncident: "30 dias atrás",
  },
  {
    id: "db-primary",
    name: "Banco de Dados Principal",
    description: "PostgreSQL - Instância primária",
    status: "operational",
    uptime: "99.99%",
    latency: "12ms",
    icon: Database,
    region: "us-east-1",
    lastIncident: "90 dias atrás",
  },
  {
    id: "db-replica",
    name: "Banco de Dados Réplica",
    description: "PostgreSQL - Réplica de leitura",
    status: "operational",
    uptime: "99.95%",
    latency: "18ms",
    icon: Database,
    region: "us-west-2",
    lastIncident: "15 dias atrás",
  },
  {
    id: "cache",
    name: "Cache Redis",
    description: "Cache distribuído para sessões e dados",
    status: "degraded",
    uptime: "98.72%",
    latency: "8ms",
    icon: Cpu,
    region: "us-east-1",
    lastIncident: "2 horas atrás",
  },
  {
    id: "storage",
    name: "Armazenamento S3",
    description: "Armazenamento de arquivos e imagens",
    status: "operational",
    uptime: "99.99%",
    latency: "120ms",
    icon: HardDrive,
    region: "sa-east-1",
    lastIncident: "60 dias atrás",
  },
  {
    id: "auth",
    name: "Serviço de Autenticação",
    description: "OAuth e gerenciamento de sessões",
    status: "operational",
    uptime: "99.97%",
    latency: "35ms",
    icon: Shield,
    region: "us-east-1",
    lastIncident: "45 dias atrás",
  },
  {
    id: "maps",
    name: "Google Maps API",
    description: "Integração com mapas e geolocalização",
    status: "operational",
    uptime: "99.90%",
    latency: "200ms",
    icon: Globe,
    region: "global",
    lastIncident: "7 dias atrás",
  },
  {
    id: "payments",
    name: "Gateway de Pagamento",
    description: "Stripe - Processamento de pagamentos",
    status: "outage",
    uptime: "95.30%",
    latency: "N/A",
    icon: Server,
    region: "us-east-1",
    lastIncident: "Agora",
  },
];

const metrics = [
  { label: "Requisições/min", value: "12.4K", trend: "+5.2%", positive: true },
  { label: "Taxa de Erro", value: "0.12%", trend: "-0.03%", positive: true },
  { label: "Tempo de Resposta", value: "87ms", trend: "+2ms", positive: false },
  { label: "Usuários Ativos", value: "3.2K", trend: "+18%", positive: true },
];

export default function InfrastructurePage() {
  const operationalCount = services.filter((s) => s.status === "operational").length;
  const degradedCount = services.filter((s) => s.status === "degraded").length;
  const outageCount = services.filter((s) => s.status === "outage").length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "degraded": return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "outage": return <XCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "operational": return "bg-green-100 text-green-700 border-green-200";
      case "degraded": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "outage": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "operational": return "Operacional";
      case "degraded": return "Degradado";
      case "outage": return "Fora do Ar";
      default: return status;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "operational": return "border-l-green-500";
      case "degraded": return "border-l-yellow-500";
      case "outage": return "border-l-red-500";
      default: return "border-l-gray-500";
    }
  };

  const overallStatus = outageCount > 0 ? "outage" : degradedCount > 0 ? "degraded" : "operational";

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Infraestrutura
              </span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitoramento e status dos serviços da plataforma
            </p>
          </div>
          <Button variant="outline" className="gap-2 self-start sm:self-auto">
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>

        {/* Overall Status Banner */}
        <div
          className={`rounded-xl border-l-4 p-4 flex items-center gap-3 ${
            overallStatus === "operational"
              ? "bg-green-50 border-green-500"
              : overallStatus === "degraded"
              ? "bg-yellow-50 border-yellow-500"
              : "bg-red-50 border-red-500"
          }`}
        >
          {getStatusIcon(overallStatus)}
          <div>
            <p className={`font-semibold ${
              overallStatus === "operational" ? "text-green-700" :
              overallStatus === "degraded" ? "text-yellow-700" : "text-red-700"
            }`}>
              {overallStatus === "operational"
                ? "Todos os sistemas operacionais"
                : overallStatus === "degraded"
                ? "Alguns sistemas com desempenho degradado"
                : "Incidente em andamento"}
            </p>
            <p className="text-sm text-muted-foreground">
              Última verificação: há 2 minutos
            </p>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{operationalCount}</p>
            <p className="text-sm text-muted-foreground">Operacional</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{degradedCount}</p>
            <p className="text-sm text-muted-foreground">Degradado</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{outageCount}</p>
            <p className="text-sm text-muted-foreground">Fora do Ar</p>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Métricas em Tempo Real</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                <p className="text-xl font-bold">{metric.value}</p>
                <p className={`text-xs font-medium mt-1 ${metric.positive ? "text-green-600" : "text-red-500"}`}>
                  {metric.trend} vs. hora anterior
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Services List */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              Status dos Serviços
            </h3>
          </div>
          <div className="divide-y divide-border">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  className={`p-4 border-l-4 hover:bg-muted/30 transition-colors ${getStatusBg(service.status)}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{service.name}</p>
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${getStatusStyle(service.status)}`}
                          >
                            {getStatusIcon(service.status)}
                            {getStatusLabel(service.status)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-6 shrink-0 text-right">
                      <div>
                        <p className="text-xs text-muted-foreground">Uptime</p>
                        <p className="text-sm font-bold text-green-600">{service.uptime}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Latência</p>
                        <p className="text-sm font-medium">{service.latency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Região</p>
                        <p className="text-sm font-medium">{service.region}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Último Incidente</p>
                        <p className="text-sm font-medium">{service.lastIncident}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
