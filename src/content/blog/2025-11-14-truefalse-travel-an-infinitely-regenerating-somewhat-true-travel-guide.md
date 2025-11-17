---
author: Nate Barksdale
pubDatetime: 2025-11-14
modDatetime: 2025-11-17T15:52:20Z
title: True/False Travel
slug: truefalse-travel-an-infinitely-regenerating-somewhat-true-travel-guide
featured: true
draft: false
description: An experimental travel guide leverages LLMs to create a playful, structured, and surprising exploration of fictionalized destinations, blending accuracy with creative fabrication.
emoji: 🌐
tags:
  - 🌐 Blogging
  - 🌍 Storytelling
  - ✍️ Literature
  - 🔍 Discoveries
  - 💡 Innovation
haiku: |
  Fictions spun by bots
  Truth and lies in guides we read
  Travel, code, and fun
coordinates: [34.0522, -118.2437]
---

I spent long enough as a travel guidebook editor to gain a healthy respect of, and wariness towards, the cliche. On the one hand we tried to avoid them like the plague ("Delhi is a city of contrasts, ancient yet modern ..."). But on the other hand, to be useful a travel guide has to be predictable, structured, each city or site writeup just different enough from the ones before or after so the user knows where to look in the text.

LLMs are cliche machines, and as such are uniquely suited to delivering structured text that is both variable and predictable. So what if the text isn't always accurate in terms of the real world? The truth is, printed travel guides produced in the oldest styles are also collections of fact and fiction, of realities squeezed to fit the structure, even of the odd editorial or reporterly hallucination.

So it seemed like it would be fun to make an infinitely regenerating, somewhat-true travel guide, with LLM calls at the backend. And so I did it: presenting [True/False Travel]()

I'd played around with the concept a few months back in a Claude artifact, structured around the old game of "two truths and a lie." This weekend, on a long flight, I fired up Claude Code on my iphone, connected it to my github pages setup, and got to prompting.

> {Claude}
>
> {Q} Let’s create a gamified open ended travel guide around the structure of “two truths and a lie”. It will use an LLM to generate place descriptions with the appropriate travel guide categories for the context (intro, getting there, sights, lodgings, food and drink, activities for a city, for instance, or more granular categories for a museum or historic building). Each category will be structured as 3 items — two truths and one lie (not always in that order). Place or site names within these descriptions will be links to their own generated-on-the-fly overviews along thr same lines. To test this you can generate sample pages your own LLM tools, but we will want to be able to deploy via openrouter to switch to cheaper or different models. One other thing: there should be a drop down option to switch between travel prose types: Standard, Richard Francis Burton, Isabella Bird, Ibn Battuta, Dorothy West and Hunter S. Thompson. Also add maps if possible using open street map or map box or another free plugin. Ideally the map would wood plot all the listings and linked nouns — true or made up — that appear on a given page.
>
> {A} I'll help you create this gamified travel guide! This is a creative and complex project. Let me start by planning the implementation and checking what's already in the codebase.
>
> ☐ Exploring existing codebase structure<br/>
> ☐ Design application architecture and data structures<br/>
> ☐ Set up React app with routing and state management<br/>
> ☐ Implement OpenRouter LLM integration<br/>
> ☐ Create place page generator with two truths and a lie structure<br/>
> ☐ Add writing style selector (Standard, Burton, Bird, Battuta, West, Thompson)<br/>
> ☐ Integrate map functionality with OpenStreetMap/Mapbox<br/>
> ☐ Implement link extraction and dynamic page generation<br/>
> ☐ Add game mechanics (scoring, reveal system)<br/>
> ☐ Test with sample locations and commit changes

By the time we landed I had tested and iterated and launched a useable, public-facing proof of concept. Over the rest of the weekend, I would occasionally pull my phone out and look at the latest version, offer some feedback to Claude, and have it generate another set of suggested changes.

By the end of the weekend I'd ironed out all of the issues I could think of, including setting up a Cloudflare worker to handle the LLM calls without exposing my API key. I did this entirely from my phone, either in the Claude App or on the GitHub, Cloudflare and OpenRouter sites. Some of the stuff at the end would have been easier to handle on my laptop, but by this point it had become a point of pride.

## What is this, really?

