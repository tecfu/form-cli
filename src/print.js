const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

function print(content, printerName) {
  if (process.platform === 'win32') {
    console.error("Can't print to win32 - sry");
    return false;
  }

  const tempPath = path.join(os.tmpdir(), `form-cli-${process.pid}-${Date.now()}.txt`);
  fs.writeFileSync(tempPath, content, 'utf8');

  const command = 'lp';
  const args = printerName ? ['-d', printerName, tempPath] : [tempPath];

  execFile(command, args, error => {
    try {
      fs.unlinkSync(tempPath);
    } catch (cleanupError) {
      console.error(`Unable to remove temporary print file: ${cleanupError.message}`);
    }

    if (error) {
      console.error(`Unable to print: ${error.message}`);
      return;
    }

    console.log('Sent to printer.');
  });

  return true;
}

module.exports = print;
