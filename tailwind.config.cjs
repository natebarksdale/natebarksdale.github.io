function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    // Remove the following screen breakpoint or add other breakpoints
    // if one breakpoint is not enough for you
    screens: {
      sm: "640px",
    },

    extend: {
      textColor: {
        skin: {
          base: withOpacity("--color-text-base"),
          accent: withOpacity("--color-accent"),
          inverted: withOpacity("--color-fill"),
        },
      },
      backgroundColor: {
        skin: {
          fill: withOpacity("--color-fill"),
          accent: withOpacity("--color-accent"),
          inverted: withOpacity("--color-text-base"),
          card: withOpacity("--color-card"),
          "card-muted": withOpacity("--color-card-muted"),
        },
      },
      outlineColor: {
        skin: {
          fill: withOpacity("--color-accent"),
        },
      },
      borderColor: {
        skin: {
          line: withOpacity("--color-border"),
          fill: withOpacity("--color-text-base"),
          accent: withOpacity("--color-accent"),
        },
      },
      fill: {
        skin: {
          base: withOpacity("--color-text-base"),
          accent: withOpacity("--color-accent"),
        },
        transparent: "transparent",
      },
      fontFamily: {
        serif: ['DovesType-Text', 'serif', 'Noto Emoji'],
        mono: ['IBM Plex Mono', 'monospace', 'Noto Emoji'],
        sans: ['Faune', 'sans-serif', 'Noto Emoji'],
      },

      typography: {
        DEFAULT: {
          css: {
            pre: {
              color: false,
            },
            code: {
              color: false,
            },
          },
        },
      },
      textDecorationThickness: {
        3: '3px',
        4: '4px',
        5: '5px',
        6: '6px',
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    function({ addUtilities, theme }) {
      addUtilities({
        '.fancy-underline': {
          'background': 'linear-gradient(0deg, rgb(var(--color-accent) / 0.5) 0%, rgb(var(--color-accent) / 0.5) 100%)',
          'background-position': '0 85%',
          'background-repeat': 'no-repeat',
          'background-size': '100% 0.4em',
          'text-shadow': [
            '0.1em 0 var(--color-fill)',
            '-0.1em 0 var(--color-fill)',
            '0 0.1em var(--color-fill)',
            '0 -0.1em var(--color-fill)'
          ].join(','),
        },
      })
    },
  ],
};
