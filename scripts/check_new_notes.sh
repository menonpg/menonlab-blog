#!/bin/bash
# Check for new GitHub-related notes since last check
# Outputs new notes in a parseable format

LAST_CHECK_FILE="$HOME/clawd/.last_notes_check"
NOTES_DB="$HOME/Library/Group Containers/group.com.apple.notes/NoteStore.sqlite"

# Get last check timestamp (default to 24 hours ago)
if [ -f "$LAST_CHECK_FILE" ]; then
    LAST_CHECK=$(cat "$LAST_CHECK_FILE")
else
    LAST_CHECK=$(date -v-24H +%s)
fi

# Convert to Core Data timestamp (seconds since 2001-01-01)
CORE_DATA_EPOCH=978307200
LAST_CHECK_CORE=$((LAST_CHECK - CORE_DATA_EPOCH))

# Query for new notes with GitHub content
sqlite3 -separator '|||' "$NOTES_DB" "
SELECT 
    ZTITLE1,
    datetime(ZMODIFICATIONDATE1 + 978307200, 'unixepoch', 'localtime'),
    ZSNIPPET
FROM ZICCLOUDSYNCINGOBJECT 
WHERE ZSNIPPET LIKE '%github.com%' 
AND ZTITLE1 IS NOT NULL
AND ZMODIFICATIONDATE1 > $LAST_CHECK_CORE
ORDER BY ZMODIFICATIONDATE1 DESC
LIMIT 10;
"

# Update last check timestamp
date +%s > "$LAST_CHECK_FILE"
