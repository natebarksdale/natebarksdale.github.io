import os
import sys

def remove_lines_from_markdown_files(directory_path, tags_file):
    # Read the lines to remove
    with open(tags_file, 'r') as f:
        lines_to_remove = set(line.strip() for line in f)
    
    # Count for reporting
    files_processed = 0
    files_modified = 0
    total_lines_removed = 0
    
    # Process each .md file in the directory
    for filename in os.listdir(directory_path):
        if filename.endswith('.md'):
            file_path = os.path.join(directory_path, filename)
            files_processed += 1
            
            # Read the file content
            with open(file_path, 'r') as f:
                original_lines = f.readlines()
            
            # Filter out lines that match any in the remove set
            filtered_lines = [line for line in original_lines 
                             if line.strip() not in lines_to_remove]
            
            # Count lines removed
            lines_removed = len(original_lines) - len(filtered_lines)
            
            # Only write back if changes were made
            if lines_removed > 0:
                with open(file_path, 'w') as f:
                    f.writelines(filtered_lines)
                files_modified += 1
                total_lines_removed += lines_removed
                print(f"Modified: {filename} - Removed {lines_removed} lines")
    
    # Print summary
    print(f"\nSummary:")
    print(f"Files processed: {files_processed}")
    print(f"Files modified: {files_modified}")
    print(f"Total lines removed: {total_lines_removed}")

if __name__ == "__main__":
    # Ask for the directory path
    directory_path = input("Enter the path to the directory containing .md files: ")
    
    # Validate directory exists
    if not os.path.isdir(directory_path):
        print(f"Error: Directory '{directory_path}' does not exist.")
        sys.exit(1)
    
    # Validate tags file exists
    tags_file = "Tags-to-Delete.txt"
    if not os.path.isfile(tags_file):
        print(f"Error: '{tags_file}' does not exist in the current directory.")
        sys.exit(1)
    
    # Confirm before proceeding
    confirm = input(f"This will remove lines from all .md files in '{directory_path}' that match lines in '{tags_file}'. Continue? (y/n): ")
    if confirm.lower() != 'y':
        print("Operation cancelled.")
        sys.exit(0)
    
    # Run the function
    remove_lines_from_markdown_files(directory_path, tags_file)