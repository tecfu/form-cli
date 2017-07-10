// use: node printFile.js [filePath printerName]
const fn = function(content,printerName){
  var printer = require("printer");

  if(!printerName){
    printerName = printer.getDefaultPrinterName();
    if(typeof printerName === 'undefined'){
      console.error('No printer name given and no default printer set.');
      return false;
    }
  }
  
  console.log('platform:', process.platform);
  console.log('trying to print content.');

  if( process.platform != 'win32') {
    printer.printDirect({
      data: content,
      printer: printerName,
      type: 'TEXT',
      success:function(jobID){
        console.log("sent to printer with ID: "+jobID);
      },
      error:function(err){
        console.log(err);
      }
    });
  } 
  else{
    console.error("Can't print to win32 - sry");
    return false;
  }
};

module.exports = fn;
