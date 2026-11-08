import os, sys
sys.stdout.reconfigure(encoding='utf-8')

engine_file = r"src/curriculum/grade10-engine.mjs"
svg_file = r"src/curriculum/grade10-svg.mjs"

# 1. Inspect engine
with open(engine_file, "r", encoding="utf-8") as f:
    engine_lines = f.readlines()

print("Engine total lines:", len(engine_lines))
for idx in range(145, 166):
    print(f"Engine {idx+1}: {repr(engine_lines[idx])}")

# 2. Inspect svg
with open(svg_file, "r", encoding="utf-8") as f:
    svg_lines = f.readlines()

print("SVG total lines:", len(svg_lines))
for idx in range(390, 455):
    print(f"SVG {idx+1}: {repr(svg_lines[idx])}")
