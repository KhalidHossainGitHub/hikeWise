import React, { useCallback, useState } from "react";

const SAMPLE_TRAILS = [
  { file: "Bruce_Trail_Highway_6_Tunnel_to_King_Road.gpx", label: "Bruce Trail – Hwy 6 to King Rd" },
  { file: "Centennial_Ridges_Trail.gpx", label: "Centennial Ridges Trail" },
  { file: "Niagara_Whirlpool_Loop.gpx", label: "Niagara Whirlpool Loop" },
  { file: "Orchard_and_Vista_Loop.gpx", label: "Orchard & Vista Loop" },
  { file: "Rouge_Valley_Loop_Vista_and_Mast_Trails.gpx", label: "Rouge Valley Loop – Vista & Mast" },
];

interface Props {
  onFile: (text: string) => void;
  loading: boolean;
}

export const FileUpload: React.FC<Props> = ({ onFile, loading }) => {
  const [loadingTrail, setLoadingTrail] = useState<string | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") onFile(reader.result);
      };
      reader.readAsText(file);
    },
    [onFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") onFile(reader.result);
      };
      reader.readAsText(file);
    },
    [onFile],
  );

  const handleSampleClick = useCallback(
    async (filename: string) => {
      setLoadingTrail(filename);
      try {
        const res = await fetch(`/trails/${filename}`);
        const text = await res.text();
        onFile(text);
      } catch {
        console.error("Failed to load sample trail:", filename);
      } finally {
        setLoadingTrail(null);
      }
    },
    [onFile],
  );

  return (
    <div className="upload-wrapper">
      <div className="sample-trails-card">
        <h2 className="sample-trails-heading">Sample Trails</h2>
        <p className="sample-trails-sub">Pick a trail to explore instantly.</p>
        <div className="sample-trails-list">
          {SAMPLE_TRAILS.map((trail) => (
            <button
              key={trail.file}
              className="sample-trail-btn"
              disabled={loading || loadingTrail !== null}
              onClick={() => handleSampleClick(trail.file)}
            >
              <span className="sample-trail-icon">🗻</span>
              <span className="sample-trail-label">
                {loadingTrail === trail.file ? "Loading…" : trail.label}
              </span>
              <span className="sample-trail-arrow">›</span>
            </button>
          ))}
        </div>

        <div className="sample-trails-divider" />

        <div
          className="upload-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <label className="upload-label">
            <input
              type="file"
              accept=".gpx"
              onChange={handleChange}
              disabled={loading}
              hidden
            />
            <span className="upload-icon">📂</span>
            <span>{loading ? "Processing…" : "Or drop a .GPX file here / click to browse."}</span>
          </label>
        </div>
      </div>
    </div>
  );
};
