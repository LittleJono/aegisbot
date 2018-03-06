var fs = require('fs');
var moment = require('moment');

var logger = {
    log: function(err, parentModule) {
        parentModule = parentModule.slice(0, -3);
        var filePath = "./logFiles/" + parentModule + "Log.txt";
        if (!fs.existsSync(filePath)) {
            fs.openSync(filePath, 'a')
        }
        var stream = fs.createWriteStream(filePath, {
            flags: 'a'
        });
        stream.on('error', (err) => {
            console.log("The logger is broken:", err)
        })
        stream.write(moment().format('MMMM Do YYYY, h:mm:ss a') + ":    " + err + "\n\n");
    }
};

module.exports = logger;