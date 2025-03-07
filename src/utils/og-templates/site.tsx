import { SITE } from "@config";

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
      {/* Main container */}
      <div
        style={{
          width: "88%",
          height: "80%",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "2rem",
        }}
      >
        {/* Shadow */}
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

        {/* Content container */}
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#fefbfb",
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
            {/* Site title and description */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "90%",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 72,
                  fontWeight: 700,
                  margin: 0,
                  padding: 0,
                }}
              >
                {SITE.title}
              </p>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 28,
                  marginTop: "1rem",
                }}
              >
                {SITE.desc}
              </p>
            </div>

            {/* Footer */}
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
                  fontWeight: 700,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {new URL(SITE.website).hostname}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
