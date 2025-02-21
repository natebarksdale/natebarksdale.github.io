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
  { id: "miller", name: "Miller", value: "miller" },
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

  const changeProjection = (projection: ProjectionType) => {
    if (!map.current) return;

    map.current.setProjection(projection);
    setCurrentProjection(projection);

    // Adjust zoom level based on projection type
    const isGlobe = projection === "globe";
    const newZoom = isGlobe ? 1.5 : 0.8;

    map.current.easeTo({
      zoom: newZoom,
      duration: 1500,
    });
  };

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
          const popupContent = `
            <div class="popup-content cursor-pointer">
              <h3 class="text-lg font-semibold uppercase tracking-wide mb-2 text-skin-accent">${title}</h3>
              <p class="text-sm italic leading-relaxed font-serif">${formattedHaiku}</p>
            </div>
          `;

          popup.current
            .setLngLat(coordinates)
            .setHTML(popupContent)
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
              className="px-2 py-1 text-sm relative group"
            >
              <span
                className={`relative transition-colors hover:text-skin-accent
                ${currentProjection === proj.value ? "text-skin-accent" : "text-skin-base"}
              `}
              >
                {proj.name}
                {currentProjection === proj.value && (
                  <span
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-skin-accent"
                    style={{ bottom: "-4px" }}
                  />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default MapView;
