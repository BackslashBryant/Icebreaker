#!/usr/bin/env python3
"""
Create a professional logo asset pack with all necessary variants:
- Icon-only: transparent background (all sizes)
- Logo+wordmark: transparent AND on-dark versions
- Monochrome: black and white variants on transparent
"""

import os
import shutil
from pathlib import Path
from PIL import Image
import math

LOGO_DIR = Path("Docs/Vision/icebreaker_logo_exports")

# Brand background colors to make transparent
BACKGROUND_COLORS = [
    (10, 15, 31),    # #0A0F1F - brand navy
    (13, 13, 13),    # #0D0D0D - brand charcoal
    (0, 0, 0),       # Pure black
    (11, 16, 32),    # Slight variation
    (12, 17, 33),    # Slight variation
]

THRESHOLD = 25

def color_distance(c1, c2):
    """Euclidean distance between two RGB colors."""
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

def is_background_pixel(rgb, threshold=THRESHOLD):
    """Check if pixel matches any background color within threshold."""
    for bg in BACKGROUND_COLORS:
        if color_distance(rgb, bg) <= threshold:
            return True
    return False

def remove_background(img_path, output_path):
    """Remove background from image, making it transparent."""
    try:
        img = Image.open(img_path)
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        pixels = img.load()
        width, height = img.size
        
        removed_count = 0
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                if a == 0:
                    continue
                if is_background_pixel((r, g, b)):
                    pixels[x, y] = (r, g, b, 0)
                    removed_count += 1
        
        img.save(output_path, 'PNG')
        return True, removed_count
    except Exception as e:
        return False, str(e)

def main():
    print("=" * 70)
    print("Creating Professional Logo Asset Pack")
    print("=" * 70)
    
    # Step 1: Rename existing logo-with-title files to -on-dark suffix
    print("\n1. Organizing logo-with-title files...")
    with_title_files = list(LOGO_DIR.glob("logo-with-title-*.png"))
    
    for filepath in with_title_files:
        if "-on-dark" in filepath.name or "-transparent" in filepath.name:
            continue  # Already processed
        
        # This becomes the on-dark version
        new_name = filepath.name.replace("logo-with-title-", "logo-with-title-on-dark-")
        new_path = filepath.parent / new_name
        
        if not new_path.exists():
            shutil.copy2(filepath, new_path)
            print(f"   ✓ Created: {new_name}")
    
    # Step 2: Create transparent versions of logo-with-title
    print("\n2. Creating transparent logo-with-title versions...")
    on_dark_files = list(LOGO_DIR.glob("logo-with-title-on-dark-*.png"))
    
    for filepath in on_dark_files:
        # Extract size from filename
        size = filepath.stem.replace("logo-with-title-on-dark-", "")
        transparent_name = f"logo-with-title-{size}.png"
        transparent_path = filepath.parent / transparent_name
        
        success, result = remove_background(filepath, transparent_path)
        if success:
            print(f"   ✓ {transparent_name}: {result} pixels made transparent")
        else:
            print(f"   ✗ {transparent_name}: ERROR - {result}")
    
    # Step 3: Ensure mono versions are transparent
    print("\n3. Processing monochrome versions...")
    mono_files = ['mono_black.png', 'mono_white.png']
    for filename in mono_files:
        filepath = LOGO_DIR / filename
        if filepath.exists():
            # Create backup if needed
            backup_name = filename.replace('.png', '-on-dark.png')
            backup_path = filepath.parent / backup_name
            if not backup_path.exists():
                shutil.copy2(filepath, backup_path)
            
            # Make the main one transparent
            success, result = remove_background(filepath, filepath)
            if success:
                print(f"   ✓ {filename}: {result} pixels made transparent")
    
    # Step 4: Summary of final asset pack
    print("\n" + "=" * 70)
    print("FINAL ASSET PACK SUMMARY")
    print("=" * 70)
    
    categories = {
        "Icon Only (transparent)": [
            "favicon_*.png", "ios_*.png", "android_*.png", "pwa_*.png",
            "maskable_icon_*.png", "splash_logo_*.png"
        ],
        "Logo + Wordmark (transparent)": ["logo-with-title-[0-9]*.png"],
        "Logo + Wordmark (on dark bg)": ["logo-with-title-on-dark-*.png"],
        "Monochrome (transparent)": ["mono_black.png", "mono_white.png"],
        "Special": ["android_adaptive_*.png", "favicon.ico"]
    }
    
    print("\nFiles by category:")
    for category, patterns in categories.items():
        print(f"\n  {category}:")
        for pattern in patterns:
            files = list(LOGO_DIR.glob(pattern))
            for f in sorted(files):
                print(f"    - {f.name}")
    
    # Final count
    all_files = list(LOGO_DIR.glob("*.png")) + list(LOGO_DIR.glob("*.ico"))
    print(f"\n  TOTAL: {len(all_files)} files")
    
    print("\n" + "=" * 70)
    print("Pro asset pack complete!")
    print("=" * 70)

if __name__ == "__main__":
    main()

