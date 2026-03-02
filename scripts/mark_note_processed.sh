#!/bin/bash
# Mark a note as processed so it doesn't show up again
# Usage: mark_note_processed.sh "Note Title"

PROCESSED_FILE="$HOME/clawd/.processed_notes"

if [ -z "$1" ]; then
    echo "Usage: $0 'Note Title'"
    exit 1
fi

# Create hash of the title (must match check_new_notes.sh)
HASH=$(echo "$1" | shasum -a 256 | cut -d' ' -f1)

# Add to processed list if not already there
if ! grep -q "^$HASH$" "$PROCESSED_FILE" 2>/dev/null; then
    echo "$HASH" >> "$PROCESSED_FILE"
    echo "Marked as processed: $1"
else
    echo "Already processed: $1"
fi
