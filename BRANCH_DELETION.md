# Branch Deletion Documentation

This document describes the tools created to delete all branches except `main` from the repository.

## Overview

The repository contains multiple branches that need to be cleaned up, keeping only the `main` branch.

## Current Branches

As of the last check, the following branches exist:
- `main` (to be kept)
- `codex/fix-style-issues-and-modernize-html`
- `codex/fix-style-issues-and-modernize-html-7k8ueb`
- `codex/fix-style-issues-and-modernize-html-w9znw8`
- `copilot/delete-other-branches`
- `copilot/fix-index-md-visual-issues`
- `copilot/fix-theme-style-issues`
- `copilot/improve-website-layout-design`
- `fix/nav-gradient-canonicalize`

## Deletion Methods

### Method 1: Using the Bash Script (Manual)

Run the provided script to delete branches interactively:

```bash
./delete-branches.sh
```

This script will:
1. Fetch all remote branches
2. Display a list of branches to be deleted
3. Ask for confirmation
4. Delete each branch one by one

**Note:** You need write permissions to the repository to delete branches.

### Method 2: Using GitHub Actions (Automated)

A GitHub Actions workflow is provided that can be triggered manually:

1. Go to the "Actions" tab in the GitHub repository
2. Select "Delete All Branches Except Main" workflow
3. Click "Run workflow"
4. Confirm the run

The workflow will automatically delete all branches except `main`.

### Method 3: Manual Git Commands

If you prefer to delete branches manually:

```bash
# Fetch all branches
git fetch --all

# List branches to delete
git branch -r | grep -v '\->' | grep -v 'origin/main'

# Delete each branch (replace BRANCH_NAME with actual branch name)
git push origin --delete BRANCH_NAME
```

## Example Commands

To delete all branches except main in one command:

```bash
git fetch --all && git branch -r | grep -v '\->' | grep -v 'origin/main' | sed 's/origin\///' | xargs -I {} git push origin --delete {}
```

⚠️ **Warning:** This command will immediately delete all branches without confirmation!

## Verification

After deletion, verify only `main` remains:

```bash
git ls-remote --heads origin
```

This should only show `refs/heads/main`.

## Permissions Required

- Write access to the repository
- Permission to delete branches (protected branches cannot be deleted)

## Safety Notes

- The `main` branch should typically be protected to prevent accidental deletion
- Always verify the list of branches before confirming deletion
- Consider backing up important branches before deletion
- Ensure no active pull requests depend on the branches being deleted
