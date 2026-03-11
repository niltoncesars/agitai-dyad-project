import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UploadCloud, X, Building2, Check } from "lucide-react";
import { toast } from "sonner";
import { TenantData } from "@/hooks/useTenantStorage";

interface CreateTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newTenant: TenantData) => void;
}

const initialFormData: TenantData = {
  id: "", // Será gerado na criação
  name: "",
  email: "",
  phone: "",
  city: "",
  website: "",
  status: "active",
  plan: "Enterprise", // Default plan
  eventsCount: 0,
  totalRevenue: 0,
  joinedAt: new Date().toISOString().split("T")[0],
  logo: null,
  document: "",
  personType: "PF", // Default to PF as per prompt
  street: "",
  number: "",
  neighborhood: "",
  state: "SP", // Default to SP as per prompt
};

export function CreateTenantDialog({ isOpen, onClose, onSave }: CreateTenantDialogProps) {
  const [formData, setFormData] = useState<TenantData>(initialFormData);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isAddressLocked, setIsAddressLocked] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setLogoPreview(null);
      setIsAddressLocked(true);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, status: checked ? "active" : "inactive" }));
  };

  const handlePersonTypeChange = (type: "PJ" | "PF") => {
    setFormData((prev) => ({ ...prev, personType: type }));
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

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setFormData((prev) => ({ ...prev, logo: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    const newTenantId = `tenant-${Date.now()}`;
    onSave({ ...formData, id: newTenantId });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        <DialogHeader className="modal-header">
          <div>
            <p className="subtitle">Configurações</p>
            <h2>Criar Novo Organizador</h2>
          </div>
          <button className="btn-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </DialogHeader>
        <div className="modal-body">
          {/* 1. Bloco: Imagem do Tenant */}
          <div>
            <Label htmlFor="logo-upload" className="field-label">Imagem do Tenant <span style={{ textTransform: 'none', letterSpacing: 'normal', fontWeight: '400', fontSize: '11px' }}> — 480 × 480 px</span></Label>
            <div className="upload-row">
              <div className={`img-preview ${logoPreview ? 'has-image' : ''}`} onClick={() => fileInputRef.current?.click()}>
                {!logoPreview ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="img-placeholder">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                ) : (
                  <img src={logoPreview} alt="Logo Preview" />
                )}
                <div className="img-edit-overlay">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
              </div>
              <div className="drop-zone" onClick={() => fileInputRef.current?.click()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 16 12 12 8 16"/>
                  <line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
                <p className="dz-main">Arraste ou clique para enviar</p>
                <p className="dz-sub">PNG, JPG, WEBP — recomendado 480×480px</p>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* 2. Divisor */}
          <div className="divider"></div>

          {/* 3. Bloco: Nome do Organizador */}
          <div>
            <Label htmlFor="name" className="field-label">Nome do Organizador</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Razão Social ou Nome Fantasia"
              className="input-field"
            />
          </div>

          {/* 4. Bloco: Email + Telefone (grid-2) */}
          <div className="grid-2">
            <div>
              <Label htmlFor="email" className="field-label">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Qual o seu e-mail?"
                className="input-field"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="field-label">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(XX) 00000-0000"
                className="input-field"
              />
            </div>
          </div>

          {/* 5. Bloco: Tipo de Pessoa (seg-control) */}
          <div>
            <Label className="field-label">Tipo de Pessoa</Label>
            <div className="seg-control">
              <button
                className={`seg-btn ${formData.personType === "PJ" ? "active" : ""}`}
                onClick={() => handlePersonTypeChange("PJ")}
              >
                CNPJ
              </button>
              <button
                className={`seg-btn ${formData.personType === "PF" ? "active" : ""}`}
                onClick={() => handlePersonTypeChange("PF")}
              >
                CPF
              </button>
              <Input
                id="document"
                value={formData.document || ""}
                onChange={handleChange}
                placeholder={formData.personType === "PJ" ? "00.000.000/0000-00" : "000.000.000-00"}
                className="seg-input"
              />
            </div>
          </div>

          {/* 6. Bloco: Plano (select) */}
          <div>
            <Label htmlFor="plan" className="field-label">Plano</Label>
            <select id="plan" value={formData.plan} onChange={handleChange}>
              <option value="Free">Free</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>

          {/* 7. Divisor */}
          <div className="divider"></div>

          {/* 8. Bloco: Endereço Completo */}
          <div>
            <div className="section-head">
              <h3>Endereço Completo</h3>
              <label className={`checkbox-label ${isAddressLocked ? 'checked' : ''}`} onClick={() => setIsAddressLocked(!isAddressLocked)}>
                <div className={`custom-cb ${isAddressLocked ? 'checked' : ''}`}>
                  {isAddressLocked && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2 6 5 9 10 3"/>
                    </svg>
                  )}
                </div>
                <span>Usar o endereço do usuário</span>
              </label>
            </div>
            <div className={`address-fields ${isAddressLocked ? 'locked' : ''}`}>
              <div>
                <Label htmlFor="street" className="field-label">Logradouro</Label>
                <Input
                  id="street"
                  value={formData.street || ""}
                  onChange={handleChange}
                  placeholder="Rua, Avenida, Alameda..."
                  className="input-field"
                  readOnly={isAddressLocked}
                />
              </div>
              <div className="grid-num-bairro">
                <div>
                  <Label htmlFor="number" className="field-label">Número</Label>
                  <Input
                    id="number"
                    value={formData.number || ""}
                    onChange={handleChange}
                    placeholder="Número ou S/N"
                    className="input-field"
                    readOnly={isAddressLocked}
                  />
                </div>
                <div>
                  <Label htmlFor="neighborhood" className="field-label">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood || ""}
                    onChange={handleChange}
                    placeholder="Qual o bairro?"
                    className="input-field"
                    readOnly={isAddressLocked}
                  />
                </div>
              </div>
              <div className="grid-cidade-uf">
                <div>
                  <Label htmlFor="city" className="field-label">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Qual a cidade?"
                    className="input-field"
                    readOnly={isAddressLocked}
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="field-label">Estado</Label>
                  <select id="state" value={formData.state || ""} onChange={handleChange} readOnly={isAddressLocked}>
                    <option value="">UF</option>
                    <option value="AC">AC</option>
                    <option value="AL">AL</option>
                    <option value="AP">AP</option>
                    <option value="AM">AM</option>
                    <option value="BA">BA</option>
                    <option value="CE">CE</option>
                    <option value="DF">DF</option>
                    <option value="ES">ES</option>
                    <option value="GO">GO</option>
                    <option value="MA">MA</option>
                    <option value="MT">MT</option>
                    <option value="MS">MS</option>
                    <option value="MG">MG</option>
                    <option value="PA">PA</option>
                    <option value="PB">PB</option>
                    <option value="PR">PR</option>
                    <option value="PE">PE</option>
                    <option value="PI">PI</option>
                    <option value="RJ">RJ</option>
                    <option value="RN">RN</option>
                    <option value="RS">RS</option>
                    <option value="RO">RO</option>
                    <option value="RR">RR</option>
                    <option value="SC">SC</option>
                    <option value="SP">SP</option>
                    <option value="SE">SE</option>
                    <option value="TO">TO</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 9. Divisor */}
          <div className="divider"></div>

          {/* 10. Bloco: Website */}
          <div>
            <Label htmlFor="website" className="field-label">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website || ""}
              onChange={handleChange}
              placeholder="https://www.seusite.com.br"
              className="input-field"
            />
          </div>

          {/* 11. Bloco: Status do Tenant */}
          <div className="status-card">
            <div>
              <p className="sc-title">Status do Tenant</p>
              <p className="sc-sub">Define se o organizador pode criar novos eventos</p>
            </div>
            <div className="toggle-wrap">
              <span className={`toggle-label ${formData.status === "inactive" ? "inactive" : ""}`}>
                {formData.status === "active" ? "Ativo" : "Inativo"}
              </span>
              <button
                className={`toggle-track ${formData.status === "inactive" ? "off" : ""}`}
                onClick={() => handleSwitchChange(formData.status === "inactive")}
              >
                <span className="toggle-knob"></span>
              </button>
            </div>
          </div>
        </div>
        <DialogFooter className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-save" onClick={handleSubmit}>Criar Organizador</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
