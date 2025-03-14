// enhanced-blog-formatter.js
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const matter = require('gray-matter');
const { AnthropicClient } = require('@anthropic-ai/sdk');
const dotenv = require('dotenv');
const slugify = require('slugify');

// Load environment variables
dotenv.config();

// Initialize the API client (defaulting to Gemini as requested)
const USING_GEMINI = true; // Set to false to use Claude instead

// Directory containing blog posts
const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');
const TAG_LIST_PATH = path.join(process.cwd(), 'Approved-Tag-List.txt');

// Default author
const DEFAULT_AUTHOR = 'Nate Barksdale';

// Read the entire file as text - useful for preserving exact frontmatter format
function readFileAsText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Read approved tags list
function getApprovedTags() {
  try {
    const tagContent = fs.readFileSync(TAG_LIST_PATH, 'utf8');
    return tagContent.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.trim());
  } catch (error) {
    console.error('Error reading approved tags list:', error);
    return [];
  }
}

// Generate metadata using Gemini API
async function generateMetadataWithGemini(content, title, approvedTags) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-pro-exp-02-05' });

    const tagsFormatted = approvedTags.join('\n');
    
    const prompt = `Generate metadata for the following blog post:
    
    Title: ${title}
    
    First few paragraphs:
    ${content.slice(0, 2000)}
    
    Please provide:
    1. A brief description (format: "description: [Description here, ~100-150 characters]") - Use standard quotation marks.
    2. A single emoji that represents the post's topic (format: "emoji: 😊")
    3. 2-5 relevant tags from ONLY this approved list, formatted exactly as shown in the final result:
    ${tagsFormatted}
    
    For tags, choose only tags from the approved list above. Format them as:
    "tags:
     - [tag1]
     - [tag2]
     - [tag3]"
    
    4. A haiku about the post content (format: "haiku: |
     First line with 5 syllables,
     Second line with 7 syllables,
     Third line with 5 syllables.")
    
    5. Suggested coordinates related to the post's content (format: "coordinates: [latitude, longitude]")
    
    ONLY provide these five items in the exact format specified above. Do not use commas at the end of haiku lines.`;

    // Retry logic for API calls
    let attempts = 0;
    const maxAttempts = 3;
    let backoffTime = 2000; // start with 2 seconds

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (error) {
        console.warn(`Attempt ${attempts}/${maxAttempts} failed: ${error.message}`);
        
        // If we've exhausted our retries, throw the error
        if (attempts >= maxAttempts) {
          throw error;
        }
        
        // If it's a 503 Service Unavailable, we should backoff and retry
        if (error.status === 503) {
          console.log(`Service unavailable, retrying in ${backoffTime/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          backoffTime *= 2; // exponential backoff
        } else {
          // For other errors, don't retry
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Error generating metadata with Gemini:', error);
    console.log('Skipping metadata generation for this post due to API error');
    return null;
  }
}

// Alternative implementation for Claude API
async function generateMetadataWithClaude(content, title, approvedTags) {
  try {
    const anthropicClient = new AnthropicClient({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const tagsFormatted = approvedTags.join('\n');
    
    const prompt = `Generate metadata for the following blog post:
          
Title: ${title}

First few paragraphs:
${content.slice(0, 2000)}

Please provide:
1. A brief description (format: "description: [Description here, ~100-150 characters]") - Use standard quotation marks, not smart quotes.
2. A single emoji that represents the post's topic (format: "emoji: 😊")
3. 2-5 relevant tags from ONLY this approved list, formatted exactly as shown in the final result:
${tagsFormatted}

For tags, choose only tags from the approved list above. Format them as:
"tags:
 - [tag1]
 - [tag2]
 - [tag3]"

4. A haiku about the post content (format: "haiku: |
 First line with 5 syllables,
 Second line with 7 syllables,
 Third line with 5 syllables.")

5. Suggested coordinates related to the post's content (format: "coordinates: [latitude, longitude]")

ONLY provide these five items in the exact format specified above. Do not use commas at the end of haiku lines.`;

    // Retry logic for API calls
    let attempts = 0;
    const maxAttempts = 3;
    let backoffTime = 2000; // start with 2 seconds

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const response = await anthropicClient.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 500,
          temperature: 0.7,
          system: "You are an assistant that generates metadata for blog posts. Be concise and accurate. Use standard quotes for descriptions. Do not use commas at the end of haiku lines. For coordinates, provide values as [latitude, longitude] without quotes.",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        });

        return response.content[0].text;
      } catch (error) {
        console.warn(`Attempt ${attempts}/${maxAttempts} failed: ${error.message}`);
        
        // If we've exhausted our retries, throw the error
        if (attempts >= maxAttempts) {
          throw error;
        }
        
        // Handle rate limiting and service unavailable errors
        if (error.status === 429 || error.status === 503) {
          console.log(`API rate limited or unavailable, retrying in ${backoffTime/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          backoffTime *= 2; // exponential backoff
        } else {
          // For other errors, don't retry
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Error generating metadata with Claude:', error);
    console.log('Skipping metadata generation for this post due to API error');
    return null;
  }
}

async function generateMetadata(content, title) {
  const approvedTags = getApprovedTags();
  
  if (USING_GEMINI) {
    return generateMetadataWithGemini(content, title, approvedTags);
  } else {
    return generateMetadataWithClaude(content, title, approvedTags);
  }
}

// Extract title from content if not in frontmatter
function extractTitleFromContent(content) {
  // Look for first markdown h1 header
  const headerMatch = content.match(/^#\s+(.+)$/m);
  if (headerMatch && headerMatch[1]) {
    return headerMatch[1].trim();
  }
  
  // If no header, use first sentence
  const sentenceMatch = content.match(/^(.+?)[.!?](?:\s|$)/);
  if (sentenceMatch && sentenceMatch[1]) {
    return sentenceMatch[1].trim();
  }
  
  return 'Untitled Post';
}

// Create slug from title
function createSlug(title) {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Get current datetime in ISO format
function getCurrentDateTime() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

// Parse the generated metadata
function parseAndExtractMetadata(text) {
  const lines = text.split('\n');
  const metadata = {};
  let currentKey = null;
  let currentValue = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for key-value pairs (description, emoji, coordinates)
    const simpleMatch = line.match(/^(description|emoji|coordinates):\s*(.*)/i);
    if (simpleMatch) {
      const key = simpleMatch[1].toLowerCase();
      let value = simpleMatch[2].trim();
      
      // Handle description - preserve curly quotes
      if (key === 'description') {
        // Keep quotes as they are - don't change curly quotes
        // Just trim any excess whitespace
        value = value.trim();
      } 
      // Handle emoji - strip quotes if present
      else if (key === 'emoji') {
        // Remove any quotes around the emoji
        value = value.replace(/^["'](.+)["']$/, '$1');
      }
      // Handle coordinates - ensure in correct format
      else if (key === 'coordinates') {
        // Remove any extra quotes around the coordinates
        value = value.replace(/^["'](.+)["']$/, '$1');
        
        // Check if it's an array format that needs to be converted to [lat, long] string
        if (value.startsWith('[') && value.endsWith(']')) {
          try {
            // Try to parse as JSON array
            const coords = JSON.parse(value);
            if (Array.isArray(coords) && coords.length === 2) {
              // Format as [lat, long] string to match desired format
              value = `[${coords[0]}, ${coords[1]}]`;
            }
          } catch (e) {
            // If parsing fails, keep as is
            console.log(`Warning: Could not parse coordinates: ${value}`);
          }
        }
      }
      
      metadata[key] = value;
      continue;
    }
    
    // Check for haiku start
    if (line.startsWith('haiku:')) {
      currentKey = 'haiku';
      currentValue = [];
      continue;
    }
    
    // Check for tags start
    if (line.startsWith('tags:')) {
      currentKey = 'tags';
      currentValue = [];
      continue;
    }
    
    // If we're collecting a multi-line value
    if (currentKey) {
      // For tag items (formatted as "- tag")
      if (currentKey === 'tags' && line.startsWith('-')) {
        currentValue.push(line.trim());
      } 
      // For haiku lines
      else if (currentKey === 'haiku' && line.length > 0) {
        // Remove any trailing commas from haiku lines
        currentValue.push(line.trim().replace(/,\s*$/, ''));
      }
      
      // Check if this is the end of the current section
      const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
      if (nextLine.length === 0 || nextLine.includes(':')) {
        if (currentKey === 'haiku') {
          metadata.haiku = `|\n ${currentValue.join('\n ')}`;
        } else if (currentKey === 'tags') {
          metadata.tags = currentValue;
        }
        currentKey = null;
      }
    }
  }

  return metadata;
}

// Carefully extract the original frontmatter content to avoid any formatting changes
function extractOriginalFrontmatter(fileContent) {
  const matches = fileContent.match(/^---\n([\s\S]*?)\n---/);
  return matches ? matches[1] : '';
}

// Process a file to update only missing or required fields but maintain formatting
async function processBlogPost(filePath) {
  // Read the file content
  const fileContent = readFileAsText(filePath);
  
  // Use gray-matter to parse the frontmatter
  const { data, content } = matter(fileContent);
  
  // Get original frontmatter text to preserve its formatting
  const originalFrontmatter = extractOriginalFrontmatter(fileContent);
  
  // Track if we need to make changes
  let hasChanges = false;
  
  // Create a new frontmatter string, starting with the original
  let newFrontmatter = originalFrontmatter;
  
  // Check for missing basic fields
  const updates = {};
    
  // 1. Author
  if (!data.author) {
    updates.author = DEFAULT_AUTHOR;
    hasChanges = true;
  }
  
  // 2. Publication date
  if (!data.pubDatetime) {
    updates.pubDatetime = getCurrentDate();
    hasChanges = true;
  } else if (typeof data.pubDatetime === 'object' || (typeof data.pubDatetime === 'string' && (data.pubDatetime.includes('GMT') || data.pubDatetime.includes('T')))) {
    // Check if the date is already in YYYY-MM-DD format with no time component
    const isSimpleDate = typeof data.pubDatetime === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.pubDatetime);
    
    // Only process the date if it's not already in the correct format
    if (!isSimpleDate) {
      // Handle Date objects directly
      if (typeof data.pubDatetime === 'object' && data.pubDatetime instanceof Date) {
        // Use the local date parts to avoid timezone issues
        const year = data.pubDatetime.getFullYear();
        const month = String(data.pubDatetime.getMonth() + 1).padStart(2, '0'); 
        const day = String(data.pubDatetime.getDate()).padStart(2, '0');
        updates.pubDatetime = `${year}-${month}-${day}`;
        console.log(`Date object handled: ${data.pubDatetime} -> ${updates.pubDatetime}`);
        hasChanges = true;
      } 
      // Handle string dates with GMT
      else if (typeof data.pubDatetime === 'string' && data.pubDatetime.includes('GMT')) {
        // The date in the GMT string is in local timezone, which causes the off-by-one issue
        // when converted to UTC. We need to preserve the local date.
        const dateParts = data.pubDatetime.split(' ');
        
        // If we can extract the date directly from the string
        if (dateParts.length >= 4 && !isNaN(parseInt(dateParts[3]))) {
          // Format: Tue Aug 19 2008 20:00:00 GMT-0400 (Eastern Daylight Time)
          const monthMap = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
            'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
          };
          
          const month = monthMap[dateParts[1]];
          const day = dateParts[2].padStart(2, '0');
          const year = dateParts[3];
          
          if (month && day && year) {
            updates.pubDatetime = `${year}-${month}-${day}`;
            console.log(`Date string parsed directly: ${data.pubDatetime} -> ${updates.pubDatetime}`);
            hasChanges = true;
          } else {
            // Fallback to date object if direct parsing fails
            const date = new Date(data.pubDatetime);
            // Use the local date parts to avoid timezone issues
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); 
            const day = String(date.getDate()).padStart(2, '0');
            updates.pubDatetime = `${year}-${month}-${day}`;
            console.log(`Date object used: ${data.pubDatetime} -> ${updates.pubDatetime}`);
            hasChanges = true;
          }
        } else {
          // Handle other date formats
          // Extract only the date part if it looks like an ISO string
          if (typeof data.pubDatetime === 'string' && data.pubDatetime.includes('T')) {
            const isoDate = data.pubDatetime.split('T')[0];
            if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
              updates.pubDatetime = isoDate;
              console.log(`ISO date extracted: ${data.pubDatetime} -> ${updates.pubDatetime}`);
              hasChanges = true;
            } else {
              // Fallback
              const date = new Date(data.pubDatetime);
              // Create date string in local timezone
              const options = { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' };
              const localDateParts = new Intl.DateTimeFormat('en-CA', options).format(date).split('/');
              updates.pubDatetime = `${localDateParts[2]}-${localDateParts[0]}-${localDateParts[1]}`;
              console.log(`Fallback date format: ${data.pubDatetime} -> ${updates.pubDatetime}`);
              hasChanges = true;
            }
          }
        }
      }
      // Handle ISO date strings with time component
      else if (typeof data.pubDatetime === 'string' && data.pubDatetime.includes('T')) {
        // Extract just the date part
        const isoDate = data.pubDatetime.split('T')[0];
        updates.pubDatetime = isoDate;
        console.log(`ISO date extracted: ${data.pubDatetime} -> ${updates.pubDatetime}`);
        hasChanges = true;
      }
    } else {
      console.log(`Date already in correct format: ${data.pubDatetime}`);
    }
  }
  
  // 3. Modification date
  if (!data.modDatetime) {
    updates.modDatetime = getCurrentDateTime();
    hasChanges = true;
  } else if (typeof data.modDatetime === 'object' || (typeof data.modDatetime === 'string' && (data.modDatetime.includes('GMT') || data.modDatetime.includes('T')))) {
    // Check if the date is already in correct ISO format with no milliseconds
    const isCorrectFormat = typeof data.modDatetime === 'string' && 
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(data.modDatetime);
    
    // Only process if not already in correct format
    if (!isCorrectFormat) {
      // Handle Date objects directly
      if (typeof data.modDatetime === 'object' && data.modDatetime instanceof Date) {
        updates.modDatetime = data.modDatetime.toISOString().replace(/\.\d{3}Z$/, 'Z');
        console.log(`ModDate object handled: ${data.modDatetime} -> ${updates.modDatetime}`);
        hasChanges = true;
      }
      // Handle string dates with GMT
      else if (typeof data.modDatetime === 'string' && data.modDatetime.includes('GMT')) {
        const dateParts = data.modDatetime.split(' ');
        
        if (dateParts.length >= 4 && !isNaN(parseInt(dateParts[3]))) {
          // Format: Mon Mar 10 2025 14:29:13 GMT-0400 (Eastern Daylight Time)
          // For modDatetime, we need the time component as well
          const monthMap = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
            'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
          };
          
          const month = monthMap[dateParts[1]];
          const day = dateParts[2].padStart(2, '0');
          const year = dateParts[3];
          const time = dateParts[4];
          
          if (month && day && year && time) {
            // Build an ISO-compatible string
            updates.modDatetime = `${year}-${month}-${day}T${time}Z`;
            console.log(`ModDate string parsed directly: ${data.modDatetime} -> ${updates.modDatetime}`);
            hasChanges = true;
          } else {
            // Fallback
            const date = new Date(data.modDatetime);
            updates.modDatetime = date.toISOString().replace(/\.\d{3}Z$/, 'Z');
            console.log(`ModDate object used: ${data.modDatetime} -> ${updates.modDatetime}`);
            hasChanges = true;
          }
        } else if (typeof data.modDatetime === 'string') {
          // Handle ISO with milliseconds
          if (data.modDatetime.includes('.000Z')) {
            updates.modDatetime = data.modDatetime.replace(/\.\d{3}Z$/, 'Z');
            console.log(`ModDate milliseconds removed: ${data.modDatetime} -> ${updates.modDatetime}`);
            hasChanges = true;
          }
          // Otherwise it might already be in the correct format - do nothing
        }
      }
      // Handle ISO format with milliseconds
      else if (typeof data.modDatetime === 'string' && data.modDatetime.includes('T')) {
        // Remove any milliseconds
        if (data.modDatetime.includes('.')) {
          updates.modDatetime = data.modDatetime.replace(/\.\d+Z$/, 'Z');
          console.log(`ModDate milliseconds removed: ${data.modDatetime} -> ${updates.modDatetime}`);
          hasChanges = true;
        } else if (!data.modDatetime.endsWith('Z')) {
          // Ensure the date ends with Z
          updates.modDatetime = `${data.modDatetime.replace(/\+.*$/, '')}Z`;
          console.log(`ModDate timezone fixed: ${data.modDatetime} -> ${updates.modDatetime}`);
          hasChanges = true;
        }
      }
    } else {
      console.log(`ModDate already in correct format: ${data.modDatetime}`);
    }
  }
  
  // 4. Title
  if (!data.title) {
    updates.title = extractTitleFromContent(content);
    hasChanges = true;
  }
  
  // 5. Slug
  if (!data.slug) {
    updates.slug = createSlug(data.title || updates.title);
    hasChanges = true;
  }
  
  // 6. Featured and draft flags
  if (data.featured === undefined) {
    updates.featured = false;
    hasChanges = true;
  }
  
  if (data.draft === undefined) {
    updates.draft = false;
    hasChanges = true;
  }
  
  // Check if we need to generate additional metadata with the LLM
  const missingFields = [];
  if (!data.description) missingFields.push('description');
  if (!data.emoji) missingFields.push('emoji');
  if (!data.tags) missingFields.push('tags');
  if (!data.haiku) missingFields.push('haiku');
  if (!data.coordinates) missingFields.push('coordinates');
  
  const needsLLMMetadata = missingFields.length > 0;
  
  if (needsLLMMetadata) {
    console.log(`Generating missing metadata for: ${path.basename(filePath)}`);
    console.log(`Missing fields: ${missingFields.join(', ')}`);
    
    // Generate metadata using LLM
    const metadataText = await generateMetadata(content, data.title || updates.title);
    
    if (metadataText) {
      // Parse the generated metadata
      const newMetadata = parseAndExtractMetadata(metadataText);
      
      // Log what was generated
      console.log(`Generated metadata fields: ${Object.keys(newMetadata).join(', ')}`);
      
      // Only add fields that are missing
      if (!data.description && newMetadata.description) {
        updates.description = newMetadata.description;
        hasChanges = true;
      }
      
      if (!data.emoji && newMetadata.emoji) {
        updates.emoji = newMetadata.emoji;
        hasChanges = true;
      }
      
      if (!data.tags && newMetadata.tags) {
        updates.tags = newMetadata.tags;
        hasChanges = true;
      }
      
      if (!data.haiku && newMetadata.haiku) {
        updates.haiku = newMetadata.haiku;
        hasChanges = true;
      }
      
      if (!data.coordinates && newMetadata.coordinates) {
        updates.coordinates = newMetadata.coordinates;
        hasChanges = true;
      }
    }
  }

  // Apply the updates to the frontmatter string
  if (hasChanges) {
    // Enhanced extraction of existing frontmatter fields that might not be properly parsed
    // This is a more thorough approach to preserve all data from the original frontmatter
    
    // Check for various fields in the original frontmatter that we should preserve
    const fieldsToCheck = ['tags', 'description', 'emoji', 'haiku', 'coordinates'];
    const preservedFields = {};
    
    // Debugging log to see what's in the data object vs. the original frontmatter
    console.log(`Frontmatter analysis for: ${path.basename(filePath)}`);
    console.log(`Parsed data keys: ${Object.keys(data).join(', ')}`);
    
    // ALWAYS extract and preserve fields from original frontmatter, even if they exist in parsed data
    // This ensures we don't lose any existing metadata
    for (const field of fieldsToCheck) {
      const hasFieldInParsedData = data[field] !== undefined;
      const hasFieldInOriginal = originalFrontmatter.includes(`${field}:`);
      
      console.log(`Field '${field}': in parsed data? ${hasFieldInParsedData}, in original? ${hasFieldInOriginal}`);
      
      // If field is in original, preserve it regardless of whether it's in parsed data
      if (hasFieldInOriginal) {
        console.log(`Preserving ${field} from original frontmatter`);
        
        if (field === 'tags') {
          // Extract tags from the original frontmatter
          const tagSection = originalFrontmatter.match(/tags:(?:\s*\n\s*-[^\n]*)+/);
          if (tagSection) {
            // Preserve the original indentation by keeping spaces but removing only leading dashes
            const tagLines = tagSection[0].split('\n').slice(1); // Skip the "tags:" line
            preservedFields.tags = tagLines.map(line => line);
            console.log(`Preserved tags: ${preservedFields.tags.join(', ')}`);
          }
        } 
        else if (field === 'description') {
          // First try to match a single-line description
          const descMatch = originalFrontmatter.match(/description:\s*(.+?)(?:\n|$)/);
          if (descMatch && descMatch[1]) {
            preservedFields.description = descMatch[1].trim();
            console.log(`Preserved description (single-line): ${preservedFields.description}`);
          } else {
            // Look for multiline description (with | or >)
            const multiDescMatch = originalFrontmatter.match(/description:\s*[|>]\s*\n((?:\s+.+\n)+)/);
            if (multiDescMatch && multiDescMatch[1]) {
              preservedFields.description = multiDescMatch[1].trim();
              console.log(`Preserved description (multi-line): ${preservedFields.description}`);
            }
          }
        }
        else if (field === 'emoji') {
          // Match emoji from original frontmatter
          const emojiMatch = originalFrontmatter.match(/emoji:\s*(.+?)(?:\n|$)/);
          if (emojiMatch && emojiMatch[1]) {
            preservedFields.emoji = emojiMatch[1].trim();
            console.log(`Preserved emoji: ${preservedFields.emoji}`);
          }
        }
        else if (field === 'haiku') {
          // Match haiku (multiline field) from original frontmatter
          const haikuMatch = originalFrontmatter.match(/haiku:\s*\|(?:\n\s+.+)+/);
          if (haikuMatch) {
            // Preserve the entire haiku block including the pipe character
            preservedFields.haiku = haikuMatch[0].replace(/^haiku:\s*/, '');
            console.log(`Preserved haiku`);
          }
        }
        else if (field === 'coordinates') {
          // Match coordinates from original frontmatter
          const coordsMatch = originalFrontmatter.match(/coordinates:\s*(\[.+?\])(?:\n|$)/);
          if (coordsMatch && coordsMatch[1]) {
            preservedFields.coordinates = coordsMatch[1].trim();
            console.log(`Preserved coordinates: ${preservedFields.coordinates}`);
          }
        }
      }
    }
    
    let updatedFrontmatter = originalFrontmatter;
    
    // Helper function to safely update a field in the frontmatter text
    function updateField(frontmatter, fieldName, newValue) {
      const fieldRegex = new RegExp(`^${fieldName}:.*$`, 'm');
      
      // Check if the field exists
      if (fieldRegex.test(frontmatter)) {
        // Replace the existing field
        return frontmatter.replace(fieldRegex, `${fieldName}: ${newValue}`);
      } else {
        // Add new field at the end
        return `${frontmatter}\n${fieldName}: ${newValue}`;
      }
    }
    
    // CRITICAL FIX: For date deprecation, log more detail about what's happening
    if (updates.pubDatetime) {
      // Check if the date is actually changing by calculating day difference
      try {
        // Create a more reliable way to parse the original date
        let oldDate;
        
        if (typeof data.pubDatetime === 'object' && data.pubDatetime instanceof Date) {
          // If it's already a Date object, use it directly
          oldDate = data.pubDatetime;
        } else if (typeof data.pubDatetime === 'string') {
          if (data.pubDatetime.includes('T')) {
            // Handle ISO format strings
            oldDate = new Date(data.pubDatetime.split('T')[0] + 'T12:00:00Z');
          } else if (data.pubDatetime.includes('GMT')) {
            // Directly extract the date parts from GMT string
            const parts = data.pubDatetime.match(/(\w{3})\s+(\w{3})\s+(\d{1,2})\s+(\d{4})/);
            if (parts) {
              const monthMap = {
                'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
              };
              const month = monthMap[parts[2]];
              const day = parseInt(parts[3], 10);
              const year = parseInt(parts[4], 10);
              if (!isNaN(year) && !isNaN(day) && month !== undefined) {
                oldDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
              }
            }
          } else {
            // Handle simple YYYY-MM-DD format
            const [year, month, day] = data.pubDatetime.split('-').map(p => parseInt(p, 10));
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
              oldDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
            } else {
              // Last resort - just use the default parser
              oldDate = new Date(data.pubDatetime);
            }
          }
        }
        
        // Parse the new date in a consistent way
        const [newYear, newMonth, newDay] = updates.pubDatetime.split('-').map(p => parseInt(p, 10));
        const newDate = new Date(Date.UTC(newYear, newMonth - 1, newDay, 12, 0, 0));
        
        // Only proceed if both dates are valid
        if (oldDate && !isNaN(oldDate.getTime()) && newDate && !isNaN(newDate.getTime())) {
          // Calculate difference in days (use UTC to avoid timezone issues)
          const diffTime = oldDate.getTime() - newDate.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          
          // If the difference is exactly one day, this is almost certainly a timezone issue
          // Show detailed debug info
          console.log(`DATE ANALYSIS: 
            Original (ISO): ${oldDate.toISOString().split('T')[0]}
            Original (raw): ${data.pubDatetime}
            Original (local): ${oldDate.toLocaleDateString()}
            New: ${updates.pubDatetime}
            Diff: ${diffDays} days`
          );
          
          // If we have a difference of exactly 1 day, correct it
          if (Math.abs(diffDays) === 1) {
            // If oldDate is 1 day ahead, add a day to newDate to match
            if (diffDays === 1) {
              newDate.setUTCDate(newDate.getUTCDate() + 1);
            } 
            // If newDate is 1 day ahead, subtract a day from newDate to match
            else if (diffDays === -1) {
              newDate.setUTCDate(newDate.getUTCDate() - 1);
            }
            
            // Format the corrected date
            const year = newDate.getUTCFullYear();
            const month = String(newDate.getUTCMonth() + 1).padStart(2, '0');
            const day = String(newDate.getUTCDate()).padStart(2, '0');
            
            // Only apply the correction if it matches the original date
            const correctedDate = `${year}-${month}-${day}`;
            const originalAsYMD = oldDate.toISOString().split('T')[0];
            
            if (correctedDate === originalAsYMD) {
              updates.pubDatetime = correctedDate;
              console.log(`DATE CORRECTION: Adjusted to: ${updates.pubDatetime} (matches original)`);
            } else {
              console.log(`DATE CORRECTION SKIPPED: Correction ${correctedDate} doesn't match original ${originalAsYMD}`);
            }
          }
        } else {
          console.warn(`Could not properly analyze dates: oldDate=${oldDate}, newDate=${newDate}`);
        }
      } catch (e) {
        console.warn(`Error analyzing dates: ${e.message}`);
      }
    }
    
    // Apply each update
    for (const [field, value] of Object.entries(updates)) {
      // Format the value properly based on field type
      let formattedValue = value;
      
      // Special handling for tags
      if (field === 'tags' && Array.isArray(value)) {
        // If we have preserved tags from the original frontmatter, use those instead
        if (preservedFields.tags && preservedFields.tags.length > 0) {
          console.log(`Using preserved tags for ${path.basename(filePath)}`);
          continue; // Skip updating tags
        }
        
        // For tags, we need to recreate the whole tag block
        const tagRegex = /^tags:(\s*\n\s*-.*)*$/m;
        const tagBlock = `tags:\n${value.map(tag => `  ${tag}`).join('\n')}`;
        
        if (tagRegex.test(updatedFrontmatter)) {
          updatedFrontmatter = updatedFrontmatter.replace(tagRegex, tagBlock);
        } else {
          updatedFrontmatter = `${updatedFrontmatter}\n${tagBlock}`;
        }
        continue;
      }
      
      // Special handling for haiku
      if (field === 'haiku' && typeof value === 'string') {
        // If we have preserved haiku from the original frontmatter, use that instead
        if (preservedFields.haiku) {
          console.log(`Using preserved haiku for ${path.basename(filePath)}`);
          continue; // Skip updating haiku
        }
        
        const haikuRegex = /^haiku:\s*\|(\s*\n\s*.+)*$/m;
        const haikuLines = value.replace(/^\|\n/, '').split('\n').map(line => line.trim());
        const haikuBlock = `haiku: |\n  ${haikuLines.join('\n  ')}`;
        
        if (haikuRegex.test(updatedFrontmatter)) {
          updatedFrontmatter = updatedFrontmatter.replace(haikuRegex, haikuBlock);
        } else {
          updatedFrontmatter = `${updatedFrontmatter}\n${haikuBlock}`;
        }
        continue;
      }
      
      // Special handling for description
      if (field === 'description') {
        // If we have preserved description from the original frontmatter, use that instead
        if (preservedFields.description) {
          console.log(`Using preserved description for ${path.basename(filePath)}`);
          continue; // Skip updating description
        }
      }
      
      // Special handling for emoji
      if (field === 'emoji') {
        // If we have preserved emoji from the original frontmatter, use that instead
        if (preservedFields.emoji) {
          console.log(`Using preserved emoji for ${path.basename(filePath)}`);
          continue; // Skip updating emoji
        }
      }
      
      // Special handling for coordinates
      if (field === 'coordinates') {
        // If we have preserved coordinates from the original frontmatter, use those instead
        if (preservedFields.coordinates) {
          console.log(`Using preserved coordinates for ${path.basename(filePath)}`);
          continue; // Skip updating coordinates
        }
      }
      
      // For other fields, just update directly
      updatedFrontmatter = updateField(updatedFrontmatter, field, formattedValue);
    }
    
    // Debug log the changes
    if (updates.pubDatetime || updates.modDatetime) {
      console.log(`Date fixes for ${path.basename(filePath)}:`);
      if (updates.pubDatetime) {
        console.log(`  - pubDatetime: "${data.pubDatetime}" -> "${updates.pubDatetime}"`);
      }
      if (updates.modDatetime) {
        console.log(`  - modDatetime: "${data.modDatetime}" -> "${updates.modDatetime}"`);
      }
    }
    
    // Force-add all preserved fields to the frontmatter
    // This guarantees they are included even if they get lost in other processing
    let additionalFields = [];
    
    // Process tags first if they exist
    if (preservedFields.tags && preservedFields.tags.length > 0) {
      console.log(`Applying preserved tags to frontmatter`);
      additionalFields.push(`tags:\n${preservedFields.tags.join('\n')}`);
    }
    
    // Process description if it exists
    if (preservedFields.description) {
      console.log(`Applying preserved description to frontmatter`);
      additionalFields.push(`description: ${preservedFields.description}`);
    }
    
    // Process emoji if it exists
    if (preservedFields.emoji) {
      console.log(`Applying preserved emoji to frontmatter`);
      additionalFields.push(`emoji: ${preservedFields.emoji}`);
    }
    
    // Process haiku if it exists
    if (preservedFields.haiku) {
      console.log(`Applying preserved haiku to frontmatter`);
      additionalFields.push(`haiku: ${preservedFields.haiku}`);
    }
    
    // Process coordinates if they exist
    if (preservedFields.coordinates) {
      console.log(`Applying preserved coordinates to frontmatter`);
      additionalFields.push(`coordinates: ${preservedFields.coordinates}`);
    }
    
    // For newly generated fields that were missing, we need to ensure they get added
    // Collect both preserved fields and new fields that might be missing
    if (additionalFields.length > 0 || Object.keys(updates).length > 0) {
      // First, extract all field names currently in the frontmatter
      const existingFieldsInFrontmatter = [];
      const frontmatterLines = updatedFrontmatter.split('\n');
      for (const line of frontmatterLines) {
        if (line.includes(':')) {
          const fieldName = line.split(':')[0].trim();
          existingFieldsInFrontmatter.push(fieldName);
        }
      }
      
      console.log(`Existing fields in frontmatter: ${existingFieldsInFrontmatter.join(', ')}`);
      
      // Fields to add from preserved original frontmatter
      const cleanedAdditionalFields = [];
      for (const field of additionalFields) {
        // Extract the field name before the colon
        const fieldName = field.split(':')[0].trim();
        // Only include if it doesn't already exist in the frontmatter
        if (!existingFieldsInFrontmatter.includes(fieldName)) {
          cleanedAdditionalFields.push(field);
        } else {
          console.log(`Field ${fieldName} already exists in frontmatter, not adding duplicate`);
        }
      }
      
      // Also check for fields in updates that aren't in the frontmatter or additionalFields
      for (const [field, value] of Object.entries(updates)) {
        // Skip non-metadata fields like pubDatetime, modDatetime, etc.
        if (['pubDatetime', 'modDatetime', 'author', 'title', 'slug', 'featured', 'draft'].includes(field)) {
          continue;
        }
        
        // Special handling for tags and haiku
        if (field === 'tags' && Array.isArray(value)) {
          if (!existingFieldsInFrontmatter.includes('tags')) {
            const tagBlock = `tags:\n${value.map(tag => `  ${tag}`).join('\n')}`;
            cleanedAdditionalFields.push(tagBlock);
            console.log(`Adding missing tags field from updates`);
          }
          continue;
        }
        
        if (field === 'haiku' && typeof value === 'string') {
          if (!existingFieldsInFrontmatter.includes('haiku')) {
            const haikuLines = value.replace(/^\|\n/, '').split('\n').map(line => line.trim());
            const haikuBlock = `haiku: |\n  ${haikuLines.join('\n  ')}`;
            cleanedAdditionalFields.push(haikuBlock);
            console.log(`Adding missing haiku field from updates`);
          }
          continue;
        }
        
        // If this field isn't already in the frontmatter, add it
        if (!existingFieldsInFrontmatter.includes(field)) {
          cleanedAdditionalFields.push(`${field}: ${value}`);
          console.log(`Adding missing field from updates: ${field}`);
        }
      }
      
      // Only append if we have clean fields to add
      if (cleanedAdditionalFields.length > 0) {
        updatedFrontmatter = `${updatedFrontmatter}\n${cleanedAdditionalFields.join('\n')}`;
      }
    }
    
    // Create the updated file content (no extra newline after closing delimiter)
    const updatedContent = `---\n${updatedFrontmatter}\n---\n${content}`;
    
    // Write the file back
    fs.writeFileSync(filePath, updatedContent);
    console.log(`✅ Updated metadata for: ${path.basename(filePath)}`);
    
    // Check if we need to rename the file
    const fileName = path.basename(filePath);
    const hasDatePrefix = /^\d{4}-\d{2}-\d{2}/.test(fileName);
    
    if (!hasDatePrefix) {
      const pubDate = updates.pubDatetime || data.pubDatetime;
      const slug = updates.slug || data.slug;
      
      if (pubDate && slug) {
        const dirName = path.dirname(filePath);
        const extension = path.extname(filePath);
        const newFileName = `${pubDate}-${slug}${extension}`;
        const newFilePath = path.join(dirName, newFileName);
        
        if (filePath !== newFilePath) {
          // Use a simplified error handling approach
          let success = false;
          try {
            fs.renameSync(filePath, newFilePath);
            success = true;
          } catch (err) {
            // Silently fail
          }
          
          if (success) {
            console.log(`Renamed file to: ${newFileName}`);
            return newFilePath;
          } else {
            console.error(`Failed to rename file: ${newFileName}`);
          }
        }
      }
    }
  }
  
  return filePath;
}

// Process a single file with error handling
async function safeProcessFile(file) {
  try {
    const processedFile = await processBlogPost(file);
    return { 
      success: true, 
      processedFile,
      error: null
    };
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
    return { 
      success: false, 
      processedFile: file,
      error 
    };
  }
}

// Main function
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    let testMode = false;
    let fileLimit = 0;
    
    // Check for --test flag to process only a few files for testing
    if (args.includes('--test')) {
      testMode = true;
      fileLimit = 5; // Process only 5 files in test mode
      console.log('Running in TEST MODE - will only process 5 files');
    }
    
    // Find all markdown files in blog directory
    const files = await glob(`${BLOG_DIR}/**/*.md`);
    
    // Limit files if in test mode
    const filesToProcess = testMode ? files.slice(0, fileLimit) : files;
    
    console.log(`Found ${files.length} blog posts${testMode ? `, will process ${fileLimit}` : ''}`);
    console.log(`Using ${USING_GEMINI ? 'Gemini' : 'Claude'} for metadata generation`);
    
    // Process all files
    let enhancedCount = 0;
    let errorCount = 0;
    let processedFiles = [];
    
    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const result = await safeProcessFile(file);
      
      if (result.success) {
        processedFiles.push(result.processedFile);
        if (result.processedFile !== file) {
          enhancedCount++;
        }
      } else {
        errorCount++;
      }
    }
    
    console.log(`\nSummary:`);
    console.log(`- Enhanced metadata for ${enhancedCount} blog posts`);
    console.log(`- Encountered errors on ${errorCount} blog posts`);
  } catch (error) {
    console.error('Error running script:', error);
    process.exit(1);
  }
}

// Run the script
main();