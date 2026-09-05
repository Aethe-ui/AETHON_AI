import { useState } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN, MAPBOX_STYLE, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "../../lib/mapbox";
import type { Geo } from "../../types";
import { MapPin, AlertCircle } from "lucide-react";

interface GeoMapProps {
  geo: Geo;
  label?: string;
}

export function GeoMap({ geo, label }: GeoMapProps) {
  const hasToken = Boolean(MAPBOX_TOKEN && MAPBOX_TOKEN !== "pk.xxxxx");
  const hasCoords = typeof geo.lat === "number" && typeof geo.lon === "number";

  const [viewState, setViewState] = useState({
    longitude: hasCoords ? geo.lon! : DEFAULT_MAP_CENTER[0],
    latitude: hasCoords ? geo.lat! : DEFAULT_MAP_CENTER[1],
    zoom: hasCoords ? 4 : DEFAULT_MAP_ZOOM,
  });

  if (!hasToken) {
    return (
      <div className="geo-map-fallback">
        <AlertCircle size={24} className="geo-map-fallback__icon" />
        <div>
          <p className="geo-map-fallback__title">Map unavailable</p>
          <p className="geo-map-fallback__body">
            Set <code>VITE_MAPBOX_TOKEN</code> in your <code>.env</code> to enable geolocation visualization.
          </p>
          {hasCoords && (
            <p className="geo-map-fallback__coords">
              {geo.country ?? "Unknown country"} · {geo.city ?? "Unknown city"} ·
              Radius ~{geo.accuracyRadiusKm} km · Confidence: {geo.confidence}
            </p>
          )}
        </div>
      </div>
    );
  }

  // GeoJSON circle source for accuracy radius
  const circleSource = hasCoords
    ? {
        type: "FeatureCollection" as const,
        features: [
          {
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: [geo.lon!, geo.lat!],
            },
            properties: {},
          },
        ],
      }
    : null;

  const circleLayer = {
    id: "accuracy-circle",
    type: "circle" as const,
    source: "accuracy-area",
    paint: {
      "circle-radius": {
        stops: [
          [0, 0],
          [20, (geo.accuracyRadiusKm * 1000) / 0.075],
        ],
        base: 2,
      } as unknown as number,
      "circle-color": "rgba(63, 208, 201, 0.12)",
      "circle-stroke-color": "rgba(63, 208, 201, 0.5)",
      "circle-stroke-width": 1.5,
    },
  };

  return (
    <div className="geo-map">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle={MAPBOX_STYLE}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        {hasCoords && circleSource && (
          <Source id="accuracy-area" type="geojson" data={circleSource}>
            <Layer {...(circleLayer as any)} />
          </Source>
        )}
        {hasCoords && (
          <Marker longitude={geo.lon!} latitude={geo.lat!} anchor="bottom">
            <div
              className="geo-map__marker"
              aria-label={`Approximate location: ${geo.city ?? ""}, ${geo.country ?? ""}`}
            >
              <MapPin size={22} />
            </div>
          </Marker>
        )}
      </Map>
      <div className="geo-map__legend">
        <span className="geo-map__legend-item">
          <strong>{geo.country ?? "Unknown"}</strong>
          {geo.city ? ` · ${geo.city}` : ""}
        </span>
        <span className="geo-map__legend-sep">·</span>
        <span className="geo-map__legend-item">~{geo.accuracyRadiusKm} km radius</span>
        <span className="geo-map__legend-sep">·</span>
        <span className="geo-map__legend-item">Confidence: {geo.confidence}</span>
        {label && (
          <>
            <span className="geo-map__legend-sep">·</span>
            <span className="geo-map__legend-item">{label}</span>
          </>
        )}
      </div>
    </div>
  );
}
