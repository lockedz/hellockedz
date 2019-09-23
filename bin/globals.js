const Emoji = require('../obj/emoji');


// FIXME:   remove redundancy having an array and an object
module.exports.BETTERS_LIST = [];    // Keeps the nicknames (only user.username, lowercase probably) of those who have already voted

/*
BETTERS_OBJECT: {
    ${user.username}: {
        userName
        lettuceBet
        betTier
        betTime
        betDate
    }
}
*/
module.exports.BETTERS_OBJECT = {};
// Apparently, all usernames are lowercase in the user Object, so, cast whatever to lowercase
module.exports.realBetBotNickname = 'Streamlabs'.toLowerCase(); // FIXME: CHANGE TO Streamlabs AT KRIPP'S CHANNEL

module.exports.handlerTmp = null;

module.exports.lockedzLove = 0;

// if 'true' in any subobject, allows the bot to mine the chat and enable/disable stuff per se
// it's separated 'cuz you might want to allow auto analytics mining but no auto emojis mining. Or vice-versa
module.exports.allowAutoMining = {
	analytics: true,
	emojis: false
};

module.exports.EMOJI_LIST_SIZE = Emoji.getListSize();

// FIXME: doesn't this belong to Analytics Object? Or maybe a new "Bet" one?
module.exports.totalBets = 0;
module.exports.totalLettuce = 0;
module.exports.bets = {
    'low': {
        counter: 0,
        amount: 0
    },
    'mid': {
        counter: 0,
        amount: 0
    },
    'high': {
        counter: 0,
        amount: 0
    },
    'before': {
        counter: 0,
        amount: 0
    },
    'during': {
        counter: 0,
        amount: 0
    },
    'finish': {
        counter: 0,
        amount: 0
    }
};

module.exports.LOCALEDATE_OPTIONS = {year:"numeric",month:"2-digit", day:"2-digit"};
module.exports.LOCALEDATE_LOCAL = 'ko-KR';
