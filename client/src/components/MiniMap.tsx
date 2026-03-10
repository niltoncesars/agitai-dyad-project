import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Corrigir ícones do Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MiniMapProps {
  latitude: number;
  longitude: number;
  address: string;
}

export function MiniMap({ latitude, longitude, address }: MiniMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Se já existir uma instância, removemos para criar uma nova com as novas coordenadas
    if (mapInstance.current) {
      mapInstance.current.remove();
    }

    const map = L.map(mapContainer.current, {
      center: [latitude, longitude],
      zoom: 15,
      zoomControl: false, // Mapa pequeno, melhor sem controles
      dragging: false,    // Estático como solicitado
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      boxZoom: false,
      keyboard: false
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
    }).addTo(map);

    L.marker([latitude, longitude], { icon: DefaultIcon })
      .addTo(map)
      .bindPopup(address);

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [latitude, longitude, address]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full rounded-xl overflow-hidden border border-border"
      style={{ background: "#f8fafc", zIndex: 0 }}
    />
  );
}
