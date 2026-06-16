import React, { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import mapboxgl from "mapbox-gl";
import type { Segment } from "../types";
import type { UserPosition } from "../hooks/useGeolocation";
import { DIFFICULTY_COLORS } from "../types";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

export const MAP_STYLES: Record<string, string> = {
  Satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  Streets: "mapbox://styles/mapbox/streets-v12",
  Outdoors: "mapbox://styles/mapbox/outdoors-v12",
};

export interface MapHandle {
  recenter: () => void;
  setStyle: (name: string) => void;
}

interface Props {
  segments: Segment[];
  highlightId: number | null;
  flyToSegmentId: number | null;
  userLocation: UserPosition | null;
  followUser: boolean;
}

function upsertTerrainAndSky(map: mapboxgl.Map) {
  if (!map.getSource("mapbox-dem")) {
    map.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.mapbox-terrain-dem-v1",
      tileSize: 512,
      maxzoom: 14,
    });
  }
  map.setTerrain({ source: "mapbox-dem", exaggeration: 1.4 });

  if (!map.getLayer("sky")) {
    map.addLayer({
      id: "sky",
      type: "sky",
      paint: {
        "sky-type": "atmosphere",
        "sky-atmosphere-sun": [0.0, 0.0],
        "sky-atmosphere-sun-intensity": 15,
      },
    });
  }
}

function upsertUserLocationLayers(map: mapboxgl.Map) {
  if (!map.getSource("user-location")) {
    map.addSource("user-location", {
      type: "geojson",
      data: { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [0, 0] } },
    });

    map.addLayer({
      id: "user-location-pulse",
      type: "circle",
      source: "user-location",
      paint: {
        "circle-radius": 14,
        "circle-color": "#4285f4",
        "circle-opacity": 0.25,
      },
    });

    map.addLayer({
      id: "user-location-dot",
      type: "circle",
      source: "user-location",
      paint: {
        "circle-radius": 7,
        "circle-color": "#4285f4",
        "circle-stroke-width": 2.5,
        "circle-stroke-color": "#ffffff",
      },
    });
  }
}

