---
title: Test Links Page
author: Nathan Barksdale
pubDatetime: 2025-03-26 09:30:00+00:00
featured: False
draft: False
tags:
  - test
modDatetime: 2025-03-26
slug: test-links-page
description: Testing out a new fancy underline style for links. See the CSS code behind a subtle, translucent red underline effect in action.
emoji: 🔬
---

## Testing Link Styles

This is a paragraph with a [link to test](/about). The link should have a fancy-underline effect with a translucent red underline.

### More links to test

Here's another [link example](#) that should also have the fancy-underline styling.

This [third link](https://example.com) should have the same styling as well.

```css
.fancy-underline {
  background: linear-gradient(
    0deg,
    rgb(var(--color-accent) / 0.5) 0%,
    rgb(var(--color-accent) / 0.5) 100%
  );
  background-position: 0 85%;
  background-repeat: no-repeat;
  background-size: 100% 0.4em;
  text-shadow:
    0.1em 0 var(--color-fill),
    -0.1em 0 var(--color-fill),
    0 0.1em var(--color-fill),
    0 -0.1em var(--color-fill);
}
```

The above code shows what the `.fancy-underline` class should look like.
