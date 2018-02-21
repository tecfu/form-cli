# form-cli

A command line utility to populate placeholders in a form template and save or 
print the output.

## Install: 

```
npm i -g form-cli
```

### Example Template:

- somefile.txt

```
Hi there, %YOUR_NAME%.
```

## Usage:

```
$ form-cli -t somefile.txt 
```

## Options:

```
Options:
  --template, -t  File path of template.                              [required]
  --printer, -p   Name of printer to print to.
  --save, -s      Save the file to the path specified.          [default: false]
```
