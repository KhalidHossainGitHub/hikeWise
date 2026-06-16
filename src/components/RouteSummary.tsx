import React from "react";
import type { RouteSummary as RouteSummaryT } from "../types";

interface Props {
  summary: RouteSummaryT;
  collapsible?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}

export const RouteSummary: React.FC<Props> = ({
  summary,
  collapsible = false,
  expanded = true,
  onToggle,
}) => {
  const items: { label: string; value: string }[] = [
    { label: "Distance", value: `${summary.totalDistance.toFixed(2)} km` },
    { label: "Total Ascent", value: `${summary.totalAscent.toFixed(0)} m` },
    { label: "Avg Grade", value: `${summary.averageGrade.toFixed(1)}%` },
    { label: "Max Difficulty", value: summary.maxDifficulty.toFixed(1) },
    {
      label: "Temperature",
      value:
        summary.temperature !== null ? `${summary.temperature}°C` : "N/A",
    },
    {
      label: "Precipitation",
      value:
        summary.precipitation !== null
          ? `${summary.precipitation} mm`
          : "N/A",
    },
  ];

  const preview = `${summary.totalDistance.toFixed(1)} km · ${summary.totalAscent.toFixed(0)} m ↑ · ${summary.averageGrade.toFixed(1)}% grade`;

  return (
    <div
      className={`summary-card${collapsible ? " summary-card--collapsible" : ""}${collapsible && expanded ? " summary-card--expanded" : ""}`}
    >
      {collapsible ? (
        <>
          <h2 className="summary-heading-desktop">Route Summary</h2>
          <button
            type="button"
            className="summary-toggle"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={expanded ? "Hide route stats" : "Show route stats"}
          >
            <span className="summary-toggle-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 20h18" />
                <path d="M7 16V9" />
                <path d="M12 16V5" />
                <path d="M17 16v-7" />
              </svg>
            </span>
            <span className="summary-toggle-text">
              <span className="summary-toggle-title">Route stats</span>
              <span className="summary-toggle-preview">{preview}</span>
            </span>
            <span className={`summary-chevron${expanded ? " summary-chevron--open" : ""}`} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </button>
        </>
      ) : (
        <h2>Route Summary</h2>
      )}
      <div className="summary-body">
        <div className="summary-grid">
          {items.map((it) => (
            <div key={it.label} className="summary-item">
              <span className="summary-value">{it.value}</span>
              <span className="summary-label">{it.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