Ultimately the site is just a UI to generate LLM responses according to the criteria I or the user have set up, and then display the results as if they were a somewhat gamified travel website. You could get roughly the same result, maybe minus the maps and points, by typing a long prompt into the Claude chatbot. But having all that structure both sets up the user to explore and gives a level of comforting structure, the same kind that a nice travel guide gives.

The true/false concept is not entirely reliable — as you browse the distinctions will blur and there's a non-zero chance the LLM will incorrectly label the description the user is supposed to be guessing about. It's also an admittedly weird thing for a professional fact-checker to be spending time developing. But I think one of the best approaches to working with LLMs without being either led astray or driven mad is to figure out how to use them with a kind of playful, curious skepticism.

Will True/False travel tell you facts about [London](https://natebarksdale.xyz/experiments/travel-guide.html#London) or [Shanghai](https://natebarksdale.xyz/experiments/travel-guide.html#Shanghai) or [Naini Tal](https://natebarksdale.xyz/experiments/travel-guide.html#Naini%20Tal)? Yes and no. Will it do so in the plausible voice [Dorothy Parker](https://en.wikipedia.org/wiki/Dorothy_Parker) or [Ibn Battuta](https://en.wikipedia.org/wiki/Ibn_Battuta) or whoever you might name? No and OH MY GOODNESS NO!

But it's fun and you might learn something, maybe not so much about the world as it is and was, but the world as a certain pile of cultural information might be made to predict it to be.

## Technical notes

This was really amazing to use — many of the iterative loops were very short: I described the feature and Claude was able to build it, filling in what I hadn't named with completions that were plausible, in some cases better, but only broke functionality a small percentage of teh time.

The largest set of iterations were as Claude and I felt out how to handle the issue of API keys for the LLM. I wasn't too worried about security or exposure, since I'd set a $5 limit on the OpenRouter keys I was using. But GitHub absolutely freaked out when I had Claude hardcode the key into the javascript that was handling the LLM calls from the user's browser. I went through a whole round playing around with self-encrypting the key to keep it hidden from at least scraper searches, though of course a user could have discovered it.

As with previous attempts to project-manage Claude Code to build and update sites and tools (but even more so) I was struck by the uneven surface of ease — some things were truly one-shot endeavors, while others required tons of back-and-forth. I had to have Claude strip the emoji from some of the sections because it was unable to make them render in the correct Noto mono emoji font — even though we very successfully use the same font in the navigation. If I hadn't been as committed to completing the prototype entirely on my phone, I would have probably hopped into a text editor and fixed the CSS myself, but given my constraints it was easiest to just change what I was asking for.

## Claude's own analysis of how it went

> {Claude}
>
> {A} I've created a comprehensive development analysis report for your True/False Travel project. Here's what I found:
>
> {A} Key Metrics<br/>- **105 commits** over 3.5 days (Nov 7-10)<br/>- **47 pull requests** merged (highly iterative development)<br/>- **+3,089 net lines** of code<br/>- **~4,455 total lines** in the final version<br/>Tech Stack<br/>The final app uses vanilla JavaScript (no frameworks), Leaflet.js for maps, Cloudflare Workers for API security, OpenRouter for LLM access, and GitHub Pages for hosting. Notably lightweight---no build tools or dependencies beyond Leaflet.<br/>Development Patterns<br/>**What Claude Code nailed:**<br/>- Map integration (Leaflet) was nearly perfect first try<br/>- LLM API integration worked smoothly<br/>- State management architecture was clean from the start<br/>- Responsive CSS mostly worked without iteration<br/>**What needed iteration:**<br/>- **API security** (8+ attempts): Underestimated the problem, went from client-side obfuscation → proper Cloudflare Workers proxy<br/>- **CSS micro-details** (15+ commits): Emoji rendering, button alignment, color contrast---worked "mostly" but needed polish<br/>- **Deployment debugging** (6+ iterations): GitHub Actions secret encoding issues, trailing newlines, env var syntax<br/>- **Gameplay mechanics** (2 pivots): Started complex, simplified to true/false, adjusted feedback generation for token costs<br/><br/>The Pattern<br/>Clear distinction emerged: Claude Code excels at **conceptual architecture** but requires human iteration for **cosmetic precision**. The gap between "good enough" and "polished" is where you spent time.
