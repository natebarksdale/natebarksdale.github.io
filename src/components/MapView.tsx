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
    console.log("MapView mounting, token status:", !!mapboxToken);

    if (!mapContainer.current) {
      console.error("Map container not found");
      return;
    }

    if (!mapboxToken) {
      console.error("Mapbox token not found");
      return;
    }

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [0, 20], // Center on world view
        zoom: 1.5,
      });

      map.current.on("load", () => {
        if (!map.current) return;

        // Add post locations as a source with clustering
        map.current.addSource("posts", {
          type: "geojson",
          data: geojson,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        // Add clusters
        map.current.addLayer({
          id: "clusters",
          type: "circle",
          source: "posts",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#de1d8d",
              10,
              "#c31c7e",
              30,
              "#a61a6e",
            ],
            // Dynamic cluster size based on zoom
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              // zoom level, size
              0,
              ["step", ["get", "point_count"], 15, 10, 25, 30, 35],
              4,
              ["step", ["get", "point_count"], 18, 10, 28, 30, 38],
              8,
              ["step", ["get", "point_count"], 22, 10, 32, 30, 42],
              12,
              ["step", ["get", "point_count"], 25, 10, 35, 30, 45],
            ],
          },
        });

        // Add cluster count labels with dynamic size
        map.current.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "posts",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              12,
              4,
              14,
              8,
              16,
              12,
              18,
            ],
          },
          paint: {
            "text-color": "#ffffff",
          },
        });

        // Add unclustered points with dynamic size
        map.current.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "posts",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "#de1d8d",
            // Dynamic point size based on zoom level
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              // zoom level, size
              0,
              3, // Far out: very small
              4,
              5, // Medium zoom: slightly larger
              8,
              8, // Closer: medium size
              12,
              10, // Very close: largest
              16,
              12, // Maximum size
            ],
            // Dynamic stroke width based on zoom
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

        // Handle clicks on clusters
        map.current.on("click", "clusters", e => {
          if (!map.current || !e.features?.[0]) return;

          const features = map.current.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
          });
          const clusterId = features[0].properties.cluster_id;

          map.current
            .getSource("posts")
            .getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err || !map.current) return;

              map.current.easeTo({
                center: (features[0].geometry as any).coordinates,
                zoom: zoom,
              });
            });
        });

        // Show popup for individual points
        map.current.on("mouseenter", "unclustered-point", e => {
          if (!map.current || !popup.current || !e.features?.[0]) return;

          const coordinates = e.features[0].geometry.coordinates.slice();
          const { title, description } = e.features[0].properties;

          map.current.getCanvas().style.cursor = "pointer";

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

        map.current.on("mouseleave", "unclustered-point", () => {
          if (!map.current || !popup.current) return;
          map.current.getCanvas().style.cursor = "";
          popup.current.remove();
        });

        // Navigate to post on click
        map.current.on("click", "unclustered-point", e => {
          if (!e.features?.[0]) return;
          const { slug } = e.features[0].properties;
          window.location.href = `/posts/${slug}`;
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
    <div
      ref={mapContainer}
      className="w-full h-full"
      style={{ background: "#f0f0f0" }} // Add a background color to see the container
    />
  );
};

export default MapView;
