import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { DenunciaMapa } from "../../types/denuncia.ts";

const SATIPO_CENTER: [number, number] = [-11.12, -74.63];
const DEFAULT_ZOOM = 13;

function MapResize() {
  const map = useMap();
  useEffect(() => {
    const onResize = () => {
      map.invalidateSize();
    };
    onResize();
    const t = window.setTimeout(onResize, 200);
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [map]);
  return null;
}

function FitBounds({ denuncias }: { denuncias: DenunciaMapa[] }) {
  const map = useMap();
  useEffect(() => {
    if (denuncias.length === 0) {
      map.setView(SATIPO_CENTER, DEFAULT_ZOOM);
      return;
    }
    if (denuncias.length === 1) {
      const { lat, lon } = denuncias[0];
      map.setView([lat, lon], 15);
      return;
    }
    const bounds = L.latLngBounds(
      denuncias.map((d) => [d.lat, d.lon] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 17 });
  }, [denuncias, map]);
  return null;
}

type DashboardMapProps = {
  denuncias: DenunciaMapa[];
  focusId: string | null;
};

function FlyToSelection({ focusId, denuncias }: DashboardMapProps) {
  const map = useMap();
  useEffect(() => {
    if (!focusId) return;
    const d = denuncias.find((x) => x.id === focusId);
    if (!d) return;
    map.flyTo([d.lat, d.lon], Math.max(map.getZoom(), 15), { duration: 0.6 });
  }, [focusId, denuncias, map]);
  return null;
}

export function DashboardMap({ denuncias, focusId }: DashboardMapProps) {
  return (
    <MapContainer
      center={SATIPO_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full min-h-[200px]"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapResize />
      <FitBounds denuncias={denuncias} />
      <FlyToSelection focusId={focusId} denuncias={denuncias} />
      {denuncias.map((d) => (
        <Marker key={d.id} position={[d.lat, d.lon]}>
          <Popup>
            <div className="min-w-[160px] text-slate-900">
              <p className="font-semibold capitalize">{d.tipo}</p>
              <p className="text-sm">{d.descripcion}</p>
              {d.foto_url && (
                <img
                  src={d.foto_url}
                  alt="Foto de denuncia"
                  className="mt-1.5 max-h-32 w-full rounded object-cover"
                />
              )}
              <p className="mt-1 text-xs text-slate-600">
                {d.lat.toFixed(5)}, {d.lon.toFixed(5)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
