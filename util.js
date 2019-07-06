module.exports = {
    doLog: (message = 'this is a breakpoint', type = 1) => {
        let typeStr = '';
        let timeNow = new Date().toLocaleTimeString();
        //let fullDateAndTime = this.fullDate() + '|' + timeNow;
        switch (type) {
            case 1: // INFO
                typeStr = `[INFO]`;
                break;
            case 2: // WARNING
                typeStr = `[WARNING]`;
                break;
            case 3: // ERROR
                typeStr = `[ERROR]`;
                break;
            default: // NO PREFIX (type >=4)
                typeStr = ``;
                break;
        }
        let txtLog = `[${timeNow}] ${typeStr} ${message}\n`;

        console.log(txtLog.slice(0, txtLog.length-1));

        return;
    },
    messageAllChannels: (client, channels, msg) => {
        channels.forEach(element => {
            client.say(element, msg);
        });
    }
}