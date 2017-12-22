#!/bin/bash

# Script to update the ITSLanguage GitHub pages website.
# Inspiration from https://gist.github.com/domenic/ec8b0fc8ab45f39403dd
#
# The script should potentially do two things. It should either update
# the esdocs for master, or add a version to it.
#
# NOTE:
# Travis has a convenient "pages" provider. This provider works awesome
# and saves the script that is below. BUT it has some drawbacks: you
# can only use it with an personal access token. This way, worst case,
# someone could gain access to the key provider its repositories. So we
# should limit that risk by using this script.
# Also, the default provider does not take multiple versions of
# documentation in account. We do try that with this script.

set -e # Exit with nonzero exit code if anything fails

SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"

# Pull requests and commits to other branches shouldn't try to deploy
# new GitHub pages. Only allow master and vX.X.X branches (= a tag for
# a new version).
if [ "$TRAVIS_PULL_REQUEST" != "false" ] ||
   [ "$TRAVIS_TAG" == "" ] &&
   [ "$TRAVIS_BRANCH" != "$SOURCE_BRANCH" ]; then
    echo "Skipping deploy"
    exit 0
fi

#Save some useful information
REPO_URL="https://$GITHUB_TOKEN@github.com/$TRAVIS_REPO_SLUG.git"
SHA=`git rev-parse --verify HEAD`

# Clone the existing gh-pages for this repo into out/
# Create a new empty branch if gh-pages doesn't exist yet (should only
# happen on first deploy)
rm -Rf ./out || exit 0
git clone $REPO_URL out
cd out
git checkout $TARGET_BRANCH || git checkout --orphan $TARGET_BRANCH

echo "Deploy docs for branch \"$TRAVIS_BRANCH\""

# create directory. If it exists... wel then it will
# be wiped!
rm -Rf "./$TRAVIS_BRANCH"
mkdir "$TRAVIS_BRANCH"
# copy documentation to place
cp -r $TRAVIS_BUILD_DIR/build/docs/* "./$TRAVIS_BRANCH"

# Now let's go have some fun with the cloned repo
git config user.name "$COMMIT_AUTHOR_NAME"
git config user.email "$COMMIT_AUTHOR_EMAIL"

# Commit the "changes", i.e. the new version.
# The delta will show diffs between new and old versions.
git add -A .
git commit -m "Deploy to GitHub Pages: ${SHA}"

# Now that we're all set up, we can push.
git push --force --quiet $REPO_URL $TARGET_BRANCH > /dev/null 2>&1

# Cleanup our out folder!
cd ..
rm -Rf out
