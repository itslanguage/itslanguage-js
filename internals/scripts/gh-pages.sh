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

# Pull requests and commits to other branches shouldn't try to deploy.
# the .travis.yml file should only allow master and vX.X.X branches (= tags).
# But just checking to be sure!
if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "$SOURCE_BRANCH" ]; then
    exit 0
fi

# Save some useful information
REPO=`git config remote.origin.url`
SSH_REPO=${REPO/https:\/\/github.com\//git@github.com:}
SHA=`git rev-parse --verify HEAD`

# Clone the existing gh-pages for this repo into out/
# Create a new empty branch if gh-pages doesn't exist yet (should only
# happen on first deploy)
git clone $REPO out
cd out
git checkout $TARGET_BRANCH || git checkout --orphan $TARGET_BRANCH
cd ..

# Clean out existing master docs if on master
if [ "$TRAVIS_BRANCH" == "$SOURCE_BRANCH" ]; then
  # find all files and folders that do not start with vX.
  # they could be older versions we still want!
  find . -not -regex "./v.*" -delete
fi

# Run the build.
yarn run build

# Start the copy of the docs process
if [ "$TRAVIS_BRANCH" == "$SOURCE_BRANCH" ]; then
  echo "Trying to update master."

  # copy docs to main folder
  cp -r build/esdoc/* out/
elif [ "$TRAVIS_BRANCH" == "$TRAVIS_TAG" ]; then
  echo "New tag: $TRAVIS_TAG"

  # clean out existing tag.
  rm -Rf out/$TRAVIS_TAG/**/* || exit 0

  # copy docs to tag folder.
  cp -r build/esdoc/* out/$TRAVIS_TAG
fi

# Now let's go have some fun with the cloned repo
cd out
git config user.name "Travis CI"
git config user.email "$COMMIT_AUTHOR_EMAIL"

# Commit the "changes", i.e. the new version.
# The delta will show diffs between new and old versions.
git add -A .
git commit -m "Deploy to GitHub Pages: ${SHA}"

# Get the deploy key by using Travis's stored variables to decrypt deploy_key.enc
ENCRYPTED_KEY_VAR="encrypted_${ENCRYPTION_LABEL}_key"
ENCRYPTED_IV_VAR="encrypted_${ENCRYPTION_LABEL}_iv"
ENCRYPTED_KEY=${!ENCRYPTED_KEY_VAR}
ENCRYPTED_IV=${!ENCRYPTED_IV_VAR}
openssl aes-256-cbc -K $ENCRYPTED_KEY -iv $ENCRYPTED_IV -in ../deploy-key.enc -out ../deploy-key -d
chmod 600 ../deploy-key
eval `ssh-agent -s`
ssh-add deploy-key

# Now that we're all set up, we can push.
git push $SSH_REPO $TARGET_BRANCH
