import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TenantData } from "@/hooks/useTenantStorage";
import "@/styles/custom-modal.css";

interface EditTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTenant: TenantData) => void;
  tenant: TenantData | null;
}

export function EditTenantDialog({ isOpen, onClose, onSave, tenant }: EditTenantDialogProps) {
  const [formData, setFormData] = useState<TenantData>(tenant || {} as TenantData);
  const [logoPreview, setLogoPreview] = useState<string | null>(tenant?.logo || null);
  const [isAddressLocked, setIsAddressLocked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tenant) {
      setFormData(tenant);
      setLogoPreview(tenant.logo || null);
      setIsAddressLocked(false);
    }
  }, [tenant]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = () => {
    setFormData((prev) => ({ 
      ...prev, 
      status: prev.status === "active" ? "inactive" : "active" 
    }));
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

  const handleToggleAddressLock = () => {
    const newLockedState = !isAddressLocked;
    setIsAddressLocked(newLockedState);
    
    if (newLockedState) {
      // Se marcou o checkbox, preenche com o endereço do usuário (mockado conforme solicitado)
      setFormData(prev => ({
        ...prev,
        street: "Avenida Paulista",
        number: "1578",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP"
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setFormData((prev) => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-container" style={{ padding: 0, border: 'none', maxWidth: '520px' }} showCloseButton={false}>
        <div className="modal-header">
          <div>
            <p className="subtitle">Configurações</p>
            <h2>Editar Tenant</h2>
          </div>
          <button className="btn-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* 1. Bloco: Imagem do Tenant */}
          <div>
            <Label className="field-label">Imagem do Tenant <span style={{ textTransform: 'none', letterSpacing: 'normal', fontWeight: '400', fontSize: '11px' }}> — 480 × 480 px</span></Label>
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
              <div 
                className="drop-zone" 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 16 12 12 8 16"/>
                  <line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
                <p className="dz-main">Arraste ou clique para enviar</p>
                <p className="dz-sub">PNG, JPG, WEBP — recomendado 480×480px</p>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

          <div className="divider"></div>

          {/* 3. Bloco: Nome do Organizador */}
          <div>
            <Label htmlFor="name" className="field-label">Nome do Organizador</Label>
            <input
              id="name"
              type="text"
              value={formData.name || ""}
              onChange={handleChange}
              placeholder="Razão Social ou Nome Fantasia"
              className="input-field"
            />
          </div>

          {/* 4. Bloco: Email + Telefone (grid-2) */}
          <div className="grid-2">
            <div>
              <Label htmlFor="email" className="field-label">Email</Label>
              <input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                placeholder="Qual o seu e-mail?"
                className="input-field"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="field-label">Telefone</Label>
              <input
                id="phone"
                type="tel"
                value={formData.phone || ""}
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
                type="button"
                className={`seg-btn ${formData.personType === "PJ" ? "active" : ""}`}
                onClick={() => handlePersonTypeChange("PJ")}
              >
                CNPJ
              </button>
              <button
                type="button"
                className={`seg-btn ${formData.personType === "PF" ? "active" : ""}`}
                onClick={() => handlePersonTypeChange("PF")}
              >
                CPF
              </button>
              <input
                id="document"
                type="text"
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
            <select id="plan" value={formData.plan || "Enterprise"} onChange={handleChange} className="select-field">
              <option value="Free">Free</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>

          <div className="divider"></div>

          {/* 8. Bloco: Endereço Completo */}
          <div>
            <div className="section-head">
              <h3>Endereço Completo</h3>
              <label className={`checkbox-label ${isAddressLocked ? 'checked' : ''}`} onClick={handleToggleAddressLock}>
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
                <input
                  id="street"
                  type="text"
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
                  <input
                    id="number"
                    type="text"
                    value={formData.number || ""}
                    onChange={handleChange}
                    placeholder="Número ou S/N"
                    className="input-field"
                    readOnly={isAddressLocked}
                  />
                </div>
                <div>
                  <Label htmlFor="neighborhood" className="field-label">Bairro</Label>
                  <input
                    id="neighborhood"
                    type="text"
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
                  <input
                    id="city"
                    type="text"
                    value={formData.city || ""}
                    onChange={handleChange}
                    placeholder="Qual a cidade?"
                    className="input-field"
                    readOnly={isAddressLocked}
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="field-label">Estado</Label>
                  <select 
                    id="state" 
                    value={formData.state || "SP"} 
                    onChange={handleChange} 
                    className="select-field"
                    disabled={isAddressLocked}
                    style={{ paddingRight: '28px', backgroundPosition: 'right 10px center' }}
                  >
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

          <div className="divider"></div>

          {/* Website */}
          <div>
            <Label htmlFor="website" className="field-label">Website</Label>
            <input
              id="website"
              type="url"
              value={formData.website || ""}
              onChange={handleChange}
              placeholder="https://www.seusite.com.br"
              className="input-field"
            />
          </div>

          {/* 9. Bloco: Status (toggle-card) */}
          <div className="status-card">
            <div>
              <p className="sc-title">Status do Tenant</p>
              <p className="sc-sub">Ative ou desative o acesso deste organizador</p>
            </div>
            <div className="toggle-wrap">
              <span className={`toggle-label ${formData.status === "inactive" ? "inactive" : ""}`}>
                {formData.status === "active" ? "Ativo" : "Inativo"}
              </span>
              <button 
                type="button"
                className={`toggle-track ${formData.status === "inactive" ? "off" : ""}`}
                onClick={handleSwitchChange}
              >
                <div className="toggle-knob"></div>
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-save" onClick={handleSubmit}>Salvar Alterações</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
