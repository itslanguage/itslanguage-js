# Contributing

This file defines the general contribution guide to follow if you want to contribute. If in doubt or
if you have any question you can contact us via support@itslanguage.nl or create an issue via the
[github issue tracker].

## Project code structure

To get started, let us explore how the current project has been set up. Not all files will be shown
in the tree below.

```
.
├── packages/
│   ├── api/
│   ├── player/
│   └── recorder/
├── scripts/
│   ├── packer/
│   │   ├── build.js
│   │   └── bundles.js
│   ├── gh-pages.sh
│   └── npmcheckversion.js
├── .editorconfig
├── .eslintignore
├── .eslintrc.yml
├── .gitignore
├── .nvmrc
├── .travis.yml
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── babel.config.js
├── jsdoc.json
├── karma.conf.js
├── package.json
└── yarn.lock
```

### root

At the root level of the project you can find the project related markdown files, dot configuration
files, the license file and of course the package.json.

| file               | scope   | description                                            |
| :----------------- | :------ | :----------------------------------------------------- |
| .editorconfig      | project | editorconfig, see [editorconfig.org]                   |
| .eslintignore      | qa      | ignore file for [ESLint]                               |
| .eslintrc.yml      | qa      | configuration file for [ESLint]                        |
| .gitignore         | project | the ignore file for git                                |
| .nvmrc             | project | configuration for [nvm], see [.nvmrc] for more on this |
| .travis.yml        | ci      | configuration file for [travis-ci.org]                 |
| babel.config.js    | build   | configuration file for [babel]                         |
| jsdoc.json         | docs    | configuration file for generating [JSDoc] docs         |
| karma.conf.js      | testing | configuration file for [karma]                         |
| package.json       | project | project definition file                                |
| yarn.lock          | project | we use [yarn] and this is our lockfile                 |
| CHANGELOG.md       | project | changelog file following [keep a changelog] rules      |
| CODE_OF_CONDUCT.md | project | our [Contributor Covenant]                             |
| CONTRIBUTING.md    | project | the file you are reading right now                     |
| LICENSE            | project | the license file this code falls under                 |
| README.md          | project | the main readme file                                   |

### packages/

This folder holds the packages that we have defined in the project.

#### packages/api/

This is the ITSLanguage API package. It will be build and deployed to npm.

#### packages/player/

This is the ITSLanguage Player package. It will be build and deployed to npm.

#### packages/recorder/

This is the ITSLanguage Recorder package. It will be build and deployed to npm.

### scripts/

Here we put scripts that can be used at project level. Most of them are available through
`yarn run`.

#### scripts/packer/build.js

This is the script that will be called when `yarn run build` is executed. It will create packages
as defined in the [bundles.js](scripts/packer/bundles.js) file. These are the packages that will be
deployed to [npm].

## Style guide

### JavaScript

The code is linted using [ESLint]. Apart from that it follows the [Airbnb JavaScript Style Guide] as
closely as possible.

If you do find yourself in a situation where you _think_ you definitely need to disable some rule
keep the following guideline in mind:

- Probably there is another way to do it _without_ disabling the rule
- Make sure to disable a rule _specifically_
- Make sure to re-enable a rule when disabled for more lines at once

Very wrong example, don't do this

```js
// Very wrong, don't do this

// eslint-disable
console.log('some log statement');
```

```js
// Better
// eslint-disable no-console
console.log('some log statement');
// eslint-enable no-console
```

```js
// Best (in this case)
// eslint-disable-next-line no-console
console.log('some log statement');
```


## Testing

Test files are placed in the same location as the file that’s under test, except that the test file
has a _.spec_ postfix. Please make sure existing tests keep working. To run tests, simply run

```sh
yarn run test
```

## Committing

Please keep commits small and focused. Only commit the code that is relevant to the change. This
will make it much more likely the change will get merged.

**Pro tip**: Use `commit add -p`.

The [Angular commit message convention] is used for commit messages.

In short, this means a commit message should use the following layout:

```
<type>(<scope>): <subject>

<body>
```

### Type

Type must be one of the following:

- build: Changes that affect the build system or external dependencies. (For example changes to
  Webpack configurations)
- ci: Changes to our CI configuration files and scripts. (For example changes to _.travis.yml_)
- docs: Documentation only changes. (For example updates to _README.md_)
- feat: A new feature.
- fix: A bug fix.
- perf: A code change that improves performance.
- refactor: A code change that neither fixes a bug nor adds a feature. (For example if code is moved
  to another file, or split into smaller chunks.)
- style: Changes that do not affect the meaning of the code. (For example if code formatting has
  changed.)
- test: Adding missing tests or correcting existing tests.

### Scope

Scope should be one of the following:

- **sdk**
- **api**
- **player**
- **recorder**

If the change doesn’t fit in one of these scopes, or the scope is unclear, it should be omitted.

### Subject

The subject should describe the change in a short line using the imperative tense. The first letter
should be lower case and the subject should not use punctuation.

### Body

A detailed description of the change. It is recommended to use markdown syntax.

## Changelog

A [changelog](CHANGELOG.md) is kept following the [keep a changelog] format. Please update it for
any notable changes.

[github issue tracker]: https://github.com/itslanguage/itslanguage-js/issues
[airbnb javascript style guide]: https://github.com/airbnb/javascript
[angular commit message convention]:
  https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit
[eslint]: https://eslint.org
[editorconfig.org]: https://editorconfig.org
[nvm]: https://github.com/creationix/nvm
[.nvmrc]: https://github.com/creationix/nvm#nvmrc
[travis-ci.org]: https;//travis-ci.org
[babel]: https://babeljs.io
[JSDoc]: http://usejsdoc.org/index.html
[karma]: https://karma-runner.github.io/latest/index.html
[yarn]: https://yarnpkg.com
[keep a changelog]: https://keepachangelog.com/en/1.0.0
[Contributor Covenant]: https://www.contributor-covenant.org

