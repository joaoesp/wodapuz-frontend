import { useEffect, useState } from "react";
import { Line } from "react-simple-maps";

interface PipelineRecord {
  n: string;
  coords: [number, number][];
  cap: number;
  c: string;
}

interface PipelineLayerProps {
  zoom: number;
  onHover: (tip: { name: string; value: string; x: number; y: number } | null) => void;
}

function PipelineLayer({ zoom, onHover }: PipelineLayerProps) {
  const [pipelines, setPipelines] = useState<PipelineRecord[]>([]);

  useEffect(() => {
    fetch("/data/infrastructure/oil-pipelines.json")
      .then((r) => r.json())
      .then((data: PipelineRecord[]) => setPipelines(data))
      .catch(console.error);
  }, []);

  return (
    <>
      {pipelines.map((pipe, i) => (
        <Line
          key={i}
          coordinates={pipe.coords}
          stroke="#b91c1c"
          strokeWidth={Math.max(0.5, 1.5 / zoom)}
          strokeOpacity={0.65}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="transparent"
          onMouseMove={(e: React.MouseEvent) => {
            onHover({
              name: pipe.n,
              value: `${pipe.cap.toLocaleString()} kb/d`,
              x: e.clientX,
              y: e.clientY,
            });
          }}
          onMouseLeave={() => onHover(null)}
          style={{ cursor: "pointer", pointerEvents: "stroke" }}
        />
      ))}
    </>
  );
}

export default PipelineLayer;
