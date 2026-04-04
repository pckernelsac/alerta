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
import type { DenunciaAdmin } from "../../api/admin.ts";

const SATIPO_CENTER: [number, number] = [-11.12, -74.63];
const DEFAULT_ZOOM = 13;

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  resuelta: "Resuelta",
};

function MapResize() {
  const map = useMap();
  useEffect(() => {
    const onResize = () => map.invalidateSize();
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

function FitBounds({ denuncias }: { denuncias: DenunciaAdmin[] }) {
  const map = useMap();
  useEffect(() => {
    if (denuncias.length === 0) {
      map.setView(SATIPO_CENTER, DEFAULT_ZOOM);
      return;
    }
    if (denuncias.length === 1) {
      map.setView([denuncias[0].lat, denuncias[0].lon], 15);
      return;
    }
    const bounds = L.latLngBounds(
      denuncias.map((d) => [d.lat, d.lon] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 17 });
  }, [denuncias, map]);
  return null;
}

function FlyToSelected({
  denuncias,
  selectedId,
}: {
  denuncias: DenunciaAdmin[];
  selectedId: string | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const d = denuncias.find((x) => x.id === selectedId);
    if (!d) return;
    map.flyTo([d.lat, d.lon], Math.max(map.getZoom(), 15), { duration: 0.6 });
  }, [selectedId, denuncias, map]);
  return null;
}

type AdminMapProps = {
  denuncias: DenunciaAdmin[];
  selectedId: string | null;
};

export function AdminMap({ denuncias, selectedId }: AdminMapProps) {
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
      <FlyToSelected denuncias={denuncias} selectedId={selectedId} />
      {denuncias.map((d) => (
        <Marker key={d.id} position={[d.lat, d.lon]}>
          <Popup>
            <div className="min-w-[180px] text-slate-900">
              <div className="flex items-center justify-between">
                <p className="font-semibold capitalize">{d.tipo}</p>
                <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium">
                  {ESTADO_LABEL[d.estado] ?? d.estado}
                </span>
              </div>
              <p className="mt-0.5 text-sm">{d.descripcion}</p>
              {d.foto_url && (
                <img
                  src={d.foto_url}
                  alt="Foto"
                  className="mt-1.5 max-h-32 w-full rounded object-cover"
                />
              )}
              <p className="mt-1 text-xs text-slate-500">
                {d.user_email ?? "sin usuario"}
              </p>
              <p className="text-xs text-slate-600">
                {d.lat.toFixed(5)}, {d.lon.toFixed(5)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
