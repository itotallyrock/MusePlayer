var fs = require('fs');

module.exports = function(msg, params) {
    if (typeof msg == "string") {
        console.log(msg);
    } else if (typeof msg == "object" && msg.length > 0) {
        console.log(msg[0], msg[1], msg[2], msg[3], msg[4], msg[5], msg[6], msg[7]);
    } else {
        console.log(msg);
    }

    if (params.log == true) {
        var log = "[" + Date.now(); + "] ";
        if (typeof msg == "string") {
			log += msg.trim();
		} if (typeof msg == "object") {
			for (var i = 0; i < msg.length; i++) {
				log += msg[i].toString();
			}
		}
        fs.writeFile(__dirname + "", fs.readFileSync() + log + "\n");
    }
}
