#!/usr/bin/env python3
import os
import re
import yaml
import argparse
from datetime import datetime
from pathlib import Path
import requests
from slugify import slugify
import google.generativeai as genai
from dotenv import load_dotenv

class MarkdownHeaderProcessor:
    def __init__(self, api_key=None, rename_files=True, rename_only_new=True):
        self.today = datetime.now().strftime('%Y-%m-%d')
        # Load approved tags
        self.approved_tags = self.load_approved_tags()
        self.rename_files = rename_files
        self.rename_only_new = rename_only_new
        
        # Store existing slugs to prevent duplicates
        self.existing_slugs = set()
        
        if api_key:
            genai.configure(api_key=api_key)
            self.gemini = genai.GenerativeModel('gemini-2.0-pro-exp-02-05')
        else:
            self.gemini = None
            print("Warning: No Gemini API key provided. LLM-based features will be disabled.")
            
    def load_approved_tags(self):
        """Load approved tags from the tag list file."""
        try:
            with open('Approved-Tag-List.txt', 'r', encoding='utf-8') as f:
                tags = [line.strip() for line in f if line.strip()]
            return tags
        except Exception as e:
            print(f"Error loading approved tags: {str(e)}")
            return []

    def collect_existing_slugs(self, directory_path):
        """Collect all existing slugs from markdown files to prevent duplicates."""
        md_files = Path(directory_path).glob('**/*.md')
        for file_path in md_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check if the file has a YAML header
                header_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
                
                if header_match:
                    # Parse the header to get values
                    try:
                        header_dict = yaml.safe_load(header_match.group(1))
                        if header_dict and 'slug' in header_dict and header_dict['slug']:
                            # Store the existing slug
                            self.existing_slugs.add(header_dict['slug'])
                    except yaml.YAMLError:
                        # Skip if YAML parsing fails
                        pass
            except Exception as e:
                print(f"Error collecting slug from {file_path}: {str(e)}")
        
        print(f"Collected {len(self.existing_slugs)} existing slugs")

    def ensure_unique_slug(self, base_slug, current_file_path=None):
        """Ensure the slug is unique by adding a number if needed."""
        if not base_slug:
            base_slug = "untitled-post"
            
        # If this is an existing file's current slug, it's allowed to keep it
        if current_file_path:
            try:
                with open(current_file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                header_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
                if header_match:
                    try:
                        header_dict = yaml.safe_load(header_match.group(1))
                        if header_dict and 'slug' in header_dict and header_dict['slug'] == base_slug:
                            # This file already has this slug, so it's allowed to keep it
                            return base_slug
                    except yaml.YAMLError:
                        pass
            except Exception:
                pass
            
        # Check if slug already exists
        if base_slug not in self.existing_slugs:
            # Slug is unique, add it to our set and return it
            self.existing_slugs.add(base_slug)
            return base_slug
            
        # Slug already exists, generate a unique one
        counter = 1
        while True:
            new_slug = f"{base_slug}-{counter}"
            if new_slug not in self.existing_slugs:
                # Found a unique slug
                self.existing_slugs.add(new_slug)
                return new_slug
            counter += 1

    def process_directory(self, directory_path):
        """Process all markdown files in the given directory."""
        # First collect all existing slugs
        self.collect_existing_slugs(directory_path)
        
        # Then process each file
        md_files = Path(directory_path).glob('**/*.md')
        for file_path in md_files:
            print(f"Processing {file_path}...")
            self.process_file(file_path)

    def process_file(self, file_path):
        """Process a single markdown file using a direct string approach."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Check if the file has a YAML header
            header_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
            
            if header_match:
                # Keep the original header text as is
                original_header_text = header_match.group(1)
                post_content = content[header_match.end():]
                
                # Parse the header to get values
                try:
                    header_dict = yaml.safe_load(original_header_text)
                    if header_dict is None:
                        header_dict = {}
                except yaml.YAMLError:
                    print(f"Error parsing YAML header in {file_path}. Creating new header.")
                    header_dict = {}
                
                # Check which fields need updating or adding
                updated_values = {}
                
                # Author
                if 'author' not in header_dict:
                    updated_values['author'] = "Nate Barksdale"
                    
                # Publication date
                if 'pubDatetime' not in header_dict:
                    updated_values['pubDatetime'] = self.today
                    
                # Modification date
                if 'modDatetime' not in header_dict:
                    updated_values['modDatetime'] = self.today
                    
                # Title and clean it if needed
                title_source = "unknown"
                if 'title' not in header_dict or not header_dict['title']:
                    # Check if we have an H1 header
                    h1_match = re.search(r'^#\s+(.+)', post_content, re.MULTILINE)
                    if h1_match:
                        title_source = "h1"
                        # Extract the title from the H1 header
                        title = h1_match.group(1).strip()
                    else:
                        title = self.extract_title(post_content)
                    updated_values['title'] = title
                elif ':' in header_dict['title'] or '"' in header_dict['title']:
                    title = header_dict['title'].replace(':', '').replace('"', '')
                    updated_values['title'] = title
                else:
                    title = header_dict['title']
                    
                # Slug - with unique slug handling
                base_slug = None
                if 'slug' not in header_dict or not header_dict['slug'] or self.slug_needs_update(header_dict.get('slug', ''), title):
                    base_slug = slugify(title)
                    unique_slug = self.ensure_unique_slug(base_slug, file_path)
                    updated_values['slug'] = unique_slug
                else:
                    # Keep the existing slug but ensure it's in our tracking set
                    self.existing_slugs.add(header_dict['slug'])
                    
                # Featured flag
                if 'featured' not in header_dict:
                    updated_values['featured'] = False
                    
                # Draft flag
                if 'draft' not in header_dict:
                    updated_values['draft'] = False
                    
                # Description - only generate if missing
                if 'description' not in header_dict or not header_dict.get('description'):
                    description_result = self.generate_description(post_content, title)
                    if description_result:  # Only add if a valid result was generated
                        updated_values['description'] = description_result
                    
                # Emoji - only generate if missing
                if 'emoji' not in header_dict:
                    emoji_result = self.generate_emoji(post_content, title)
                    if emoji_result:  # Only add if a valid result was generated
                        updated_values['emoji'] = emoji_result
                    
                # Tags - only generate if missing
                if 'tags' not in header_dict or not header_dict.get('tags'):
                    tags_result = self.generate_tags(post_content, title)
                    if tags_result:  # Only add if valid results were generated
                        updated_values['tags'] = tags_result
                    
                # Haiku - only generate if missing
                if 'haiku' not in header_dict:
                    haiku_result = self.generate_haiku(post_content, title)
                    if haiku_result and haiku_result != "Words flow like water,\nThoughts captured in black and white,\nStories come alive.":
                        # Only add if it's not the fallback value
                        updated_values['haiku'] = haiku_result
                    
                # Coordinates - only generate if missing
                if 'coordinates' not in header_dict:
                    coords_result = self.generate_coordinates(post_content, title)
                    # Only add if it's not the fallback London coordinates
                    if coords_result and not (coords_result[0] == 51.509865 and coords_result[1] == -0.118092):
                        updated_values['coordinates'] = coords_result
                
                # If nothing needs updating, return early
                if not updated_values:
                    print(f"No updates needed for {file_path}")
                    return
                
                # Now prepare to create a new header based on what we need to update
                # Instead of trying to modify the original, let's extract all fields including their format
                # and then recreate the header with updates
                
                # Strategy:
                # 1. Keep the original header text completely intact
                # 2. Parse out required fields we need to add (if missing)
                # 3. Only append missing fields at the end
                
                # To handle the case where values in the original header need to be updated,
                # we'll make a new header with all the original values first, then update ones that need changing
                new_header_dict = {}
                if header_dict:
                    new_header_dict.update(header_dict)
                new_header_dict.update(updated_values)
                
                # Now detect if we're just adding fields or if we need to update existing fields
                if set(updated_values.keys()).issubset(set(k for k in header_dict.keys() if k not in header_dict)):
                    # We're just adding fields, so append to original header
                    new_header_text = original_header_text
                    
                    # Add each missing field
                    for field, value in updated_values.items():
                        if field == 'tags' and isinstance(value, list):
                            new_header_text += f"\n{field}:"
                            for tag in value:
                                new_header_text += f"\n  - {tag}"
                        elif field == 'haiku' and isinstance(value, str) and '\n' in value:
                            new_header_text += f"\n{field}: |"
                            for line in value.split('\n'):
                                new_header_text += f"\n  {line}"
                        elif field == 'coordinates' and isinstance(value, list):
                            new_header_text += f"\n{field}: [{value[0]}, {value[1]}]"
                        else:
                            new_header_text += f"\n{field}: {value}"
                else:
                    # We have to reconstruct the header from scratch, but preserve original order
                    
                    # Extract order of fields from original header text
                    field_pattern = re.compile(r'^([a-zA-Z0-9_]+):\s', re.MULTILINE)
                    original_fields = [m.group(1) for m in field_pattern.finditer(original_header_text)]
                    
                    # Get the unique fields in order
                    ordered_fields = []
                    for field in original_fields:
                        if field not in ordered_fields:
                            ordered_fields.append(field)
                            
                    # Add any fields from new_header_dict that aren't in ordered_fields
                    for field in new_header_dict:
                        if field not in ordered_fields:
                            ordered_fields.append(field)
                    
                    # Now build the new header text in the original order
                    new_header_lines = []
                    for field in ordered_fields:
                        value = new_header_dict.get(field)
                        if value is not None:
                            if field == 'tags' and isinstance(value, list):
                                new_header_lines.append(f"{field}:")
                                for tag in value:
                                    new_header_lines.append(f"  - {tag}")
                            elif field == 'haiku' and isinstance(value, str) and '\n' in value:
                                new_header_lines.append(f"{field}: |")
                                for line in value.split('\n'):
                                    new_header_lines.append(f"  {line}")
                            elif field == 'coordinates' and isinstance(value, list):
                                new_header_lines.append(f"{field}: [{value[0]}, {value[1]}]")
                            else:
                                new_header_lines.append(f"{field}: {value}")
                    
                    new_header_text = "\n".join(new_header_lines)
                
                # Process the content to remove H1 if needed
                processed_content = self.process_content(post_content, title_source)
                
                # Create the final content
                new_content = f"---\n{new_header_text}\n---\n{processed_content}"
            else:
                # No header found, create a new one from scratch
                new_header = {}
                
                # Set all required fields
                new_header['author'] = "Nate Barksdale"
                new_header['pubDatetime'] = self.today
                new_header['modDatetime'] = self.today
                
                # Extract title from content
                title_source = "unknown"
                h1_match = re.search(r'^#\s+(.+)', content, re.MULTILINE)
                if h1_match:
                    title_source = "h1"
                    title = h1_match.group(1).strip()
                else:
                    title = self.extract_title(content)
                
                new_header['title'] = title
                
                # Generate a unique slug
                base_slug = slugify(title)
                unique_slug = self.ensure_unique_slug(base_slug, file_path)
                new_header['slug'] = unique_slug
                
                # Set defaults
                new_header['featured'] = False
                new_header['draft'] = True  # Set draft to true by default for new files
                
                # Generate fields using LLM and only include if valid results are returned
                description_result = self.generate_description(content, title)
                if description_result:
                    new_header['description'] = description_result
                
                emoji_result = self.generate_emoji(content, title)
                if emoji_result:
                    new_header['emoji'] = emoji_result
                
                tags_result = self.generate_tags(content, title)
                if tags_result:
                    new_header['tags'] = tags_result
                
                haiku_result = self.generate_haiku(content, title)
                if haiku_result and haiku_result != "Words flow like water,\nThoughts captured in black and white,\nStories come alive.":
                    new_header['haiku'] = haiku_result
                
                coords_result = self.generate_coordinates(content, title)
                if coords_result and not (coords_result[0] == 51.509865 and coords_result[1] == -0.118092):
                    new_header['coordinates'] = coords_result
                
                # Format the new header manually
                header_lines = []
                for field, value in new_header.items():
                    if field == 'tags' and isinstance(value, list):
                        header_lines.append(f"{field}:")
                        for tag in value:
                            header_lines.append(f"  - {tag}")
                    elif field == 'haiku' and isinstance(value, str) and '\n' in value:
                        header_lines.append(f"{field}: |")
                        for line in value.split('\n'):
                            header_lines.append(f"  {line}")
                    elif field == 'coordinates' and isinstance(value, list):
                        header_lines.append(f"{field}: [{value[0]}, {value[1]}]")
                    else:
                        header_lines.append(f"{field}: {value}")
                
                formatted_header = "\n".join(header_lines)
                
                # Process content to remove H1 if found
                processed_content = self.process_content(content, title_source)
                
                new_content = f"---\n{formatted_header}\n---\n{processed_content}"
            
            # Write updated content back to file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            # Get the publication date and slug
            if 'new_header_dict' in locals():
                pub_date = new_header_dict.get('pubDatetime')
                slug = new_header_dict.get('slug')
            else:
                pub_date = new_header.get('pubDatetime')
                slug = new_header.get('slug')
                
            # Rules for renaming:
            # 1. If rename_only_new is True, only rename files without headers and without date-based names
            # 2. If rename_only_new is False, rename any file if it doesn't have date-based naming
            should_rename = False
            
            if self.rename_only_new:
                # Only rename files without headers (new files)
                should_rename = not header_match
            else:
                # Rename any file that doesn't follow the date-slug pattern
                should_rename = True
                
            if should_rename and self.rename_files:
                # Rename file based on slug
                renamed_path = self.rename_file_if_needed(file_path, slug, pub_date)
                if renamed_path and renamed_path != file_path:
                    print(f"Updated and renamed: {file_path} -> {renamed_path}")
                else:
                    print(f"Updated: {file_path}")
            else:
                print(f"Updated: {file_path}")
                
        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")

    def extract_title(self, content):
        """Extract title from content."""
        # Look for H1 header
        h1_match = re.search(r'^#\s+(.+)', content, re.MULTILINE)
        if h1_match:
            return h1_match.group(1).strip()
        
        # If no H1, use first non-empty line
        lines = content.split('\n')
        for line in lines:
            if line.strip():
                return line.strip()[:50]  # Limit to 50 chars
                
        return "Untitled Post"
        
    def process_content(self, content, title_source="unknown"):
        """Process content based on the title source."""
        if title_source == "h1":
            # Remove the H1 line from content
            content = re.sub(r'^#\s+.+\n?', '', content, count=1, flags=re.MULTILINE)
            
            # Remove any extra blank lines at the beginning
            content = re.sub(r'^\s+', '', content)
            
            # Ensure there's at least one newline at the beginning
            if not content.startswith('\n'):
                content = '\n' + content
            
        return content

    def slug_needs_update(self, current_slug, title):
        """Check if slug needs to be updated based on title."""
        expected_slug = slugify(title)
        return current_slug != expected_slug

    def generate_description(self, content, title):
        """Generate a description for the post."""
        if self.gemini:
            try:
                prompt = f"""
                Generate a concise, engaging description for a blog post.
                
                Title: {title}
                
                First few paragraphs of content:
                {content[:500]}
                
                Important instructions:
                1. Return ONLY the final description - no introductory text, no options, no explanations
                2. The description should be 1-2 sentences (about 120-160 characters)
                3. Capture the essence of the post in a compelling way
                4. Use present tense and active voice
                5. Do not include phrases like "This blog post..."
                """
                response = self.gemini.generate_content(prompt)
                return response.text.strip()
            except Exception as e:
                print(f"Error generating description with Gemini: {str(e)}")
                return None  # Return None instead of fallback
        
        # Return None for fallback case too, to prevent overwriting
        return None

    def generate_emoji(self, content, title):
        """Generate an appropriate emoji for the post."""
        if self.gemini:
            try:
                prompt = f"""
                Select a single emoji that best represents this blog post.
                Title: {title}
                
                First few paragraphs:
                {content[:300]}
                
                Return only the emoji character, nothing else.
                """
                response = self.gemini.generate_content(prompt)
                emoji = response.text.strip()
                # Ensure we only get one emoji
                if len(emoji) > 2:
                    emoji = emoji[0]
                return emoji
            except Exception as e:
                print(f"Error generating emoji with Gemini: {str(e)}")
                return None  # Return None instead of fallback
        
        # Return None for fallback case too, to prevent overwriting
        return None

    def generate_tags(self, content, title):
        """Generate appropriate tags for the post from the approved list."""
        if not self.approved_tags:
            print("Warning: No approved tags found. Skipping tag generation.")
            return None  # Return None instead of fallback
            
        if self.gemini:
            try:
                # Convert approved tags to a string for the prompt
                approved_tags_str = "\n".join(self.approved_tags)
                
                prompt = f"""
                Select 3-5 tags from the APPROVED LIST BELOW that best match this blog post.
                
                Title: {title}
                
                First few paragraphs:
                {content[:500]}
                
                APPROVED TAG LIST:
                {approved_tags_str}
                
                Return ONLY tags from the approved list above, one per line.
                Do not create new tags or modify the existing ones.
                """
                response = self.gemini.generate_content(prompt)
                
                # Filter and validate that returned tags are in the approved list
                suggested_tags = [tag.strip() for tag in response.text.strip().split('\n') if tag.strip()]
                valid_tags = [tag for tag in suggested_tags if tag in self.approved_tags]
                
                # If we have valid tags, use them (up to 5)
                if valid_tags:
                    return valid_tags[:5]
                else:
                    # If no valid tags were returned, return None instead of random fallbacks
                    print("No valid tags returned from Gemini. Skipping tag generation.")
                    return None
                    
            except Exception as e:
                print(f"Error generating tags with Gemini: {str(e)}")
                return None  # Return None instead of fallback
        
        # Return None for fallback case too, to prevent overwriting
        return None

    def generate_haiku(self, content, title):
        """Generate a haiku related to the post."""
        if self.gemini:
            try:
                prompt = f"""
                Create a haiku that captures the essence of this blog post.
                
                Title: {title}
                
                First few paragraphs:
                {content[:500]}
                
                Important instructions:
                1. Return ONLY the final haiku - no introductory text, no options, no explanations
                2. The haiku must follow the traditional 5-7-5 syllable pattern
                3. Format as three lines separated by line breaks
                4. The haiku should relate directly to the content and theme of the post
                5. Use evocative, poetic language appropriate for the subject matter
                """
                response = self.gemini.generate_content(prompt)
                haiku = response.text.strip()
                return haiku
            except Exception as e:
                print(f"Error generating haiku with Gemini: {str(e)}")
                return None  # Return None instead of fallback
        
        # Return None for fallback case too, to prevent overwriting
        return None

    def generate_coordinates(self, content, title):
        """Generate coordinates if the post seems to be about a specific location."""
        if self.gemini:
            try:
                prompt = f"""
                If this blog post is about a specific geographical location, return the latitude and longitude coordinates for that location.
                Title: {title}
                
                First few paragraphs:
                {content[:500]}
                
                If there is no specific location mentioned, explicitly respond with "NO_LOCATION".
                Otherwise, return only the coordinates in the format [latitude, longitude].
                """
                response = self.gemini.generate_content(prompt)
                coords_text = response.text.strip()
                
                # Check if the response indicates no location
                if "NO_LOCATION" in coords_text.upper():
                    return None
                    
                # Extract coordinates with regex
                coords_match = re.search(r'\[(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\]', coords_text)
                if coords_match:
                    lat = float(coords_match.group(1))
                    lon = float(coords_match.group(2))
                    return [lat, lon]
                else:
                    return None  # No valid coordinates found
            except Exception as e:
                print(f"Error generating coordinates with Gemini: {str(e)}")
                return None  # Return None instead of fallback
        
        # Return None for fallback case too, to prevent overwriting
        return None
        
    def rename_file_if_needed(self, file_path, slug, pub_date=None):
        """Rename the file based on slug and publication date, but only for new files without date-based naming.
        Uses a copy-then-delete approach to make the operation more visible to Git."""
        if not self.rename_files or not slug:
            return file_path
            
        try:
            file_path = Path(file_path)
            directory = file_path.parent
            
            # Check if file already has a date-based naming format (YYYY-MM-DD-*)
            date_pattern = r'\d{4}-\d{2}-\d{2}-.*\.md$'
            if self.rename_only_new and re.match(date_pattern, file_path.name):
                print(f"File already has date-based naming, skipping rename: {file_path}")
                return file_path
                
            # Use the publication date from the header if available, otherwise today's date
            date_prefix = pub_date if pub_date else self.today
            new_filename = f"{date_prefix}-{slug}.md"
            new_path = directory / new_filename
            
            # Check if file already has the correct name
            if file_path.name == new_filename:
                print(f"File already has the correct name: {file_path}")
                return file_path
                
            # Check if the destination file already exists
            if new_path.exists():
                print(f"Cannot rename {file_path} to {new_path} - destination file already exists")
                # Create alternative filename with a suffix
                counter = 1
                while True:
                    alt_new_path = directory / f"{date_prefix}-{slug}-{counter}.md"
                    if not alt_new_path.exists():
                        new_path = alt_new_path
                        break
                    counter += 1
            
            # Instead of directly renaming, use copy-then-delete to be more visible to Git
            # Copy content to new file
            with open(file_path, 'r', encoding='utf-8') as src:
                content = src.read()
                
            with open(new_path, 'w', encoding='utf-8') as dst:
                dst.write(content)
                
            # Delete original file
            file_path.unlink()
            
            print(f"Copied and deleted file: {file_path} -> {new_path}")
            return new_path  # Return the new path for further processing
        except Exception as e:
            print(f"Error renaming file {file_path} to {slug}: {str(e)}")
            return file_path  # Return the original path if renaming failed

def load_api_key():
    """Load API key from .env file."""
    try:
        load_dotenv()  # Load environment variables from .env file
        return os.getenv('GEMINI_API_KEY')
    except Exception as e:
        print(f"Error loading API key from .env file: {str(e)}")
        return None

def main():
    parser = argparse.ArgumentParser(description='Process markdown blog posts to update YAML headers')
    parser.add_argument('--directory', help='Directory containing markdown files', default='src/content/blog')
    parser.add_argument('--api-key', help='Google Gemini API key')
    parser.add_argument('--no-rename', help='Disable file renaming based on slug', action='store_true')
    parser.add_argument('--rename-all', help='Rename all files (not just new ones)', action='store_true')
    parser.add_argument('--file', help='Process a specific file instead of a directory')
    args = parser.parse_args()
    
    # If no API key is provided via command line, try to load from .env file
    api_key = args.api_key or load_api_key()
    
    processor = MarkdownHeaderProcessor(
        api_key=api_key, 
        rename_files=not args.no_rename,
        rename_only_new=not args.rename_all
    )
    
    if args.file:
        # Process a single file
        processor.process_file(args.file)
    else:
        # Process all files in directory
        processor.process_directory(args.directory)

if __name__ == "__main__":
    main()