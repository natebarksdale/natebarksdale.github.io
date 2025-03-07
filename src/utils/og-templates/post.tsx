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
          }}
        >
          <img
            src={mapBackground}
            alt="Map background"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "grayscale(80%) contrast(120%) brightness(80%)",
              mixBlendMode: "multiply",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(250, 245, 240, 0.75)",
              mixBlendMode: "overlay",
            }}
          />
        </div>
      )}

      {/* Shadow layer */}
      <div
        style={{
          position: "absolute",
          top: "-1px",
          right: "-1px",
          border: "4px solid #000",
          background: "#ecebeb",
          opacity: "0.9",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "center",
          margin: "2.5rem",
          width: "88%",
          height: "80%",
          zIndex: 1,
        }}
      />

      {/* Main content container */}
      <div
        style={{
          border: "4px solid #000",
          background: useMapBackground
            ? "rgba(250, 245, 240, 0.85)"
            : "#fefbfb",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "center",
          margin: "2rem",
          width: "88%",
          height: "80%",
          position: "relative",
          zIndex: 2,
          backdropFilter: useMapBackground ? "blur(8px)" : "none",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            margin: "20px",
            width: "90%",
            height: "90%",
          }}
        >
          {/* Title */}
          <p
            style={{
              fontFamily: "Libre Baskerville, serif",
              fontSize: 72,
              fontWeight: 700,
              maxHeight: "84%",
              overflow: "hidden",
              marginBottom: "1rem",
              color: "#111",
            }}
          >
            {post.data.title}
          </p>

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
            <span>
              by{" "}
              <span
                style={{
                  color: "transparent",
                }}
              >
                "
              </span>
              <span
                style={{
                  overflow: "hidden",
                  fontFamily: "Libre Baskerville, serif",
                  fontWeight: 700,
                }}
              >
                {post.data.author}
              </span>
            </span>

            <span
              style={{
                overflow: "hidden",
                fontFamily: "Libre Baskerville, serif",
                fontWeight: 700,
              }}
            >
              {SITE.title}
            </span>
          </div>

          {/* Show coordinates badge if available */}
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
                fontFamily: "IBM Plex Mono, monospace",
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
