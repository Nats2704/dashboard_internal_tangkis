"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { CONNECTIVITY } from "@/lib/constants/status";
import { formatRelative } from "@/lib/utils/format";
import { MARKER_COLOR, REGIONS, type MapFilter, type RegionKey, type SiteMarker } from "./map-types";

// Peta dasar OpenStreetMap: tanpa API key. Bisa diganti lewat env bila memakai penyedia berbayar.
const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function FitRegion({ region }: { region: RegionKey }) {
  const map = useMap();

  useEffect(() => {
    // Saat mount, container map bisa masih berukuran 0 (CSS dev-mode belum
    // sempat terpasang, atau parent flex belum selesai layout). Leaflet
    // menyimpan ukuran itu sebagai cache, jadi fitBounds tanpa
    // invalidateSize() dulu bisa menghasilkan zoom yang sangat jauh
    // (mencoba memuat satu tile di zoom 19) dan peta tampak kosong.
    map.invalidateSize();
    map.fitBounds(REGIONS[region].bounds, { padding: [24, 24] });
  }, [map, region]);

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
}

function markerRadius(total: number) {
  return 6 + Math.sqrt(total) * 1.5;
}

interface UnitMapProps {
  sites: SiteMarker[];
  filter: MapFilter;
  region: RegionKey;
}

export default function UnitMap({ sites, filter, region }: UnitMapProps) {
  const [tileErrors, setTileErrors] = useState(0);
  const [tilesLoaded, setTilesLoaded] = useState(false);
  const tilesFailed = tileErrors > 2 && !tilesLoaded;

  return (
    // absolute inset-0, bukan h-full: mengisi kotak relative induknya lewat
    // positioning, bukan lewat persentase tinggi. height:100% pada beberapa
    // rantai block/flex campuran gagal diresolusi Chromium meski induknya
    // sudah bertinggi pasti (terlihat langsung di DevTools: computed height
    // tetap 0px walau parent 380px) — inset-0 tidak punya masalah itu.
    <div className="absolute inset-0">
      <MapContainer
        bounds={REGIONS[region].bounds}
        scrollWheelZoom={false}
        zoomSnap={0.25}
        className="h-full w-full"
        attributionControl
        zoomControl
      >
        <FitRegion region={region} />
        <TileLayer
          url={TILE_URL}
          attribution={TILE_ATTRIBUTION}
          maxZoom={19}
          className="unit-map-tiles"
          eventHandlers={{
            tileerror: () => setTileErrors((n) => n + 1),
            tileload: () => setTilesLoaded(true),
          }}
        />
        {sites.map((site) => {
          const status = filter === "all" ? site.status : filter;
          const color = MARKER_COLOR[status];
          return (
            <CircleMarker
              key={site.building.id}
              center={[site.building.lat, site.building.lng]}
              radius={markerRadius(filter === "all" ? site.total : site.counts[filter])}
              pathOptions={{ color: "#ffffff", weight: 2, fillColor: color, fillOpacity: 0.9 }}
            >
              <Popup minWidth={240} maxWidth={280}>
                <SitePopup site={site} />
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      {tilesFailed ? (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[500] rounded-md border border-line bg-surface/95 px-3 py-2 text-[12px] text-muted">
          Peta dasar tidak dapat dimuat (tanpa koneksi internet). Posisi unit tetap ditampilkan.
        </div>
      ) : null}
    </div>
  );
}

function SitePopup({ site }: { site: SiteMarker }) {
  const focus = site.flagged[0] ?? site.sample;
  return (
    <div>
      <p className="text-[13px] font-semibold text-ink">{site.building.name}</p>
      <p className="text-[12px] text-muted">
        {site.building.area}, {site.building.city} · {site.total} unit
      </p>
      <p className="mt-2 flex gap-3 text-[12px]">
        <span className="text-success">{site.counts.online} online</span>
        <span className="text-danger">{site.counts.offline} offline</span>
        <span className="text-warning">{site.counts.maintenance} maint.</span>
      </p>
      {focus ? (
        <div className="mt-2.5 border-t border-line pt-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold">{focus.id}</span>
            <span
              className="text-[12px] font-medium"
              style={{ color: MARKER_COLOR[focus.connectivity ?? "online"] }}
            >
              {CONNECTIVITY[focus.connectivity ?? "online"].label}
            </span>
          </div>
          <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
            <dt className="text-muted">Last data</dt>
            <dd className="text-right">{formatRelative(focus.lastSeen)}</dd>
            <dt className="text-muted">Battery</dt>
            <dd className="text-right">{focus.batteryPct ?? "—"}%</dd>
            <dt className="text-muted">Signal</dt>
            <dd className="text-right">{focus.signalDbm !== null ? `${focus.signalDbm} dBm` : "—"}</dd>
          </dl>
          {site.flagged.length > 1 ? (
            <p className="mt-2 text-[12px] text-muted">
              +{site.flagged.length - 1} unit lain perlu perhatian:{" "}
              {site.flagged
                .slice(1, 5)
                .map((d) => d.id)
                .join(", ")}
            </p>
          ) : null}
        </div>
      ) : null}
      <Link
        href={`/devices?building=${site.building.id}`}
        className="mt-2.5 inline-block text-[12px] font-medium text-accent"
      >
        Lihat semua unit →
      </Link>
    </div>
  );
}
