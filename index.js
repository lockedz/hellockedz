const twitchJs = require('twitch-js');

const UTIL = require('./bin/util');
const GLOBALS = require('./bin/globals');

const Analytics = require('./obj/analytics');
const Emoji = require('./obj/emoji');
const Bot = require('./obj/bot');

const client = new twitchJs.client(Bot.options);

// Remove dis
if (!Bot.options.channels.includes('#nl_kripp')) {   UTIL.doLog(`THE BOT IS NOT RUNNING AT KRIPP\'S CHANNEL. BE ADVISED.`, 3);   }
// And remove dis
if (GLOBALS.realBetBotNickname !== 'streamlabs') {   UTIL.doLog(`THE REGISTERED BOT TO MINE IS NOT STREAMLABS. BE ADVISED.`, 3);   }

const reportInformations = (addr = undefined, port = undefined) =>
{   // Using some default colouring, may be stripped
    UTIL.doLog(`Nick: \x1b[32m${client.getUsername()}\x1b[0m connected at:\t\t [ ${addr}:${port} ]`);
    UTIL.doLog(`Channel: \x1b[32m${Bot.options.channels}\x1b[0m`);
        console.log(``); // one new line
    UTIL.doLog(`Analytics is \x1b[33m${Analytics.getAnalytics()}\x1b[0m \t\t\t|\t Auto Bet Analysis (per \'\x1b[32m${GLOBALS.realBetBotNickname}\x1b[0m\') is \x1b[33m${GLOBALS.allowAutoMining.analytics}\x1b[0m`);
    UTIL.doLog(`Analytics working with ARENA is \x1b[33m${Analytics.isItArena()}\x1b[0m`);
    UTIL.doLog(`Emojis Mining is \x1b[33m${Emoji.ACTIVE}\x1b[0m (\x1b[32m${GLOBALS.EMOJI_LIST_SIZE}\x1b[0m Emojis) \t|\t Auto Emojis Analysis is \x1b[33m${GLOBALS.allowAutoMining.emojis}\x1b[0m`);
        console.log(`_`.repeat(120)); // one 'visual separator'
}
/*
This is a BOT created to analyze the !bet system in nl_kripp's channel. It only reads for each nickname the bets in the format "!bet low|mid|high {number}" and can provide statistics
such as how many people voted, how many in each tier and the lettuce statistics
It's by no means affiliated with Kripparian or his channel; it's a personal project that I wanted because I'm a curious little one
I don't know how was it obnoxious enough to warrant a ban. But, welp.
- lockedz 05/07/2019 (inutil.mente@yahoo.com.br)
*/

// ***********
// DISCLAIMER: BOT IS BANNED FROM KRIPP'S CHANNEL SO NOW ALL CLIENT.SAY INSTANCES ARE COMMENTED. IT **ONLY LOGS TO THE CONSOLE** WHILST MINING THE CHAT
//************

    // All this TODO's are deprecated since the Bot is banned in Kripp's chat hence unable to chat/reply to anyone. Maybe consider the whisper route?
    // The whisper route is no more. Bots that aren't verifyed are not allowed to whisper users anymore
	// TODO: ALLOW !analyzebets TO WORK IF THERE IS A SECOND ARGUMENT (A NICKNAME) (JUST TO HIGHLIGHT WHOMEVER ASKS FOR ANALYTICS)

// ---------------------------- NEW TODOS
// TODO:    ADD A COMMAND LIKE 'IZA  <classname>' THAT RECORDS THE CLASS OF THE CURRENT ARENA BETS AND ADDS TO THE BETS.TXT STRING. IF THIS COMMAND IS NOT EXECUTED, SIMPLY THERE WILL BE NO MENTION TO THE CLASS OF THE AREBA/BET (AS IS NOW)
// TODO:    WE ARE CURRENTLY WRITING THE BETTERS AND STATISTICS, BUT WE HAVE TO READ THEM AT SOME POINT
// FIXME:   THE BET ANALYSIS ARE BEING WRITTEN TO A SINGLE FILE, MULTILINE, INDEPENDENTLY OF WHICH DAY THE BETTING AS OCCURED, THAT IS DIFFERENT WITH THE BETTERS THEMSELVES
// FIXME:   ALL THE GOOD STUFF THAT HAPPENS AT THE END OF THE BETS (WRITE TO FILES/LOG) ONLY HAPPENS - AS FOR NOW - IF IT'S AN ACTION AND AUTOMATED PER STREAMLABS, GOTTA MAKE IT DO EVERY END OF ANALYTICS

