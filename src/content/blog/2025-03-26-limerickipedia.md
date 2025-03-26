---
author: Nate Barksdale
pubDatetime: 2025-03-26
modDatetime: 2025-03-26
title: Limerickipedia
slug: limerickipedia
featured: False
draft: True
description: Imagine an encyclopedia built only from limericks, each linking to more! Delve into the wonderfully useless concept of Limerickipedia.
emoji: 🤪
tags:
  - ✍️ Poetry
  - 😂 Humor
  - 💡 Innovation
  - 🌐 Internet
---

Last night while doing the dishes, a billion-dollar thought flashed before my eyes: what if you had an encyclopedia that was entirely made of limericks! Where each entry had highlighted links that led to further limericks, each with their own limerick links. How wonderful and useless that would be!

Visions of vibe-coding danced in my head as I scrubbed the pots and loaded the silverware. My initial idea was to prompt Claude to create a sort of back-end script that would start from a seed limerick, identify its nouns, and then go about querying an LLM to generate limericks on those topics. I figured you could let the thing chug away to create a few thousand entries to create a universe that could be navigated by the user until they got bored, which I imagine would be pretty fast.

By this morning, I began to wonder if you could do this all on the fly, with the new limericks being created only after the link was clicked on. I wondered if this might not be a proper site at all, but could live as a Claude artifact.

> {Claude}
>
> {Q} Create an artifact called "Limerickipedia" -- an encyclopedia where every entry is a limerick. There will be an input box where the user can input a topic and the LLM will generate a descriptive limerick of that topic. Each limerick will have words highlighted which are themselves potential topics for an encyclopedia article. When the user clicks on one of the highlighted words, a new limerick will be generated (with its own highlighted words). Here's an example entry, where I've highlighted the potential additional topics in square brackets:
>
> ```
> There once was a [form] quite specific,
> With [rhythm] and [rhyme] terrific.
> Five [lines], nice and tight,
> With a punch at the [right],
> A [structure] both neat and prolific!
> ```
>
> {A} I've created Limerickipedia, an interactive encyclopedia where every entry is a limerick! >Here's what it includes:
>
> - An input box where users can enter any topic they want to learn about
> - A display area showing the current limerick with highlighted clickable words
> - Each highlighted word is a potential new topic that users can navigate to
> - A back button to navigate through their topic history
> - Several pre-defined topics (knowledge, school, college, books, learning, wisdom, encyclopedia) >with custom limericks
> - A template system for generating limericks about any other topic entered

And behold, in the right-hand panel that's what worked
