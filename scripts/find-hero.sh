#!/bin/bash
# Find and download a Creative Commons hero image from Wikimedia Commons
# Usage: ./scripts/find-hero.sh "search query" post-slug

QUERY="$1"
SLUG="$2"

if [ -z "$QUERY" ] || [ -z "$SLUG" ]; then
  echo "Usage: $0 \"search query\" post-slug"
  echo "Example: $0 \"circuit board technology\" my-post"
  exit 1
fi

# Target dimensions for hero images
TARGET_WIDTH=1200
TARGET_HEIGHT=630

echo "🔍 Searching Wikimedia Commons for: $QUERY"

# URL encode function
urlencode() {
  python3 -c "import urllib.parse; print(urllib.parse.quote('''$1'''))"
}

# Search Wikimedia Commons
SEARCH_URL="https://commons.wikimedia.org/w/api.php"
ENCODED_QUERY=$(urlencode "$QUERY filetype:bitmap")
SEARCH_PARAMS="action=query&format=json&list=search&srsearch=${ENCODED_QUERY}&srnamespace=6&srlimit=10"

RESULTS=$(curl -sL "${SEARCH_URL}?${SEARCH_PARAMS}")

# Extract first image title
TITLE=$(echo "$RESULTS" | jq -r '.query.search[0].title // empty')

if [ -z "$TITLE" ]; then
  echo "❌ No images found for query: $QUERY"
  exit 1
fi

echo "📸 Found: ${TITLE##File:}"

# Get image info (URL-encode the title)
ENCODED_TITLE=$(urlencode "$TITLE")
INFO_PARAMS="action=query&format=json&titles=${ENCODED_TITLE}&prop=imageinfo&iiprop=url|size"
INFO=$(curl -sL "${SEARCH_URL}?${INFO_PARAMS}")

WIDTH=$(echo "$INFO" | jq -r '.query.pages | to_entries[0].value.imageinfo[0].width // 0')
HEIGHT=$(echo "$INFO" | jq -r '.query.pages | to_entries[0].value.imageinfo[0].height // 0')
URL=$(echo "$INFO" | jq -r '.query.pages | to_entries[0].value.imageinfo[0].url // ""')

if [ -z "$URL" ] || [ "$URL" = "null" ] || [ "$URL" = "" ]; then
  echo "❌ Could not get image URL"
  exit 1
fi

echo "   Dimensions: ${WIDTH}×${HEIGHT}"

# Create directory
mkdir -p "public/images/blog/$SLUG"

# Download image
echo "⬇️  Downloading..."
curl -sL "$URL" -o "public/images/blog/$SLUG/hero-temp.jpg"

# Resize to exact dimensions using sips (macOS built-in)
if command -v sips &> /dev/null; then
  echo "🖼️  Resizing to ${TARGET_WIDTH}×${TARGET_HEIGHT}..."
  sips -z $TARGET_HEIGHT $TARGET_WIDTH \
    "public/images/blog/$SLUG/hero-temp.jpg" \
    --out "public/images/blog/$SLUG/hero.jpg" &> /dev/null
  rm "public/images/blog/$SLUG/hero-temp.jpg"
else
  echo "⚠️  No resize tool available (saving original)"
  mv "public/images/blog/$SLUG/hero-temp.jpg" "public/images/blog/$SLUG/hero.jpg"
fi

# Get file size
SIZE=$(du -k "public/images/blog/$SLUG/hero.jpg" | cut -f1)

echo ""
echo "✅ Hero image saved: public/images/blog/$SLUG/hero.jpg"
echo "   Size: ${SIZE}KB"
echo ""
echo "📝 Add to your post frontmatter:"
echo "   heroAlt: \"[Describe what's in the image]\""
echo "   imageCredit: \"${TITLE##File:} (Wikimedia Commons)\""
