#!/usr/bin/env python3
"""
URL to Markdown Converter
-------------------------

This script converts article URLs to markdown blog posts with proper formatting and metadata.

Requirements:
    - Python 3.7+
    - Dependencies listed in requirements.txt

Installation:
    pip install -r requirements.txt

Usage:
    python url-to-markdown-converter.py --url "https://example.com/article" --llm-model openai
    python url-to-markdown-converter.py --url-file "urls.txt" --llm-model gemini
"""

import os
import re
import argparse
import time
import random
from datetime import datetime
from pathlib import Path
import requests
try:
    from bs4 import BeautifulSoup
except ImportError:
    print("ERROR: BeautifulSoup is required but not installed.")
    print("Please install dependencies with: pip install -r requirements.txt")
    exit(1)
try:
    from slugify import slugify
except ImportError:
    print("ERROR: python-slugify is required but not installed.")
    print("Please install dependencies with: pip install -r requirements.txt")
    exit(1)
try:
    from dotenv import load_dotenv
    HAS_DOTENV = True
except ImportError:
    print("WARNING: python-dotenv not installed.")
    print("Env file loading disabled. Install with: pip install python-dotenv")
    HAS_DOTENV = False

try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    print("WARNING: google-generativeai not installed.")
    print("Gemini features will be disabled. Install with: pip install google-generativeai")
    HAS_GEMINI = False

try:
    import openai
    HAS_OPENAI = True
except ImportError:
    print("WARNING: openai package not installed.")
    print("OpenAI features will be disabled. Install with: pip install openai")
    HAS_OPENAI = False

