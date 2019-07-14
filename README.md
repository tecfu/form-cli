# form-cli

A command line utility to populate placeholders in a form template and 
save or print the output.

## Install: 

### Local Machine

```sh
npm i -g form-cli
```

### Running Via Prebuilt Docker Image

```sh
$ docker pull tecfu/form-cli
$ docker run -d \
  -it \
  --name form-cli \
  --mount type=bind,source="$(pwd)",target=/home \
  form-cli:latest
```

### Example Template:

Placeholders are surrounded by % symbol.

```
Hi there, %YOUR_NAME%.
```

## Usage:

```sh
$ form-cli -t somefile.txt 
```

## Options:

```sh
Options:
  --template, -t  File path of template.                              [required]
  --printer, -p   Name of printer to print to.
  --save, -s      Save the file to the path specified.          [default: false]
```
