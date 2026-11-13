#!/usr/bin/env python3
"""Render the transparent Natural Earth coastline layer used by Coral-lytics."""

import argparse
from pathlib import Path

import cartopy.crs as ccrs
import cartopy.feature as cfeature
import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt


MAP_EXTENT = (-180, 180, -60, 80)
MAP_SIZE = (12, 6)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "src/pages/coral-map.png",
    )
    output = parser.parse_args().output
    output.parent.mkdir(parents=True, exist_ok=True)

    figure = plt.figure(figsize=MAP_SIZE, dpi=160)
    axes = figure.add_axes([0, 0, 1, 1], projection=ccrs.PlateCarree())
    axes.set_extent(MAP_EXTENT, crs=ccrs.PlateCarree())
    axes.set_aspect("auto")
    axes.patch.set_alpha(0)

    layers = (
        (cfeature.LAND.with_scale("50m"), "#B8BCB6", "#E2E5DF", 0.45, 1),
        (cfeature.BORDERS.with_scale("50m"), "none", "#929A94", 0.22, 2),
    )
    for feature, facecolor, edgecolor, linewidth, zorder in layers:
        geometries = (geometry.simplify(0.08, preserve_topology=True) for geometry in feature.geometries())
        axes.add_geometries(
            geometries,
            crs=ccrs.PlateCarree(),
            facecolor=facecolor,
            edgecolor=edgecolor,
            linewidth=linewidth,
            zorder=zorder,
        )
    axes.coastlines(resolution="50m", color="#E2E5DF", linewidth=0.45, zorder=3)

    figure.savefig(output, format="png", transparent=True, pad_inches=0)
    plt.close(figure)
    print(f"Rendered {output}")


if __name__ == "__main__":
    main()