class URLToMarkdownConverter:
    def __init__(self, api_key=None, output_dir="output", api_delay=0, llm_model="gemini", openai_api_key=None):
        self.today = datetime.now().strftime('%Y-%m-%d')
        self.output_dir = output_dir
        self.api_delay = api_delay  # Delay in seconds between API calls
        self.llm_model = llm_model.lower()
        
        # Load approved tags
        self.approved_tags = self.load_approved_tags()
        
        # Ensure output directory exists
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        # Setup LLM client based on selected model
        if self.llm_model == "gemini" and api_key and HAS_GEMINI:
            genai.configure(api_key=api_key)
            self.gemini = genai.GenerativeModel('gemini-2.0-pro-exp-02-05')
            print("Using Gemini for LLM generation")
            self.llm_available = True
        elif self.llm_model == "openai" and openai_api_key and HAS_OPENAI:
            openai.api_key = openai_api_key
            self.openai_client = openai.OpenAI(api_key=openai_api_key)
            print("Using OpenAI for LLM generation")
            self.llm_available = True
        else:
            self.gemini = None
            self.openai_client = None
            self.llm_available = False
            print(f"Warning: {self.llm_model} model not available. LLM-based features will be disabled.")
            if self.llm_model not in ["gemini", "openai"]:
                print(f"Invalid LLM model: {self.llm_model}. Use 'gemini' or 'openai'.")
    
    def load_approved_tags(self):
        """Load approved tags from the tag list file."""
        try:
            with open('Approved-Tag-List.txt', 'r', encoding='utf-8') as f:
                tags = [line.strip() for line in f if line.strip()]
            
            if tags:
                print(f"Loaded {len(tags)} approved tags from Approved-Tag-List.txt")
            else:
                print("Warning: No tags found in Approved-Tag-List.txt")
                
            return tags
        except Exception as e:
            print(f"Error loading approved tags: {str(e)}")
            print("Warning: Using fallback tags")
            return ["🌀 Templeton", "✍️ Writing", "🔭 Science", "🧠 Philosophy"]
    
    def generate_with_llm(self, prompt, temperature=0.7):
        """Generic method to generate content using the configured LLM."""
        if not self.llm_available:
            return None
            
        try:
            if self.llm_model == "gemini" and hasattr(self, 'gemini'):
                response = self.gemini.generate_content(prompt, temperature=temperature)
                result = response.text.strip()
            elif self.llm_model == "openai" and hasattr(self, 'openai_client'):
                response = self.openai_client.chat.completions.create(
                    model="gpt-4-turbo",  # You can adjust this to other models as needed
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant that responds with exactly what is asked, nothing more."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=temperature
                )
                result = response.choices[0].message.content.strip()
            else:
                return None
                
            # Add delay after API call to avoid rate limits
            time.sleep(self.api_delay)
            return result
        except Exception as e:
            print(f"Error generating content with {self.llm_model}: {str(e)}")
            return None
    
    def process_url_file(self, file_path):
        """Process a file containing URLs, one per line."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                urls = [line.strip() for line in f if line.strip()]
            
            for i, url in enumerate(urls):
                print(f"Processing URL {i+1}/{len(urls)}: {url}")
                self.process_single_url(url)
                
        except Exception as e:
            print(f"Error processing URL file: {str(e)}")
    
    def process_single_url(self, url):
        """Process a single URL and create a markdown file from it."""
        try:
            print(f"Fetching content from {url}")
            response = requests.get(url)
            response.raise_for_status()  # Raise exception for HTTP errors
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove modal-newsletter from soup to avoid extracting data from it
            modal_newsletter = soup.select_one('#modal-newsletter')
            if modal_newsletter:
                modal_newsletter.decompose()
            
            # Extract article data
            article_data = self.extract_article_data(soup, url)
            
            # Generate markdown content
            markdown_content = self.generate_markdown(article_data, url)
            
            # Save to file
            filename = self.save_markdown_to_file(markdown_content, article_data)
            print(f"Created markdown file: {filename}")
            
        except Exception as e:
            print(f"Error processing URL {url}: {str(e)}")
    
    def extract_article_data(self, soup, url):
        """Extract article data from the BeautifulSoup parsed HTML."""
        article_data = {}
        
        # Extract title (usually in h1)
        title_element = soup.find('h1')
        if title_element:
            title = title_element.get_text().strip()
        else:
            # Fallback to title tag
            title_element = soup.find('title')
            title = title_element.get_text().strip() if title_element else "Untitled Article"
        
        # Determine article type and format title accordingly
        if "grant/" in url:
            article_data['title'] = f"{title}"
        elif "/news/" in url:
            article_data['title'] = f"{title}"
        else:
            article_data['title'] = title
            
        # Extract publication date
        date = self.extract_date(soup)
        article_data['pubDatetime'] = date if date else self.today
        article_data['modDatetime'] = self.today
        
        # Check for intro span and use it for description if available
        intro_span = soup.select_one('span.intro')
        if intro_span:
            article_data['description'] = intro_span.get_text().strip()
        else:
            article_data['description'] = None  # Will be generated later if needed
        
        # Extract main content paragraphs
        paragraphs = self.extract_main_paragraphs(soup)
        article_data['paragraphs'] = paragraphs
        
        return article_data
    
    def extract_date(self, soup):
        """Extract publication date from the article."""
        # First check for the news-published-date element
        news_date = soup.select_one('#news-published-date')
        if news_date:
            date_text = news_date.get_text().strip()
            # Try to extract a date from this text
            try:
                # Try to parse different date formats
                date_patterns = [
                    r'(\w+\s+\d{1,2},\s+\d{4})',  # e.g., "January 1, 2022"
                    r'(\d{1,2}\s+\w+\s+\d{4})',   # e.g., "1 January 2022"
                    r'(\d{4}-\d{1,2}-\d{1,2})'     # e.g., "2022-01-01"
                ]
                
                for pattern in date_patterns:
                    match = re.search(pattern, date_text)
                    if match:
                        date_str = match.group(1)
                        # Try different date formats
                        for fmt in ["%B %d, %Y", "%b %d, %Y", "%d %B %Y", "%d %b %Y", "%Y-%m-%d"]:
                            try:
                                parsed_date = datetime.strptime(date_str, fmt)
                                return parsed_date.strftime('%Y-%m-%d')
                            except ValueError:
                                continue
            except Exception as e:
                print(f"Error parsing date from news-published-date: {str(e)}")
                # Continue with other methods if this fails
        
        
        # Look for date patterns in common date elements
        date_elements = soup.select('time, .date, .published, meta[property="article:published_time"]')
        
        for element in date_elements:
            # Check for datetime attribute
            if element.has_attr('datetime'):
                date_str = element['datetime']
                try:
                    date = datetime.fromisoformat(date_str.split('T')[0])
                    return date.strftime('%Y-%m-%d')
                except (ValueError, IndexError):
                    pass
            
            # Check for content in meta tags
            if element.name == 'meta' and element.has_attr('content'):
                date_str = element['content']
                try:
                    date = datetime.fromisoformat(date_str.split('T')[0])
                    return date.strftime('%Y-%m-%d')
                except (ValueError, IndexError):
                    pass
            
            # Check text content
            date_text = element.get_text().strip()
            date_patterns = [
                # Try common date formats
                r'(\d{1,2})[-/\.](\d{1,2})[-/\.](\d{4})',  # DD-MM-YYYY
                r'(\d{4})[-/\.](\d{1,2})[-/\.](\d{1,2})',  # YYYY-MM-DD
                r'([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})'      # Month DD, YYYY
            ]
            
            for pattern in date_patterns:
                match = re.search(pattern, date_text)
                if match:
                    try:
                        if len(match.groups()) == 3:
                            if match.group(3).isdigit() and len(match.group(3)) == 4:  # Year is group 3
                                month = match.group(1) if match.group(1).isdigit() else self.month_to_number(match.group(1))
                                day = match.group(2)
                                year = match.group(3)
                            else:  # Year is group 1
                                year = match.group(1)
                                month = match.group(2)
                                day = match.group(3)
                            
                            # Validate numbers
                            if 1 <= int(month) <= 12 and 1 <= int(day) <= 31 and 2000 <= int(year) <= 2030:
                                return f"{year}-{int(month):02d}-{int(day):02d}"
                    except (ValueError, IndexError):
                        continue
        
        # If no valid date found, return today's date
        return self.today
    
    def month_to_number(self, month_name):
        """Convert month name to number."""
        months = {
            'january': 1, 'february': 2, 'march': 3, 'april': 4,
            'may': 5, 'june': 6, 'july': 7, 'august': 8,
            'september': 9, 'october': 10, 'november': 11, 'december': 12,
            'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'jun': 6,
            'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
        }
        return months.get(month_name.lower(), 1)  # Default to January if not found
    
    def extract_main_paragraphs(self, soup):
        """Extract the main paragraphs from the article, focusing only on #main-content section."""
        # Find the main content section
        main_content = soup.select_one('#main-content')
        
        # If main content section exists, look for paragraphs within it
        if main_content:
            paragraphs = main_content.find_all('p')
        else:
            # Fallback: if #main-content not found, look in the full document
            print("Warning: #main-content section not found. Scanning entire document.")
            paragraphs = soup.find_all('p')
        
        # Find paragraphs that contain intro spans to exclude them
        intro_paragraphs = set()
        intro_spans = soup.select('span.intro')
        for span in intro_spans:
            parent_p = span.find_parent('p')
            if parent_p:
                intro_paragraphs.add(parent_p)
        
        # Filter out paragraphs that are likely not part of the main content
        content_paragraphs = []
        for p in paragraphs:
            # Skip if empty or very short
            if not p.get_text().strip() or len(p.get_text().strip()) < 30:
                continue
                
            # Skip if it contains "Study of the Day"
            if "Study of the Day" in p.get_text():
                continue
                
            # Skip if it's a paragraph containing an intro span
            if p in intro_paragraphs:
                continue
                
            # Skip if it's a likely navigation, header, or footer paragraph
            if p.parent and p.parent.name in ['header', 'footer', 'nav']:
                continue
                
            # Skip paragraphs that are centered or italicized (often captions or metadata)
            if p.get('class') and any(c in ' '.join(p['class']).lower() for c in ['center', 'italic', 'caption']):
                continue
                
            # Skip paragraphs with only a few words (likely captions)
            if len(p.get_text().strip().split()) < 10:
                continue
                
            # Add this paragraph
            content_paragraphs.append(p)
        
        # Convert paragraphs to formatted text while preserving formatting
        formatted_paragraphs = []
        for p in content_paragraphs:
            # Process paragraph to preserve italics, links, etc.
            formatted_text = self.format_paragraph(p)
            formatted_paragraphs.append(formatted_text)
            
            # Only keep the first two paragraphs as required
            if len(formatted_paragraphs) >= 2:
                break
        
        return formatted_paragraphs
    
    def format_paragraph(self, paragraph):
        """Format a paragraph element preserving italics and links."""
        result = ""
        
        for element in paragraph.contents:
            if element.name == 'em' or element.name == 'i':
                # Italics
                result += f"*{element.get_text()}*"
            elif element.name == 'strong' or element.name == 'b':
                # Bold
                result += f"**{element.get_text()}**"
            elif element.name == 'a':
                # Link
                result += f"[{element.get_text()}]({element.get('href')})"
            elif element.name:
                # Other tags, just get their text
                result += element.get_text()
            else:
                # Plain text
                result += str(element)
        
        return result.strip()
    
    def generate_tags(self, article_data, url):
        """Generate appropriate tags for the post from the approved list, always including '🌀 Templeton'."""
        # Always include the Templeton tag if it's in the approved list, or add it if not
        templeton_tag = "🌀 Templeton"
        
        if not self.approved_tags:
            # Fallback if no approved tags loaded
            return [templeton_tag, "✍️ Writing", "🔭 Science"]
            
        # Make sure Templeton tag is in our list
        if templeton_tag not in self.approved_tags:
            self.approved_tags.append(templeton_tag)
            
        # Create a string of all approved tags for the prompt
        approved_tags_str = "\n".join(self.approved_tags)
        
        prompt = f"""
        Select 2-4 tags from the APPROVED LIST BELOW that best match this blog post:
        
        Title: {article_data['title']}
        
        First paragraphs:
        {'\n\n'.join(article_data['paragraphs'])}
        
        APPROVED TAG LIST:
        {approved_tags_str}
        
        IMPORTANT: Return ONLY tags from the approved list above, one per line.
        Always include "🌀 Templeton" as the first tag.
        Do not create new tags or modify the existing ones.
        Return only 3-5 tags total (including 🌀 Templeton).
        """
        
        result = self.generate_with_llm(prompt)
        if result:
            # Parse the returned tags and validate against approved list
            suggested_tags = [tag.strip() for tag in result.split('\n') if tag.strip()]
            valid_tags = [tag for tag in suggested_tags if tag in self.approved_tags]
            
            # Ensure Templeton tag is first
            if templeton_tag in valid_tags:
                valid_tags.remove(templeton_tag)
            final_tags = [templeton_tag] + valid_tags
            
            # Ensure we have at least 3 tags total
            if len(final_tags) < 3:
                # Add more tags from approved list
                additional_tags = [tag for tag in self.approved_tags 
                                if tag != templeton_tag and tag not in final_tags]
                if additional_tags:
                    # Add random approved tags until we have at least 3
                    needed = 3 - len(final_tags)
                    sample_size = min(needed, len(additional_tags))
                    final_tags.extend(random.sample(additional_tags, sample_size))
            
            # Maximum 5 tags total
            return final_tags[:5]
        
        # Fallback: Templeton tag + a couple random approved tags
        additional_tags = [tag for tag in self.approved_tags if tag != templeton_tag]
        if additional_tags:
            sample_size = min(2, len(additional_tags))
            return [templeton_tag] + random.sample(additional_tags, sample_size)
        else:
            return [templeton_tag, "✍️ Writing", "🔭 Science"]
    
    def generate_description(self, article_data, url):
        """Generate a description for the post."""
        # If we already extracted a description from an intro span, use that
        if article_data.get('description'):
            return article_data['description']
            
        # Otherwise, generate using LLM
        prompt = f"""
        Generate a concise, engaging description for a blog post.
        
        Title: {article_data['title']}
        
        First paragraphs of content:
        {'\n\n'.join(article_data['paragraphs'])}
        
        Important instructions:
        1. Return ONLY the final description - no introductory text, no options, no explanations
        2. The description should be 1-2 sentences (about 120-160 characters)
        3. Capture the essence of the post and what's interesting about the topic in a compelling way; remember you're writing for an educated, witty audience
        4. Use present tense and active voice
        5. Do not include phrases like "This blog post..."
        """
        
        result = self.generate_with_llm(prompt)
        if result:
            return result
        
        # Fallback: Use first 160 chars of content
        paragraphs = '\n\n'.join(article_data['paragraphs'])
        clean_content = re.sub(r'\n+', ' ', paragraphs)  # Replace newlines with spaces
        return clean_content.strip()[:160] + "..."
    
    def generate_emoji(self, article_data, url):
        """Generate an appropriate emoji for the post."""
        prompt = f"""
        Select a single emoji that best represents this blog post.
        Title: {article_data['title']}
        
        First paragraphs:
        {'\n\n'.join(article_data['paragraphs'])}
        
        Return only the emoji character, nothing else.
        """
        
        result = self.generate_with_llm(prompt)
        if result:
            # Ensure we only get one emoji
            if len(result) > 2:
                result = result[0]
            return result
        
        # Fallback emoji
        return "📝"
    
    def generate_haiku(self, article_data, url):
        """Generate a haiku related to the post."""
        prompt = f"""
        Create a haiku that captures the essence of this blog post.
        
        Title: {article_data['title']}
        
        First paragraphs:
        {'\n\n'.join(article_data['paragraphs'])}
        
        Important instructions:
        1. Return ONLY the final haiku - no introductory text, no options, no explanations
        2. The haiku must follow the traditional 5-7-5 syllable pattern
        3. Format as three lines separated by line breaks
        4. The haiku should relate directly to the content and theme of the post
        5. Use evocative, poetic language appropriate for the subject matter
        """
        
        result = self.generate_with_llm(prompt)
        if result:
            return result
        
        # Fallback haiku
        return "Words flow like water,\nThoughts captured in black and white,\nStories come alive."
    
    def generate_coordinates(self, article_data, url):
        """Generate coordinates if the post seems to be about a specific location."""
        prompt = f"""
        If this blog post is about a specific geographical location, return the latitude and longitude coordinates for that location.
        Title: {article_data['title']}
        
        First paragraphs:
        {'\n\n'.join(article_data['paragraphs'])}
        
        If there is no specific location mentioned, make a best guess based on the content — this could be from a mentioned country, city or institution.
        Return only the coordinates in the format [latitude, longitude].
        """
        
        result = self.generate_with_llm(prompt)
        if result:
            # Extract coordinates with regex
            coords_match = re.search(r'\[(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\]', result)
            if coords_match:
                lat = float(coords_match.group(1))
                lon = float(coords_match.group(2))
                return [lat, lon]
        
        # Fallback coordinates (London)
        return [51.509865, -0.118092]
    
    def generate_intro_sentence(self, article_data, url):
        """Generate the introductory sentence for the post."""
        prompt = f"""
        Generate a single introductory sentence for a blog post that:
        
        1. Mentions that "I wrote" it
        2. States it was "for the John Templeton Foundation"
        3. Gives a very brief, pithy description of the topic
        4. Avoids repeating phrases (or too many words) from the article title
        
        Title: {article_data['title']}
        
        First paragraphs:
        {'\n\n'.join(article_data['paragraphs'])}
        
        Use a similar tone to these examples:
        "For the John Templeton Foundation, I wrote about Robert Hazen's fascinating project to catalog mineral species."
        "For the John Templeton Foundation, I wrote about a study that explores whether planning for one's own future might also equip one to care for future generations as well."
        
        Return ONLY the final sentence - no explanations or options.
        """
        
        result = self.generate_with_llm(prompt)
        if result:
            return result
        
        # Fallback intro sentence
        return f"For the John Templeton Foundation, I wrote about {article_data['title']}."
    
    def generate_markdown(self, article_data, url):
        """Generate markdown content from the article data."""
        title = article_data['title']
        slug = slugify(title)
        
        # Generate LLM-based metadata
        description = self.generate_description(article_data, url)
        emoji = self.generate_emoji(article_data, url)
        tags = self.generate_tags(article_data, url)
        haiku = self.generate_haiku(article_data, url)
        coordinates = self.generate_coordinates(article_data, url)
        intro_sentence = self.generate_intro_sentence(article_data, url)
        
        # Format the paragraphs with blockquote
        quoted_paragraphs = ""
        for p in article_data['paragraphs']:
            quoted_paragraphs += f"> {p}\n>\n"
        quoted_paragraphs = quoted_paragraphs.rstrip(">\n")
        
        # Build the markdown content
        markdown_content = f"""---
author: Nate Barksdale
pubDatetime: {article_data['pubDatetime']}
modDatetime: {article_data['modDatetime']}
title: {title}
slug: {slug}
featured: false
draft: false
description: {description}
emoji: {emoji}
tags:
{self.format_tags(tags)}
haiku: |
{self.format_haiku(haiku)}
coordinates: [{coordinates[0]}, {coordinates[1]}]
---

{intro_sentence}

{quoted_paragraphs}

[Read more at templeton.org]({url})
"""
        return markdown_content
    
    def format_tags(self, tags):
        """Format tags as YAML list items."""
        return '\n'.join([f"  - {tag}" for tag in tags])
    
    def format_haiku(self, haiku):
        """Format haiku with proper indentation."""
        return '\n'.join([f"  {line}" for line in haiku.split('\n')])
    
    def save_markdown_to_file(self, markdown_content, article_data):
        """Save markdown content to a file with the proper naming convention."""
        slug = slugify(article_data['title'])
        date = article_data['pubDatetime']
        
        filename = f"{date}-{slug}.md"
        file_path = Path(self.output_dir) / filename
        
        # Ensure we don't overwrite existing files
        counter = 1
        while file_path.exists():
            filename = f"{date}-{slug}-{counter}.md"
            file_path = Path(self.output_dir) / filename
            counter += 1
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
            
        return file_path

