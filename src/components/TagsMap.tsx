import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

interface TagsMapProps {
  allTagsGeoJson: {
    [tag: string]: {
      geojson: any;
      count: number;
    };
  };
  mapboxToken: string;
}

const TagsMap: React.FC<TagsMapProps> = ({ allTagsGeoJson, mapboxToken }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize the map
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
        projection: "winkelTripel",
        attributionControl: false,
      });

      map.current.on("load", () => {
        if (!map.current) return;

        // Set a light background color
        map.current.setPaintProperty(
          "background",
          "background-color",
          "#faf8f3"
        );

        // Create popup but don't add to map yet
        popup.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: true,
          maxWidth: "250px",
        });

        // Set up direct event listeners for tag hovering
        const setupTagHoverListeners = () => {
          // Find all tag elements
          const tagElements = document.querySelectorAll("[data-tag-name]");
          console.log("Found tag elements:", tagElements.length);

          // Add event listeners to each tag
          tagElements.forEach(tag => {
            // On mouse enter, highlight this tag's points
            tag.addEventListener("mouseenter", () => {
              const tagName = tag.getAttribute("data-tag-name");
              console.log("Tag mouseenter:", tagName);
              setActiveTag(tagName);
            });

            // On mouse leave, reset to default view
            tag.addEventListener("mouseleave", () => {
              console.log("Tag mouseleave");
              setActiveTag(null);
            });
          });
        };

        // Wait for tags to be available in the DOM
        setTimeout(setupTagHoverListeners, 100);

        // Add all tags as separate layers
        Object.keys(allTagsGeoJson).forEach(tagName => {
          // Skip tags with no geotagged posts
          if (allTagsGeoJson[tagName].geojson.features.length === 0) return;

          // Add the GeoJSON source
          map.current!.addSource(`tag-${tagName}`, {
            type: "geojson",
            data: allTagsGeoJson[tagName].geojson,
          });

          // Add the points layer with initial visibility
          map.current!.addLayer({
            id: `tag-${tagName}-circles`,
            type: "circle",
            source: `tag-${tagName}`,
            paint: {
              "circle-radius": 5,
              "circle-color": "#e60000",
              "circle-stroke-width": 1.5,
              "circle-stroke-color": "#ffffff",
              "circle-opacity": 0.4, // Initially visible
              "circle-stroke-opacity": 0.4, // Initially visible
            },
          });

          // Setup interactions for each layer
          map.current!.on("mouseenter", `tag-${tagName}-circles`, e => {
            if (!map.current || !popup.current || !e.features?.[0]) return;

            const coordinates = e.features[0].geometry.coordinates.slice();
            const { title, slug } = e.features[0].properties;

            // Ensure the popup appears over the right point
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            // Create popup content
            const popupHTML = `
              <div class="popup-content cursor-pointer">
                <h3 class="text-sm font-semibold uppercase tracking-wide text-skin-accent">${title}</h3>
              </div>
            `;

            popup.current
              .setLngLat(coordinates)
              .setHTML(popupHTML)
              .addTo(map.current);

            // Add click listener to navigate to post
            const popupElement = popup.current.getElement();
            const popupContentElement =
              popupElement.querySelector(".popup-content");
            if (popupContentElement) {
              popupContentElement.addEventListener("click", () => {
                window.location.href = `/posts/${slug}`;
              });
            }

            // Change cursor to pointer
            map.current.getCanvas().style.cursor = "pointer";
          });

          // Handle mouseleave
          map.current!.on("mouseleave", `tag-${tagName}-circles`, () => {
            if (!map.current) return;
            if (popup.current) popup.current.remove();
            map.current.getCanvas().style.cursor = "";
          });

          // Make points clickable
          map.current!.on("click", `tag-${tagName}-circles`, e => {
            if (!e.features?.[0]) return;
            const { slug } = e.features[0].properties;
            window.location.href = `/posts/${slug}`;
          });
        });

        setIsMapLoaded(true);
      });
    } catch (error) {
      console.error("Error initializing tags map:", error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken, allTagsGeoJson]);

  // Expose setActiveTag to window for external access
  useEffect(() => {
    // Expose the setActiveTag function to window for communication from vanilla JS
    // @ts-ignore - Adding custom property to window
    window.tagsMapSetActiveTag = setActiveTag;

    // Cleanup
    return () => {
      // @ts-ignore - Removing custom property
      window.tagsMapSetActiveTag = undefined;
    };
  }, []);

  // Handle active tag changes
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    console.log(`Active tag changed to: ${activeTag}`);

    // Apply different styles based on whether a tag is active
    Object.keys(allTagsGeoJson).forEach(tagName => {
      // Skip tags with no geotagged posts
      if (allTagsGeoJson[tagName].geojson.features.length === 0) return;

      const layerId = `tag-${tagName}-circles`;

      // If this layer exists in the map
      if (map.current!.getLayer(layerId)) {
        if (activeTag) {
          // If a tag is active, make its points very visible and others very dim
          const isActive = activeTag === tagName;

          // Dramatically different styling for active vs inactive
          if (isActive) {
            // Active tag gets full opacity and larger size
            map.current!.setPaintProperty(layerId, "circle-radius", 8);
            map.current!.setPaintProperty(layerId, "circle-color", "#e60000");
            map.current!.setPaintProperty(layerId, "circle-opacity", 1);
            map.current!.setPaintProperty(layerId, "circle-stroke-width", 2);
            map.current!.setPaintProperty(layerId, "circle-stroke-opacity", 1);
          } else {
            // Inactive tags get very low opacity
            map.current!.setPaintProperty(layerId, "circle-radius", 5);
            map.current!.setPaintProperty(layerId, "circle-color", "#e60000");
            map.current!.setPaintProperty(layerId, "circle-opacity", 0.1);
            map.current!.setPaintProperty(layerId, "circle-stroke-width", 1);
            map.current!.setPaintProperty(
              layerId,
              "circle-stroke-opacity",
              0.1
            );
          }
        } else {
          // If no tag is active, show all points equally
          map.current!.setPaintProperty(layerId, "circle-radius", 5);
          map.current!.setPaintProperty(layerId, "circle-color", "#e60000");
          map.current!.setPaintProperty(layerId, "circle-opacity", 0.4);
          map.current!.setPaintProperty(layerId, "circle-stroke-width", 1.5);
          map.current!.setPaintProperty(layerId, "circle-stroke-opacity", 0.4);
        }
      }
    });
  }, [activeTag, isMapLoaded, allTagsGeoJson]);

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        className="w-full h-[300px] rounded overflow-hidden"
      />

      {/* Export the setActiveTag function for parent component */}
      <div
        style={{ display: "none" }}
        id="tagsmap-controls"
        data-hook-active-tag={setActiveTag.toString()}
      />
    </div>
  );
};

export default TagsMap;
