#!/usr/bin/env python3
"""
Organize and fix logo assets.
- Check for transparent backgrounds
- Identify icon-only vs with-title versions
- Fix backgrounds where needed
- Extract icon-only from with-title versions
"""

import os
from pathlib import Path
from PIL import Image
import sys

LOGO_DIR = Path("Docs/Vision/icebreaker_logo_exports")

def has_transparency(img):
    """Check if image has transparent background."""
    if img.mode in ('RGBA', 'LA'):
        # Check if alpha channel exists and has transparent pixels
        if img.mode == 'RGBA':
            alpha = img.split()[3]
            # Check if any pixel is not fully opaque
            return any(pixel < 255 for pixel in alpha.getdata())
        elif img.mode == 'LA':
            alpha = img.split()[1]
            return any(pixel < 255 for pixel in alpha.getdata())
    return False

def has_text(img_path):
    """Simple heuristic: larger files with text are usually bigger."""
    # This is a rough check - we'll use file size and manual inspection
    size = os.path.getsize(img_path)
    return size > 50000  # Files with text tend to be larger

def analyze_file(filepath):
    """Analyze a logo file and return its properties."""
    try:
        img = Image.open(filepath)
        width, height = img.size
        mode = img.mode
        transparent = has_transparency(img)
        file_size = os.path.getsize(filepath)
        
        # Guess if it has text based on filename and size
        has_title = 'full' in filepath.name.lower() or 'branding' in filepath.name.lower()
        
        return {
            'path': filepath,
            'name': filepath.name,
            'width': width,
            'height': height,
            'mode': mode,
            'transparent': transparent,
            'size': file_size,
            'has_title': has_title,
            'needs_fix': not transparent and ('favicon' in filepath.name.lower() or 
                                               'ios' in filepath.name.lower() or 
                                               'android' in filepath.name.lower() or 
                                               'pwa' in filepath.name.lower() or
                                               'maskable' in filepath.name.lower())
        }
    except Exception as e:
        return {
            'path': filepath,
            'name': filepath.name,
            'error': str(e)
        }

def main():
    """Main analysis function."""
    if not LOGO_DIR.exists():
        print(f"Error: {LOGO_DIR} does not exist")
        return 1
    
    files = sorted(LOGO_DIR.glob("*.png")) + sorted(LOGO_DIR.glob("*.ico"))
    results = []
    
    for filepath in files:
        result = analyze_file(filepath)
        results.append(result)
    
    # Print analysis
    print("Logo File Analysis")
    print("=" * 80)
    print(f"{'Filename':<40} {'Size':<12} {'Dimensions':<15} {'Transparent':<12} {'Needs Fix':<10}")
    print("-" * 80)
    
    needs_fix = []
    for r in results:
        if 'error' in r:
            print(f"{r['name']:<40} ERROR: {r['error']}")
            continue
        
        needs_fix_flag = "YES" if r.get('needs_fix', False) else "NO"
        transparent_flag = "YES" if r['transparent'] else "NO"
        dims = f"{r['width']}x{r['height']}"
        
        print(f"{r['name']:<40} {r['size']:<12} {dims:<15} {transparent_flag:<12} {needs_fix_flag:<10}")
        
        if r.get('needs_fix'):
            needs_fix.append(r)
    
    print("\n" + "=" * 80)
    print(f"Files needing fixes: {len(needs_fix)}")
    if needs_fix:
        print("\nFiles that need transparent backgrounds:")
        for r in needs_fix:
            print(f"  - {r['name']} ({r['width']}x{r['height']})")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())

