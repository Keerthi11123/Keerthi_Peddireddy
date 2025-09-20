#!/usr/bin/env bash
set -euo pipefail
REPO=Keerthi_Peddireddy
git init
git branch -m main || true
git add .
git commit -m "Initial portfolio commit"
git remote add origin https://github.com/Keerthi11123/${REPO}.git || true
git push -u origin main
echo
echo "Now enable GitHub Pages: Settings → Pages → Source = 'Deploy from a branch' → main /(root)"
echo "Your site will be live at: https://Keerthi11123.github.io/${REPO}/"
