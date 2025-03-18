---
author: Nate Barksdale
pubDatetime: 2025-03-11
modDatetime: 2025-03-11 19:54:16+00:00
title: Blog Resurrection
slug: blog-resurrection
featured: True
draft: False
tags:
  - 🌐 Blogging
description: Using LLMs to pull thousands of old blog posts back from a grave of mangled database text and rotten links
emoji: ✍️
haiku: |
  Old words find new home,
  Past thoughts revived, take new breath,
  Making culture bloom.
coordinates: [51.509865, -0.118092]
---

## When is the past worth saving, and how do we go about it it?

I came to this new site with a huge back-catalog of nearly a thousand blog posts, penned articles and the like. The core of it contained posts brought over from my work writing for [Culture Making](https://www.culture-making.com), a blog that launched in conjunction with Andy Crouch's [book of that name](https://www.amazon.com/Culture-Making-Recovering-Creative-Calling/dp/0830837558), and plugged on with daily posts of anything I found resonant with the themes Andy expores in the book.

Culture Making ceased active posting around 2010, and I moved most of the posts over to my personal domain, natebarksdale.com, where I set up a wordpress blog to serve them along with basic portfolio information for [Nate Barksdale Writing + Design](https://natebarksdale.xyz).

Around 2020, a rogue `php` update hobbled that site, but I didn't have capacity to dig into the source code to figure out what had gone wrong. Then in 2020, I somehow missed a domain re-registration and `natebarksdale.com` got swiped by a third party; my bespoke URL now led users to a Chinese-language web hosting page. (A year or two later, the domain's owner reached out to me to offer to sell it back, for $3,000, but I declined. Hence, our current home at <natebarksdale.xyz>).

The Wordpress blog still, technically, existed on its old server, but neither the public-facing portion nor the Wordpress admin panel was accessible. After some poking around I realized I still had access to the blog's database through `PHPMyAdmin`; from there I was able to export a giant blob of a `json` file containing all of the posts from the Wordpress blog (but not the post tags I'd used to categorize -- more on that later).

## Enter the LLMs

I new I had the content in there somewhere, and that I wanted to break out the posts in `markdown` files (basically lightly formatted plain text) used by my new blog setup. I fired up `ChatGPT` and gave it the following prompt:

> {ChatGPT}
>
> {Q}I have a json export from my old blog that I want to format and split into separate markdown files, one for each blog post. Here's an example of the json export format: {"ID":"863","post_author":"1","post_date":"2009-05-26 ... [followed by more json]

... and entered into a dialogue with the LLM. Its predicted suggestion was to create a `Python` script that would handle the file formatting and generate the Markdown front matter block, in the necessary `YAML` formatting. I had a little back and forth where I showed it one of the sample Markdown-formatted posts that had come with the `AstroPages` blog template I was using.

After some more back and forth (ChatGPT provided both sample code and bullet-point explanations that gave me a sense that the code had been assembled to do what I was asking for), I was ready to ask:

> {ChatGPT}
>
> {Q}Cool. How would I test the script on my Mac?

I followed the instructions and ... it didn't work. Hence more digging into the current state of things with LLM coding:

1. Prompt the LLM for code
2. Plug it in
3. Try it out
4. Paste the inevitable error log into the LLM
5. Skim the LLM's friendly `Ah, I see what the problem is!` and follow further instructions.
6. Repeat until the error messages stop coming.
7. Then check to see if the code actually accomplishes what you were asking for

In the case of me and my Mac, this involved the dance of error messages for a little while until I was guided to set up a virtual environment that would let me run my script in `python3`. And then, momentously ...

> {ChatGPT}
> {Q}I ran it but it didn't convert anything. I'll attach the full json file -- do I need to update the python script?

Back to the error dance until I got a version that ran. Then more back-and-forth pasting in the output I was getting and the output I wanted. Then dropping some of the sample Markdown files into my actual blog folder, doing a `git` push to GitHub Pages, where the site is living, flagging errors, pasting those back into the LLM, and so forth.

## Link Rot

Resurrection is a tricky business, and I knew that many of the things I had linked back in my 2008-10 blogging heyday would have been rotted out. So I had the `LLM` come up with another python script that would go through each Markdown file, look for links, check those links, and then replace broken links with a working fallback. My initial idea was to just construct a simple Google search link from the link text itself, but in practice these searchers were usually not very useful. Instead, what I landed on was generating and then checking a Wayback Machine link for an archived version of whatever page I had linked. Only if this failed would we fall further back to a Google search.

