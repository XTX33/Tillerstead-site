#!/bin/bash

# Script to delete all branches except main
# This script will delete all remote branches except 'main'

set -e

echo "=========================================="
echo "Branch Deletion Script"
echo "=========================================="
echo "This script will delete ALL branches except 'main'"
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Fetch all branches
echo "Fetching all remote branches..."
git fetch --all --prune

# Get list of all remote branches except main
echo ""
echo "Branches that will be deleted:"
echo "=========================================="
branches=$(git branch -r | grep -v '\->' | grep -v 'origin/main' | sed 's/origin\///' | grep -v '^$')

if [ -z "$branches" ]; then
    echo "No branches to delete (only main exists)"
    exit 0
fi

echo "$branches"
echo "=========================================="
echo ""

# Ask for confirmation
read -p "Are you sure you want to delete these branches? (yes/no): " confirmation

if [ "$confirmation" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

# Delete each branch
echo ""
echo "Deleting branches..."
for branch in $branches; do
    echo "Deleting: $branch"
    if git push origin --delete "$branch"; then
        echo "✓ Successfully deleted: $branch"
    else
        echo "✗ Failed to delete: $branch"
    fi
done

echo ""
echo "=========================================="
echo "Branch deletion complete!"
echo "=========================================="
