import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

interface MapViewProps {
  geojson: any;
  mapboxToken: string;
}

const MapView: React.FC<MapViewProps> = ({ geojson, mapboxToken }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);

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
        projection: "mercator",
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
          closeButton: true,
          closeOnClick: false, // Don't close when clicking inside popup
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

          // Create popup content with styled title and haiku
          const popupContent = `
            <div class="popup-content">
              <h3 class="text-lg font-semibold uppercase tracking-wide mb-2">${title}</h3>
              <p class="text-sm italic">${haiku || "No haiku available"}</p>
              <button class="mt-3 text-sm text-skin-accent hover:underline">Read more →</button>
            </div>
          `;

          popup.current
            .setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(map.current);

          // Add click event listener to the "Read more" button
          const popupElement = popup.current.getElement();
          const readMoreButton = popupElement.querySelector("button");
          if (readMoreButton) {
            readMoreButton.addEventListener("click", () => {
              window.location.href = `/posts/${slug}`;
            });
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

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default MapView;
