const twitchJs = require('twitch-js');
const weather = require('weather-js');
const UTIL = require('./util');

/*
This is a BOT created to analyze the !bet system in nl_kripp's chat. It only reads for each nickname the bets in the format "!bet low|mid|high {number}" and can provide statistics
such as how many people voted, how many in each tier and the lettuce statistics
It's by no means affiliated with Kripparian or his channel; it's a personal project that I wanted because I'm a curious little one
And sorry, mods, if it was obnoxious enough to warrant a ban. Mah bad.

- lockedz 05/07/2019 (inutil.mente@yahoo.com.br)
*/

// ***********
// DISCLAIMER: BOT WAS/IS BANNED FROM KRIPP'S CHAT SO NOW ALL CLIENT.SAY INSTANCES ARE COMMENTED. IT **ONLY LOGS TO THE CONSOLE** WHILIST MINING THE CHAT
//************

// TODO: INSTEAD OF AN ARRAY OF 'WHO VOTED' ONLY, STORE THE NICKNAME, WHAT BET TIER AND LETTUCE. ADD A COMMAND FOR 'NICKNAME' TO CHECK THIS
// TODO: IF THERE IS TWO ARGUMENTS IN THE "CHECK BET" COMMAND, THE SECOND ONE MIGHT BE A NICKNAME TO CHECK ON; OR THE USER WHO USED THE COMMAND (1 ARGUMENT ONLY)
// TODO: LOG IN THE CONSOLE IF SOMEONE MENTIONS THE BOT NICKNAME (TO CHECK WTF HE/SHE SAID)
// TODO: ALLOW !analyzebets TO WORK IF THERE IS A SECOND ARGUMENT (A NICKNAME) (JUST TO HIGHLIGHT WHOMEVER ASKS FOR ANALYTICS)

const WORKING_ON_THIS_CHANNEL = ['nl_kripp'];
const options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: '',
		password: 'oauth:'
    },
    channels: WORKING_ON_THIS_CHANNEL
};

const Analytics = {
    FLAG_ANALYTICS: false,

    setAnalytics: (status) => {
        Analytics.FLAG_ANALYTICS = status;
    },
    getAnalytics: () => {
        return Analytics.FLAG_ANALYTICS;
    },
    isBotAnalyticsOn: () => {
       //console.dir(this, { depth: null })
        return Analytics.getAnalytics();
    },
    analyzeBets: (bets, channel) => {
        let sayBetsAnalyticsString = '';
        let totalBetsLow, totalBetsMid, totalBetsHigh = 0;
        let totalAmountLow, totalAmountMid, totalAmountHigh = 0;
        let percentBetsLow, percentBetsMid, percentBetsHigh = 0;
    
        totalBetsLow = bets['low']['counter'];
        totalBetsMid = bets['mid']['counter'];
        totalBetsHigh = bets['high']['counter'];
    
        totalAmountLow = bets['low']['amount'];
        totalAmountMid = bets['mid']['amount'];
        totalAmountHigh = bets['high']['amount'];
        
        if (totalBets !== 0) {
            percentBetsLow = (totalBetsLow / totalBets * 100).toFixed(2);
            percentBetsMid = (totalBetsMid / totalBets * 100).toFixed(2);
            percentBetsHigh = (totalBetsHigh / totalBets * 100).toFixed(2);
        } else {
            percentBetsLow = percentBetsMid = percentBetsHigh = 0;
        }

        sayBetsAnalyticsString = `LOW: ${percentBetsLow}% (${totalAmountLow} lettuce) | MID: ${percentBetsMid}% (${totalAmountMid} lettuce) | HIGH: ${percentBetsHigh}% (${totalAmountHigh} lettuce); TOTAL BETS: ${totalBets} (${totalLettuce} TOTAL LETTUCE)`;
        if (!Analytics.isBotAnalyticsOn()) {
            sayBetsAnalyticsString += ` (Bets are OFF)`;
        }

        try {
            //client.say(channel, sayBetsAnalyticsString);
            UTIL.doLog(sayBetsAnalyticsString);
        } catch(e) {
            UTIL.doLog(e, 3);
        }

        if (totalBets !== BETTERS_LIST.length) {
            UTIL.doLog(`Something's is wrong since ${totalBets} != ${BETTERS_LIST.length}`, 2);
        }
    },
    distributeBets: (type, amount) => {
        bets[type]['counter']++;
        bets[type]['amount'] += amount;
    },
    resetAnalytics: () => {
        totalBets = totalLettuce = 0;

        bets.low.counter = 0;
        bets.low.amount = 0;

        bets.mid.counter = 0;
        bets.mid.amount = 0;

        bets.high.counter = 0;
        bets.high.amount = 0;

        BETTERS_LIST = []; // Flush the array of betters

        return true;
    }
};

