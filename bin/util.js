const fs = require('fs');
const weather = require('weather-js');


const UTIL = {
	normalizeDigits: (d) => {
        if (d < 0 || typeof d === 'undefined') return; // retorna undefined para números negativos | undefined
        if (d >= 100) { return d.toString(); } // retorna o próprio número convertido para String
        return ((d < 10) ? '0'+d.toString() : d.toString());
    },
	
    doLog: (message = 'this is a breakpoint', type = 1) => {
        let amPM = false;
        let typeStr = '';
        let timeNow = new Date().toLocaleTimeString('default', {hour12: amPM});
        //let fullDateAndTime = this.fullDate() + '|' + timeNow;
        switch (type) {
            case 1: // INFO (green)
                typeStr = `\x1b[32m[INFO]\x1b[0m`;
                break;
            case 2: // WARNING (yellow)
                typeStr = `\x1b[33m[WARNING]\x1b[0m`;
                break;
            case 3: // ERROR (red)
                typeStr = `\x1b[31m[ERROR]\x1b[0m`;
                break;
            default: // NO PREFIX (type >=4)
                typeStr = ``;
                break;
        }
        let txtLog = `[${timeNow}] ${typeStr} ${message}\n`;

        console.log(txtLog.slice(0, txtLog.length-1)); // Remove the newline
		//console.log(txtLog);

        return;
    },

    asyncWriteToLog: (txt, pathFile, overrideFile = false) => {
        // USAGE:   'String', 'PathToTheFileToCreateOrAppend', <true> if we will override file if it already exists or <false> to only append or create a new file
        if (!overrideFile) {
            fs.appendFile(pathFile, txt, (err) => {
                if (err) throw err;

                UTIL.doLog(`Appended to:\t \'${pathFile}\'`, 2);
            });
        } else {
            fs.writeFile(pathFile, txt, (err) => {
                if (err) throw err;

                UTIL.doLog(`Wrote to:\t\t \'${pathFile}\'`, 2);
            });
        }
    },

    deepIterate: (obj) => { // Iterates through objects, even nested objects and logs the content
        Object.keys(obj).forEach(key => {
    
        console.log(`key: ${key} - value: ${obj[key]}`);
        // TODO:    default is console.log but it's a neat function, maybe add a real functionality later?
    
        if (typeof obj[key] === 'object') {
                deepIterate(obj[key]);
            }
        });
    },
	
    messageAllChannels: (client, channels, msg) => {
        channels.forEach(element => {
            //client.say(element, msg);
        });
    },

    boolToText: (bool, lang = 'en') => {
        // Transforms boolean 'true' to 'ON'/'LIGADO' or 'false' to 'OFF'/'DESLIGADO'
		// Usage: boolToText(variavelBool, 'pt')
		let boolStr = '';

		switch (lang.toLowerCase()) {
			case 'en':
                boolStr = (bool) ? 'ON':'OFF';
                break;
			case 'pt':
			default:
				boolStr = (bool) ? 'LIGADO':'DESLIGADO';
				break;
		}
				
		return boolStr;
	},

    cmd_clima: (args, user, channel) => {
        // Package: weather-js
        if (args.length === 0) { return; }
    
        let unidadeGraus = 'C';
        let argsAsString = args.join(' ');
        let stringToSay = '';
    
        weather.find({search: argsAsString, degreeType: unidadeGraus},(err, result) => {
            if (err) UTIL.doLog(err);

            if (result.length === 0) {
                UTIL.doLog('Invalid Local', 2);
                return;
            }

            // Variables
            let current = result[0].current;
            let location = result[0].location;
            
            if (current.temperature == current.feelslike) {
                stringToSay = `${user.username}: Temperature in [${current.observationpoint}] is ${current.temperature}${unidadeGraus}. Winds: ${current.winddisplay}, ${current.humidity}% Humidity (UTC${location.timezone})`;
            } else {
                stringToSay = `${user.username}: Temperature in [${current.observationpoint}] is ${current.temperature}${unidadeGraus} (Feels like ${current.feelslike}${unidadeGraus} tho).  Winds: ${current.winddisplay}, ${current.humidity}% Humidity (UTC${location.timezone})`;
            }
            //client.say(channel, stringToSay);
            UTIL.doLog(`${user.username} asked the temperature in ${argsAsString} (${current.observationpoint})`);
        });
    }
};

module.exports = UTIL;