> {ChatGPT}
>
> {A}```

    		# Process non-image links
    		md_link_pattern = r'(?<!\!)\[([^\]]+)\]\(([^)]+)\)'
    		for m in re.finditer(md_link_pattern, modified_content):
    			link_text, raw_link_url = m.group(1).strip(), m.group(2).strip()
    			link_url = raw_link_url.split()[0]

    			if is_link_broken(link_url, filepath):
    				stripped_url = strip_query_params(link_url)
    				if stripped_url != link_url and not is_link_broken(stripped_url, filepath):
    					replacement_url = stripped_url
    					print(f"Fixed Markdown link in {filename}: {link_url} → {stripped_url}")
    				else:
    					wayback_url = check_wayback_link(link_url)
    					if wayback_url:
    						replacement_url = wayback_url
    						print(f"Replaced {link_url} with Wayback Machine link: {wayback_url}")
    					else:
    						site_name = extract_site_name(link_url)
    						search_query = f'"{link_text}" {site_name}' if site_name else f'"{link_text}"'
    						replacement_url = f"https://www.google.com/search?q={quote(search_query)}"
    						print(f"Replaced {link_url} with Google search: {replacement_url}")

    				modified_content = modified_content.replace(m.group(0), f"[{link_text}]({replacement_url})")
    				link_replacements_made = True

    				if modified_content != content_no_pub:
    					with open(filepath, "w", encoding="utf-8") as f:
    						f.write(modified_content)
    					new_filepath = os.path.join(fixed_links_folder, filename)
    					if os.path.exists(filepath):
    						os.rename(filepath, new_filepath)
    						print(f"Moved {filename} to fixed_links folder")
    				else:
    					print(f"No broken non-image links fixed in {filename}; file left in place.")```

And it worked! Which was a good thing, because something like two-thirds of the links in the old blog materials had rotted out. (Broken image links were another matter — either I removed them entirely, or, in the case of images I had once hosted, found the old files and integrated them into the new site.)

## LLMs Summoning LLMs

One thing I realized is that AstroBlog needs each Markdown file to contain a description property. Since writing up 900 descriptions didn't seem feasible, my first idea was to just use the first sentence of the blog post. I had the LLM come up with a script for that but quickly realized that that was causing issues (the blog's yaml header format didn't like some of the punctuation and syntax that was getting hoovered up).

