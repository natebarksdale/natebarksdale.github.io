import Fuse from "fuse.js";
import { useEffect, useRef, useState, useMemo } from "react";
import Card from "@components/Card";
import type { CollectionEntry } from "astro:content";

export type SearchItem = {
  title: string;
  description: string;
  data: CollectionEntry<"blog">["data"];
  slug: string;
  content?: string; // Content field
  normalizedTags?: string; // Normalized tags without emoji prefixes
  tagText?: string; // Original tags joined as a string
};

interface Props {
  searchList: SearchItem[];
}

interface SearchResult {
  item: SearchItem;
  refIndex: number;
}

export default function SearchBar({ searchList }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputVal, setInputVal] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(
    null
  );

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    setInputVal(e.currentTarget.value);
  };

  // Create a stricter Fuse instance
  const fuse = useMemo(
    () =>
      new Fuse(searchList, {
        keys: [
          { name: "title", weight: 1.0 }, // Highest priority
          { name: "description", weight: 0.8 }, // High priority
          { name: "normalizedTags", weight: 0.9 }, // Higher priority for clean tags
          { name: "tagText", weight: 0.8 }, // High priority for original tags
          { name: "data.tags", weight: 0.7 }, // Keep original tag search
          { name: "content", weight: 0.6 }, // Medium priority for better performance
        ],
        includeMatches: false, // Don't need matches for highlighting
        minMatchCharLength: 2, // Reduced to 2 to allow shorter search terms
        threshold: 0.4, // Increased threshold for more lenient matching
        distance: 100, // Increased distance for better fuzzy matching
        useExtendedSearch: true, // Enable extended search for better tag matching
      }),
    [searchList]
  );

  useEffect(() => {
    // If URL has search query, insert that search query in input field
    const searchUrl = new URLSearchParams(window.location.search);
    const searchStr = searchUrl.get("q");
    if (searchStr) setInputVal(searchStr);

    // Put focus cursor at the end of the string
    setTimeout(function () {
      if (inputRef.current) {
        inputRef.current.selectionStart = inputRef.current.selectionEnd =
          searchStr?.length || 0;
      }
    }, 50);
  }, []);

  useEffect(() => {
    // Add search result only if input value is more than one character
    let inputResult: Fuse.FuseResult<SearchItem>[] = [];

    if (inputVal.length > 1) {
      // Perform the search with improved options
      inputResult = fuse.search(inputVal, { limit: 50 }); // Increased result limit
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
  }, [inputVal]);

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

      {inputVal.length > 1 && (
        <div className="mt-8">
          <p>
            Found {searchResults?.length}
            {searchResults?.length === 1 ? " result" : " results"}
            for '{inputVal}'
          </p>
        </div>
      )}

      <ul>
        {searchResults &&
          searchResults.map(({ item, refIndex }) => (
            <Card
              key={`${refIndex}-${item.slug}`}
              href={`/posts/${item.slug}/`}
              frontmatter={item.data}
            />
          ))}
      </ul>
    </>
  );
}
