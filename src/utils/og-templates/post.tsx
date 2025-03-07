import { SITE } from "@config";
import type { CollectionEntry } from "astro:content";

export default (
  post: CollectionEntry<"blog">,
  mapBackground: string | null = null
) => {
  // Define map-specific styling if a map background is provided
  const useMapBackground = !!mapBackground;

  return (
    <div
      style={{
        background: "#fefbfb",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Main content container - always rendered */}
      <div
        style={{
          width: "88%",
          height: "80%",
          position: "relative",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "2rem",
          zIndex: 5,
        }}
      >
        {/* Map background when coordinates are available */}
        {useMapBackground && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 0,
              display: "flex",
            }}
          >
            <img
              src={mapBackground}
              alt="Map background"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.3,
                filter: "grayscale(80%) contrast(120%)",
              }}
            />
          </div>
        )}

        {/* Shadow card */}
        <div
          style={{
            position: "absolute",
            top: "-8px",
            right: "-8px",
            width: "100%",
            height: "100%",
            background: "#ecebeb",
            borderRadius: "4px",
            border: "4px solid #000",
            zIndex: 1,
          }}
        />

        {/* Content card */}
        <div
          style={{
            width: "100%",
            height: "100%",
            background: useMapBackground
              ? "rgba(250, 245, 240, 0.9)"
              : "#fefbfb",
            borderRadius: "4px",
            border: "4px solid #000",
            position: "relative",
            zIndex: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Content wrapper */}
          <div
            style={{
              width: "90%",
              height: "90%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Title */}
            <div style={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 72,
                  fontWeight: 700,
                  color: "#111",
                  margin: 0,
                  padding: 0,
                }}
              >
                {post.data.title}
              </p>
            </div>

            {/* Footer with author and site title */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                marginBottom: "8px",
                fontSize: 28,
              }}
            >
              <span style={{ display: "flex" }}>
                by{" "}
                <span
                  style={{
                    overflow: "hidden",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    marginLeft: "0.5em",
                  }}
                >
                  {post.data.author}
                </span>
              </span>

              <span
                style={{
                  overflow: "hidden",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                }}
              >
                {SITE.title}
              </span>
            </div>
          </div>

          {/* Coordinates badge if available */}
          {post.data.coordinates && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "rgba(0,0,0,0.7)",
                color: "white",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "14px",
                fontFamily: "Inter, monospace",
                display: "flex",
              }}
            >
              {post.data.coordinates[0].toFixed(3)}°,{" "}
              {post.data.coordinates[1].toFixed(3)}°
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
