import React from "react";
import type { Segment } from "../types";
import { formatDistanceShort, NEAR_TRAIL_HINT_M } from "../utils/trailLocation";

interface Props {
  onTrail: boolean;
  segment: Segment | undefined;
  distanceMeters: number;
}

export const TrackIndicator: React.FC<Props> = ({
  onTrail,
  segment,
  distanceMeters,
}) => {
  if (onTrail && segment) {
    return (
      <div className="track-indicator track-indicator--on-trail" role="status">
        <span className="track-indicator-dot" aria-hidden="true" />
        Segment {segment.id + 1}
        <span className="track-indicator-tag">{segment.level}</span>
      </div>
    );
  }

  if (distanceMeters <= NEAR_TRAIL_HINT_M) {
    return (
      <div className="track-indicator track-indicator--nearby" role="status">
        <span className="track-indicator-dot" aria-hidden="true" />
        {formatDistanceShort(distanceMeters)} to trail
      </div>
    );
  }

  return (
    <div className="track-indicator track-indicator--live" role="status">
      <span className="track-indicator-pulse" aria-hidden="true" />
      Live location
    </div>
  );
};
