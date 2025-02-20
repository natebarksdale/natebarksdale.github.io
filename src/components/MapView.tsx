import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

interface MapViewProps {
  geojson: any;
}

const MapView: React.FC<MapViewProps> = ({ geojson }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);

  useEffect(() => {
    if (!mapContainer.current) {
      console.error("Map container not found");
      return;
    }

    // Get token from window environment
    const token =
      process.env.PUBLIC_MAPBOX_TOKEN || import.meta.env.PUBLIC_MAPBOX_TOKEN;

    console.log(
      "Attempting to initialize map with token:",
      token ? "Token exists" : "No token"
    );

    if (!token) {
      console.error("Mapbox token not found");
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [0, 20], // Center on world view
      zoom: 1.5,
    });

    map.current.on("load", () => {
      if (!map.current) return;

      // Add post locations as a source
      map.current.addSource("posts", {
        type: "geojson",
        data: geojson,
      });

      // Add circles for post locations
      map.current.addLayer({
        id: "posts-circles",
        type: "circle",
        source: "posts",
        paint: {
          "circle-radius": 8,
          "circle-color": "var(--color-accent)",
          "circle-opacity": 0.8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Create popup but don't add to map yet
      popup.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      });

      // Show popup on hover
      map.current.on("mouseenter", "posts-circles", e => {
        if (!map.current || !popup.current || !e.features?.[0]) return;

        const coordinates = e.features[0].geometry.coordinates.slice();
        const { title, description } = e.features[0].properties;

        // Change the cursor style
        map.current.getCanvas().style.cursor = "pointer";

        // Populate the popup and set its coordinates
        popup.current
          .setLngLat(coordinates)
          .setHTML(
            `
            <h3 class="font-semibold">${title}</h3>
            <p class="text-sm">${description}</p>
          `
          )
          .addTo(map.current);
      });

      // Hide popup when mouse leaves feature
      map.current.on("mouseleave", "posts-circles", () => {
        if (!map.current || !popup.current) return;
        map.current.getCanvas().style.cursor = "";
        popup.current.remove();
      });

      // Navigate to post on click
      map.current.on("click", "posts-circles", e => {
        if (!e.features?.[0]) return;
        const { slug } = e.features[0].properties;
        window.location.href = `/posts/${slug}`;
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [geojson]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full"
      style={{ background: "#f0f0f0" }} // Add a background color to see the container
    />
  );
};

export default MapView;
