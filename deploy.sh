#!/usr/bin/env bash

#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"
if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
    echo "Skipping deploy; just doing a build."
    exit 0
fi
# Save some useful information
REPO=`git config remote.origin.url`
SSH_REPO=${REPO/https:\/\/github.com\//git@github.com:}

SHA=`git rev-parse --verify HEAD`

git remote set-url origin ${SSH_REPO}
git config user.name "Travis CI"
git config user.email "$COMMIT_AUTHOR_EMAIL"

ENCRYPTED_KEY_VAR="encrypted_${ENCRYPTION_LABEL}_key"
ENCRYPTED_IV_VAR="encrypted_${ENCRYPTION_LABEL}_iv"
echo ${ENCRYPTION_LABEL}
echo ${ENCRYPTED_IV_VAR}
ENCRYPTED_KEY=${!ENCRYPTED_KEY_VAR}
ENCRYPTED_IV=${!ENCRYPTED_IV_VAR}
echo ${ENCRYPTED_IV}
openssl aes-256-cbc -K ${ENCRYPTED_KEY} -iv ${ENCRYPTED_IV} -in itsl_js_deploy_key.enc -out itsl_js_deploy_key -d
chmod 600 itsl_js_deploy_key
eval `ssh-agent -s`
ssh-add itsl_js_deploy_key

npm run esdoc
git add esdoc/
git commit -m "Deploy to GitHub Pages: ${SHA}"

git subtree split --prefix esdoc/ -b gh-pages
git push -f origin gh-pages:gh-pages

npm run clearbuild
npm run babelify
