import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

interface MapViewProps {
  geojson: any;
  mapboxToken: string;
}

const projections = [
  { id: "globe", name: "Globe", value: "globe" },
  { id: "mercator", name: "Mercator", value: "mercator" },
  { id: "albers", name: "Albers", value: "albers" },
  { id: "equalEarth", name: "Equal Earth", value: "equalEarth" },
  { id: "equirectangular", name: "Equirectangular", value: "equirectangular" },
  { id: "winkelTripel", name: "Winkel Tripel", value: "winkelTripel" },
  {
    id: "lambertConformalConic",
    name: "Lambert",
    value: "lambertConformalConic",
  },
] as const;

type ProjectionType = (typeof projections)[number]["value"];

const MapView: React.FC<MapViewProps> = ({ geojson, mapboxToken }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const [currentProjection, setCurrentProjection] =
    useState<ProjectionType>("globe");
  const [center, setCenter] = useState(30); // Default center parallel
  const [parallel1, setParallel1] = useState(20); // Default first standard parallel
  const [parallel2, setParallel2] = useState(40); // Default second standard parallel

  const changeProjection = (projection: ProjectionType) => {
    if (!map.current) return;

    if (projection === "lambertConformalConic") {
      map.current.setProjection({
        name: projection,
        center: [0, center],
        parallels: [parallel1, parallel2],
      });
    } else {
      map.current.setProjection(projection);
    }

    setCurrentProjection(projection);

    // Adjust zoom level and rotation based on projection type
    const isGlobe = projection === "globe";
    const newZoom = isGlobe ? 1.5 : 0.8;

    map.current.easeTo({
      zoom: newZoom,
      bearing: projection === "albers" ? 45 : 0,
      duration: 1500,
    });
  };

  const updateLambertProjection = () => {
    if (!map.current || currentProjection !== "lambertConformalConic") return;

    map.current.setProjection({
      name: "lambertConformalConic",
      center: [0, center],
      parallels: [parallel1, parallel2],
    });
  };

  useEffect(() => {
    updateLambertProjection();
  }, [center, parallel1, parallel2]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [0, 20],
        zoom: 1.5,
        renderWorldCopies: true,
        projection: "globe",
        attributionControl: false,
      });

      map.current.on("load", () => {
        if (!map.current) return;

        map.current.setPaintProperty(
          "background",
          "background-color",
          "#faf8f3"
        );

        map.current.addSource("posts", {
          type: "geojson",
          data: geojson,
        });

        map.current.addLayer({
          id: "posts-circles",
          type: "circle",
          source: "posts",
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              3,
              4,
              5,
              8,
              8,
              12,
              10,
              16,
              12,
            ],
            "circle-color": "#de1d8d",
            "circle-stroke-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              1,
              4,
              1.5,
              8,
              2,
              12,
              2.5,
            ],
            "circle-stroke-color": "#ffffff",
          },
        });

        // Create popup but don't add to map yet
        popup.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          maxWidth: "300px",
        });

        // Show popup on click
        map.current.on("click", "posts-circles", e => {
          if (!map.current || !popup.current || !e.features?.[0]) return;

          const coordinates = e.features[0].geometry.coordinates.slice();
          const { title, slug, haiku } = e.features[0].properties;

          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          // Format haiku with line breaks
          const formattedHaiku = haiku
            ? haiku.replace(/\n/g, "<br>")
            : "No haiku available";

          // Create popup content with styled title and formatted haiku
          const popupHTML = `
            <div class="popup-content cursor-pointer">
              <h3 class="text-lg font-semibold uppercase tracking-wide mb-2 text-skin-accent">${title}</h3>
              <p class="text-sm italic leading-relaxed font-doves">${formattedHaiku}</p>
            </div>
          `;

          popup.current
            .setLngLat(coordinates)
            .setHTML(popupHTML)
            .addTo(map.current);

          // Add click event listener to the popup content
          const popupElement = popup.current.getElement();
          const popupContentElement =
            popupElement.querySelector(".popup-content");
          if (popupContentElement) {
            popupContentElement.addEventListener("click", () => {
              // Use client-side navigation
              const link = document.createElement("a");
              link.href = `/posts/${slug}`;
              link.click();
            });
          }
        });

        // Close popup when clicking outside of it
        map.current.on("click", e => {
          if (!map.current || !popup.current) return;

          // Check if the click was on a marker
          const features = map.current.queryRenderedFeatures(e.point, {
            layers: ["posts-circles"],
          });

          // If no features were clicked (i.e., clicked outside markers and popup)
          if (features.length === 0) {
            popup.current.remove();
          }
        });

        // Change cursor to pointer when hovering over a point
        map.current.on("mouseenter", "posts-circles", () => {
          if (!map.current) return;
          map.current.getCanvas().style.cursor = "pointer";
        });

        map.current.on("mouseleave", "posts-circles", () => {
          if (!map.current) return;
          map.current.getCanvas().style.cursor = "";
        });
      });
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [geojson, mapboxToken]);

  return (
    <>
      <div ref={mapContainer} className="w-full h-[600px]" />
      <div className="mt-8 text-center">
        <h2 className="text-lg font-semibold mb-3">Map Projections</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {projections.map(proj => (
            <button
              key={proj.id}
              onClick={() => changeProjection(proj.value)}
              className={`px-2 py-1 text-sm relative transition-colors hover:text-skin-accent
                ${
                  currentProjection === proj.value
                    ? "text-skin-accent after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-skin-accent"
                    : "text-skin-base"
                }`}
            >
              {proj.name}
            </button>
          ))}
        </div>

        {currentProjection === "lambertConformalConic" && (
          <div className="mt-6 max-w-xl mx-auto px-4">
            <style>
              {`
                input[type="range"] {
                  -webkit-appearance: none;
                  height: 2px;
                  background: rgb(var(--color-base) / 0.6);
                  border-radius: 1px;
                }
                
                input[type="range"]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  background: rgb(var(--color-accent));
                  cursor: pointer;
                  border: none;
                  box-shadow: 0 0 0 2px var(--color-fill);
                }
                
                input[type="range"]::-moz-range-thumb {
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  background: rgb(var(--color-accent));
                  cursor: pointer;
                  border: none;
                  box-shadow: 0 0 0 2px var(--color-fill);
                }

                input[type="range"]::-webkit-slider-runnable-track {
                  background: rgb(var(--color-base) / 0.6);
                  height: 2px;
                  border-radius: 1px;
                }

                input[type="range"]::-moz-range-track {
                  background: rgb(var(--color-base) / 0.6);
                  height: 2px;
                  border-radius: 1px;
                }
              `}
            </style>
            <div className="mb-4">
              <label className="block text-sm mb-2">
                Center Parallel: {center}°
              </label>
              <input
                type="range"
                min="-80"
                max="80"
                value={center}
                onChange={e => setCenter(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-2">
                First Standard Parallel: {parallel1}°
              </label>
              <input
                type="range"
                min="-80"
                max="80"
                value={parallel1}
                onChange={e => setParallel1(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-2">
                Second Standard Parallel: {parallel2}°
              </label>
              <input
                type="range"
                min="-80"
                max="80"
                value={parallel2}
                onChange={e => setParallel2(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MapView;
