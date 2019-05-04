const fs = require('fs');
const moment = require('moment');

const logger = {
  log: (err, parentModule) => {
    const realParentModule = parentModule.slice(0, -3);
    const filePath = `./logFiles/${realParentModule}Log.txt`;
    if (!fs.existsSync(filePath)) {
      fs.openSync(filePath, 'a');
    }
    const stream = fs.createWriteStream(filePath, {
      flags: 'a'
    });
    stream.on('error', (theError) => {
      console.log(`The logger is broken:    ${theError}`);
    });
    if (err.stack) {
      stream.write(`${moment().format('MMMM Do YYYY, h:mm:ss a')}: ${JSON.stringify(err.stack)}\n\n`);
    } else {
      stream.write(`${moment().format('MMMM Do YYYY, h:mm:ss a')}: ${JSON.stringify(err)}\n\n`);
    }
  }
};

module.exports = logger;
