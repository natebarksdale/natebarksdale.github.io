---
author: Nate Barksdale
pubDatetime: 2025-02-19
modDatetime: 2025-04-09T20:04:10Z
title: Is it ethical to clone FDR's voice? What if it's really, really funny?
slug: is-it-ethical-to-clone-fdrs-voice-what-if-its-really-really-funny
featured: false
draft: false
description: Or, a joke that shall live in infamy...
emoji: 🎤
tags:
  - 💡 Ethics
  - 💬 Technology
  - 🧠 Artificial Intelligence
  - 🌍 History
  - 😂 Humor
  - 🤖 Experiments
  - 🤖 Claude
  - 🎶 Sounds
  - ➿ What Comes Next_
haiku: |
  Roosevelt speaks
  Through quantum hallucinations
  Robot voice returns
coordinates: [38.8977, -77.0365]
---

The other day a college friend — who I have generally considered to be mildly luddite — posted what appeared to be a student's AI-assisted research results confidently stating that Franklin Delano Roosevelt was known for his signature eyepatch.

If you buy into the theory (which I just made up) that every LLM hallucination is simply a quantum sign of the existence of a parallel universe where the hallucination is true and there's a university writing teacher guffawing right now at the idea of an alt-FDR known for using crutches, then this becomes an irresistible challenge which, frankly, AI is up to quickly meeting.

I hopped over to the AI model testing ground [huggingface](https://huggingface.co), where I found an instance of [a Chinese open-source voice-cloning algorithm](https://huggingface.co/spaces/mrfakename/E2-F5-TTS) which will, based on 15 seconds of sample audio, create what sounds like a very advanced robot trying its darnedest to impersonate the source (and succeeding 95 percent of the time).

I made a [quick snippet sample](@assets/media/fdr-sample.mp3) of FDR's "Date that will live in infamy" speech to Congress after the Pearl Harbor attacks. And plugged in some generated sample text I got by prompting Claude for bombastic 1930s political eypatch-centric rhetoric.

<audio controls style="width: 100%; max-width: 400px;">
  <source src={@assets/media/fdr-eye-patch.wav} type="audio/wav" />
  Your browser does not support the audio element.
</audio>

My friend said he hadn't laughed so hard in a long time. But ... was our laughter ethical? I feel OK with this use case of voice cloning because a) it's of a well-known public figure who b) has been dead for over 50yrs and is c) "saying" something that would be really hard to interpret as other than a joke. This feels like it's having that one guy in your improv troupe who's really good at impressions. Also there's the matter of d) the low-quality model offers some creepily inhuman passages to the presidential defense of eye-shielding, where the flesh-mask falls away to reveal the inhuman model beneath. Honestly it's those moments that make the piece the most charming.

![](@assets/media/fdr-eye-patch.wav)
