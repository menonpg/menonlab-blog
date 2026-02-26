#!/bin/bash
# Check for new GitHub-related notes that haven't been processed yet
# Outputs new notes in a parseable format

PROCESSED_FILE="$HOME/clawd/.processed_notes"
NOTES_DB="$HOME/Library/Group Containers/group.com.apple.notes/NoteStore.sqlite"

# Create processed file if it doesn't exist
touch "$PROCESSED_FILE"

# Query for notes with GitHub content
RESULTS=$(sqlite3 -separator '|||' "$NOTES_DB" "
SELECT 
    ZTITLE1,
    datetime(ZMODIFICATIONDATE1 + 978307200, 'unixepoch', 'localtime'),
    ZSNIPPET
FROM ZICCLOUDSYNCINGOBJECT 
WHERE (
    ZTITLE1 LIKE '%github.com%' OR 
    ZTITLE1 LIKE '%huggingface.co%' OR 
    ZTITLE1 LIKE '%arxiv.org%' OR
    ZSNIPPET LIKE '%github.com%' OR 
    ZSNIPPET LIKE '%huggingface.co%' OR 
    ZSNIPPET LIKE '%arxiv.org%'
)
AND ZTITLE1 IS NOT NULL
AND ZMODIFICATIONDATE1 > (strftime('%s', 'now', '-7 days') - 978307200)
ORDER BY ZMODIFICATIONDATE1 DESC
LIMIT 20;
")

# Filter out already-processed notes
while IFS='|||' read -r title date snippet; do
    # Skip if empty
    [ -z "$title" ] && continue
    
    # Create a hash of the title for tracking (use shasum, available on macOS/Linux)
    HASH=$(echo "$title" | shasum -a 256 | cut -d' ' -f1)
    
    # Check if already processed
    if ! grep -q "^$HASH$" "$PROCESSED_FILE" 2>/dev/null; then
        echo "$title|||$date|||$snippet"
    fi
done <<< "$RESULTS"

# NOTE: Don't mark as processed here!
# The calling agent should call mark_note_processed.sh after writing the post
