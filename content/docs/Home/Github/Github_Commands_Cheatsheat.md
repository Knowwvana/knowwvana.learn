---
title: "GitHub Commands Cheat Sheet"
description: "A complete, easy reference guide for Git, from initializing a repository to advanced operations like branching, tagging, undoing, and stashing."
date: 2025-11-24
draft: false
tags: ["GitHub", "Git", "Cheat Sheet", "Knowwvana", "DevOps"]
categories: ["DevOps", "GitHub"]
---

# GitHub Commands Cheat Sheet

Below is a complete, structured table of the most commonly used Git and GitHub commands — from repo setup, daily usage, branching, merging, tagging, and troubleshooting.

---

## 📘 GitHub Command Reference Table

| Category | Purpose | Command |
|----------|---------|---------|
| **Initialize Repo** | Create README | `echo "# ProjectName" >> README.md` |
| | Initialize Git | `git init` |
| | Add all files | `git add .` |
| | Commit | `git commit -m "Initial commit"` |
| **Connect to GitHub** | Rename branch to main | `git branch -M main` |
| | Add remote origin | `git remote add origin https://github.com/USERNAME/REPO.git` |
| | First push | `git push -u origin main` |
| **Everyday Use** | Status | `git status` |
| | Add file | `git add filename` |
| | Add all files | `git add .` |
| | Commit | `git commit -m "message"` |
| | Push | `git push` |
| | Pull | `git pull` |
| | Commit history | `git log --oneline --graph --decorate` |
| | Diff | `git diff` |
| **Branching** | Create branch | `git branch feature1` |
| | Switch branch | `git checkout feature1` |
| | Create & switch | `git checkout -b feature1` |
| | Delete branch | `git branch -d feature1` |
| | Delete remote branch | `git push origin --delete feature1` |
| **Merging** | Switch to main | `git checkout main` |
| | Merge a branch | `git merge feature1` |
| **Tags** | Create tag | `git tag v1.0` |
| | Push tags | `git push origin --tags` |
| | Delete local tag | `git tag -d v1.0` |
| | Delete remote tag | `git push origin :refs/tags/v1.0` |
| **Undo Changes** | Unstage file | `git reset filename` |
| | Unstage all | `git reset` |
| | Discard file changes | `git checkout -- filename` |
| | Undo commit (keep changes) | `git reset --soft HEAD~1` |
| | Undo commit (discard changes) | `git reset --hard HEAD~1` |
| **Stashing** | Stash changes | `git stash` |
| | Apply stash | `git stash apply` |
| | Pop stash | `git stash pop` |
| | List stashes | `git stash list` |
| **Clone Repo** | Clone | `git clone https://github.com/USERNAME/REPO.git` |
| **Git Config** | Set username | `git config --global user.name "Your Name"` |
| | Set email | `git config --global user.email "you@example.com"` |
| | Cache credentials | `git config --global credential.helper cache` |
| **GitHub Login** | Browser auth (GitHub CLI) | `gh auth login` |

---

## 🎉 You're all set!

Let me know if you want:

✅ A *beginner version*  
✅ A *Knowwvana-branded* style version  
✅ A *PDF version*  
✅ A *Cheat-sheet image (PNG)*  
✅ A *Print-friendly version*

I can generate any format you want.
