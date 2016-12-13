## Publishing

Make sure your repo is up to date with the latest master from upstream.

Assuming you're working in your own fork and configured (`itslanguage/itslanguage-js`) as upstream:

```sh
git checkout master
git fetch upstream --tags
git reset --hard upstream/master
```

To release a new version, run:

```sh
npm version minor
git push upstream master --tags
```

Travis will deploy it to the npm registry and publish the docs to gh-pages.