const Bot = {
    REST_INTERVAL: 3500,
    IS_RESPONSIVE: true,

    makeBotUnresponsiveForAnInterval: (intervalLength) => {
        Bot.IS_RESPONSIVE = !Bot.IS_RESPONSIVE;
    
        handlerTmp = setTimeout(() => {
            Bot.IS_RESPONSIVE = !Bot.IS_RESPONSIVE;
        }, intervalLength);
    },
    isBotResponsive: () => {
        return Bot.IS_RESPONSIVE;
    },
    forceBotResponsive: () => {
        clearTimeout(handlerTmp);
        Bot.IS_RESPONSIVE = true;
    }
};

const BOT_OWNER = 'lockedz';
let BETTERS_LIST = []; // Contains all the nicknames of those whom have already voted
let handlerTmp = null;
// FIXME: doesn't this belong to Analytics Object? Or maybe a new "Bet" one?
let totalBets = 0;
let totalLettuce = 0;
let lockedzLove = 0;
let bets = {
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
};

const client = new twitchJs.client(options);
client.connect();

client.on('connected', (addr, port) => {
    UTIL.doLog(`[HellockedZ] Connected! [${addr}:${port}]`);
    Analytics.setAnalytics(true);
    UTIL.doLog(`Analytics ON`);
    //client.say(WORKING_ON_THIS_CHANNEL, `Oi, m8, I am alive [from: ${addr}:${port}]`); // DEPRECATED
});

client.on('chat', (channel, user, message, self) => {
    message = message.toLowerCase();
    let messageArray = message.split(' ');

    // Kripp Betting Analytic START
    if (Analytics.isBotAnalyticsOn() && messageArray[0] === '!bet' && messageArray.length === 3) {

        // STORE THE NICKNAME AND CHECK IF IT HAS ALREADY VOTED
        // FIXME TEST ON KRIPPS CHANNEL WITH THOUSANDD OF PEOPLE!
        if (BETTERS_LIST.includes(user.username)) { // VOTED ALREADY!!!
            return false;
        } else {
            // Adjust to only accept 'low, mid or high' strings
            // FIXME:   Try to put this in a separated function. The 'return' will fuck things up but maybe throwing an error and trying try/catch HERE in this flow works?
            let betType = messageArray[1].toLowerCase();
            switch (betType) {
                case 'low':
                case 'mid':
                case 'high':
                    break;
                default:
                    return;
            }

            let betAmountAkaLettuce = parseInt(messageArray[2]);
            if (isNaN(betAmountAkaLettuce) || betAmountAkaLettuce < 1) {
                return;
            }

            totalBets++;
            totalLettuce += betAmountAkaLettuce;
            //let userBetterName = user.username;

            BETTERS_LIST.push(user.username);
            Analytics.distributeBets(betType, betAmountAkaLettuce);
        }
    } // Kripp bet analytic end
    
    if (Bot.isBotResponsive()) {
        if (message === 'let us see') { // OLD !analyzebets [to seem like it's not a command to a bot, but normal chat text (sorry mods)]
            Analytics.analyzeBets(bets, channel);
            Bot.makeBotUnresponsiveForAnInterval(Bot.REST_INTERVAL);
			UTIL.doLog(`${user.username} asked about the bets analytics`);
        }

        if (user.username === BOT_OWNER) {
            if (message === 'the end' && Analytics.isBotAnalyticsOn()) { // OLD !endanalytics
                Analytics.setAnalytics(false);
                UTIL.doLog(`Analytics OFF`);

                //client.say(channel, `I am not analyzing bets anymore`);
            }

            if (message === 'here we go again' && !Analytics.isBotAnalyticsOn()) { // OLD !startanalytics
                // RESET THE ANALYTICS TO START A FRESH NEW ANALYSIS
                Analytics.resetAnalytics();
                Analytics.setAnalytics(true);
                UTIL.doLog(`Analytics ON`);

                //client.say(channel, `I am now actively analyzing bets`);
            }

            /*
            // SEND MESSAGE TO ALL CHANNELS IN WORKING_ON_THIS_CHANNEL
            if (message === '!sayhitoall') {
                UTIL.messageAllChannels(client, WORKING_ON_THIS_CHANNEL, `THIS IS A TEST!`);
            }
            */
        }
        /*
        if (message === '!comebackonred') {
            lockedzLove++;
            client.say(channel, `FeelsGoodMan you are loved ${user.username} FeelsGoodMan (I am NOT onred) [${lockedzLove}]`);
            Bot.makeBotUnresponsiveForAnInterval(Bot.REST_INTERVAL);
        }
        */
        /*
        if (messageArray[0] === '!watweather') {
            cmd_clima(messageArray.slice(1), user, channel);
            Bot.makeBotUnresponsiveForAnInterval(Bot.REST_INTERVAL);
        }
        */
    }
	
});


function cmd_clima(args, user, channel) {
    // Package: weather-js
    if (args.length === 0) { return; }

    let unidadeGraus = 'C';
    let argsAsString = args.join(' ');
    let stringToSay = '';

    weather.find({search: argsAsString, degreeType: unidadeGraus},
            function(err, result) {
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
            }
    );
}