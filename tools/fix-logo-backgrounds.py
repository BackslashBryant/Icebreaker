#!/usr/bin/env python3
"""
Fix logo backgrounds - make them transparent for app icons.
Removes dark blue/black backgrounds and replaces with transparency.
"""

import os
from pathlib import Path
from PIL import Image
import sys

LOGO_DIR = Path("Docs/Vision/icebreaker_logo_exports")

# Dark blue/black colors to remove (brand colors: #0A0F1F, #0D0D0D)
BACKGROUND_COLORS = [
    (10, 15, 31, 255),   # #0A0F1F
    (13, 13, 13, 255),   # #0D0D0D
    (0, 0, 0, 255),      # Pure black
    (10, 15, 31),        # Without alpha
    (13, 13, 13),        # Without alpha
    (0, 0, 0),           # Without alpha
]

# Teal accent color to preserve: #00B8D9
TEAL_COLOR = (0, 184, 217, 255)

def is_background_color(pixel, img_mode):
    """Check if pixel matches background colors."""
    if img_mode == 'RGBA':
        r, g, b, a = pixel
        pixel_rgb = (r, g, b, a)
        pixel_rgb_no_alpha = (r, g, b)
    elif img_mode == 'RGB':
        r, g, b = pixel
        pixel_rgb = (r, g, b, 255)
        pixel_rgb_no_alpha = (r, g, b)
    else:
        return False
    
    # Check against all background color variations
    for bg_color in BACKGROUND_COLORS:
        if len(bg_color) == 4:  # RGBA
            if pixel_rgb == bg_color:
                return True
        elif len(bg_color) == 3:  # RGB
            if pixel_rgb_no_alpha == bg_color:
                return True
        # Also check with tolerance for slight variations
        if len(bg_color) == 3:
            r_bg, g_bg, b_bg = bg_color
            r_p, g_p, b_p = pixel_rgb_no_alpha if img_mode == 'RGB' else pixel[:3]
            # Allow small tolerance (5 pixels)
            if abs(r_p - r_bg) <= 5 and abs(g_p - g_bg) <= 5 and abs(b_p - b_bg) <= 5:
                return True
    
    return False

def make_transparent(img_path, output_path=None):
    """Make background transparent by removing dark blue/black pixels."""
    if output_path is None:
        output_path = img_path
    
    try:
        img = Image.open(img_path)
        
        # Convert to RGBA if not already
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Get pixel data
        pixels = img.load()
        width, height = img.size
        
        # Make background transparent
        transparent_count = 0
        for y in range(height):
            for x in range(width):
                pixel = pixels[x, y]
                if is_background_color(pixel, 'RGBA'):
                    # Make transparent
                    pixels[x, y] = (pixel[0], pixel[1], pixel[2], 0)
                    transparent_count += 1
        
        # Save
        img.save(output_path, 'PNG')
        return True, transparent_count
    except Exception as e:
        return False, str(e)

def main():
    """Fix backgrounds for app icon files."""
    if not LOGO_DIR.exists():
        print(f"Error: {LOGO_DIR} does not exist")
        return 1
    
    # Files that need transparent backgrounds (app icons only)
    files_to_fix = [
        'android_144.png', 'android_192.png', 'android_48.png', 'android_512.png',
        'android_72.png', 'android_96.png', 'android_adaptive_background.png',
        'favicon_128.png', 'favicon_16.png', 'favicon_32.png', 'favicon_48.png',
        'favicon_64.png', 'ios_1024.png', 'ios_120.png', 'ios_152.png',
        'ios_167.png', 'ios_180.png', 'ios_76.png', 'maskable_icon_1024.png',
        'pwa_192.png', 'pwa_256.png', 'pwa_384.png', 'pwa_512.png'
    ]
    
    print("Fixing logo backgrounds...")
    print("=" * 80)
    
    fixed = 0
    errors = 0
    
    for filename in files_to_fix:
        filepath = LOGO_DIR / filename
        if not filepath.exists():
            print(f"  SKIP: {filename} (not found)")
            continue
        
        success, result = make_transparent(filepath)
        if success:
            print(f"  FIXED: {filename} ({result} pixels made transparent)")
            fixed += 1
        else:
            print(f"  ERROR: {filename} - {result}")
            errors += 1
    
    print("=" * 80)
    print(f"Fixed: {fixed}, Errors: {errors}")
    
    return 0 if errors == 0 else 1

if __name__ == "__main__":
    sys.exit(main())

