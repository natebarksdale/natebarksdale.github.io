---
author: Nate Barksdale
pubDatetime: 2025-03-26
modDatetime: 2025-03-26
title: Limerickipedia
slug: limerickipedia
featured: False
draft: False
description: Imagine an encyclopedia built only from limericks, each linking to more!
emoji: 🤪
tags:
  - ✍️ Poetry
  - 😂 Humor
  - 🤖 Experiments
  - 🤖 Claude
  - 🌐 Internet
haiku: |
  Dishes gleam, thought sparks
  Linked limericks weave a strange web
  Useless, wordy fun
---

Last night while doing the dishes, a billion-dollar thought flashed before my eyes: what if you had an encyclopedia that was entirely made of limericks! Where each entry had highlighted links that led to further limericks, each with their own limerick links. How wonderful and useless that would be!

tldr; I built it: [Limerickipedia](https://limerickipedia.vercel.app)

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
> {A} I've created Limerickipedia, an interactive encyclopedia where every entry is a limerick! >Here's what it includes:
> - An input box where users can enter any topic they want to learn about
> - A display area showing the current limerick with highlighted clickable words
> - Each highlighted word is a potential new topic that users can navigate to
> - A back button to navigate through their topic history
> - Several pre-defined topics (knowledge, school, college, books, learning, wisdom, encyclopedia) >with custom limericks
> - A template system for generating limericks about any other topic entered
> ```

And behold, in the right-hand Artifact panel, that's what appeared.

One of my key mental concepts for experimenting and building with LLMs is that of uneven surfaces. Things that seem like they should be hard seem unaccountably easy, and vise versa. In this case, the easy part was really making the initial demo. It got harder once I realized the artifact it created wasn't making limericks at all.

> {Claude}
>
> {Q} It looks like the limericks are being generated from our pre-registered patterns. What I want is to do an actual LLM call for each new limerick, so if I search for "Cat" I get a limerick on that exact topic, rather than something nonsensical like "The field of cat is vast..."
>
> {Q} Can I run my own LLM API calls within the artifact, or do I need to host this on my own?
>
> {A} I understand your request better now. You want the application to generate actual unique limericks about any topic using an LLM call rather than relying on templates. Let me update the component to incorporate this functionality.
>
> {A} Within the artifact itself, you generally can't run your own LLM API calls directly. React components rendered in the artifact environment don't have access to make external API calls to LLM services. You would need to host this on your own server to implement the actual LLM functionality. There are a few approaches you could take...

Now we were off to the races. Claude walked me through setting up a vercel instance on my local computer and soon enough I had it putting out API calls to the LLM of my choice and returning haiku.

More problems, of course, arose:

> {Claude}
>
> {Q} I have it running, but the api only returns the first line of the limerick, and without highlighting any words ever (I'm using free models so this could be the issue, but it's the same for all of them)

It was like this for cycle after cycle: one issue fixed, new issue emerges, and Claude was unfailingly apologetic and patient as we moved through it. Occasionally Claude would add or delete features without being asked — it was always minor, and probably the same thing would happen if I was interacting with a human developer to fix my requests.

Finally — it was working on my local system! I entered a new world of build errors, pasting in log code, etc. Much of it revolved around type errors, which it was painful to identify and fix one at a time as I had to wait a minute or two each time for vercel to fail the build the site and give me an output log telling me where it got stuck.

Up till now I had been doing everything via my Claude Pro account, but the chat kept exceeding the context window and it kept asking me to type "Continue" mid-process, which sometimes seemed to result in slightly mangled code. So I cheated a bit — firing up Claude Code to tell it my woes. Because Claude Code has visibility for all of the files in my project, it was better at fully solving the items. And because it does this for cash, it won't quit midway through a process as long as it's funded (I gave it $5 or $10). I gave Claude Code the sample error output for one kind of type error, and told it to fix that and any other similar issues in the code. This it did for like $0.50.

## Conclusions

This is addictive — being able to go from a wild idea to a working prototype so quickly was awesome. But, like many addictive things, it winds up demanding a bit more of you than the initial dopamine rush might indicate. Pre-LLMs I would have assumed this was something that would take a pro developer a day or two, so it would've been out of my league. Post-LLMs, I figured it would probably work but definitely overestimated how much it would still require of me (it took most of a workday babysitting the AI prompts). And even with the resorting to Claude Code in the end, there were still a lot of things I had to think hard to be precise about — both in describing what I wanted and what wasn't working, and in pulling in outside ideas gleaned from my general cloud of tech knowledge to effectively talk like a software project manager (e.g. it seems like you keep getting stuck trying X. Would it make sense to try this random thing I remember reading about recently in a tech article?).

Also — here again with the addictive angle — I want to make Limirickipedia _even better_ at doing its peculiar useless thing.
