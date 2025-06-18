import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

interface TagMapProps {
  geojson: any;
  mapboxToken: string;
}

const TagMap: React.FC<TagMapProps> = ({ geojson, mapboxToken }) => {
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
        zoom: 0.8,
        renderWorldCopies: true,
        projection: "winkelTripel", // Use Winkel Tripel projection by default
        attributionControl: false,
      });

      // Detect if the device is likely mobile
      const isMobile = window.matchMedia("(max-width: 768px)").matches;

      map.current.on("load", () => {
        if (!map.current) return;

        // Set a light background color
        map.current.setPaintProperty(
          "background",
          "background-color",
          "#faf8f3"
        );

        // Add the GeoJSON source
        map.current.addSource("tag-posts", {
          type: "geojson",
          data: geojson,
        });

        // Add the points layer
        map.current.addLayer({
          id: "tag-posts-circles",
          type: "circle",
          source: "tag-posts",
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              5, // Slightly larger dots for better visibility
              4,
              6,
              8,
              8,
            ],
            "circle-color": "#e60000", // Changed from magenta to red
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#ffffff",
          },
        });

        // Create popup but don't add to map yet
        popup.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false, // Changed to false to match MapView behavior
          maxWidth: "300px", // Increased to match MapView
        });

        if (isMobile) {
          // On mobile: show popup on tap, close on tap elsewhere
          map.current.on("click", "tag-posts-circles", e => {
            if (!map.current || !popup.current || !e.features?.[0]) return;

            const coordinates = e.features[0].geometry.coordinates.slice();
            const { title, slug, haiku } = e.features[0].properties;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            // Format haiku with line breaks if it exists
            const formattedHaiku = haiku ? haiku.replace(/\n/g, "<br>") : "";

            // Create popup content with larger text to match MapView
            const popupHTML = `
              <div class="popup-content cursor-pointer">
                <h3 class="text-lg font-semibold uppercase tracking-wide mb-2 text-skin-accent">${title}</h3>
                ${formattedHaiku ? `<p class="text-lg leading-relaxed" style="font-family: 'DovesType-Text', serif;">${formattedHaiku}</p>` : ""}
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
                // Navigate to the post
                window.location.href = `/posts/${slug}`;
              });
            }
          });

          // Close popup when clicking outside of a feature
          map.current.on("click", e => {
            if (!map.current || !popup.current) return;

            // Check if the click was on a marker
            const features = map.current.queryRenderedFeatures(e.point, {
              layers: ["tag-posts-circles"],
            });

            // If no features were clicked (i.e., clicked outside markers and popup)
            if (features.length === 0) {
              popup.current.remove();
            }
          });
        } else {
          // On desktop: show popup on hover
          map.current.on("mouseenter", "tag-posts-circles", e => {
            if (!map.current || !popup.current || !e.features?.[0]) return;

            const coordinates = e.features[0].geometry.coordinates.slice();
            const { title, slug, haiku } = e.features[0].properties;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            // Format haiku with line breaks if it exists
            const formattedHaiku = haiku ? haiku.replace(/\n/g, "<br>") : "";

            // Create popup content with larger text to match MapView
            const popupHTML = `
              <div class="popup-content cursor-pointer">
                <h3 class="text-lg font-semibold uppercase tracking-wide mb-2 text-skin-accent">${title}</h3>
                ${formattedHaiku ? `<p class="text-lg leading-relaxed" style="font-family: 'DovesType-Text', serif;">${formattedHaiku}</p>` : ""}
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
                // Navigate to the post
                window.location.href = `/posts/${slug}`;
              });
            }
          });

          // Close popup when leaving a feature
          map.current.on("mouseleave", "tag-posts-circles", () => {
            if (popup.current) popup.current.remove();
          });

          // Make points clickable to navigate to posts
          map.current.on("click", "tag-posts-circles", e => {
            if (!e.features?.[0]) return;
            const { slug } = e.features[0].properties;
            window.location.href = `/posts/${slug}`;
          });
        }

        // Change cursor to pointer when hovering over a point (both mobile and desktop)
        map.current.on("mouseenter", "tag-posts-circles", () => {
          if (!map.current) return;
          map.current.getCanvas().style.cursor = "pointer";
        });

        map.current.on("mouseleave", "tag-posts-circles", () => {
          if (!map.current) return;
          map.current.getCanvas().style.cursor = "";
        });
      });
    } catch (error) {
      console.error("Error initializing tag map:", error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [geojson, mapboxToken]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-[300px] rounded overflow-hidden"
    />
  );
};

export default TagMap;
