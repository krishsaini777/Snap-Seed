"""
download_dataset.py
====================
Downloads the PlantVillage dataset from Kaggle using kagglehub.

The dataset contains 38 classes of plant leaf images (healthy and diseased)
organised as:  <download_path>/plantvillage dataset/color/<ClassName>/

Usage:
    python download_dataset.py

Prerequisites:
    pip install kagglehub
    You may need to authenticate with Kaggle — see kagglehub docs.
"""

import os
import sys

try:
    import kagglehub
except ImportError:
    print("ERROR: kagglehub is not installed. Run: pip install kagglehub")
    sys.exit(1)


def main():
    print("=" * 60)
    print("  PlantVillage Dataset Downloader")
    print("=" * 60)

    print("\n[INFO] Downloading PlantVillage dataset from Kaggle …")
    print("[INFO] This may take a while on the first run.\n")

    path = kagglehub.dataset_download("abdallahalidev/plantvillage-dataset")

    print("\n✅  Dataset downloaded successfully!")
    print(f"📂  Root path : {path}")

    # The colour images live under a known sub-directory.
    color_dir = os.path.join(path, "plantvillage dataset", "color")
    if os.path.isdir(color_dir):
        classes = sorted(os.listdir(color_dir))
        print(f"🌿  Colour images directory: {color_dir}")
        print(f"📊  Number of classes found: {len(classes)}")
        print("\nClasses:")
        for i, cls in enumerate(classes, 1):
            class_path = os.path.join(color_dir, cls)
            n_images = len(os.listdir(class_path)) if os.path.isdir(class_path) else 0
            print(f"  {i:>2}. {cls}  ({n_images} images)")
    else:
        print(f"\n⚠️  Expected colour directory not found at: {color_dir}")
        print("    Please check the download path above and locate the images manually.")

    print("\n" + "=" * 60)
    print("  Use this path with train.py:")
    print(f"    python train.py --dataset-path \"{color_dir}\"")
    print("=" * 60)


if __name__ == "__main__":
    main()
