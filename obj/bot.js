const Options = require('./options');
const GLOBALS = require('../bin/globals');

const Bot = {
    REST_INTERVAL: 3500,
    IS_RESPONSIVE: true,
    OWNER:  'lockedz',
    options: Options,

    makeBotUnresponsiveForAnInterval: (intervalLength) => {
        Bot.IS_RESPONSIVE = !Bot.IS_RESPONSIVE;
    
        GLOBALS.handlerTmp = setTimeout(() => {
            Bot.IS_RESPONSIVE = !Bot.IS_RESPONSIVE;
        }, intervalLength);
    },
    isBotResponsive: () => {
        return Bot.IS_RESPONSIVE;
    },
    forceBotResponsive: () => {
        clearTimeout(GLOBALS.handlerTmp);
        Bot.IS_RESPONSIVE = true;
    }
};

module.exports = Bot;