import React, { useState, useEffect, useRef } from "react";
import { BarChart3, ExternalLink } from "lucide-react";

type VizKey = "heatmap" | "score" | "popularity" | "directors" | "actors";

interface VizInfo {
  title: string;
  embedUrl: string;
}

export default function Dashboard() {
  const [activeViz, setActiveViz] = useState<VizKey>("heatmap");
  const vizRefs = useRef<Record<VizKey, HTMLIFrameElement | null>>({
    heatmap: null,
    score: null,
    popularity: null,
    directors: null,
    actors: null,
  });

  const visualizations: Record<VizKey, VizInfo> = {
    heatmap: {
      title: "Genre-Month Heatmap",
      embedUrl:
        "https://public.tableau.com/views/Heatmap_17613927411610/Sheet1?:showVizHome=no&:embed=true",
    },
    score: {
      title: "Score Trends",
      embedUrl:
        "https://public.tableau.com/views/Score-Year/Sheet2?:showVizHome=no&:embed=true",
    },
    popularity: {
      title: "Popularity Trends",
      embedUrl:
        "https://public.tableau.com/views/PopularityTrends/Sheet3?:showVizHome=no&:embed=true",
    },
    directors: {
      title: "Top Directors",
      embedUrl:
        "https://public.tableau.com/views/topdirectors_17613931661200/Sheet4?:showVizHome=no&:embed=true",
    },
    actors: {
      title: "Top Actors",
      embedUrl:
        "https://public.tableau.com/views/topdirectors_17613931661200/Sheet5?:showVizHome=no&:embed=true",
    },
  };

  useEffect(() => {
    Object.values(vizRefs.current).forEach((iframe) => {
      if (iframe) iframe.style.height = `${iframe.offsetWidth * 0.75}px`;
    });
  }, [activeViz]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full mb-4">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-3">Analytics Dashboard</h2>
        <p className="text-gray-400 text-lg">
          Comprehensive movie industry insights and trends
        </p>
      </div>

      {/* Main */}
      <div className="flex flex-col md:flex-row bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="md:w-64 w-full border-b md:border-b-0 md:border-r border-white/10 bg-gradient-to-b from-blue-500/10 to-cyan-600/10">
          {(
            Object.entries(visualizations) as [VizKey, VizInfo][]
          ).map(([key, viz]) => (
            <button
              key={key}
              onClick={() => setActiveViz(key)}
              className={`w-full text-left px-6 py-4 transition-colors duration-200 ${
                activeViz === key
                  ? "bg-blue-500/20 text-blue-300 font-semibold"
                  : "text-gray-300 hover:bg-white/5"
              }`}
            >
              {viz.title}
            </button>
          ))}
        </div>

        {/* Active Viz */}
        <div className="flex-1 p-4 relative min-h-[600px]">
          <iframe
            ref={(el) => (vizRefs.current[activeViz] = el)}
            src={visualizations[activeViz].embedUrl}
            className="w-full h-full rounded-lg"
            frameBorder="0"
            allowFullScreen
            title={visualizations[activeViz].title}
          ></iframe>
        </div>
      </div>
    </div>
  );
}
