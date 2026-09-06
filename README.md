# form-cli

A command-line utility for populating `%PLACEHOLDER%` fields in a text template and saving or printing the result.

## Requirements

- Node.js 22 or newer

## Install

```sh
npm install -g form-cli
```

## Usage

```sh
form-cli --template path/to/form.txt
```

For each placeholder in the template, `form-cli` prompts for a value, shows a review table, and lets you edit entries before generating the output.

### Options

- `-t, --template <path>` — template file to populate (required)
- `-s, --save <path>` — save the generated output directly to the specified path
- `-p, --printer <name>` — print the generated output to the named printer
- `-h, --help` — show command help

If `--save` is omitted, the CLI asks whether to save the output and offers a generated filename. Input values can also be saved as JSON when requested.

## Template syntax

Placeholders are delimited by `%` characters, for example:

```text
Dear %FIRST-NAME%,

Your email is %EMAIL.ADDRESS%.
```

Placeholder names may contain punctuation other than `%` and line breaks. Values are inserted literally, so characters such as `$` are not treated as replacement expressions.

Templates without placeholders are supported and simply produce their original contents.

## Development

Run the test suite with:

```sh
npm test
```

Continuous integration runs the tests on Node.js 22 and 24.

## Docker

Docker is an optional way to run `form-cli` without installing Node.js on the host. It is most useful for automated, isolated, or otherwise controlled environments. For normal interactive use—and especially when using local printers—installing `form-cli` directly is recommended.

Build the image from this repository:

```sh
docker build -t form-cli .
```

Run it against a template in the current directory:

```sh
docker run --rm -it \
  -v "$PWD:/work" \
  form-cli --template /work/form.txt
```

The container runs the CLI with `/work` as its working directory, so paths passed to `form-cli` should refer to files in the mounted directory.

Printing from inside the container is not recommended because the container does not automatically have access to printers configured on the host. Use a native installation for `--printer`.
