# github-funding-yml-updater

Update multiple repositories's `.github/FUNDING.yml` via GitHub API.

## Install

Install with [npm](https://www.npmjs.com/):

    npm install github-funding-yml-updater

## Usage

	Usage
	  $ github-funding-yml-updater [options]

	Options
	  --mode "add" or "delete"
	  --user GitHub account name
	  --list-file input list file path. list file includes line-separated repository list for updating
	  --write update GitHub repository if set it. Default: dry-run(no update)
	  --token GitHub Token(or env GITHUB_TOKEN=xxx)

	Examples
	  # Dry-run by default
	  $ github-funding-yml-updater --mode add --user azu --list-file list.txt --token XXXX
	  # Update Repository
	  $ github-funding-yml-updater --mode add --user azu --list-file list.txt --token XXXX --write

### file-list

`--file-list` specify text file that is following format:

```
owner/repo
owner/repo@branch
https://github.com/owner/repo
```

Example `list.txt`

```
azu/example1@develop
azu/example2
example/example
```

## Changelog

See [Releases page](https://github.com/azu/github-funding-yml-updater/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/azu/github-funding-yml-updater/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu
