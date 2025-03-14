def remove_matching_lines(approved_file, delete_file, output_file=None):
    # Read the lines to delete
    with open(delete_file, 'r') as f:
        lines_to_delete = set(line.strip() for line in f)
    
    # Read the approved lines and filter out matching ones
    with open(approved_file, 'r') as f:
        approved_lines = f.readlines()
    
    # Keep only lines that don't match any in the delete set
    filtered_lines = [line for line in approved_lines 
                     if line.strip() not in lines_to_delete]
    
    # Either write to a new file or overwrite the original
    if output_file:
        with open(output_file, 'w') as f:
            f.writelines(filtered_lines)
    else:
        with open(approved_file, 'w') as f:
            f.writelines(filtered_lines)

# Usage
if __name__ == "__main__":
    # Option 1: Create a new file with filtered content
    remove_matching_lines("Approved-Tag-List.txt", "Tags-to-Delete.txt", "Filtered-Approved-Tags.txt")
    
    # Option 2: Overwrite the original file
    # remove_matching_lines("Approved-Tag-List.txt", "Tags-to-Delete.txt")