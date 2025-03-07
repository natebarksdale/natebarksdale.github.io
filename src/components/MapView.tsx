import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

interface MapViewProps {
  geojson: any;
  mapboxToken: string;
}

// Multiple descriptions for each projection type (except Lambert which has dynamic descriptions)
const projectionDescriptions = {
  globe: [
    "Earth as nature intended. Distortion-free, but you can only see half the world at once. Always the showoff at parties.",
    "Perfect sphere, imperfect utility. Beautiful but practically useless for navigation. Like most beautiful things.",
    "No distortion! Also no back side of the planet. Choose your compromises wisely.",
    "The only truly accurate representation. Shame you can only see 50% of the Earth at once.",
    "Looks nice, doesn't scale. Hard to find Fiji when half the planet is hiding from you.",
  ],
  mercator: [
    "Navigators love it, polar bears hate it. Greenland isn't actually the size of Africa, despite what this projection suggests.",
    "Great for navigation, terrible for size comparisons. Somehow Antarctica became a continent-sized line.",
    "Straight lines are nice for sailing. Just don't use this to compare country sizes unless you want to start a geographical argument.",
    "Colonial powers' favorite projection. Makes Europe seem important and the equator seem... less so.",
    "The default map everyone remembers from school. Also the reason you think Russia and Canada are comically huge.",
  ],
  albers: [
    "America's narcissistic projection of choice. Equal-area and pleasant to look at, but good luck using it globally.",
    "Fine for continental views if you don't mind the squishing at the edges. Standard choice for those who prioritize area over shape.",
    "Equal-area but not equal-angle. Like a visual compromise when you care about size but not too much about shape.",
    "Conic projections like this one are what happen when you try to flatten a peeled orange on your desk.",
    "Good middle-ground projection. Nothing gets too distorted, but everything's at least a little wrong.",
  ],
  equalEarth: [
    "The new kid on the block trying to dethrone the problematic projections. Equal area with minimal distortion, but still looks weird.",
    "Created in 2018 as if cartographers finally realized distortion was an issue after only 500 years of making maps.",
    "Pseudo-cylindrical with equal area. For when you want to show true sizes but don't want shapes getting too bizarre.",
    "Modern compromise between accuracy and aesthetics. Still makes Australia look like it's melting a bit.",
    "The progressive cartographer's choice. Politically correct sizes with only moderate shape distortion.",
  ],
  equirectangular: [
    "Simplistic to a fault. Every degree of latitude and longitude is the same size, which is mathematically convenient and geographically absurd.",
    "The rectangular grid we all secretly wish the Earth actually was. Straight lines everywhere, reality nowhere.",
    "The laziest projection. Just stretches longitude and latitude into a grid and calls it a day.",
    "Used in computing because it's easy to implement, not because it's good at representing Earth.",
    "When you need to make a quick world map and don't care about distortion, this is your go-to.",
  ],
  winkelTripel: [
    "National Geographic's darling. Tries to minimize all types of distortion and ends up being mediocre at everything.",
    "A compromise projection that's neither equal-area nor conformal. The participation trophy of cartography.",
    "The 'jack of all trades, master of none' of map projections. Looks fine until you measure anything.",
    "Popular because it doesn't look too weird at first glance. Just don't look too closely at the poles.",
    "Minimizes the three main distortions at once, which means it still has all three but can claim it tried its best.",
  ],
};