// FIXME:   OPTIONS is accessible but through the Bot Object. Is this the correct/best way? Should it be accessible at all? We do have the client.getOption() tho...

// TODO:	DO SOMETHING TO GET SIMILAR EMOJIS IN THE SAME 'CATEGORY', LIKE SUBOBJECTS (EG: LUL: { LUL, LULW, LuL })
//			MAKE A FUNCTION THAT RECEIVES THE OBJECT CREATED BY THE Emoji.getTop() AND REGROUP THE SIMILAR EMOJIS

// TODO:	CONSIDER ADDING A PERCENTAGE STATISTIC TO THE EMOJI LIST. A PARAMETER IN getTop() ?
// FIXME:	CONSIDER BLACKLISTING 'Nightbot' FROM BEING MINED IN CHAT IF IT BECOMES TOO ANNOYING

client.connect();

client.on('connected', (addr, port) => {
    reportInformations(addr, port);
});

client.on('reconnect', () => {
    reportInformations();
});

client.on('chat', async (channel, user, msg, self) => {
    //if (self) return false; // if it's the bot itself doing stuff, ignore and get out

    let userWhoSentTheMessageStringLowercase = user.username.toString().toLowerCase();
    let messageLowerCase = msg.toLowerCase();
    let msgArray = msg.split(' '); // MESSAGE ARRAY WITHOUT THE TOLOWERCASE FORCE. *** AS IS ***
    let messageArrayLowerCase = messageLowerCase.split(' '); // FORCED CAST TO LOWERCASE (ARRAY) SO COMMANDS ARE CASE INSENSITIVE

    if (messageArrayLowerCase.includes(client.getUsername().toLowerCase())) { // Someone mentioned the bot
        UTIL.doLog(`${user.username} says:\t ${msg}`);
    }


    // **** IF ANALYTICS IS ON, LET'S START/KEEP MINING THE BETS IN CHAT
    // Kripp Betting Analytic START
    if (Analytics.isBotAnalyticsOn() && messageArrayLowerCase[0] === '!bet' && messageArrayLowerCase.length === 3) {
        let userUsername = user.username;

        // STORE THE NICKNAME AND CHECK IF IT HAS ALREADY VOTED
        if (GLOBALS.BETTERS_LIST.includes(userUsername)) { // VOTED ALREADY!!!
            return false;
        } else {
            let timeNow = new Date().toLocaleTimeString('default', {hour12: false});
            let dateNow = new Date().toLocaleDateString(GLOBALS.LOCALEDATE_LOCAL, GLOBALS.LOCALEDATE_OPTIONS);

            // Only accepts 'low', 'mid','high' Strings
            // FIXME:   Try to put this in a separated function. The 'return' will frick things up but maybe throwing an error and trying try/catch HERE in this flow works?
            let betType = messageArrayLowerCase[1];
            let betAmountAkaLettuce = -1;

            if (Analytics.isItArena()) {
                switch (betType) {
                    // Arena bets
                    case 'low':
                    case 'mid':
                    case 'high':
                        break;
                    default:
                        return;
                }
            } else {
                switch (betType) {
                    // PvE bets
                    case 'before':
                    case 'during':
                    case 'finish':
                        break;
                    default:
                        return;
                }
            }
            // FIXME: Colocar com logica ternaria... colocar as variaveis mais organizadas tb
            if (messageArrayLowerCase[2] === 'all' && Analytics.getIsThereAMaximumBetValue()) {
                betAmountAkaLettuce = Analytics.getMaxBetValue();
            } else {
                betAmountAkaLettuce = parseInt(messageArrayLowerCase[2]);
            }
            if (isNaN(betAmountAkaLettuce) || betAmountAkaLettuce < 1) {
                return;
            } else if (Analytics.getIsThereAMaximumBetValue() && betAmountAkaLettuce > Analytics.getMaxBetValue()) {
                return; // If we have a maximum number to bet AND this persons's bet exceeds this maximum, let's ignore all and return
            }

            GLOBALS.totalBets++;
            GLOBALS.totalLettuce += betAmountAkaLettuce;

            GLOBALS.BETTERS_LIST.push(userUsername);

            // If this gets too 'heavy' to run... remove. There is no real need. Adjust the GLOBALS.BETTERS_OBJECT accordingly
            // It shouldn't cause trouble ''cause we've already checked if the userUsername has already voted so userUsername SHOULD BE UNIQUE
            GLOBALS.BETTERS_OBJECT[userUsername] = {};
            GLOBALS.BETTERS_OBJECT[userUsername]['userName'] = userUsername;
            GLOBALS.BETTERS_OBJECT[userUsername]['lettuceBet'] = betAmountAkaLettuce;
            GLOBALS.BETTERS_OBJECT[userUsername]['betTier'] = betType;
            GLOBALS.BETTERS_OBJECT[userUsername]['betTime'] = timeNow;
            GLOBALS.BETTERS_OBJECT[userUsername]['betDate'] = dateNow;

            Analytics.distributeBets(betType, betAmountAkaLettuce);

            if (Analytics.isVerbose()) {
                UTIL.doLog(`Registered ${userUsername} bet (${betType}) with ${betAmountAkaLettuce} lettuce!`);
            }
        }
    } // Kripp bet analytic end
    
    // *****************
    // EMOJI ANALYSIS (IF ACTIVE)
    // **************************
    if (Emoji.ACTIVE) {
        // EXAMPLE MESSAGE: "VEGAN ARMS LUL"
        // msgArray[0] = 'VEGAN', [1] = 'ARMS', [2] = 'LUL'
        msgArray.forEach((elementArray, idxArray) => {
            Object.keys(Emoji.LIST).forEach(key => {
                if (elementArray === key) {
                    Emoji.LIST[key]++;
                    //console.log(`[found emoji ${key} at index = ${idx}! Now the count is: ${Emoji.LIST[key]}]`);
                }
            });
        });
        if (Emoji.VERBOSE) {
			let msgArrayLength = msgArray.length;
            let emojiAnalysisCalculation = 0;
			let isItAWarning = 1; // 1 = INFO | 2 = WARNING

            try {
                emojiAnalysisCalculation = (GLOBALS.EMOJI_LIST_SIZE * msgArrayLength);
                ++Emoji.totalMessagesAnalysed;
            } catch (e) {
                UTIL.doLog(`${e}`, 3);
            }
			
			isItAWarning = ((emojiAnalysisCalculation > 1000) ? 2 : 1);
			
            UTIL.doLog(`[EmojiAnalysis] ${emojiAnalysisCalculation} calculations\t(${msgArrayLength})\t\t[${Emoji.totalMessagesAnalysed}]`, isItAWarning);
        }
    }
    // END OF EMOJI ANALYSIS
    // *************************

    if (Bot.isBotResponsive()) {
        // ****************
        // CHECK THE ANALYSIS
        // ****************
        if (messageLowerCase === 'let us see') { // OLD !analyzebets [to seem like it's not a command to a bot, but normal chat text (sorry mods)]
        // This command is not only executed by the owner 'cause it used to be 'public' for the people to check the analytics in chat
            let betAnalyticsNow = '';

            betAnalyticsNow = Analytics.analyzeBets(GLOBALS.bets, channel);

            Bot.makeBotUnresponsiveForAnInterval(Bot.REST_INTERVAL);

            UTIL.doLog(`${user.username} asked about the bets analytics`);
            UTIL.doLog(`${betAnalyticsNow}`);
        }

        //*************** */
        // COMMANDS ONLY EXECUTED BY THE BOT OWNER *******
        // ******************************
        if (user.username === Bot.OWNER) {
            // ****************
            // DEFAULT IS TO BE ARENA BETS; USE THIS COMMAND TO TOOGLE
            // ****************
            if (messageLowerCase === 'betting is different') {
                Analytics.setIsItArena(!Analytics.isItArena());
                UTIL.doLog(`Betting set to work with arena IS ${Analytics.isItArena()}`, 2);
            }

            // ****************
            // TO END THE ANALYSIS:
            // ****************
            if (messageLowerCase === 'the end' && Analytics.isBotAnalyticsOn()) { // OLD !endanalytics
                Analytics.triggerEnd(channel);
                //client.say(channel, `I am not analyzing bets anymore`);
            }
            // ****************
            // TO START THE ANALYSIS:
            // ****************
            if (messageLowerCase === 'here we go again' && !Analytics.isBotAnalyticsOn()) { // OLD !startanalytics
                let successReset = false; 

                // RESET THE ANALYTICS TO START A FRESH NEW ANALYSIS
                successReset = Analytics.resetAnalytics();
                Analytics.setAnalytics(true);

                //client.say(channel, `I am now actively analyzing bets`);
            }
            if (msg === 'EEZ Clap') { // Returns/Logs the BETTERS_OBJECT | FULL OBJECT WILL BE PRINTED!!!
                console.dir(GLOBALS.BETTERS_OBJECT, {depth: null});
            }
            // WTH is this but... let's get it working... | if the OWNER send "LUL LUL <nickname>" the bot will check for the bet status of <nickname>
            // for now it will only console log. TODO:  Whisper <nickname> the status
            if (msgArray[0] === 'LUL' && msgArray[1] === 'LUL' && msgArray.length === 3) {
                let prettyString = '';

                prettyString = Analytics.searchBetterStatus(msgArray[2]);
                UTIL.doLog(`${prettyString}`);
                //client.say(channel, `${prettyString}`);

            //client.whisper(userWhoSentTheMessageStringLowercase, `${prettyString} (I'm a bot)`); // as of july 2019, bot whispers to not work if the bot isn't verified
            }
            if (msgArray[0] === 'nani' && !isNaN(msgArray[1]) && msgArray.length === 2) { // Usage: topbetters <integer>
                let topBettersString = '';

                topBettersString = Analytics.getTopBetters(msgArray[1]).prettyString;
                UTIL.doLog(`${topBettersString}`, 1);
            }

            if (msgArray.length === 1 && msgArray[0] === 'noman') {
                Analytics.toggleVerbose();
            }

            // **********************
            // EMOJI ANALYSIS ****
            // **************** */
            if (messageLowerCase === 'feelsgoodman') { // ACTIVATE THE EMOJI ANALYSIS
                Emoji.ACTIVE = true;
				
				UTIL.doLog(`Emojis Mining ${Emoji.ACTIVE}`);
            }
            if (messageLowerCase === 'feelsbadman') {
                Emoji.ACTIVE = false;
				
				UTIL.doLog(`Emojis Mining ${Emoji.ACTIVE}`);
            }
            if (messageLowerCase === 'noice') {
                UTIL.doLog(`Logging the emoji analysis at ${Bot.options.channels}: `);
                console.dir(Emoji.LIST, { depth: null })
            }
            if (messageArrayLowerCase[0] === 'got' && messageArrayLowerCase.length >= 2) { // POSSIBLE USAGE: got <int> FeelsWeirdNab    [length = 3]
                if (messageArrayLowerCase.length >= 4 && isNaN(messageArrayLowerCase[1])) { // IF THERE IS TOO MANY ARGUMENTS OR THE FIRST ARGUMENT IS NOT A NUMBER, FRICK THIS CRAP
                    return;
                }
                else { // !topemojis <number> OR !topemojis <number> -e
                    let topValue = messageArrayLowerCase[1];
                    let topObj = {};
                    let prettyEmojiObject = {};
                    let whatToShow = '';

                    topObj = Emoji.getTop(topValue); // Populate Object with the TOP <arg> where args is an Integer

                    if (messageArrayLowerCase.length === 3 && messageArrayLowerCase[2] === 'feelsweirdman') { // !topemojis <number> -e
                        prettyEmojiObject = Emoji.adjustEmojiList(topObj);
                        console.dir(prettyEmojiObject, {depth: null});
                    }

                   // whatToShow = ((messageArrayLowerCase[2] === 'feelsweirdman') ? `TOP ${topValue} EMOJIS USED SO FAR: ${JSON.stringify(prettyEmojiObject, undefined, 2)}` : `TOP ${topValue} EMOJIS USED SO FAR: ${JSON.stringify(topObj, undefined, 2)}`);
                    
                    UTIL.doLog(`${JSON.stringify(topObj, undefined, 2)}`);
                    //client.say(channel, whatToShow);
                }
            }
            /*
            // SEND MESSAGE TO ALL CHANNELS IN Bot.options.channels
            if (messageLowerCase === '!sayhitoall') {
                UTIL.messageAllChannels(client, Bot.options.channels, `THIS IS A TEST!`);
            }
            */
        } // END OF COMMANDS ONLY EXECUTED BY BOT OWNER *******************
        /*
        if (messageLowerCase === '!comebackonred') {
            GLOBALS.lockedzLove++;
            //client.say(channel, `FeelsGoodMan you are loved ${user.username} FeelsGoodMan (I am NOT onred) [${lockedzLove}]`);
            Bot.makeBotUnresponsiveForAnInterval(Bot.REST_INTERVAL);
        }
        */
        /*
        if (messageArrayLowerCase[0] === '!watweather') {
            cmd_clima(messageArrayLowerCase.slice(1), user, channel);
            Bot.makeBotUnresponsiveForAnInterval(Bot.REST_INTERVAL);
        }
        */
    }
	
});


