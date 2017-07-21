#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const moment = require('moment');
const timestamp = moment().format('YYYYMMDDhhmmss');
const chalk = require('chalk');

let yargs = require('yargs');
yargs.strict();
yargs.option('template',{
  alias:'t',
  describe:'File path of template.',
  demandOption: true
});
yargs.option('printer',{
  alias:'p',
  describe:'Name of printer to print to.'
});
yargs.option('save',{
  alias:'s',
  describe:'Save the file to the path specified.',
  default:false
});

const readlineSync = require('readline-sync');
readlineSync.setDefaultOptions({
  prompt: '> '
});

const insertValue = function(key,obj){
  let keyName = key.replace(/%/g,'');
  console.log('Enter value for ' + chalk.green(keyName) + ':');
  let value = readlineSync.prompt();
  obj[key] = value;
  return obj;
}

const reviewValues = function(obj){
  let table = require('tty-table');
  let header = [
    {
      value: 'Line #',
    },
    {
      value: 'Field'
    },
    {
      value: 'Value'
    }
  ];
  let rows = Object.keys(obj).map(function(key,index){
    return [index,key,obj[key]];
  });
  let reviewTable = table(header,rows).render();
  console.log(reviewTable);
  console.log('Is this correct? y/n');
  let reviewAnswer = readlineSync.prompt({
    limit: ['y','n']
  });

  if (reviewAnswer === 'n') {
    let text = 'Enter the line number for each value that needs editing.\nSeparated the numbers by commas.\nLeave blank to skip.';
    console.log(text);
    let values = readlineSync.prompt();
    if(values.length){
      let editsArr = values.split(',');
      editsArr.forEach(function(valueStr){
        let value = valueStr * 1;
        if(typeof value === 'number' && value < rows.length){
          let checkKey = rows[value][1];
          insertValue(checkKey,obj);
        }
        else{
          console.log('Entry '+valueStr+' not recognized. Try again.');
        }
      })
    }
    reviewValues(obj);
  }
}

const customSavePath = function(defaultSavePath){
  let qText = "Enter path or leave blank to use default (" + defaultSavePath + ")\n> ";
  let answer = readlineSync.question(qText);
  
  //yes
  if(answer.trim().length > 0){
    //make sure parent directory of save path is writable
    try {
      let parentDir = path.dirname(answer);
      fs.accessSync(parentDir, fs.W_OK);
    }
    catch(err){
      //try again
      console.log(err);
      console.log("Bad filepath. Let's try again.\n");
      return customSavePath(defaultSavePath);
    }
    return answer;
  }
  return defaultSavePath;
}

//get template
const tplPath = yargs.argv.template;
let tpl = fs.readFileSync(tplPath,{
  encoding: 'utf8'
});

//get template name for default saved filenames
let tplPathArr = yargs.argv.template.split('/');
let tplFileName = tplPathArr.pop();
let tplFileNameExt = tplFileName.split('.').pop();

//scan the template for placeholders 
let matches = tpl.match(/(%\w*%)/g);

//remove duplicates
let placeholderArr = matches.filter(function(item, pos, self) {
  return self.indexOf(item) === pos;
})

//display placeholders and for each prompt for a value
let placeholderObj = {};

//insert values
placeholderArr.forEach(function(key){
  placeholderObj = insertValue(key,placeholderObj);
})

//review values
reviewValues(placeholderObj);

//replace template placeholders with values
let content = tpl;
Object.keys(placeholderObj).forEach(function(key){
  let regex = new RegExp(key,'g');
  content = content.replace(regex,placeholderObj[key]);
});

console.log('\n');
console.log(chalk.red('---BEGIN OUTPUT---'));
console.log(content);
console.log(chalk.red('---END OUTPUT---'));
console.log('\n');

//save output to file?
let saveOutputPath;
let saveOutput = true;
if(yargs.argv.save){
  saveOutputPath = yargs.argv.save;
}
else{
  //ask user if they want to save
  console.log("Save file? y/n");
  let answer = readlineSync.prompt({
    limit: ['y','n']
  });
  if(answer === 'n'){
    saveOutput = false;
  }
  else{
    saveOutputPath = process.cwd() + '/' + tplFileName + '.output.' + timestamp + '.' + tplFileNameExt;

    //give user option to customize save path
    saveOutputPath = customSavePath(saveOutputPath);
  }
}
if(saveOutput){
  fs.writeFileSync(saveOutputPath,content,{
    encoding: 'utf8'
  });
}

//save input to file?
let saveInput = false;
let saveInputPath = process.cwd() + '/' + tplFileName + '.inputs.' + timestamp + '.json';
console.log('Save input values? y/n');
let answer = readlineSync.prompt({
  limit: ['y','n']
});
if(answer === 'y'){
  saveInput = true;
  saveInputPath = customSavePath(saveInputPath);
}
if(saveInput){
  fs.writeFileSync(saveInputPath,JSON.stringify(placeholderObj,null,'\t'),{
    encoding: 'utf8'
  });
}

//print to file
if(yargs.argv.printer){
  const printer = require('./print.js');
  printer(content,yargs.argv.printer);}

yargs.argv = yargs.help('h').argv;

console.log(chalk.green('JOB COMPLETE.'));
