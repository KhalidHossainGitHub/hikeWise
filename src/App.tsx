import React, { useState, useRef } from "react";
import { FileUpload } from "./components/FileUpload";
import { MapView, MAP_STYLES } from "./components/MapView";
import type { MapHandle } from "./components/MapView";
import { RouteSummary } from "./components/RouteSummary";
import { SegmentList } from "./components/SegmentList";
import { useGpxRoute } from "./hooks/useGpxRoute";
import "./App.css";

const App: React.FC = () => {
  const { segments, summary, loading, error, processGpx } = useGpxRoute();
  const [activeSegId, setActiveSegId] = useState<number | null>(null);
  const [mapStyle, setMapStyle] = useState("Satellite");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mapRef = useRef<MapHandle>(null);

  const hasRoute = segments.length > 0;

  return (
    <div className="app">
      {/* Map is always full-screen */}
      <MapView ref={mapRef} segments={segments} activeId={activeSegId} />

      {/* Upload overlay — centered on map */}
      {!hasRoute && (
        <div className="upload-overlay">
          <FileUpload onFile={processGpx} loading={loading} />
          {error && <p className="error-msg">⚠️ {error}</p>}
        </div>
      )}

      {/* Floating sidebar panel — slides in from left (desktop), bottom drawer (mobile) */}
      <aside className={`sidebar-panel ${hasRoute ? "sidebar-panel--open" : ""} ${drawerOpen ? "sidebar-panel--expanded" : ""}`}>
        {/* Mobile drawer handle */}
        <button
          className="drawer-handle"
          onClick={() => setDrawerOpen((prev) => !prev)}
          aria-label={drawerOpen ? "Collapse panel" : "Expand panel"}
        >
          <span className="drawer-handle-bar" />
          {!drawerOpen && summary && (
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

        {summary && <RouteSummary summary={summary} />}

        {/* ── Map controls row ── */}
        {hasRoute && (
          <div className="panel-controls">
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
            activeId={activeSegId}
            onSelect={(id) =>
              setActiveSegId((prev) => (prev === id ? null : id))
            }
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
