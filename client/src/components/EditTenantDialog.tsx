import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUp, X, Building2, Pencil } from "lucide-react";
import { TenantData } from "@/hooks/useTenantStorage";

interface EditTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: TenantData;
  onSave: (id: string, updates: Partial<TenantData>) => void;
}

export function EditTenantDialog({ isOpen, onClose, tenant, onSave }: EditTenantDialogProps) {
  const [formData, setFormData] = useState<Partial<TenantData>>(tenant);
  const [logoPreview, setLogoPreview] = useState<string | null>(tenant.logo || null);
  const [isAddressLocked, setIsAddressLocked] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(tenant);
    setLogoPreview(tenant.logo || null);
    setIsAddressLocked(true); // Resetar para bloqueado ao abrir
  }, [tenant]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, status: checked ? "active" : "inactive" }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, plan: value }));
  };

  const handleDocumentTypeChange = (type: 'cnpj' | 'cpf') => {
    setFormData((prev) => ({ ...prev, documentType: type }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setFormData((prev) => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(tenant.id, formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="text-2xl font-bold">Editar Organizador</DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col items-center justify-center p-4 border border-border rounded-lg bg-muted/40">
              <Label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                {logoPreview ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500 group">
                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Pencil className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <Building2 className="w-12 h-12" />
                  </div>
                )}
                <span className="text-sm text-muted-foreground">Clique para alterar logo</span>
              </Label>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name">Nome do Organizador</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="Ex: Cultura Viva Entretenimento"
                />
              </div>
              <div>
                <Label htmlFor="email">Email de Contato</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="contato@empresa.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Identificação Fiscal</Label>
            <div className="flex space-x-2">
              <Button
                variant={formData.documentType === 'cnpj' ? 'default' : 'outline'}
                onClick={() => handleDocumentTypeChange('cnpj')}
              >
                CNPJ
              </Button>
              <Button
                variant={formData.documentType === 'cpf' ? 'default' : 'outline'}
                onClick={() => handleDocumentTypeChange('cpf')}
              >
                CPF
              </Button>
            </div>
            <Input
              id="document"
              value={formData.document || ""}
              onChange={handleChange}
              placeholder={formData.documentType === 'cnpj' ? '00.000.000/0000-00' : '000.000.000-00'}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Endereço</Label>
              <Button variant="link" onClick={() => setIsAddressLocked(!isAddressLocked)} className="p-0 h-auto">
                {isAddressLocked ? "Usar meu endereço" : "Editar endereço"}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input
                  id="logradouro"
                  value={formData.logradouro || ""}
                  onChange={handleChange}
                  disabled={isAddressLocked}
                  placeholder="Rua, Avenida, Alameda..."
                />
              </div>
              <div>
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.numero || ""}
                  onChange={handleChange}
                  disabled={isAddressLocked}
                  placeholder="Nº"
                />
              </div>
              <div>
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.bairro || ""}
                  onChange={handleChange}
                  disabled={isAddressLocked}
                  placeholder="Bairro"
                />
              </div>
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade || ""}
                  onChange={handleChange}
                  disabled={isAddressLocked}
                  placeholder="Cidade"
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, estado: value }))}
                  value={formData.estado || ""}
                  disabled={isAddressLocked}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AC">AC</SelectItem>
                    <SelectItem value="AL">AL</SelectItem>
                    <SelectItem value="AP">AP</SelectItem>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="BA">BA</SelectItem>
                    <SelectItem value="CE">CE</SelectItem>
                    <SelectItem value="DF">DF</SelectItem>
                    <SelectItem value="ES">ES</SelectItem>
                    <SelectItem value="GO">GO</SelectItem>
                    <SelectItem value="MA">MA</SelectItem>
                    <SelectItem value="MT">MT</SelectItem>
                    <SelectItem value="MS">MS</SelectItem>
                    <SelectItem value="MG">MG</SelectItem>
                    <SelectItem value="PA">PA</SelectItem>
                    <SelectItem value="PB">PB</SelectItem>
                    <SelectItem value="PR">PR</SelectItem>
                    <SelectItem value="PE">PE</SelectItem>
                    <SelectItem value="PI">PI</SelectItem>
                    <SelectItem value="RJ">RJ</SelectItem>
                    <SelectItem value="RN">RN</SelectItem>
                    <SelectItem value="RS">RS</SelectItem>
                    <SelectItem value="RO">RO</SelectItem>
                    <SelectItem value="RR">RR</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                    <SelectItem value="SP">SP</SelectItem>
                    <SelectItem value="SE">SE</SelectItem>
                    <SelectItem value="TO">TO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website || ""}
              onChange={handleChange}
              placeholder="www.seusite.com.br"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="status">Status do Organizador</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={formData.status === "active"}
                onCheckedChange={handleSwitchChange}
              />
              <span>{formData.status === "active" ? "Ativo" : "Inativo"}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
