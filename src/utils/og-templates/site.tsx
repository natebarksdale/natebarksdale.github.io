import { SITE } from "@config";
import OgIllustration from "./OgIllustration";

export default () => {
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
      {/* Add the OgIllustration as a background */}
      <OgIllustration title={SITE.title} />

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
          zIndex: 5, // Ensure it's above the illustration
        }}
      />

      <div
        style={{
          border: "4px solid #000",
          background: "rgba(254, 251, 251, 0.85)", // Add transparency to see the background
          borderRadius: "4px",
          display: "flex",
          justifyContent: "center",
          margin: "2rem",
          width: "88%",
          height: "80%",
          position: "relative",
          zIndex: 10, // Ensure it's above the illustration
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "90%",
              maxHeight: "90%",
              overflow: "hidden",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: 72,
                fontWeight: "bold",
                textShadow: "0 2px 4px rgba(0,0,0,0.2)", // Add text shadow for better visibility
                display: "flex", // Add explicit display for Satori
              }}
            >
              {SITE.title}
            </p>
            <p style={{ fontSize: 28, display: "flex" }}>{SITE.desc}</p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
              marginBottom: "8px",
              fontSize: 28,
            }}
          >
            <span
              style={{
                overflow: "hidden",
                fontWeight: "bold",
                display: "flex",
              }}
            >
              {new URL(SITE.website).hostname}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
