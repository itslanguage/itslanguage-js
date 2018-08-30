## Publishing

Make sure your repo is up to date with the latest master from upstream.

Assuming you're working in your own fork and configured (`itslanguage/itslanguage-js`) as upstream:

```sh
git checkout master
git fetch upstream --tags
git reset --hard upstream/master
```

To release a new version login first with `npm login` run:

```sh
npm run babelify
cd build
npm version minor
npm publish
```
This will upload the build artifacts to NPM. Be sure to also update the version number in the master branch and,
if necessary, flag a release version.
