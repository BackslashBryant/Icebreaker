#!/usr/bin/env python3
"""Verify all logo files in the app are correct."""

from PIL import Image
import os

files_to_check = [
    'frontend/src/assets/logo-128.png',
    'frontend/src/assets/logo-256.png',
    'frontend/public/logo-128.png',
    'frontend/public/logo-256.png',
    'frontend/public/favicon.ico'
]

print("Verifying all logo files in app:")
print("=" * 80)

for filepath in files_to_check:
    if os.path.exists(filepath):
        try:
            img = Image.open(filepath)
            transparent = img.mode in ('RGBA', 'LA')
            print(f"✓ {filepath}")
            print(f"    Size: {img.size}, Mode: {img.mode}, Transparent: {transparent}")
        except Exception as e:
            print(f"✗ {filepath} - ERROR: {e}")
    else:
        print(f"✗ {filepath} - NOT FOUND")

print("=" * 80)

