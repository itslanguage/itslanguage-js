#!/bin/bash

# Script to update the ITSLanguage GitHub pages website.
# Inspiration from https://gist.github.com/domenic/ec8b0fc8ab45f39403dd
#
# The script should potentially do two things. It should either update
# the esdocs for master, or add a version to it.
#
# NOTE:
# Travis has a convenient "pages" provider. This provider works awesome
# and saves the script that is below. BUT it has one huge drawback: you
# can only use it with an personal access token. This way, worst case,
# someone could gane access to the key provider its repositories. So we
# should limit that risk by using this script.

set -e # Exit with nonzero exit code if anything fails

SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"

# Pull requests and commits to other branches shouldn't try to deploy
# new GitHub pages. Only allow master and vX.X.X branches (= a tag for
# a new version).
if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_TAG" == "" ]; then
    exit 0
fi

#

# identify repo url with GITHUB_TOKEN
REPO_URL=`git remote -v | grep -m1 "^origin" | sed -Ene's#.*(git@github.com:[^[:space:]]*).*#\1#p'`
if [ -z "$REPO_URL" ]; then
  echo "-- ERROR:  Could not identify Repo url."
  echo "   It is possible this repo is already using HTTPS instead of SSH."
  exit 1
fi

USER=`echo $REPO_URL | sed -Ene's#git@github.com:([^/]*)/(.*).git#\1#p'`
if [ -z "$USER" ]; then
  echo "-- ERROR:  Could not identify User."
  exit 1
fi

REPO=`echo $REPO_URL | sed -Ene's#git@github.com:([^/]*)/(.*).git#\2#p'`
if [ -z "$REPO" ]; then
  echo "-- ERROR:  Could not identify Repo."
  exit 1
fi

REPO_HTTPS_URL="https://$GITHUB_TOKEN@github.com/$USER/$REPO.git"

# Clone the existing gh-pages for this repo into out/
# Create a new empty branch if gh-pages doesn't exist yet (should only
# happen on first deploy)
git clone $REPO out
cd out
git checkout $TARGET_BRANCH || git checkout --orphan $TARGET_BRANCH

echo "Deploy $TARGET_BRANCH docs!"

# create directory. If it exists... wel then it will
# be wiped!
rm -Rf ./$TARGET_BRANCH
mkdir $TARGET_BRANCH
# copy documentation to place
cp -r ../docs/* ./$TARGET_BRANCH

# Now let's go have some fun with the cloned repo
git config user.name "$COMMIT_AUTHOR_NAME"
git config user.email "$COMMIT_AUTHOR_EMAIL"

# Commit the "changes", i.e. the new version.
# The delta will show diffs between new and old versions.
git add -A .
git commit -m "Deploy to GitHub Pages: ${SHA}"

# Now that we're all set up, we can push.
git push --force --quiet $REPO_HTTPS_URL $TARGET_BRANCH > /dev/null 2>&1

# Cleanup our out folder!
cd ..
rm -Rf out
