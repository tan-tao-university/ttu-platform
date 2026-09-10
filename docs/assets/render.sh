#!/usr/bin/env bash
# Render every .mmd in this directory to a .png that markdown files reference.
#
# Diagrams are PNG rather than SVG because GitHub does not reliably render SVG
# foreignObject elements (e.g. edge labels and sequence boxes) when loaded as images.
#
# Usage:
#   ./docs/assets/render.sh              # Render all .mmd files
#   ./docs/assets/render.sh overview-*   # Render specific diagram(s)
set -euo pipefail
cd "$(dirname "$0")"

if [ -z "${PUPPETEER_EXECUTABLE_PATH:-}" ]; then
  for candidate in \
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    "/Applications/Chromium.app/Contents/MacOS/Chromium" \
    "$(command -v google-chrome || true)" \
    "$(command -v chromium || true)"; do
    if [ -n "$candidate" ] && [ -x "$candidate" ]; then
      export PUPPETEER_EXECUTABLE_PATH="$candidate"
      break
    fi
  done
fi

MMDC=${MMDC:-"bunx @mermaid-js/mermaid-cli@11"}
targets=("$@")
if [ ${#targets[@]} -eq 0 ]; then targets=(*.mmd); fi

failed=()
for file in "${targets[@]}"; do
  [ -f "$file" ] || continue
  echo "Rendering $file -> ${file%.mmd}.png..."
  if ! $MMDC -i "$file" -o "${file%.mmd}.png" -c mermaid.config.json -b white -s 2 --quiet; then
    failed+=("$file")
  fi
done

if [ ${#failed[@]} -gt 0 ]; then
  echo
  echo "FAILED (${#failed[@]}):"
  printf '  %s\n' "${failed[@]}"
  exit 1
fi
echo "All diagrams rendered successfully."
