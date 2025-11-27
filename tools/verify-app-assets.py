#!/usr/bin/env python3
"""Verify and update app logo assets."""

import os
import shutil
from pathlib import Path
from PIL import Image

ASSETS_DIR = Path("frontend/src/assets")
LOGO_DIR = Path("Docs/Vision/icebreaker_logo_exports")

def main():
    """Verify and update app assets."""
    # Ensure assets directory exists
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Required logo files
    logo_files = {
        'logo-128.png': 'favicon_128.png',
        'logo-256.png': 'pwa_256.png'
    }
    
    print("Verifying app logo assets...")
    print("=" * 80)
    
    for asset_name, source_name in logo_files.items():
        asset_path = ASSETS_DIR / asset_name
        source_path = LOGO_DIR / source_name
        
        if not source_path.exists():
            print(f"  ERROR: Source {source_name} not found")
            continue
        
        # Copy if missing or outdated
        if not asset_path.exists():
            shutil.copy2(source_path, asset_path)
            print(f"  CREATED: {asset_name} (copied from {source_name})")
        else:
            # Check if files are different
            source_img = Image.open(source_path)
            asset_img = Image.open(asset_path)
            
            if source_img.size != asset_img.size or source_img.mode != asset_img.mode:
                shutil.copy2(source_path, asset_path)
                print(f"  UPDATED: {asset_name} (size/mode mismatch)")
            else:
                print(f"  OK: {asset_name} (already exists and matches)")
        
        # Verify final asset
        img = Image.open(asset_path)
        transparent = img.mode in ('RGBA', 'LA')
        print(f"    Size: {img.size}, Mode: {img.mode}, Transparent: {transparent}")
    
    print("=" * 80)
    print("Done!")

if __name__ == "__main__":
    main()

