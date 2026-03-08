
import React, { useState, useRef, useEffect } from "react";
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
  const getInitialFormData = () => {
    if (editingEvent) {
      return {
        title: editingEvent.title || "",
        date: editingEvent.date ? new Date(editingEvent.date).toISOString().split('T')[0] : "",
        startTime: "",
        endTime: "",
        gateTime: "",
        censorship: "",
        category: editingEvent.category || "",
        organizer: editingEvent.organizer_name || "",
        locationName: "",
        city: editingEvent.city_name || "",
        state: "",
        address: "",
        tickets: [],
      };
    }
    return {
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
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [coverImage, setCoverImage] = useState<string | null>(editingEvent?.image || null);
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

  useEffect(() => {
    if (editingEvent && isOpen) {
      setFormData(getInitialFormData());
      setCoverImage(editingEvent.image || null);
    }
  }, [editingEvent, isOpen]);

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
        ticketType: selectedTickets[0] || "Pista",
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[24px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-[24px]">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold">{editingEvent ? "Editar" : "Criar Novo"} <span className="text-[#5b2ef7]">Evento</span></h2>
              <p className="text-sm text-gray-500 mt-1">TENANT</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Images Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-[#5b2ef7] uppercase">Imagens do Evento</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Cover Image */}
              <div
                onClick={() => coverInputRef.current?.click()}
                className="border-2 border-dashed border-red-300 rounded-[12px] p-6 text-center cursor-pointer hover:bg-red-50 transition-colors"
              >
                {coverImage ? (
                  <div className="relative">
                    <img src={coverImage} alt="Capa" className="w-full h-32 object-cover rounded-lg" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoverImage(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="font-semibold text-gray-800">Capa do Cartão</p>
                    <p className="text-xs text-gray-500 mt-1">Clique para adicionar</p>
                    <p className="text-xs text-gray-400 mt-2">415 × 510 px</p>
                  </div>
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'cover')}
                  className="hidden"
                />
              </div>

              {/* Banner Image */}
              <div
                onClick={() => bannerInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 rounded-[12px] p-6 text-center cursor-pointer hover:bg-blue-50 transition-colors"
              >
                {bannerImage ? (
                  <div className="relative">
                    <img src={bannerImage} alt="Banner" className="w-full h-32 object-cover rounded-lg" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBannerImage(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="font-semibold text-gray-800">Banner do Evento</p>
                    <p className="text-xs text-gray-500 mt-1">Clique para adicionar</p>
                    <p className="text-xs text-gray-400 mt-2">1056 × 553 px</p>
                  </div>
                )}
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'banner')}
                  className="hidden"
                />
              </div>
            </div>
          </section>

          {/* Event Details Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-[#5b2ef7] uppercase">Detalhes do Evento</h3>
            <div className="space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Nome do Evento"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-[12px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5b2ef7]"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  name="date"
                  placeholder="Data do Evento"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-[12px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5b2ef7]"
                />
                <input
                  type="time"
                  name="startTime"
                  placeholder="Horário de Início"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-[12px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5b2ef7]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="time"
                  name="endTime"
                  placeholder="Horário de Término"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-[12px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5b2ef7]"
                />
                <input
                  type="time"
                  name="gateTime"
                  placeholder="Abertura dos Portões"
                  value={formData.gateTime}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-[12px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5b2ef7]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select
                  name="censorship"
                  value={formData.censorship}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-[12px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5b2ef7]"
                >
                  <option value="">Selecione</option>
                  <option value="Livre">Livre</option>
                  <option value="12">12 anos</option>
                  <option value="14">14 anos</option>
                  <option value="16">16 anos</option>
                  <option value="18">18 anos</option>
                </select>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-[12px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5b2ef7]"
                >
                  <option value="">Selecione a categoria</option>
                  {eventCategories.map((cat) => (
                    <optgroup key={cat.label} label={cat.label}>
                      {cat.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <input
                type="text"
                name="organizer"
                placeholder="Organização"
                value={formData.organizer}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-[12px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5b2ef7]"
              />
            </div>
          </section>

          {/* Location Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-[#5b2ef7] uppercase">Local</h3>
            <div className="space-y-4">
              <input
                type="text"
                name="locationName"
                placeholder="Nome do Local"
                value={formData.locationName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-[12px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5b2ef7]"
              />
              <input
                type="text"
                name="city"
                placeholder="Cidade"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-[12px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5b2ef7]"
              />
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-[12px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5b2ef7]"
              >
                <option value="">UF</option>
                {brazilianStates.map((state) => (
                  <option key={state.value} value={state.value}>{state.label}</option>
                ))}
              </select>
              <input
                type="text"
                name="address"
                placeholder="Endereço Completo"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-[12px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5b2ef7]"
              />
            </div>
          </section>

          {/* Tickets Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-[#5b2ef7] uppercase">Ingressos & Lotes</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800">Tipos de Ingresso</h4>
                <button
                  onClick={addLote}
                  className="text-[#5b2ef7] text-sm font-semibold flex items-center gap-1 hover:text-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Lote
                </button>
              </div>

              <div className="space-y-2">
                {["Pista", "Camarote", "VIP", "Backstage"].map((type) => (
                  <label key={type} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedTickets.includes(type)}
                      onChange={() => toggleTicket(type)}
                      className="w-5 h-5 rounded-full accent-[#5b2ef7]"
                    />
                    <span className="font-medium text-gray-700">{type}</span>
                  </label>
                ))}
              </div>

              {/* Lotes */}
              <div className="space-y-4 mt-6">
                {lotes.map((lote) => (
                  <div key={lote.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-gray-800">Lote {lote.id}</h5>
                      {lotes.length > 1 && (
                        <button
                          onClick={() => removeLote(lote.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={lote.ticketType}
                        onChange={(e) => handleLoteChange(lote.id, "ticketType", e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b2ef7]"
                      >
                        {selectedTickets.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Quantidade de Ingressos"
                        value={lote.quantity}
                        onChange={(e) => handleLoteChange(lote.id, "quantity", e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b2ef7]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                        <span className="text-gray-500 mr-2">R$</span>
                        <input
                          type="number"
                          placeholder="0,00"
                          value={lote.price}
                          onChange={(e) => handleLoteChange(lote.id, "price", e.target.value)}
                          className="flex-1 border-0 focus:outline-none focus:ring-0 text-sm"
                        />
                      </div>
                      <input
                        type="datetime-local"
                        value={lote.startDate}
                        onChange={(e) => handleLoteChange(lote.id, "startDate", e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b2ef7]"
                      />
                    </div>
                    <input
                      type="datetime-local"
                      value={lote.endDate}
                      onChange={(e) => handleLoteChange(lote.id, "endDate", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b2ef7]"
                    />
                  </div>
                ))}
              </div>
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
              {editingEvent ? "Atualizar Evento" : "Criar Evento"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateEventFormModal;
