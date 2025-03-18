import Fuse from "fuse.js";
import { useEffect, useRef, useState, useMemo } from "react";
import Card from "@components/Card";
import type { CollectionEntry } from "astro:content";

export type SearchItem = {
  title: string;
  description: string;
  data: CollectionEntry<"blog">["data"];
  slug: string;
  content?: string; // Add content field
};

interface Props {
  searchList: SearchItem[];
}

interface SearchResult {
  item: SearchItem;
  refIndex: number;
  matches?: Array<{
    key: string;
    indices: Array<[number, number]>;
    value: string;
  }>;
}

export default function SearchBar({ searchList }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputVal, setInputVal] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(
    null
  );
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    setInputVal(e.currentTarget.value);
  };

  // Extract all unique tags for the filter
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();

    searchList.forEach(item => {
      if (item.data.tags) {
        item.data.tags.forEach(tag => tagSet.add(tag));
      }
    });

    return Array.from(tagSet).sort();
  }, [searchList]);

  // Create an improved Fuse instance with better configuration
  const fuse = useMemo(
    () =>
      new Fuse(searchList, {
        keys: [
          { name: "title", weight: 1.0 }, // Highest priority
          { name: "description", weight: 0.8 }, // High priority
          { name: "data.tags", weight: 0.7 }, // Medium-high priority
          { name: "content", weight: 0.5 }, // Medium priority
        ],
        includeMatches: true,
        minMatchCharLength: 2,
        threshold: 0.4, // Lower threshold for more exact matches
        distance: 100, // Allow terms to be further apart in content
        useExtendedSearch: true, // Enable extended search for more powerful queries
      }),
    [searchList]
  );

  // Toggle a tag filter
  const toggleFilter = (tag: string) => {
    if (activeFilter === tag) {
      setActiveFilter(null);
    } else {
      setActiveFilter(tag);
      // Auto-append the tag to the search if there's already a query
      if (inputVal && !inputVal.includes(tag)) {
        setInputVal(`${inputVal} ${tag}`);
      } else if (!inputVal) {
        setInputVal(tag);
      }
    }
  };

  useEffect(() => {
    // If URL has search query, insert that search query in input field
    const searchUrl = new URLSearchParams(window.location.search);
    const searchStr = searchUrl.get("q");
    if (searchStr) setInputVal(searchStr);

    // Put focus cursor at the end of the string
    setTimeout(function () {
      inputRef.current!.selectionStart = inputRef.current!.selectionEnd =
        searchStr?.length || 0;
    }, 50);
  }, []);

  useEffect(() => {
    // Add search result only if input value is more than one character
    let inputResult: Fuse.FuseResult<SearchItem>[] = [];

    if (inputVal.length > 1) {
      // Perform the search
      inputResult = fuse.search(inputVal);

      // If a tag filter is active, filter results to only include posts with that tag
      if (activeFilter) {
        inputResult = inputResult.filter(result =>
          result.item.data.tags?.includes(activeFilter)
        );
      }
    }

    setSearchResults(inputResult);

    // Update search string in URL
    if (inputVal.length > 0) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("q", inputVal);
      const newRelativePathQuery =
        window.location.pathname + "?" + searchParams.toString();
      history.replaceState(history.state, "", newRelativePathQuery);
    } else {
      history.replaceState(history.state, "", window.location.pathname);
    }
  }, [inputVal, activeFilter]);

  // Helper to highlight the matched text
  const highlightMatch = (text: string, indices: Array<[number, number]>) => {
    let result = "";
    let lastIndex = 0;

    indices.forEach(([start, end]) => {
      // Add text up to the match
      result += text.substring(lastIndex, start);
      // Add the matched text with highlighting
      result += `<mark class="bg-skin-accent bg-opacity-20 px-1 rounded">${text.substring(start, end + 1)}</mark>`;
      lastIndex = end + 1;
    });

    // Add any remaining text
    result += text.substring(lastIndex);

    return result;
  };

  return (
    <>
      <label className="relative block">
        <span className="absolute inset-y-0 left-0 flex items-center pl-2 opacity-75">
          <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M19.023 16.977a35.13 35.13 0 0 1-1.367-1.384c-.372-.378-.596-.653-.596-.653l-2.8-1.337A6.962 6.962 0 0 0 16 9c0-3.859-3.14-7-7-7S2 5.141 2 9s3.14 7 7 7c1.763 0 3.37-.66 4.603-1.739l1.337 2.8s.275.224.653.596c.387.363.896.854 1.384 1.367l1.358 1.392.604.646 2.121-2.121-.646-.604c-.379-.372-.885-.866-1.391-1.36zM9 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z"></path>
          </svg>
          <span className="sr-only">Search</span>
        </span>
        <input
          className="block w-full rounded border border-skin-fill 
        border-opacity-40 bg-skin-fill py-3 pl-10
        pr-3 placeholder:italic placeholder:text-opacity-75 
        focus:border-skin-accent focus:outline-none"
          placeholder="Search for titles, topics, or content..."
          type="text"
          name="search"
          value={inputVal}
          onChange={handleChange}
          autoComplete="off"
          ref={inputRef}
        />
      </label>

      {/* Tags filter */}
      {allTags.length > 0 && (
        <div className="mt-4">
          <p className="text-sm mb-2 italic">Filter by tag:</p>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleFilter(tag)}
                className={`text-xs px-2 py-1 rounded-full border 
                  ${
                    activeFilter === tag
                      ? "bg-skin-accent text-white border-skin-accent"
                      : "border-skin-line hover:border-skin-accent"
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {inputVal.length > 1 && (
        <div className="mt-8">
          <p>
            Found {searchResults?.length}
            {searchResults?.length === 1 ? " result" : " results"}
            for '{inputVal}'
            {activeFilter && <span> with tag '{activeFilter}'</span>}
          </p>
        </div>
      )}

      <ul>
        {searchResults &&
          searchResults.map(({ item, refIndex, matches }) => (
            <li key={`${refIndex}-${item.slug}`} className="mb-6">
              <Card href={`/posts/${item.slug}/`} frontmatter={item.data} />

              {/* Show snippet of matched content if available */}
              {matches &&
                matches.map((match, i) => {
                  // Skip showing certain match types to avoid redundancy
                  if (["slug", "data.emoji", "data.haiku"].includes(match.key))
                    return null;

                  // For content matches, create a snippet
                  if (match.key === "content" && match.indices.length > 0) {
                    // Find the first match
                    const [start] = match.indices[0];

                    // Create a snippet that starts a bit before the match
                    const snippetStart = Math.max(0, start - 40);
                    const snippetEnd = Math.min(
                      match.value.length,
                      start + 150
                    );
                    let snippet = match.value.substring(
                      snippetStart,
                      snippetEnd
                    );

                    // Add ellipsis if we're not at the beginning/end
                    if (snippetStart > 0) snippet = "..." + snippet;
                    if (snippetEnd < match.value.length)
                      snippet = snippet + "...";

                    // Adjust indices for the snippet
                    const adjustedIndices = match.indices
                      .filter(([s, e]) => s >= snippetStart && e <= snippetEnd)
                      .map(
                        ([s, e]) =>
                          [s - snippetStart, e - snippetStart] as [
                            number,
                            number,
                          ]
                      );

                    return (
                      <div
                        key={i}
                        className="text-sm mt-1 ml-4 text-opacity-80"
                      >
                        <span
                          dangerouslySetInnerHTML={{
                            __html: highlightMatch(snippet, adjustedIndices),
                          }}
                        />
                      </div>
                    );
                  }

                  // For tag matches, highlight the matched tag
                  if (match.key === "data.tags") {
                    return (
                      <div key={i} className="text-sm italic mt-1 ml-4">
                        Tag:{" "}
                        <span
                          dangerouslySetInnerHTML={{
                            __html: highlightMatch(match.value, match.indices),
                          }}
                        />
                      </div>
                    );
                  }

                  return null;
                })}
            </li>
          ))}
      </ul>
    </>
  );
}