def load_api_keys():
    """Load API keys from .env file."""
    if not HAS_DOTENV:
        return None, None
        
    try:
        load_dotenv()  # Load environment variables from .env file
        gemini_key = os.getenv('GEMINI_API_KEY')
        openai_key = os.getenv('OPENAI_API_KEY')
        return gemini_key, openai_key
    except Exception as e:
        print(f"Error loading API keys from .env file: {str(e)}")
        return None, None

def main():
    parser = argparse.ArgumentParser(description='Convert URLs to markdown blog posts')
    parser.add_argument('--url-file', help='Text file containing URLs, one per line')
    parser.add_argument('--url', help='Single URL to process')
    parser.add_argument('--output-dir', help='Directory to save markdown files', default='output')
    parser.add_argument('--gemini-api-key', help='Google Gemini API key')
    parser.add_argument('--openai-api-key', help='OpenAI API key')
    parser.add_argument('--api-delay', type=float, help='Delay in seconds between API calls', default=1.5)
    parser.add_argument('--llm-model', help='LLM model to use (gemini or openai)', default='gemini')
    args = parser.parse_args()
    
    # Load API keys from .env if not provided
    gemini_key, openai_key = load_api_keys()
    
    # Use command line args if provided, otherwise use .env values
    gemini_api_key = args.gemini_api_key or gemini_key
    openai_api_key = args.openai_api_key or openai_key
    
    # Determine which API key to use based on selected model
    if args.llm_model.lower() == 'openai' and not openai_api_key:
        print("Error: OpenAI selected but no API key provided")
        print("Either set OPENAI_API_KEY in .env or use --openai-api-key")
        exit(1)
    elif args.llm_model.lower() == 'gemini' and not gemini_api_key:
        print("Error: Gemini selected but no API key provided")
        print("Either set GEMINI_API_KEY in .env or use --gemini-api-key")
        exit(1)
    
    converter = URLToMarkdownConverter(
        api_key=gemini_api_key, 
        output_dir=args.output_dir, 
        api_delay=args.api_delay,
        llm_model=args.llm_model,
        openai_api_key=openai_api_key
    )
    
    if args.url:
        # Process a single URL
        converter.process_single_url(args.url)
    elif args.url_file:
        # Process URLs from a file
        converter.process_url_file(args.url_file)
    else:
        print("Error: Either --url or --url-file must be provided.")
        parser.print_help()

if __name__ == "__main__":
    main()