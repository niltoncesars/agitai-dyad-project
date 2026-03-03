import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Corrigir ícones do Leaflet que podem não carregar corretamente com o Vite
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  onMapReady?: (map: any) => void;
}

export function MapView({
  className,
  initialCenter = { lat: -14.2350, lng: -51.9253 },
  initialZoom = 4,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    // Inicializar o mapa Leaflet
    const map = L.map(mapContainer.current, {
      center: [initialCenter.lat, initialCenter.lng],
      zoom: initialZoom,
      zoomControl: true,
    });

    // Adicionar camada de tiles do OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstance.current = map;
    setIsReady(true);

    // Adaptador para manter compatibilidade básica com as chamadas do Google Maps no componente pai
    const mapAdapter = {
      setCenter: (pos: { lat: number; lng: number }) => map.setView([pos.lat, pos.lng]),
      setZoom: (zoom: number) => map.setZoom(zoom),
      getZoom: () => map.getZoom(),
      // Adicionar outros métodos conforme necessário para o MapPage.tsx
      leafletInstance: map,
    };

    if (onMapReady) {
      onMapReady(mapAdapter as any);
    }

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <div 
      ref={mapContainer} 
      className={cn("w-full h-[500px] z-0", className)} 
      style={{ background: "#f8fafc" }}
    />
  );
}
