// HTW List to Markdown Formatter
// This script reads the HTW list.txt file and generates markdown files in the /output directory

const fs = require('fs');
const path = require('path');

// Read the input file
async function readHTWList() {
  try {
    const data = await fs.promises.readFile('HTW list.txt', 'utf8');
    return data;
  } catch (err) {
    console.error('Error reading the input file:', err);
    return null;
  }
}

// Parse the entries from the input data
function parseEntries(data) {
  // Split the data by entries (each entry starts with a date)
  const entries = [];
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  
  let currentEntry = [];
  const lines = data.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // If we encounter a date line and we already have content in currentEntry,
    // push the current entry and start a new one
    if (dateRegex.test(line) && currentEntry.length > 0) {
      entries.push(currentEntry.join('\n'));
      currentEntry = [];
    }
    
    currentEntry.push(line);
  }
  
  // Don't forget the last entry
  if (currentEntry.length > 0) {
    entries.push(currentEntry.join('\n'));
  }
  
  return entries;
}

  // Format a single entry into a markdown file
function formatEntryToMarkdown(entry) {
  const lines = entry.split('\n');
  
  // Extract date (first line)
  const dateStr = lines[0].trim();
  const date = new Date(dateStr);
  const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Extract title (second line)
  let title = lines[1].trim();
  // Fix duplicate "HISTORY This Week - " in the title
  if (title.startsWith("HISTORY This Week - HISTORY This Week - ")) {
    title = title.replace("HISTORY This Week - HISTORY This Week - ", "HISTORY This Week - ");
  }
  
  // Extract URL (third line)
  const url = lines[2].trim();
  
  // Extract iframe (fourth line)
  const iframe = lines[3].trim();
  
  // Extract blockquotes (remaining lines starting with >)
  const blockquoteLines = [];
  for (let i = 4; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('>')) {
      blockquoteLines.push(line);
    }
  }
  
  // Format blockquotes with proper spacing between paragraphs
  const formattedBlockquotes = blockquoteLines.join('\n>\n');
  
  // Generate slug from title
  const slug = title.toLowerCase()
    .replace(/history this week - /i, '') // Remove the "HISTORY This Week - " prefix
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/--+/g, '-')     // Replace multiple hyphens with single hyphen
    .trim();                  // Trim leading/trailing hyphens
  
  // Determine the filename
  const filename = `${formattedDate}-${slug}.md`;
  
  // Create the markdown content
  let markdown = `---
author: Nate Barksdale
pubDatetime: ${formattedDate}
modDatetime: ${formattedDate}
title: ${title}
slug: ${slug}
featured: False
draft: False
---

I helped fact-check this [podcast](${url}) for The History Channel.

${formattedBlockquotes}

${iframe}
`;

  return { filename, markdown };
}

// Create the output directory if it doesn't exist
async function ensureOutputDirectory() {
  const outputDir = './output'; // Changed from '/output' to './output' (relative path)
  try {
    await fs.promises.mkdir(outputDir, { recursive: true });
  } catch (err) {
    console.error('Error creating output directory:', err);
  }
}

// Write a markdown file to the output directory
async function writeMarkdownFile(filename, content) {
  const outputPath = path.join('./output', filename); // Changed from '/output' to './output'
  try {
    await fs.promises.writeFile(outputPath, content);
    console.log(`Successfully created ${outputPath}`);
  } catch (err) {
    console.error(`Error writing file ${outputPath}:`, err);
  }
}

// Main function
async function processHTWList() {
  // Read the input file
  const data = await readHTWList();
  if (!data) return;
  
  // Parse entries
  const entries = parseEntries(data);
  
  // Create output directory
  await ensureOutputDirectory();
  
  // Process each entry
  for (const entry of entries) {
    const { filename, markdown } = formatEntryToMarkdown(entry);
    await writeMarkdownFile(filename, markdown);
  }
  
  console.log(`Processed ${entries.length} entries.`);
}

// Run the script
processHTWList();