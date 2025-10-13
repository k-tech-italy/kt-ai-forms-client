#!/bin/bash

CURRENT=$(grep '"version"' package.json | cut -d'"' -f4)
PREVIOUS=$(git show HEAD~1:package.json | grep '"version"' | cut -d'"' -f4)

echo "Previous: $PREVIOUS"
echo "Current: $CURRENT"

# Use sort -V to compare versions
if [ "$CURRENT" = "$PREVIOUS" ]; then
    echo "❌ Version not incremented! Still $CURRENT"
    exit 1
elif [ "$(printf '%s\n' "$PREVIOUS" "$CURRENT" | sort -V | head -n1)" = "$PREVIOUS" ]; then
    echo "✅ Version incremented: $PREVIOUS → $CURRENT"
else
    echo "❌ Version decreased: $PREVIOUS → $CURRENT"
    exit 1
fi