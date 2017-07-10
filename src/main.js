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
const insertValue = function(key,obj){
  let keyName = key.replace(/%/g,'');
  let value = readlineSync.question('Enter value for '+keyName+':');
  obj[key] = value;
  return obj;
}

const reviewValues = function(obj){
  let table = require('tty-table');
  let header = [
    {
      value: '#',
    },
    {
      value: 'Field'
    },
    {
      value: 'Value'
    }
  ];
  let rows = Object.keys(obj).map(function(value,index){
    return [index,value,placeholderObj[value]];
  });
  let reviewTable = table(header,rows).render();
  console.log(reviewTable);

  if (!readlineSync.keyInYN('Is this correct?')) {
    let editLine = readlineSync.question('Enter the line number of a value that needs editing, or leave blank to skip.');
    editLine = editLine*1;
    if(typeof editLine === 'number' && editLine < rows.length){
      let checkKey = rows[editLine][1];
      insertValue(checkKey,obj);
    }
    else{
      console.log('Entry not recognized. Try again.');
    }
    reviewValues(obj);
  }
}

//get template
const tplPath = yargs.argv.template;
let tpl = fs.readFileSync(tplPath,{
  encoding: 'utf8'
});

//scan the template for placeholders - ignore duplicates
let placeholderArr = tpl.match(/(%\w*%)(?!.*\1)/g);
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
  content = content.replace(key,placeholderObj[key]);
});

//save to file
if(yargs.argv.save){
  fs.writeFileSync(yargs.argv.save,content);
}

//print to file
if(yargs.argv.printer){
  const print = require('./print.js');
  //print(content,yargs.argv.printer);
}

console.log(content);
yargs.argv = yargs.help('h').argv;