Ah, but looking at text and coming up with a plausible summary is just the sort of thing that LLMs excel at, if only I could automate the prompting. I realized I could do just that, using [Simon Willison](https://simonwillison.net)'s [LLM Plugin](https://llm.datasette.io/en/stable/index.html), which gives a command-line interface for LLM requests. Once it's set up (and you've authorized it to a funded LLM account) you can type things like

```

llm "Eight hilariously incorrect facts about Martin Van Buren"

```

and get a result. In this case, I had ChatGPT help me figure out how to make a Python script that would:

- Read each blog post's content and write me a one-liner description field (required for the header section of the file)
- Generate tags for each post — they had all had tags once upon a time, but those didn't come through in the export
- A topical emoji for the post
- A best-guess set of latitude and longitude coordinates based on the post content (surprisingly accurate in many cases, hilariously wrong in others)
- A Haiku inspired by the post

I actually had now idea how I was going to use the Haiku when I asked it, but in the end I found a way — both as silly alt text for the post links, and in the Mapping feature I came up with since I had lat/lon info.

I refined the script on a small batch of around 10 sample pages to keep costs down, but even when I ran the whole 900+ post archive through it, it cost me less than a dollar in ChatGPT API credits. (I'll write another post about Claude Code, which is a much faster -- but arguably even more useful -- way to feed money into the LLM).

## Map Illustrations

Since I had lat/lon coordinates for each post, I decided to programatically create collage style illustrations for each post. I suppose another way to do this would have been to generate custom images using MidJourney or DallE in a similar pipeline from LLM. With art-history-informed prompting (e.g. `generate an image based on the post text in the style of a collage made from cut-up pieces of 19th century aquatint prints and woodblock type samples`) we might have had something pretty good. But I have mixed feelings about deploying these fascinating tools for mass illustration. Somehow it seemed better to have an assembly that was somewhat artistic but also somewhat programmatic.

The basic instruction for the assembled illustrations was to have a background satellite image centered on the lat/lon coordinates, with layers of cropped letters, seeded from words in the post title. Developing it was a classic LLM story — incredibly quick to get to an impressive working prototype, but surprisingly difficult to fine-tune. This difficulty of tuning was greatly expanded because I was giving it visual feedback that _the model couldn't directly see_. Even when I did back-and-forth with screenshots, there were often loops and loops of errors where the layers just wouldn't be clustered in the way I intended. Eventually, though, after a few LLM chat sessions where I grew increasingly frustrated, we arrived at what we have now: not perfectly what I'd envisioned, but close enough I'm not going to try much more.

## Resurrection Men

In London there's a nice plaque marking the site of the Fortune of War, a pub at Pye Corner (now revamped as a co-working space) where the Resurrection Men of old — that is, people who acquired corpses under dubious circumstances and sold them to medical students eager to learn anatomy. According to the plaque, they would bring the bodies upstairs for display, so that future surgeons could select the make and model best suited to their needs.

Trying to pull my own blog back from online death (and the growing stench of link rot) has seemed, over the past few weeks, to be an enterprise both dubious and thrilling. It's fun seeing my old, un-remembered posts and remarks. And I'm learning a bit of anatomy as well — about what works, and doesn't, with the current tools on hand.

One of the recurring features on the Culture Making blog was what Andy and I called the Five Questions (taken, of course from the book), where each week we'd interrogate a cultural artifact, asking what it says about the world, what it makes possible, or impossible, or difficult, and what new culture is created in response. This new era for the old material asks, and answers, those questions in so many ways — ways I hope to explore a bit more in the site's current resurrected state.

Other LLM formats:

> {ChatGPT}
>
> {Q}What's a cool name for my dog?
>
> {A}Fido or rex -- which do you like?
>
> {Q}Rex is pretty good. Thanks!
>
> {A}No problem!

> {Claude}
>
> {Q}What's a cool name for my dog?
>
> {A}Fido or rex -- which do you like?
>
> {Q}Rex is pretty good. Thanks!
>
> {A}No problem!

> {Gemini}
>
> {Q}What's a cool name for my dog?
>
> {A}Fido or rex -- which do you like?
>
> {Q}Rex is pretty good. Thanks!
>
> {A}No problem!

> {Mistral}
>
> {Q}What's a cool name for my dog?
>
> {A}Fido or rex -- which do you like?
>
> {Q}Rex is pretty good. Thanks!
>
> {A}No problem!

> {DeepSeek}
>
> {Q}What's a cool name for my dog?
>
> {A}Fido or rex -- which do you like?
>
> {Q}Rex is pretty good. Thanks!
>
> {A}No problem!

## LLM Chat Markdown Format - Example

````markdown
> {ChatGPT}
> {Q}How do I add a code block to my Python project?
>
> {A}You can add a code block to a Python project by following these steps:
>
> ```python
> # This is a simple Python function
> def hello_world():
>     print("Hello, World!")
>
> # Call the function
> hello_world()
> ```
>
> Make sure to indent your code properly as Python is whitespace-sensitive.
>
> {Q}What about adding comments to my code?
>
> {A}Python supports both single-line and multi-line comments:
>
> ```python
> # This is a single-line comment
>
> """
> This is a multi-line comment or docstring
> that can span multiple lines of text
> """
>
> def my_function():
>     """This is a function docstring."""
>     # This comment explains the next line
>     return True
> ```
>
> Good comments explain why rather than what the code is doing.
````

## Important Format Rules

1. Start with `> {ModelName}` (e.g., `> {ChatGPT}`, `> {Claude}`)
2. Each message starts with `> {Q}` or `> {A}`
3. Separate messages with a blank line containing only `>`
4. Place code blocks _directly after_ the text they belong to, without blank lines
5. Start every line (including code) with `>`
6. Use standard code block syntax: triple backticks with language name

## Troubleshooting

If your code isn't appearing correctly in chat bubbles:

1. Check that the code block appears immediately after text (no blank line)
2. Verify that every line of the code block starts with `>`
3. Make sure the CSS changes are properly applied to your theme
4. Check browser console for any JavaScript errors
   > .counter {
   > display: flex;
   > flex-direction: column;
   > align-items: center;
   > padding: 1rem;
   > border-radius: 8px;
   > background-color: #f8f9fa;
   > box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
   > }
   >
   > .counter-buttons {
   > display: flex;
   > gap: 0.5rem;
   > }
   >
   > button {
   > padding: 0.5rem 1rem;
   > border: none;
   > border-radius: 4px;
   > background-color: #0d6efd;
   > color: white;
   > cursor: pointer;
   > transition: background-color 0.2s;
   > }
   >
   > button:hover {
   > background-color: #0b5ed7;
   > }
   >
   > .reset-button {
   > background-color: #6c757d;
   > }
   >
   > .reset-button:hover {
   > background-color: #5c636a;
   > }
   >
   > ```
   >
   > ```