// Kripp's bot utilizes the "/me" (action) command to announce that bets are open, hence we need to mine chat is this event
client.on('action', (channel, user, msg, self) => {
    //if (self) return false;

    let userWhoSentTheMessageStringLowercase = user.username.toString().toLowerCase();
    // *************
    // START OF:    Chat Mining Area
    // **********   No commands, just reading chat and searching/analyzing stuff
    //************************************************************************* */

    // ***********************
    // SEARCH FOR "StreamLabs"*: "*BETTING HAS OPENED*" IN CHAT TO TURN ANALYTICS ON
    // ******************************************
    if (GLOBALS.allowAutoMining.analytics && userWhoSentTheMessageStringLowercase === GLOBALS.realBetBotNickname) { // nicknames should be compared lowercase always
        let regExpPatternStartBet = /BETTING HAS OPENED/ig;
        let regExpPatternEndBet = /BETTING HAS CLOSED/ig;
		
        if (!Analytics.isBotAnalyticsOn() && regExpPatternStartBet.test(msg)) { // FOUND THAT THE REAL BOT (FeelsBadMan) HAS STARTED THE BET TIMER (AND IT WAS OFF)
            // TURN ON ANALYTICS
            Analytics.setAnalytics(true);

            UTIL.doLog(`Found that ${GLOBALS.realBetBotNickname} has STARTED the Bet timer`, 2);
        }

        if (Analytics.isBotAnalyticsOn() && regExpPatternEndBet.test(msg)) { // BET TIME HAS ENDED (AND IT WAS ON)
            UTIL.doLog(`Found that ${GLOBALS.realBetBotNickname} has ENDED the Bet timer`, 2);

            Analytics.triggerEnd(channel);
        }
    }

});