// Function to generate Lambert description based on slider values
const getLambertDescription = (
  center: number,
  parallel1: number,
  parallel2: number
) => {
  // Categorize each parameter into low, medium, or high
  const centerCategory = center < -25 ? "low" : center > 25 ? "high" : "medium";
  const parallel1Category =
    parallel1 < -25 ? "low" : parallel1 > 25 ? "high" : "medium";
  const parallel2Category =
    parallel2 < -25 ? "low" : parallel2 > 25 ? "high" : "medium";

  // Base description parts
  let pros, cons;

  // Center descriptions
  if (centerCategory === "low") {
    pros = "Excellent for southern hemisphere mapping";
    cons = "Northern continents get increasingly distorted";
  } else if (centerCategory === "high") {
    pros = "Ideal for northern hemisphere detail";
    cons = "Makes Antarctica look like it's falling off the edge";
  } else {
    pros = "Balanced global perspective";
    cons = "No region gets perfect treatment";
  }

  // Modify based on parallels
  if (parallel1Category === parallel2Category) {
    // Parallels in same region
    if (parallel1Category === "low") {
      pros += ", highlights southern oceans";
      cons += ", and shrinks northern countries";
    } else if (parallel1Category === "high") {
      pros += ", preserves shapes in Arctic regions";
      cons += ", while severely warping everything below the equator";
    }
  } else if (Math.abs(parallel1 - parallel2) > 50) {
    // Wide spread between parallels
    pros += ", minimizes overall distortion";
    cons += ", but creates a funhouse effect at the poles";
  } else {
    // Moderate difference
    pros += ", creates reasonable compromise";
    cons += ", though still distorts regions far from standard parallels";
  }

  return `${pros}. ${cons}. What you're seeing is cartographic art, not reality.`;
};

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
  const [projectionDescription, setProjectionDescription] =
    useState<string>("");
  const [descriptionIndexes, setDescriptionIndexes] = useState<{
    [key: string]: number;
  }>({
    globe: Math.floor(Math.random() * projectionDescriptions.globe.length),
    mercator: Math.floor(
      Math.random() * projectionDescriptions.mercator.length
    ),
    albers: Math.floor(Math.random() * projectionDescriptions.albers.length),
    equalEarth: Math.floor(
      Math.random() * projectionDescriptions.equalEarth.length
    ),
    equirectangular: Math.floor(
      Math.random() * projectionDescriptions.equirectangular.length
    ),
    winkelTripel: Math.floor(
      Math.random() * projectionDescriptions.winkelTripel.length
    ),
  });

  const randomizeLambertParams = () => {
    // Generate random values for Lambert parameters
    const newCenter = Math.floor(Math.random() * 160) - 80; // -80 to 80
    const newParallel1 = Math.floor(Math.random() * 160) - 80; // -80 to 80
    const newParallel2 = Math.floor(Math.random() * 160) - 80; // -80 to 80

    setCenter(newCenter);
    setParallel1(newParallel1);
    setParallel2(newParallel2);

    return {
      center: newCenter,
      parallel1: newParallel1,
      parallel2: newParallel2,
    };
  };

  const changeProjection = (projection: ProjectionType) => {
    if (!map.current) return;

    let params;

    if (projection === "lambertConformalConic") {
      // Randomize Lambert parameters when selecting Lambert
      params = randomizeLambertParams();

      map.current.setProjection({
        name: projection,
        center: [0, params.center],
        parallels: [params.parallel1, params.parallel2],
      });

      // Update the description based on new parameters
      setProjectionDescription(
        getLambertDescription(params.center, params.parallel1, params.parallel2)
      );
    } else {
      map.current.setProjection(projection);

      // For non-Lambert projections, get a random description from the array
      if (projection in projectionDescriptions) {
        setProjectionDescription(
          projectionDescriptions[
            projection as keyof typeof projectionDescriptions
          ][descriptionIndexes[projection]]
        );
      } else {
        setProjectionDescription("");
      }
    }

    setCurrentProjection(projection);

    // Adjust zoom level and rotation based on projection type
    const isGlobe = projection === "globe";
    const newZoom = isGlobe ? 1.5 : 0.8;

    map.current.easeTo({
      zoom: newZoom,
      bearing: projection === "albers" ? 103 : 0, // Rotate Albers 103 degrees clockwise
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

    // Update description when Lambert parameters change
    setProjectionDescription(
      getLambertDescription(center, parallel1, parallel2)
    );
  };

  useEffect(() => {
    updateLambertProjection();
  }, [center, parallel1, parallel2]);

  // Set initial projection description
  useEffect(() => {
    // Set description for globe projection on initial load
    setProjectionDescription(
      projectionDescriptions.globe[descriptionIndexes.globe]
    );
  }, []);

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
              6, // Increased from 3 for better mobile tapping
              4,
              8, // Increased from 5
              8,
              12, // Increased from 8
              12,
              15, // Increased from 10
              16,
              18, // Increased from 12
            ],
            "circle-color": "#de1d8d",
            "circle-stroke-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              1.5, // Increased from 1
              4,
              2, // Increased from 1.5
              8,
              2.5, // Increased from 2
              12,
              3, // Increased from 2.5
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
              <p class="text-lg leading-relaxed" style="font-family: 'DovesType-Text', serif;">${formattedHaiku}</p>
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
              {currentProjection === "lambertConformalConic" &&
              proj.value === "lambertConformalConic"
                ? "Randomize"
                : proj.name}
            </button>
          ))}
        </div>

        {/* Display projection description */}
        {projectionDescription && (
          <div className="mt-4 max-w-2xl mx-auto text-sm italic text-skin-base opacity-80 px-4">
            {projectionDescription}
          </div>
        )}

        {currentProjection === "lambertConformalConic" && (
          <div className="mt-6 max-w-xl mx-auto px-4">
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
