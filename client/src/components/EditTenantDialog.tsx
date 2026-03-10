import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TenantData } from "@/hooks/useTenantStorage";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface EditTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: any; // Pode ser o objeto inicial ou o do storage
  onSave: (id: string, updates: Partial<TenantData>) => void;
}

export function EditTenantDialog({ isOpen, onClose, tenant, onSave }: EditTenantDialogProps) {
  const [formData, setFormData] = useState<Partial<TenantData>>({
    name: "",
    email: "",
    phone: "",
    city: "",
    website: "",
    status: "active",
    plan: "Starter",
    personType: "legal",
    documentNumber: "",
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || "",
        email: tenant.email || "",
        phone: tenant.phone || "",
        city: tenant.city || "",
        website: tenant.website || "",
        status: tenant.status || "active",
        plan: tenant.plan || "Starter",
        personType: tenant.personType || "legal",
        documentNumber: tenant.documentNumber || "",
      });
    }
  }, [tenant, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tenant?.id) {
      onSave(tenant.id, formData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Tenant: {tenant?.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Nome do Organizador</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-3 col-span-2 p-3 bg-muted/30 rounded-lg border border-border">
              <Label>Tipo de Pessoa</Label>
              <div className="flex gap-4 mb-2">
                <Button 
                  type="button"
                  variant={formData.personType === "legal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, personType: "legal" })}
                  className="flex-1"
                >
                  PJ (CNPJ)
                </Button>
                <Button 
                  type="button"
                  variant={formData.personType === "individual" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, personType: "individual" })}
                  className="flex-1"
                >
                  PF (CPF)
                </Button>
              </div>
              <div className="pt-1">
                <Input
                  placeholder={formData.personType === "legal" ? "00.000.000/0000-00" : "000.000.000-00"}
                  value={formData.documentNumber}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="plan">Plano</Label>
              <Select 
                value={formData.plan} 
                onValueChange={(value: any) => setFormData({ ...formData, plan: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Starter">Starter</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between col-span-2 p-3 bg-muted/30 rounded-lg border border-border">
              <div className="space-y-0.5">
                <Label>Status do Tenant</Label>
                <p className="text-xs text-muted-foreground">
                  Define se o organizador pode criar novos eventos
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${formData.status === "active" ? "text-green-600" : "text-muted-foreground"}`}>
                  {formData.status === "active" ? "Ativo" : "Desativado"}
                </span>
                <Switch
                  checked={formData.status === "active"}
                  onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? "active" : "inactive" })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
