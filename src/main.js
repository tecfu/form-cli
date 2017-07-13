const fs = require('fs');
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
  console.log('Enter value for '+keyName+':');
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

//get template
const tplPath = yargs.argv.template;
let tpl = fs.readFileSync(tplPath,{
  encoding: 'utf8'
});

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

console.log('---BEGIN OUTPUT---');
console.log('\n');
console.log(content);
console.log('\n');
console.log('---END OUTPUT---');

//save to file to template path + 'populated' unless otherwise specified
let savePath;
if(yargs.argv.save){
  savePath = yargs.argv.save;
}
else{
  savePath = yargs.argv.t
  let savePathArr = savePath.split('/');
  let fileName = savePathArr.pop();
  let fileNameArr = fileName.split('.');
  let fileExt;
  if(fileNameArr.length > 1){
    fileExt = fileNameArr.pop();
  }
  else{
    fileExt = '';
  }
  savePath = fileNameArr.join('.') + '.populated.' + fileExt;
}

//save the output 
fs.writeFileSync(savePath,content,{
  encoding: 'utf8'
});

//print to file
if(yargs.argv.printer){
  const printer = require('./print.js');
  printer(content,yargs.argv.printer);
}

yargs.argv = yargs.help('h').argv;
