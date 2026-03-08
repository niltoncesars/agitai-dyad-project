import React, { useState, useRef } from "react";
import { ArrowLeft, Upload, Trash2, Plus } from "lucide-react";

interface CreateEventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const CreateEventFormModal: React.FC<CreateEventFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "NEON Paradise",
    date: "2026-03-07",
    startTime: "22:00",
    endTime: "08:00",
    gateTime: "22:00",
    censorship: "18",
    category: "eletronico",
    organizer: "",
    locationName: "FALLS",
    city: "Piraju - SP",
    address: "R. Eng. Nelsom de Godói, 161 - Centro, Piraju - SP, 18800-000",
  });

  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<string[]>(["Pista", "Camarote"]);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = () => {
    onSubmit({
      ...formData,
      coverImage,
      bannerImage,
      selectedTickets
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'cover') setCoverImage(reader.result as string);
        else setBannerImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTicket = (type: string) => {
    setSelectedTickets(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#f4f2ff] w-full max-w-[720px] rounded-[24px] shadow-2xl relative animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 flex items-center gap-4 sticky top-0 bg-[#f4f2ff] z-10 rounded-t-[24px] border-b border-indigo-100">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-indigo-100 bg-white flex items-center justify-center hover:border-indigo-500 hover:shadow-md transition-all group"
          >
            <ArrowLeft className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600" />
          </button>
          <h2 className="text-[22px] font-[800] tracking-tight text-[#1a1530] font-syne">
            Criar Novo <span className="text-[#5b2ef7]">Evento</span>
          </h2>
          <span className="ml-auto flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#5b2ef7] bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase">
            <span className="w-1.5 h-1.5 bg-[#5b2ef7] rounded-full"></span>
            Tenant
          </span>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Images Section */}
          <section>
            <div className="flex items-center gap-2.5 mb-4 text-[11px] font-bold tracking-[2px] text-[#5b2ef7] uppercase font-syne after:content-[''] after:flex-1 after:h-[1.5px] after:bg-gradient-to-r after:from-indigo-100 after:to-transparent">
              Imagens do Evento
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.6fr] gap-4">
              {/* Cover Slot */}
              <div 
                className={`relative aspect-[415/510] rounded-[12px] border-2 border-dashed flex flex-col items-center justify-center gap-2.5 cursor-pointer overflow-hidden transition-all group ${coverImage ? 'border-indigo-500 bg-white' : 'border-indigo-100 bg-white hover:border-indigo-400 hover:bg-indigo-50/30'}`}
                onClick={() => coverInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={coverInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'cover')}
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-[#5b2ef7] text-white text-[10px] font-bold rounded-full uppercase z-10">Capa</span>
                
                {coverImage ? (
                  <>
                    <img src={coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#5b2ef7]/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-xs font-semibold">Trocar imagem</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="text-center px-4">
                      <strong className="block text-[13px] text-[#5b2ef7]">Capa do Cartão</strong>
                      <span className="text-[12px] text-[#8b86a8]">Clique para adicionar</span>
                    </div>
                    <div className="text-[11px] font-semibold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">415 × 510 px</div>
                  </>
                )}
              </div>

              {/* Banner Slot */}
              <div 
                className={`relative aspect-[1056/553] rounded-[12px] border-2 border-dashed flex flex-col items-center justify-center gap-2.5 cursor-pointer overflow-hidden transition-all group ${bannerImage ? 'border-indigo-500 bg-white' : 'border-indigo-100 bg-white hover:border-indigo-400 hover:bg-indigo-50/30'}`}
                onClick={() => bannerInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={bannerInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'banner')}
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-[#5b2ef7] text-white text-[10px] font-bold rounded-full uppercase z-10">Banner</span>
                
                {bannerImage ? (
                  <>
                    <img src={bannerImage} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#5b2ef7]/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-xs font-semibold">Trocar imagem</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="text-center px-4">
                      <strong className="block text-[13px] text-[#5b2ef7]">Banner do Evento</strong>
                      <span className="text-[12px] text-[#8b86a8]">Clique para adicionar</span>
                    </div>
                    <div className="text-[11px] font-semibold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">1056 × 553 px</div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Info Section */}
          <section>
            <div className="flex items-center gap-2.5 mb-4 text-[11px] font-bold tracking-[2px] text-[#5b2ef7] uppercase font-syne after:content-[''] after:flex-1 after:h-[1.5px] after:bg-gradient-to-r after:from-indigo-100 after:to-transparent">
              Informações do Evento
            </div>
            <div className="bg-white border border-indigo-100 rounded-[12px] p-6 shadow-sm space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#5a5478]">Nome do Evento <span className="text-pink-500">*</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all" placeholder="Ex: NEON Paradise" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#5a5478]">Data <span className="text-pink-500">*</span></label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#5a5478]">Horário <span className="text-pink-500">*</span></label>
                  <div className="flex items-center gap-2">
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="flex-1 bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all" />
                    <span className="text-[13px] text-[#8b86a8]">até</span>
                    <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="flex-1 bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#5a5478]">Abertura dos Portões <span className="text-pink-500">*</span></label>
                  <input type="time" name="gateTime" value={formData.gateTime} onChange={handleInputChange} className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#5a5478]">Censura <span className="text-pink-500">*</span></label>
                  <select name="censorship" value={formData.censorship} onChange={handleInputChange} className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2214%22 height=%2214%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%238b86a8%22 stroke-width=%222%22%3E%3Cpath d=%22M6 9l6 6 6-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-[position:right_12px_center]">
                    <option value="">Selecione</option>
                    <option value="livre">Livre</option>
                    <option value="12">12 anos</option>
                    <option value="14">14 anos</option>
                    <option value="16">16 anos</option>
                    <option value="18">18 anos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#5a5478]">Estilo do Evento <span className="text-pink-500">*</span></label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2214%22 height=%2214%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%238b86a8%22 stroke-width=%222%22%3E%3Cpath d=%22M6 9l6 6 6-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-[position:right_12px_center]">
                    <option value="">Selecione</option>
                    <option value="eletronico">Eletrônico</option>
                    <option value="funk">Funk</option>
                    <option value="sertanejo">Sertanejo</option>
                    <option value="pagode">Pagode</option>
                    <option value="rock">Rock</option>
                    <option value="pop">Pop</option>
                    <option value="hip-hop">Hip-Hop</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#5a5478]">Organização <span className="text-pink-500">*</span></label>
                  <input type="text" name="organizer" value={formData.organizer} onChange={handleInputChange} className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all" placeholder="Nome do organizador" />
                </div>
              </div>
            </div>
          </section>

          {/* Location Section */}
          <section>
            <div className="flex items-center gap-2.5 mb-4 text-[11px] font-bold tracking-[2px] text-[#5b2ef7] uppercase font-syne after:content-[''] after:flex-1 after:h-[1.5px] after:bg-gradient-to-r after:from-indigo-100 after:to-transparent">
              Local
            </div>
            <div className="bg-white border border-indigo-100 rounded-[12px] p-6 shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#5a5478]">Nome do Local <span className="text-pink-500">*</span></label>
                  <input type="text" name="locationName" value={formData.locationName} onChange={handleInputChange} className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all" placeholder="Ex: FALLS" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#5a5478]">Cidade <span className="text-pink-500">*</span></label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all" placeholder="Ex: Piraju - SP" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#5a5478]">Endereço Completo <span className="text-pink-500">*</span></label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all" placeholder="Rua, número, bairro..." />
              </div>
            </div>
          </section>

          {/* Tickets Section */}
          <section>
            <div className="flex items-center gap-2.5 mb-4 text-[11px] font-bold tracking-[2px] text-[#5b2ef7] uppercase font-syne after:content-[''] after:flex-1 after:h-[1.5px] after:bg-gradient-to-r after:from-indigo-100 after:to-transparent">
              Ingressos & Lotes
            </div>
            <div className="bg-white border border-indigo-100 rounded-[12px] p-6 shadow-sm space-y-6">
              <div className="space-y-3">
                <label className="text-[12px] font-semibold text-[#5a5478]">Tipos de Ingresso <span className="text-pink-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {["Pista", "Camarote", "VIP", "Backstage"].map(type => (
                    <button 
                      key={type}
                      type="button"
                      onClick={() => toggleTicket(type)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-medium transition-all ${selectedTickets.includes(type) ? 'bg-indigo-50 border-indigo-500 text-indigo-600 font-bold' : 'bg-[#f8f7ff] border-indigo-50 text-[#8b86a8] hover:border-indigo-200'}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${selectedTickets.includes(type) ? 'bg-indigo-500' : 'bg-gray-300'}`}></span>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[1.5px] bg-indigo-50"></div>

              {/* Lote Item (Mock) */}
              <div className="border border-indigo-50 rounded-[12px] overflow-hidden">
                <div className="bg-indigo-50/30 px-4 py-3 flex items-center justify-between border-b border-indigo-50">
                  <div className="flex items-center gap-2 text-[14px] font-bold text-[#1a1530]">
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[11px]">1</span>
                    1º Lote
                  </div>
                  <button type="button" className="text-pink-500 hover:bg-pink-50 p-1.5 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex gap-2">
                    {selectedTickets.map((type, idx) => (
                      <button key={type} type="button" className={`px-4 py-1.5 rounded-md text-[12px] font-bold transition-all ${idx === 0 ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-400'}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#8b86a8]">Quantidade <span className="text-pink-500">*</span></label>
                      <input type="number" className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-indigo-500" placeholder="Ex: 200" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#8b86a8]">Preço Unitário <span className="text-pink-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-indigo-500">R$</span>
                        <input type="number" className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] pl-9 pr-3 py-2 text-[14px] outline-none focus:border-indigo-500" placeholder="0,00" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button type="button" className="w-full py-3 rounded-[12px] border-2 border-dashed border-indigo-100 text-indigo-400 text-[13px] font-bold hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Adicionar novo lote
              </button>
            </div>
          </section>

          {/* Submit Area */}
          <div className="pt-4 space-y-3">
            <button 
              type="button"
              onClick={handleFormSubmit}
              className="w-full py-4 bg-[#5b2ef7] text-white rounded-[12px] font-bold text-[15px] shadow-lg shadow-indigo-200 hover:bg-[#4a24cc] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Criar Evento Agora
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="w-full py-4 bg-white border border-indigo-100 text-[#5a5478] rounded-[12px] font-bold text-[14px] hover:border-indigo-300 hover:text-indigo-600 transition-all"
            >
              Cancelar e Voltar
            </button>
          </div>

        </div>
      </div>

      <style>{`
        .font-syne { font-family: 'Syne', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e0ff; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d0cdff; }
      `}</style>
    </div>
  );
};

export default CreateEventFormModal;
