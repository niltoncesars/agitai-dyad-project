
import React, { useState, useRef } from "react";
import { ArrowLeft, Upload, Trash2, Plus } from "lucide-react";

interface CreateEventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingEvent?: any;
}

const brazilianStates = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

const eventCategories = [
  {
    label: "Música",
    options: ["Shows", "Festival de música", "Rave / Música eletrônica", "Samba / Pagode", "Rock / Pop"]
  },
  {
    label: "Festas & Vida Noturna",
    options: ["Balada", "Festa temática", "Open bar", "Festa universitária", "After party"]
  },
  {
    label: "Humor & Entretenimento",
    options: ["Stand-up comedy", "Improviso", "Show de humor", "Podcast ao vivo", "Entretenimento ao vivo"]
  },
  {
    label: "Arte & Cultura",
    options: ["Exposições", "Teatro", "Dança", "Literatura", "Cinema / Audiovisual"]
  },
  {
    label: "Gastronomia",
    options: ["Festival gastronômico", "Degustação", "Vinhos & Drinks", "Cerveja artesanal", "Experiência culinária"]
  },
  {
    label: "Negócios & Networking",
    options: ["Networking", "Empreendedorismo", "Marketing", "Liderança", "Inovação"]
  },
  {
    label: "Tecnologia",
    options: ["Inteligência artificial", "Programação", "Startups", "Desenvolvimento de software", "Hackathon"]
  },
  {
    label: "Educação",
    options: ["Cursos", "Workshops", "Treinamentos", "Seminários", "Palestras"]
  },
  {
    label: "Esportes",
    options: ["Corridas", "Torneios", "Artes marciais", "Fitness", "eSports"]
  },
  {
    label: "Comunidade & Social",
    options: ["Meetups", "Eventos comunitários", "Eventos religiosos", "Eventos beneficentes", "Grupos de interesse"]
  },
  {
    label: "Família & Infantil",
    options: ["Eventos infantis", "Parques / recreação", "Espetáculos infantis", "Oficinas infantis", "Atividades familiares"]
  },
  {
    label: "Feiras & Experiências",
    options: ["Feiras", "Convenções", "Exposições comerciais", "Lançamentos", "Experiências imersivas"]
  }
];

