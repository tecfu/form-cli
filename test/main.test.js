const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const {
  createTimestamp,
  findPlaceholders,
  renderTemplate,
  defaultOutputPath,
  defaultInputPath
} = require('../src/main');

test('findPlaceholders handles templates without placeholders', () => {
  assert.deepEqual(findPlaceholders('plain text'), []);
});

test('findPlaceholders de-duplicates placeholders and allows punctuation', () => {
  assert.deepEqual(findPlaceholders('%FIRST-NAME% / %FIRST-NAME% / %EMAIL.ADDRESS%'), [
    '%FIRST-NAME%',
    '%EMAIL.ADDRESS%'
  ]);
});

test('renderTemplate treats placeholders and replacement values literally', () => {
  assert.equal(
    renderTemplate('Hello %NAME%! %NAME%', { '%NAME%': '$& and $1' }),
    'Hello $& and $1! $& and $1'
  );
});

test('createTimestamp uses a sortable 24-hour timestamp', () => {
  const date = new Date(2026, 0, 2, 23, 4, 5);
  assert.equal(createTimestamp(date), '20260102230405');
});

test('default paths are platform-safe and preserve template extensions', () => {
  const output = defaultOutputPath('/tmp/forms/example.txt', '20260102230405');
  const input = defaultInputPath('/tmp/forms/example.txt', '20260102230405');
  assert.equal(path.basename(output), 'example.output.20260102230405.txt');
  assert.equal(path.basename(input), 'example.inputs.20260102230405.json');
});
