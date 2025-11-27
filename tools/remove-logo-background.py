#!/usr/bin/env python3
"""
Remove navy/dark background from logo PNGs, making them truly transparent.
Uses color-distance matching to remove the navy (#0A0F1F) and near-black areas.
"""

import os
from pathlib import Path
from PIL import Image
import math
import sys

LOGO_DIR = Path("Docs/Vision/icebreaker_logo_exports")

# Brand background colors to make transparent
BACKGROUND_COLORS = [
    (10, 15, 31),    # #0A0F1F - brand navy
    (13, 13, 13),    # #0D0D0D - brand charcoal
    (0, 0, 0),       # Pure black (some exports)
    (11, 16, 32),    # Slight variation
    (12, 17, 33),    # Slight variation
]

# Color distance threshold - how close a pixel must be to bg color to be removed
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

def remove_background(img_path, output_path=None):
    """Remove background from image, making it transparent."""
    if output_path is None:
        output_path = img_path
    
    try:
        img = Image.open(img_path)
        
        # Convert to RGBA if needed
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        pixels = img.load()
        width, height = img.size
        
        removed_count = 0
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                
                # Skip already transparent pixels
                if a == 0:
                    continue
                
                # Check if this is a background pixel
                if is_background_pixel((r, g, b)):
                    pixels[x, y] = (r, g, b, 0)  # Make transparent
                    removed_count += 1
        
        img.save(output_path, 'PNG')
        return True, removed_count
    except Exception as e:
        return False, str(e)

def process_icon_files():
    """Process all icon-only files that need transparent backgrounds."""
    # Icon-only files (should have transparent bg)
    icon_files = [
        # Favicons
        'favicon_16.png', 'favicon_32.png', 'favicon_48.png', 
        'favicon_64.png', 'favicon_128.png',
        # iOS
        'ios_76.png', 'ios_120.png', 'ios_152.png', 
        'ios_167.png', 'ios_180.png', 'ios_1024.png',
        # Android
        'android_48.png', 'android_72.png', 'android_96.png',
        'android_144.png', 'android_192.png', 'android_512.png',
        'android_adaptive_foreground.png',
        # PWA
        'pwa_192.png', 'pwa_256.png', 'pwa_384.png', 'pwa_512.png',
        # Others
        'maskable_icon_1024.png', 'splash_logo_1200.png',
        'mono_white.png', 'mono_black.png',
    ]
    
    print("Removing backgrounds from logo files...")
    print("=" * 70)
    
    success_count = 0
    for filename in icon_files:
        filepath = LOGO_DIR / filename
        if not filepath.exists():
            print(f"  SKIP: {filename} (not found)")
            continue
        
        success, result = remove_background(filepath)
        if success:
            print(f"  ✓ {filename}: {result} pixels made transparent")
            success_count += 1
        else:
            print(f"  ✗ {filename}: ERROR - {result}")
    
    print("=" * 70)
    print(f"Processed: {success_count} files")
    return success_count

def main():
    """Main entry point."""
    if not LOGO_DIR.exists():
        print(f"Error: {LOGO_DIR} does not exist")
        return 1
    
    process_icon_files()
    
    # Also update the frontend assets
    print("\nUpdating frontend assets...")
    frontend_assets = Path("frontend/src/assets")
    frontend_public = Path("frontend/public")
    
    # Copy updated files to frontend
    for size in [128, 256]:
        # Use favicon for 128, pwa for 256
        src_file = 'favicon_128.png' if size == 128 else 'pwa_256.png'
        src_path = LOGO_DIR / src_file
        
        if src_path.exists():
            for dest_dir in [frontend_assets, frontend_public]:
                dest_path = dest_dir / f"logo-{size}.png"
                if dest_dir.exists():
                    import shutil
                    shutil.copy2(src_path, dest_path)
                    print(f"  ✓ Copied to {dest_path}")
    
    # Copy favicon.ico to public
    favicon_src = LOGO_DIR / "favicon.ico"
    favicon_dest = frontend_public / "favicon.ico"
    if favicon_src.exists() and frontend_public.exists():
        import shutil
        shutil.copy2(favicon_src, favicon_dest)
        print(f"  ✓ Copied favicon.ico to {favicon_dest}")
    
    print("\nDone!")
    return 0

if __name__ == "__main__":
    sys.exit(main())