export const MapView = forwardRef<MapHandle, Props>(
  ({ segments, highlightId, flyToSegmentId, userLocation, followUser }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const readyRef = useRef(false);
    const lastFollowRef = useRef(0);

    /* ── initialise map once ──────────────────────────── */
    useEffect(() => {
      if (!containerRef.current || mapRef.current) return;

      mapboxgl.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [0, 30],
        zoom: 2,
        pitch: 50,
        bearing: 0,
        antialias: true,
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.on("style.load", () => {
        upsertTerrainAndSky(map);
        upsertUserLocationLayers(map);
        readyRef.current = true;
      });

      mapRef.current = map;

      return () => {
        map.remove();
        mapRef.current = null;
        readyRef.current = false;
      };
    }, []);

    /* ── draw / update segments ───────────────────────── */
    const drawSegments = useCallback(() => {
      const map = mapRef.current;
      if (!map || !readyRef.current || segments.length === 0) return;

      for (let i = 0; i < 200; i++) {
        const lid = `seg-${i}`;
        if (map.getLayer(lid)) map.removeLayer(lid);
        if (map.getSource(lid)) map.removeSource(lid);
      }

      segments.forEach((seg) => {
        const coords = seg.points.map((p) => [p.lon, p.lat, p.ele]);
        const id = `seg-${seg.id}`;

        map.addSource(id, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: coords },
          },
        });

        map.addLayer({
          id,
          type: "line",
          source: id,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": DIFFICULTY_COLORS[seg.level],
            "line-width": 4,
            "line-opacity": 0.9,
          },
        });
      });

      upsertUserLocationLayers(map);

      const allCoords = segments.flatMap((s) =>
        s.points.map((p) => [p.lon, p.lat] as [number, number]),
      );
      const bounds = new mapboxgl.LngLatBounds(allCoords[0], allCoords[0]);
      allCoords.forEach((c) => bounds.extend(c));
      map.fitBounds(bounds, { padding: 60, duration: 1200 });
    }, [segments]);

    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;

      if (readyRef.current) {
        drawSegments();
      } else {
        map.once("style.load", drawSegments);
      }
    }, [drawSegments]);

    /* ── highlight segment ────────────────────────────── */
    useEffect(() => {
      const map = mapRef.current;
      if (!map || !readyRef.current) return;

      segments.forEach((seg) => {
        const lid = `seg-${seg.id}`;
        if (map.getLayer(lid)) {
          map.setPaintProperty(lid, "line-width", seg.id === highlightId ? 7 : 4);
          map.setPaintProperty(
            lid,
            "line-opacity",
            highlightId === null || seg.id === highlightId ? 0.9 : 0.4,
          );
        }
      });
    }, [highlightId, segments]);

    /* ── fly to manually selected segment ───────────── */
    useEffect(() => {
      const map = mapRef.current;
      if (!map || !readyRef.current || flyToSegmentId === null) return;

      const seg = segments.find((s) => s.id === flyToSegmentId);
      if (seg?.points.length) {
        const mid = seg.points[Math.floor(seg.points.length / 2)];
        map.flyTo({ center: [mid.lon, mid.lat], zoom: 14, duration: 900 });
      }
    }, [flyToSegmentId, segments]);

    /* ── user location marker + follow ────────────────── */
    useEffect(() => {
      const map = mapRef.current;
      if (!map || !readyRef.current) return;

      const source = map.getSource("user-location") as mapboxgl.GeoJSONSource | undefined;
      if (!source) return;

      if (!userLocation) {
        source.setData({
          type: "Feature",
          properties: {},
          geometry: { type: "Point", coordinates: [0, 0] },
        });
        if (map.getLayer("user-location-dot")) {
          map.setLayoutProperty("user-location-dot", "visibility", "none");
          map.setLayoutProperty("user-location-pulse", "visibility", "none");
        }
        return;
      }

      if (map.getLayer("user-location-dot")) {
        map.setLayoutProperty("user-location-dot", "visibility", "visible");
        map.setLayoutProperty("user-location-pulse", "visibility", "visible");
      }

      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [userLocation.lon, userLocation.lat],
        },
      });

      if (followUser) {
        const now = Date.now();
        if (now - lastFollowRef.current > 2_000) {
          lastFollowRef.current = now;
          map.easeTo({
            center: [userLocation.lon, userLocation.lat],
            duration: 800,
          });
        }
      }
    }, [userLocation, followUser]);

    /* ── recenter on route ────────────────────────────── */
    const handleRecenter = useCallback(() => {
      const map = mapRef.current;
      if (!map || segments.length === 0) return;
      const allCoords = segments.flatMap((s) =>
        s.points.map((p) => [p.lon, p.lat] as [number, number]),
      );
      const bounds = new mapboxgl.LngLatBounds(allCoords[0], allCoords[0]);
      allCoords.forEach((c) => bounds.extend(c));
      map.fitBounds(bounds, { padding: 60, duration: 1200 });
    }, [segments]);

    /* ── change map style ─────────────────────────────── */
    const handleStyleChange = useCallback(
      (name: string) => {
        const map = mapRef.current;
        if (!map) return;
        readyRef.current = false;
        map.setStyle(MAP_STYLES[name]);

        map.once("style.load", () => {
          upsertTerrainAndSky(map);
          readyRef.current = true;
          drawSegments();
        });
      },
      [drawSegments],
    );

    useImperativeHandle(
      ref,
      () => ({
        recenter: handleRecenter,
        setStyle: handleStyleChange,
      }),
      [handleRecenter, handleStyleChange],
    );

    return <div ref={containerRef} className="map-container" />;
  },
);

MapView.displayName = "MapView";
