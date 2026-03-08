import { useState, useEffect } from "react";
import { Heart, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { events, formatCurrency } from "@/lib/mock-data";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "wouter";
import { toast } from "sonner";

// SVG do ícone de lixeira
const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

// SVG do ícone de calendário personalizado
const CalendarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="2" fill="#e9030f" stroke="#c0020c" strokeWidth="1"/>
    <line x1="3" y1="10" x2="21" y2="10" stroke="#c0020c" strokeWidth="1"/>
    <rect x="7" y="12" width="2" height="2" fill="white"/>
    <rect x="11" y="12" width="2" height="2" fill="white"/>
    <rect x="15" y="12" width="2" height="2" fill="white"/>
    <rect x="7" y="16" width="2" height="2" fill="white"/>
    <rect x="11" y="16" width="2" height="2" fill="white"/>
    <rect x="15" y="16" width="2" height="2" fill="white"/>
  </svg>
);

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadFavorites = () => {
    const favorites = JSON.parse(localStorage.getItem("agitai_favorites") || "[]");
    setFavoriteIds(favorites);
  };

  useEffect(() => {
    loadFavorites();
    window.addEventListener("favorites_updated", loadFavorites);
    return () => window.removeEventListener("favorites_updated", loadFavorites);
  }, []);

  const [localEvents, setLocalEvents] = useState<any[]>([]);
  
  useEffect(() => {
    const savedEvents = localStorage.getItem('agitai_events');
    if (savedEvents) {
      try {
        setLocalEvents(JSON.parse(savedEvents));
      } catch (error) {
        console.error('Erro ao carregar eventos do localStorage:', error);
      }
    }
  }, []);

  const allEvents = [...events, ...localEvents];

  const favoriteEvents = allEvents.filter((event) => 
    favoriteIds.includes(event.id) &&
    (searchQuery === "" || event.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRemoveFavorite = (eventId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setRemovingId(eventId);
    
    setTimeout(() => {
      const newFavorites = favoriteIds.filter(id => id !== eventId);
      localStorage.setItem("agitai_favorites", JSON.stringify(newFavorites));
      setFavoriteIds(newFavorites);
      toast.success("Removido dos favoritos");
      window.dispatchEvent(new Event("favorites_updated"));
      setRemovingId(null);
    }, 300);
  };

  return (
    <DashboardLayout>
      <style>{`
        @font-face {
          font-family: 'VinilaVariable';
          src: url('/fonts/VinilaVariable-Regular.otf') format('opentype');
          font-weight: 100 900;
        }

        .favorites-section {
          background-color: #f0f2f5;
          padding: 32px;
          min-height: 100vh;
        }

        .favorites-title {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 20px;
          font-family: 'VinilaVariable', 'Open Sans', sans-serif;
        }

        .favorites-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        @media (max-width: 768px) {
          .favorites-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .favorites-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .event-card {
          width: 320px;
          background-color: #ffffff;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
          opacity: 1;
          transform: translateY(0);
        }

        .event-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
        }

        .event-card.removing {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s ease;
        }

        .event-card-hero {
          height: 180px;
          overflow: hidden;
          position: relative;
          border-radius: 20px 20px 0 0;
        }

        .event-card-hero img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .event-card:hover .event-card-hero img {
          transform: scale(1.05);
        }

        .event-card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.35) 100%);
        }

        .event-card-badge {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background-color: #1a73e8;
          color: white;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
          letter-spacing: 0.3px;
          font-family: 'VinilaVariable', 'Open Sans', sans-serif;
        }

        .event-card-delete-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background-color: #ffffff;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .event-card-delete-btn:hover {
          background-color: #ffe5e5;
        }

        .event-card-body {
          padding: 18px 18px 20px;
        }

        .event-card-title {
          font-size: 18px;
          font-weight: 700;
          color: #1a73e8;
          margin-bottom: 8px;
          line-height: 1.25;
          font-family: 'VinilaVariable', 'Open Sans', sans-serif;
        }

        .event-card-date {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          font-weight: 630;
          color: #e9030f;
          line-height: 120%;
          text-transform: capitalize;
          margin-bottom: 6px;
          font-family: 'VinilaVariable', 'Open Sans', sans-serif;
        }

        .event-card-city {
          font-size: 13px;
          font-weight: 600;
          color: #000;
          margin-bottom: 2px;
          font-family: 'VinilaVariable', 'Open Sans', sans-serif;
        }

        .event-card-address {
          font-size: 10px;
          font-weight: 400;
          color: #000;
          opacity: 0.6;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-bottom: 22px;
          font-family: 'VinilaVariable', 'Open Sans', sans-serif;
        }

        .event-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .event-card-price {
          font-size: 17px;
          font-weight: 700;
          color: #1a73e8;
          font-family: 'VinilaVariable', 'Open Sans', sans-serif;
        }

        .event-card-button {
          background-color: #eef3fb;
          color: #1a73e8;
          border: none;
          border-radius: 10px;
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
          font-family: 'VinilaVariable', 'Open Sans', sans-serif;
          text-decoration: none;
        }

        .event-card-button:hover {
          background-color: #d6e4fc;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          text-align: center;
        }

        .empty-state-icon {
          width: 64px;
          height: 64px;
          background-color: #e8eaed;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .empty-state-title {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
          font-family: 'VinilaVariable', 'Open Sans', sans-serif;
        }

        .empty-state-text {
          font-size: 14px;
          color: #666;
          max-width: 300px;
          margin-bottom: 24px;
          font-family: 'VinilaVariable', 'Open Sans', sans-serif;
        }
      `}</style>

      <div className="favorites-section">
        {/* Search Bar */}
        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar favoritos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="favorites-title">Favoritos</h1>

        {/* Cards Grid or Empty State */}
        {favoriteEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Heart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="empty-state-title">Sua lista está vazia</h3>
            <p className="empty-state-text">
              Explore o mapa e clique no coração para salvar os eventos que você mais gosta.
            </p>
            <Link href="/map">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                Explorar Eventos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="favorites-grid">
            {favoriteEvents.map((event) => (
              <div
                key={event.id}
                className={`event-card ${removingId === event.id ? "removing" : ""}`}
              >
                {/* Hero Section */}
                <div className="event-card-hero">
                  <img src={event.image} alt={event.title} />
                  <div className="event-card-overlay"></div>
                  
                  {/* Badge */}
                  <div className="event-card-badge">{event.category}</div>
                  
                  {/* Delete Button */}
                  <button
                    className="event-card-delete-btn"
                    onClick={(e) => handleRemoveFavorite(event.id, e)}
                    title="Remover dos favoritos"
                  >
                    <TrashIcon />
                  </button>
                </div>

                {/* Body */}
                <div className="event-card-body">
                  <h3 className="event-card-title">{event.title}</h3>
                  
                  {/* Date */}
                  <div className="event-card-date">
                    <CalendarIcon />
                    {event.date ? new Date(event.date).toLocaleDateString("pt-BR") : "Data não informada"}
                  </div>
                  
                  {/* City */}
                  <div className="event-card-city">
                    {event.city_name || "Cidade não informada"}
                  </div>
                  
                  {/* Address */}
                  <div className="event-card-address">
                    {event.address ? event.address.split(',')[0] : "Endereço não informado"}
                  </div>
                  
                  {/* Footer */}
                  <div className="event-card-footer">
                    <span className="event-card-price">
                      {event.price === 0 ? "Gratuito" : formatCurrency(event.price)}
                    </span>
                    <Link href={`/map?event=${event.id}`}>
                      <button className="event-card-button">
                        Ver no Mapa
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
