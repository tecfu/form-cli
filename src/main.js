#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const readlineSync = require('readline-sync');
const table = require('tty-table');

readlineSync.setDefaultOptions({ prompt: '> ' });

function createTimestamp(date = new Date()) {
  const pad = value => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('') + pad(date.getHours()) + pad(date.getMinutes()) + pad(date.getSeconds());
}

function findPlaceholders(template) {
  const matches = template.match(/%[^%\r\n]+%/g) || [];
  return [...new Set(matches)];
}

function renderTemplate(template, values) {
  return Object.keys(values).reduce(
    (content, key) => content.replaceAll(key, () => values[key]),
    template
  );
}

function insertValue(key, values) {
  const keyName = key.replace(/%/g, '');
  console.log('Enter value for ' + chalk.green(keyName) + ':');
  values[key] = readlineSync.prompt();
  return values;
}

function reviewValues(values) {
  const keys = Object.keys(values);
  if (!keys.length) return;

  const header = [
    { value: 'Line #' },
    { value: 'Field' },
    { value: 'Value' }
  ];
  const rows = keys.map((key, index) => [index + 1, key, values[key]]);

  console.log(table(header, rows).render());
  console.log('Is this correct? y/n');
  const reviewAnswer = readlineSync.prompt({ limit: ['y', 'n'] });

  while (reviewAnswer === 'n') {
    console.log('Enter the line number for each value that needs editing.');
    console.log('Separate the numbers by commas. Leave blank to skip.');
    const input = readlineSync.prompt().trim();

    if (input) {
      input.split(',').forEach(valueStr => {
        const value = Number(valueStr.trim());
        if (Number.isInteger(value) && value >= 1 && value <= rows.length) {
          insertValue(rows[value - 1][1], values);
        } else {
          console.log('Entry ' + valueStr.trim() + ' not recognized. Try again.');
        }
      });
    }

    console.log(table(header, keys.map((key, index) => [index + 1, key, values[key]])).render());
    console.log('Is this correct? y/n');
    reviewAnswer = readlineSync.prompt({ limit: ['y', 'n'] });
  }
}

function customFileName(defaultFileName) {
  const answer = readlineSync.question(
    'Enter filename or leave blank to use default (' + defaultFileName + ')\n> '
  );
  return answer.trim().length > 0 ? answer : defaultFileName;
}

function defaultOutputPath(templatePath, timestamp = createTimestamp()) {
  const templateName = path.basename(templatePath);
  const extension = path.extname(templateName);
  const stem = extension ? templateName.slice(0, -extension.length) : templateName;
  return path.join(process.cwd(), stem + '.output.' + timestamp + extension);
}

function defaultInputPath(templatePath, timestamp = createTimestamp()) {
  const templateName = path.basename(templatePath);
  const extension = path.extname(templateName);
  const stem = extension ? templateName.slice(0, -extension.length) : templateName;
  return path.join(process.cwd(), stem + '.inputs.' + timestamp + '.json');
}

function parseArgs(argv) {
  return require('yargs/yargs')(argv)
    .option('template', {
      alias: 't',
      describe: 'File path of template.',
      demandOption: true,
      type: 'string'
    })
    .option('printer', {
      alias: 'p',
      describe: 'Name of printer to print to.',
      type: 'string'
    })
    .option('save', {
      alias: 's',
      describe: 'Save the file to the path specified.',
      type: 'string'
    })
    .strict()
    .help('h')
    .parse();
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const template = fs.readFileSync(args.template, 'utf8');
  const placeholders = findPlaceholders(template);
  const values = {};

  placeholders.forEach(key => insertValue(key, values));
  reviewValues(values);

  const content = renderTemplate(template, values);
  console.log('\n');
  console.log(chalk.red('---BEGIN OUTPUT---'));
  console.log(content);
  console.log(chalk.red('---END OUTPUT---'));
  console.log('\n');

  let saveOutput = true;
  let saveOutputPath = args.save;
  if (!saveOutputPath) {
    console.log('Save file? y/n');
    const answer = readlineSync.prompt({ limit: ['y', 'n'] });
    if (answer === 'n') {
      saveOutput = false;
    } else {
      saveOutputPath = customFileName(defaultOutputPath(args.template));
    }
  }

  if (saveOutput) {
    fs.writeFileSync(saveOutputPath, content, 'utf8');
  }

  const saveInputPath = defaultInputPath(args.template);
  console.log('Save input values? y/n');
  const saveInputAnswer = readlineSync.prompt({ limit: ['y', 'n'] });
  if (saveInputAnswer === 'y') {
    fs.writeFileSync(customFileName(saveInputPath), JSON.stringify(values, null, '\t'), 'utf8');
  }

  if (args.printer) {
    const printer = require('./print.js');
    printer(content, args.printer);
  }

  console.log(chalk.green('JOB COMPLETE.'));
}

module.exports = {
  createTimestamp,
  findPlaceholders,
  renderTemplate,
  defaultOutputPath,
  defaultInputPath,
  parseArgs,
  reviewValues
};

if (require.main === module) {
  main();
}
