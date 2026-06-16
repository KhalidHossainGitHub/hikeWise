import React, { useState, useRef, useMemo } from "react";
import { FileUpload } from "./components/FileUpload";
import { MapView, MAP_STYLES } from "./components/MapView";
import type { MapHandle } from "./components/MapView";
import { RouteSummary } from "./components/RouteSummary";
import { SegmentList } from "./components/SegmentList";
import { TrackIndicator } from "./components/TrackIndicator";
import { useGpxRoute } from "./hooks/useGpxRoute";
import { useMobileDrawer } from "./hooks/useMobileDrawer";
import { useDrawerSwipe } from "./hooks/useDrawerSwipe";
import { useGeolocation } from "./hooks/useGeolocation";
import {
  findNearestSegment,
  OFF_TRAIL_THRESHOLD_M,
} from "./utils/trailLocation";
import "./App.css";

const App: React.FC = () => {
  const { segments, summary, loading, error, processGpx } = useGpxRoute();
  const [activeSegId, setActiveSegId] = useState<number | null>(null);
  const [flyToSegId, setFlyToSegId] = useState<number | null>(null);
  const [mapStyle, setMapStyle] = useState("Satellite");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const { position, error: geoError, tracking, toggleTracking } = useGeolocation();
  const {
    drawerOpen,
    drawerClosing,
    drawerExpanded,
    drawerVisible,
    openDrawer,
    closeDrawer,
  } = useMobileDrawer();
  const mapRef = useRef<MapHandle>(null);
  const drawerSwipe = useDrawerSwipe(drawerOpen, openDrawer, closeDrawer);

  const hasRoute = segments.length > 0;

  const nearestOnTrail = useMemo(() => {
    if (!position || !hasRoute) return null;
    return findNearestSegment(segments, position.lat, position.lon);
  }, [position, segments, hasRoute]);

  const onTrail =
    nearestOnTrail !== null &&
    nearestOnTrail.distanceMeters <= OFF_TRAIL_THRESHOLD_M;

  const trackedSegmentId = onTrail ? nearestOnTrail!.segmentId : null;

  const highlightId = tracking && trackedSegmentId !== null
    ? trackedSegmentId
    : activeSegId;

  const listActiveId = tracking && trackedSegmentId !== null
    ? trackedSegmentId
    : activeSegId;

  return (
    <div className="app">
      {/* Map is always full-screen */}
      <MapView
        ref={mapRef}
        segments={segments}
        highlightId={highlightId}
        flyToSegmentId={flyToSegId}
        userLocation={tracking ? position : null}
        followUser={tracking}
      />

      {tracking && position && (
        <TrackIndicator
          onTrail={onTrail}
          segment={segments.find((s) => s.id === trackedSegmentId)}
          distanceMeters={nearestOnTrail?.distanceMeters ?? Infinity}
        />
      )}

      {/* Upload overlay — centered on map */}
      {!hasRoute && (
        <div className="upload-overlay">
          <FileUpload onFile={processGpx} loading={loading} />
          {error && <p className="error-msg">⚠️ {error}</p>}
        </div>
      )}

      {/* Tap outside to collapse the mobile drawer */}
      {drawerVisible && (
        <button
          type="button"
          className="drawer-backdrop"
          onClick={closeDrawer}
          aria-label="Close route panel"
        />
      )}

      {/* Floating sidebar panel — slides in from left (desktop), bottom drawer (mobile) */}
      <aside
        className={`sidebar-panel ${hasRoute ? "sidebar-panel--open" : ""} ${drawerExpanded ? "sidebar-panel--expanded" : ""} ${drawerClosing ? "sidebar-panel--closing" : ""}`}
      >
        {/* Mobile drawer handle */}
        <button
          className="drawer-handle"
          onClick={drawerSwipe.onClick}
          onTouchStart={drawerSwipe.onTouchStart}
          onTouchMove={drawerSwipe.onTouchMove}
          onTouchEnd={drawerSwipe.onTouchEnd}
          aria-label={drawerOpen ? "Collapse panel" : "Expand panel"}
        >
          <span className="drawer-handle-bar" />
          {!drawerVisible && summary && (
            <div className="drawer-peek">
              <span className="drawer-peek-item">
                <strong>{summary.totalDistance.toFixed(1)}</strong> km
              </span>
              <span className="drawer-peek-divider">·</span>
              <span className="drawer-peek-item">
                <strong>{summary.totalAscent.toFixed(0)}</strong> m↑
              </span>
              <span className="drawer-peek-divider">·</span>
              <span className="drawer-peek-item">
                Max <strong>{summary.maxDifficulty.toFixed(0)}</strong>
              </span>
            </div>
          )}
        </button>

        {summary && (
          <RouteSummary
            summary={summary}
            collapsible
            expanded={summaryOpen}
            onToggle={() => setSummaryOpen((prev) => !prev)}
          />
        )}

        {/* ── Map controls row ── */}
        {hasRoute && (
          <div className="panel-controls">
            <button
              type="button"
              className={`panel-ctrl-btn panel-ctrl-btn--track${tracking ? " active" : ""}`}
              onClick={toggleTracking}
            >
              {tracking ? "◎ Stop Tracking" : "◎ Track Location"}
            </button>

            {geoError && <p className="track-error">⚠ {geoError}</p>}

            <button
              className="panel-ctrl-btn"
              onClick={() => mapRef.current?.recenter()}
            >
              ⌖ Recenter
            </button>

            <div className="panel-style-picker">
              <span className="panel-style-label">Map Style</span>
              <div className="panel-style-options">
                {Object.keys(MAP_STYLES).map((name) => (
                  <button
                    key={name}
                    className={`panel-style-btn ${name === mapStyle ? "active" : ""}`}
                    onClick={() => {
                      setMapStyle(name);
                      mapRef.current?.setStyle(name);
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {hasRoute && (
          <SegmentList
            segments={segments}
            activeId={listActiveId}
            onSelect={(id) => {
              setActiveSegId((prev) => (prev === id ? null : id));
              setFlyToSegId(id);
            }}
          />
        )}
        {hasRoute && (
          <button
            className="reset-btn"
            onClick={() => window.location.reload()}
          >
            ↩ Load another GPX
          </button>
        )}
      </aside>
    </div>
  );
};

export default App;
