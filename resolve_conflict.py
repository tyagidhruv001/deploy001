
import os
import sys

def resolve_conflict(target_file):
    """
    Safely resolves git conflicts in a specified file by favoring the incoming changes.
    """
    if not os.path.isabs(target_file):
        # Resolve relative to the script's directory if it's not an absolute path
        base_dir = os.path.dirname(os.path.abspath(__file__))
        target_file = os.path.join(base_dir, target_file)

    if not os.path.exists(target_file):
        print(f"Error: Target file not found at {target_file}")
        return False

    try:
        with open(target_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        new_lines = []
        skip = False
        in_conflict_block = False
        
        # Git conflict markers usually start at the beginning of the line
        for line in lines:
            stripped = line.strip()
            
            if stripped.startswith("<<<<<<<"):
                skip = True
                in_conflict_block = True
                continue
            elif stripped.startswith("=======") and in_conflict_block:
                # Stop skipping once we hit the divider; we want the bottom (incoming) part
                skip = False
                continue
            elif stripped.startswith(">>>>>>>") and in_conflict_block:
                # End of the entire conflict block
                skip = False
                in_conflict_block = False
                continue
            
            if not skip:
                new_lines.append(line)

        with open(target_file, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        
        print(f"Successfully resolved conflicts in: {target_file}")
        return True

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return False

if __name__ == "__main__":
    # Default target if none provided as argument
    default_path = os.path.join("frontend", "pages", "dashboard", "customer", "customer-dashboard.js")
    
    # Allow passing file path as an argument
    target = sys.argv[1] if len(sys.argv) > 1 else default_path
    
    resolve_conflict(target)