const CreateEventFormModal: React.FC<CreateEventFormModalProps> = ({ isOpen, onClose, onSubmit, editingEvent }) => {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    gateTime: "",
    censorship: "",
    category: "",
    organizer: "",
    locationName: "",
    city: "",
    state: "",
    address: "",
    tickets: [],
  });

  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<string[]>(["Pista", "Camarote"]);
  const [lotes, setLotes] = useState<any[]>([
    {
      id: 1,
      ticketType: "Pista",
      quantity: "",
      price: "",
      startDate: "",
      endDate: "",
    },
  ]);

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
      selectedTickets,
      lotes,
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
    setSelectedTickets(prev => {
      const newSelectedTickets = prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type];
      // Update lotes to reflect changes in selected ticket types
      setLotes(prevLotes =>
        prevLotes.map(lote => {
          if (!newSelectedTickets.includes(lote.ticketType)) {
            // If the previously selected ticket type for this lote is no longer active, default to the first active ticket type
            return { ...lote, ticketType: newSelectedTickets[0] || "" };
          }
          return lote;
        })
      );
      return newSelectedTickets;
    });
  };

  const handleLoteChange = (id: number, field: string, value: string) => {
    setLotes(prevLotes =>
      prevLotes.map(lote => (lote.id === id ? { ...lote, [field]: value } : lote))
    );
  };

  const addLote = () => {
    const newId = lotes.length > 0 ? Math.max(...lotes.map(lote => lote.id)) + 1 : 1;
    setLotes(prevLotes => [
      ...prevLotes,
      {
        id: newId,
        ticketType: selectedTickets[0] || "", // Default to the first selected ticket type
        quantity: "",
        price: "",
        startDate: "",
        endDate: "",
      },
    ]);
  };

  const removeLote = (id: number) => {
    setLotes(prevLotes => prevLotes.filter(lote => lote.id !== id));
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
            {editingEvent ? "Editar" : "Criar Novo"} <span className="text-[#5b2ef7]">Evento</span>
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



          {/* Details Section */}
          <section>
            <div className="flex items-center gap-2.5 mb-4 text-[11px] font-bold tracking-[2px] text-[#5b2ef7] uppercase font-syne after:content-[''] after:flex-1 after:h-[1.5px] after:bg-gradient-to-r after:from-indigo-100 after:to-transparent">
              Detalhes do Evento
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#5a5478]">Nome do Evento <span className="text-pink-500">*</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Nome do Evento" className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#5a5478]">Data <span className="text-pink-500">*</span></label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} placeholder="Data do Evento" className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#5a5478]">Horário <span className="text-pink-500">*</span></label>
                  <div className="flex items-center gap-2">
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} placeholder="Horário de Início" className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all" />
                    <span className="text-[13px] text-[#8b86a8]">até</span>
                    <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} placeholder="Horário de Término" className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#5a5478]">Abertura dos Portões <span className="text-pink-500">*</span></label>
                  <input type="time" name="gateTime" value={formData.gateTime} onChange={handleInputChange} placeholder="Abertura dos Portões" className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#5a5478]">Censura <span className="text-pink-500">*</span></label>
                <select name="censorship" value={formData.censorship} onChange={handleInputChange} placeholder="Censura" className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none bg-[url(\'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2214%22 height=%2214%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%238b86a8%22 stroke-width=%222%22%3E%3Cpath d=%22M6 9l6 6 6-6%22/%3E%3C/svg%3E\')] bg-no-repeat bg-[position:right_12px_center]">
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
                <select name="category" value={formData.category} onChange={handleInputChange} placeholder="Estilo do Evento" className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none bg-[url(\'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2214%22 height=%2214%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%238b86a8%22 stroke-width=%222%22%3E%3Cpath d=%22M6 9l6 6 6-6%22/%3E%3C/svg%3E\')] bg-no-repeat bg-[position:right_12px_center]">
                    <option value="">Selecione a categoria</option>
                    {eventCategories.map((cat) => (
                      <optgroup key={cat.label} label={cat.label} className="event-category-optgroup">
                        {cat.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#5a5478]">Organização <span className="text-pink-500">*</span></label>
                  <input type="text" name="organizer" value={formData.organizer} onChange={handleInputChange} placeholder="Organização" className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all" />
                </div>
              </div>
            </div>
          </section>

          {/* Location Section */}
          <section>
            <div className="flex items-center gap-2.5 mb-4 text-[11px] font-bold tracking-[2px] text-[#5b2ef7] uppercase font-syne after:content-[''] after:flex-1 after:h-[1.5px] after:bg-gradient-to-r after:from-indigo-100 after:to-transparent">
              Local
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_0.5fr] gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#5a5478]">Nome do Local <span className="text-pink-500">*</span></label>
                 <input type="text" name="locationName" value={formData.locationName} onChange={handleInputChange} placeholder="Nome do Local" className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#5a5478]">Cidade <span className="text-pink-500">*</span></label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Cidade" className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#5a5478]">Estado <span className="text-pink-500">*</span></label>
                  <select name="state" value={formData.state} onChange={handleInputChange} placeholder="Estado" className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none bg-[url(\'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2214%22 height=%2214%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%238b86a8%22 stroke-width=%222%22%3E%3Cpath d=%22M6 9l6 6 6-6%22/%3E%3C/svg%3E\')] bg-no-repeat bg-[position:right_12px_center]">                   <option value="">UF</option>
                    {brazilianStates.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#5a5478]">Endereço Completo <span className="text-pink-500">*</span></label>
               <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Endereço Completo" className="w-full bg-[#f8f7ff] border border-indigo-50 rounded-[8px] px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all" />
              </div>
            </div>
          </section>

          {/* Tickets & Batches Section */}
          <section>
            <div className="flex items-center gap-2.5 mb-4 text-[11px] font-bold tracking-[2px] text-[#5b2ef7] uppercase font-syne after:content-[''] after:flex-1 after:h-[1.5px] after:bg-gradient-to-r after:from-indigo-100 after:to-transparent">
              Ingressos & Lotes
            </div>
            <div className="bg-white rounded-[12px] border border-indigo-100 p-6 shadow-sm">
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#5a5478] mb-1.5">
                  Tipos de Ingresso <span className="text-[#e8005a]">*</span>
                </label>
                <div className="flex flex-wrap gap-2" id="ticketTypes">
                  {["Pista", "Camarote", "VIP", "Backstage"].map((type) => (
                    <label
                      key={type}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-full border border-indigo-100 bg-indigo-50/30 cursor-pointer text-sm font-medium transition-all select-none ${selectedTickets.includes(type) ? "border-[#5b2ef7] bg-[#5b2ef7]/10 text-[#5b2ef7] font-semibold" : "text-[#8b86a8]"}`}
                      onClick={() => toggleTicket(type)}
                    >
                      <input type="checkbox" className="hidden" checked={selectedTickets.includes(type)} readOnly />
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedTickets.includes(type) ? "bg-[#5b2ef7]" : "bg-[#ccc]"}`}></span>
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-[1.5px] bg-indigo-100 my-5"></div>

              <div className="space-y-5" id="lotesList">
                {lotes.map((lote, loteIndex) => (
                  <div key={lote.id} className="bg-[#f8f7ff] rounded-[12px] border border-indigo-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="flex items-center gap-2 text-base font-bold text-[#1a1530]">
                        <span className="w-6 h-6 rounded-full bg-[#5b2ef7] text-white flex items-center justify-center text-xs font-bold">{loteIndex + 1}</span>
                        {loteIndex + 1}º Lote
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLote(lote.id)}
                        className="w-8 h-8 rounded-full bg-red-50/50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedTickets.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${lote.ticketType === type ? "bg-[#5b2ef7] text-white" : "bg-indigo-50/30 text-[#5b2ef7] hover:bg-[#5b2ef7]/20"}`}
                          onClick={() => handleLoteChange(lote.id, "ticketType", type)}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="block text-xs font-semibold text-[#5a5478]">Quantidade de Ingressos <span className="text-[#e8005a]">*</span></label>
                        <input
                          type="number"
                          placeholder="Quantidade de Ingressos"
                          min="1"
                          value={lote.quantity}
                          onChange={(e) => handleLoteChange(lote.id, "quantity", e.target.value)}
                          className="bg-[#f8f7ff] border border-indigo-100 rounded-md px-3 py-2 text-sm text-[#1a1530] focus:outline-none focus:ring-2 focus:ring-[#5b2ef7] focus:border-transparent"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="block text-xs font-semibold text-[#5a5478]">Valor <span className="text-[#e8005a]">*</span></label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-[#8b86a8] text-sm">R$</span>
                          <input
                            type="number"
                            placeholder="0,00"
                            min="0"
                            step="0.01"
                            value={lote.price}
                            onChange={(e) => handleLoteChange(lote.id, "price", e.target.value)}
                            className="pl-9 bg-[#f8f7ff] border border-indigo-100 rounded-md px-3 py-2 text-sm text-[#1a1530] focus:outline-none focus:ring-2 focus:ring-[#5b2ef7] focus:border-transparent w-full"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="block text-xs font-semibold text-[#5a5478]">Início do Lote <span className="text-[#e8005a]">*</span></label>
                        <input
                          type="datetime-local"
                          value={lote.startDate}
                          onChange={(e) => handleLoteChange(lote.id, "startDate", e.target.value)}
                          className="bg-[#f8f7ff] border border-indigo-100 rounded-md px-3 py-2 text-sm text-[#1a1530] focus:outline-none focus:ring-2 focus:ring-[#5b2ef7] focus:border-transparent"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="block text-xs font-semibold text-[#5a5478]">Fim do Lote <span className="text-[#e8005a]">*</span></label>
                        <input
                          type="datetime-local"
                          value={lote.endDate}
                          onChange={(e) => handleLoteChange(lote.id, "endDate", e.target.value)}
                          className="bg-[#f8f7ff] border border-indigo-100 rounded-md px-3 py-2 text-sm text-[#1a1530] focus:outline-none focus:ring-2 focus:ring-[#5b2ef7] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addLote}
                className="mt-5 w-full py-3 rounded-xl border border-indigo-100 bg-white text-[#5a5478] font-medium flex items-center justify-center gap-2 hover:border-indigo-300 hover:text-[#5b2ef7] hover:shadow-sm transition-all"
              >
                <Plus className="w-5 h-5" />
                Adicionar Lote
              </button>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 sticky bottom-0 bg-[#f4f2ff] z-10 rounded-b-[24px] border-t border-indigo-100">
          <div className="flex gap-3">
            <button 
              onClick={() => onSubmit({ ...formData, coverImage, bannerImage, selectedTickets, lotes, isDraft: true })}
              className="flex-1 bg-white border-2 border-indigo-100 text-[#5b2ef7] font-bold py-3.5 rounded-[12px] hover:border-indigo-300 hover:bg-indigo-50 transition-all"
            >
              Salvar nos Rascunhos
            </button>
            <button 
              onClick={handleFormSubmit}
              className="flex-1 bg-[#5b2ef7] text-white font-bold py-3.5 rounded-[12px] hover:bg-indigo-700 transition-all shadow-[0_4px_20px_rgba(91,46,247,0.25)]"
            >
              {editingEvent ? "Atualizar Evento" : "Publicar Evento"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateEventFormModal;
