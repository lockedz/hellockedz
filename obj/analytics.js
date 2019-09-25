const UTIL = require('../bin/util');
const GLOBALS = require('../bin/globals');


const Analytics = {
    IS_IT_ARENA: true, // Could be PvE content (so, false) (betting on bosses)
    FLAG_ANALYTICS: false,
    IS_THERE_A_MAXIMUM_BET_VALUE: true,
    MAX_BET_VALUE: 100,
    VERBOSE: true,

    setIsItArena: (isIt) => { // typedef isIt = bool
        Analytics.IS_IT_ARENA = isIt;    
    },
    isItArena: () => { // FIXME: Needed?
        return Analytics.IS_IT_ARENA;
    },

    toggleVerbose: () => {
        Analytics.VERBOSE = !Analytics.VERBOSE;

        UTIL.doLog(`Analytics VERBOSE is now ${Analytics.VERBOSE}`, 2);
    },
    isVerbose: () => {
        return Analytics.VERBOSE;
    },

    setMaxBetValue: (max) => { // Will we ever set the max value dynamically? FIXME
        try {
            if (!isNaN(max))    Analytics.MAX_BET_VALUE = parseInt(max);
        } catch(e) {
            UTIL.doLog(`${e}`, 3);
        }
    },
    getMaxBetValue: () => {
        return Analytics.MAX_BET_VALUE;
    },

    setIsThereAMaximumBetValue: (yesorno) => {
        if (typeof yesorno === 'boolean') {
            Analytics.IS_THERE_A_MAXIMUM_BET_VALUE = yesorno;
        } else {
            UTIL.doLog(`${yesorno} is not a valid boolean. Not setting IS_THERE_A_MAXIMUM_BET_VALUE`, 3);
        }
    },
    getIsThereAMaximumBetValue: () => {
        return Analytics.IS_THERE_A_MAXIMUM_BET_VALUE;
    },

    setAnalytics: (status) => {
        let boolToTextPretty = UTIL.boolToText(status);
        
        Analytics.FLAG_ANALYTICS = status;

        UTIL.doLog(`Analytics is now ${boolToTextPretty}`, 2);
    },
    getAnalytics: () => {
        return Analytics.FLAG_ANALYTICS;
    },
    /*
        END OF GETTERS AND SETTERS OF ANALYTICS OBJECT
    */
    
    isBotAnalyticsOn: () => { // FIXME: Worth it to have a separate 'get' to this? It just points to the original get...
        return Analytics.getAnalytics();
    },
    
    analyzeBets: (bets, channel) => { // Returns a Pretty String with the statistics
        let sayBetsAnalyticsString = '';
        let totalBetsLow, totalBetsMid, totalBetsHigh = 0;
        let totalAmountLow, totalAmountMid, totalAmountHigh = 0;
        let percentBetsLow, percentBetsMid, percentBetsHigh = 0;
        let betLowTierText, betMidTierText, betHighTierText = '';

        if (Analytics.isItArena()) {
            betLowTierText = 'low';
            betMidTierText = 'mid';
            betHighTierText = 'high';
        } else { // else, it's PvE Betting (bosses run)
            betLowTierText = 'before';
            betMidTierText = 'during';
            betHighTierText = 'finish';
        }
    
        totalBetsLow = bets[betLowTierText]['counter'];
        totalBetsMid = bets[betMidTierText]['counter'];
        totalBetsHigh = bets[betHighTierText]['counter'];
    
        totalAmountLow = bets[betLowTierText]['amount'];
        totalAmountMid = bets[betMidTierText]['amount'];
        totalAmountHigh = bets[betHighTierText]['amount'];
        
        if (GLOBALS.totalBets !== 0) {
            percentBetsLow = (totalBetsLow / GLOBALS.totalBets * 100).toFixed(2);
            percentBetsMid = (totalBetsMid / GLOBALS.totalBets * 100).toFixed(2);
            percentBetsHigh = (totalBetsHigh / GLOBALS.totalBets * 100).toFixed(2);
        } else {
            percentBetsLow = percentBetsMid = percentBetsHigh = 0;
        }

        sayBetsAnalyticsString = `${betLowTierText.toUpperCase()}: ${percentBetsLow}% (${totalAmountLow} lettuce) | ${betMidTierText.toUpperCase()}: ${percentBetsMid}% (${totalAmountMid} lettuce) | ${betHighTierText.toUpperCase()}: ${percentBetsHigh}% (${totalAmountHigh} lettuce); TOTAL BETS: ${GLOBALS.totalBets} (${GLOBALS.totalLettuce} TOTAL LETTUCE)`;
        // Uncomment if you want to specify (and write to log with the text) that the Bets are off when this function was called
        // if (!Analytics.isBotAnalyticsOn()) {
        //     sayBetsAnalyticsString += ` (Bets are OFF)`;
        // }

        if (GLOBALS.totalBets !== GLOBALS.BETTERS_LIST.length) {
            UTIL.doLog(`Something's is wrong since ${GLOBALS.totalBets} != ${BETTERS_LIST.length}`, 2);
        }
        
       // ADD A (WINDOWS) NEWLINE
       //sayBetsAnalyticsString += '\n';

        return sayBetsAnalyticsString;
    },
    
    distributeBets: (type, amount) => {
        GLOBALS.bets[type]['counter']++;
        GLOBALS.bets[type]['amount'] += amount;
    },

    // TODO:    ADD ARGUMENTS TO SEARCH ONLY FOR SPECIFIC OPTIONS (TIME OF THE BET, OR ONLY LETTUCEAMOUNT, OR ONLY BET TIER)
    searchBetterStatus: (uniqueIDNickname) => { // Returns a String prettified with the current <arg> (nickname) bet statistics
        let prettyStringToReturn = ``;

        try {
            console.dir(`${GLOBALS.BETTERS_OBJECT}`, {depth: null});
            // If Object is empty or there the nickname hasn't bet (not found), get out
            if ((Object.entries(GLOBALS.BETTERS_OBJECT).length === 0 && GLOBALS.BETTERS_OBJECT.constructor === Object) || !GLOBALS.BETTERS_OBJECT.hasOwnProperty(uniqueIDNickname)) {
                prettyStringToReturn = `${uniqueIDNickname} was not found as a registered better...`;
                UTIL.doLog(`${prettyStringToReturn}`, 3);

                return prettyStringToReturn;
            }
        } catch(e) {
            UTIL.doLog(`${e}`, 3);
            
            return false;
        }

        //console.log(`@${uniqueIDNickname} betting status:`);
        //prettyStringToReturn += `@${uniqueIDNickname} betting status:\n`;

        Object.keys(GLOBALS.BETTERS_OBJECT[uniqueIDNickname]).forEach((key) => {
            //console.log(`${key}:\t ${GLOBALS.BETTERS_OBJECT[uniqueIDNickname][key]}`);
            prettyStringToReturn += `${key}:\t ${GLOBALS.BETTERS_OBJECT[uniqueIDNickname][key]} | `;
        });

        prettyStringToReturn = prettyStringToReturn.slice(0, -2); // Remove the last pipe and space characters

        return prettyStringToReturn;
    },

    getTopBetters: (top) => {
        if (isNaN(top)) return false;
        if (top <= 0) { top = 1; }

        top = parseInt(top); // Explicity converting String argument to Integer

        let auxObject = {}; // Object per se that will contain all the topbetters analysis
        let printableObject = {}; // Object that contains the auxObject itself plus a String prettified for printing purposes
        let max = new Array(top).fill(0);   // MAX LENGTH MUST BE EQUALS TO 'top'
        let id = '';
        let betTier = '';
        let stringToChat = '';

        stringToChat += `TOP ${top} BETTERS: `;

        try {
            for (let i = 0; i < top; i++) { // ITERATE 'top' times
                Object.keys(GLOBALS.BETTERS_OBJECT).forEach((v, idx, a) => {
                    if (GLOBALS.BETTERS_OBJECT[v].lettuceBet >= max[i] && !auxObject.hasOwnProperty(v)) {
                        max[i] = GLOBALS.BETTERS_OBJECT[v].lettuceBet;
                        id = v;
                        betTier = GLOBALS.BETTERS_OBJECT[v].betTier;
                        //console.log(`ADDED NEW MAX = ${max[i]} AS ${id}`);
                    }
                });
                if (!auxObject.hasOwnProperty(id)) { // Only create if there is this nickname (ID) in the Object
                    auxObject[id] = {};
                    auxObject[id].lettuceBet = max[i];
                    auxObject[id].userName = id;

                    stringToChat += `${i+1}) ${id}: ${max[i]} lettuce (${betTier}gang), `;
                //console.log(`THE MAX OF THIS ${i} ROUND WAS ${id} WITH MAX = ${max[i]}`);
                }
            }
        } catch (e) {
            UTIL.doLog(`${e}`, 3);
        }
        //console.dir(auxObject, {depth: null});
        //stringToChat = stringToChat.slice(0, stringToChat.length-1);

        // ADD A CHECK IF THERE IS ONLY ONE ID AND VALUE IS 0... THEN SHOW SOMETHING ELSE CUZ THERE IS NO TOP ANYTHING
        if (max[0] === 0) {
            auxObject = { 'bet' : false };
            stringToChat = `There are no betters yet FeelsBadMan  `;
        }

        // Remove/adjust the last comma and space of the string (last 2 chars)
        stringToChat = stringToChat.slice(0, -2);

        printableObject['prettyString'] = stringToChat;
        printableObject['rawObject'] = auxObject;

        return printableObject;
        //return auxObject;
    },

    resetAnalytics: () => {
        GLOBALS.totalBets = 0;
        GLOBALS.totalLettuce = 0;

        GLOBALS.bets.low.counter = 0;
        GLOBALS.bets.low.amount = 0;

        GLOBALS.bets.mid.counter = 0;
        GLOBALS.bets.mid.amount = 0;

        GLOBALS.bets.high.counter = 0;
        GLOBALS.bets.high.amount = 0;

        GLOBALS.BETTERS_LIST = []; // Flush the array of betters
        GLOBALS.BETTERS_OBJECT = {}; // Flush the Object of betters

        return true;
    },
    triggerEnd: (channel) => {
        let topBettersString = '', betAnalyticsNow = '';
        let localTime = '', localDate = '';
        let bettersUniqueIdFileName = '';

        // TURN OFF ANALYTICS
        Analytics.setAnalytics(false);
        //UTIL.doLog(`Analytics is now ${UTIL.boolToText(Analytics.getAnalytics())}`);

        // As soon as bets end, get the statistics AND the top 3 betters
        // UPDATE: topBetters is kinda useless now since it will almost always be '100' (MAX_BET_VALUE) for the top 3, 5 mabye 10... uncomment if you're willing to try
        betAnalyticsNow = Analytics.analyzeBets(GLOBALS.bets, channel);
        //topBettersString = Analytics.getTopBetters(3).prettyString;
        UTIL.doLog(`${betAnalyticsNow}`);
        //UTIL.doLog(`${topBettersString}`);

        // FIXME:
        localTime = new Date().toLocaleTimeString('default', {hour12: false});
        localDate = new Date().toLocaleDateString(GLOBALS.LOCALEDATE_LOCAL, GLOBALS.LOCALEDATE_OPTIONS);
        bettersUniqueIdFileName = `${localDate}.${localTime}`.replace(/:/g,'_'); // Remove the ":" from the time String to '_' so filenames accept it
        // WRITE TO FILE IN DISK
        // FIXME:   THE PATH IS BEING HARDCODED HERE. SHOULD BE AT THE OPTIONS FILE (?)
        UTIL.asyncWriteToLog(`[${localDate}.${localTime}] ${betAnalyticsNow}\n`, `./log/Bets.txt`, false); // ONLY APPEND, DO **NOT** OVERRIDE THE FILE
        UTIL.asyncWriteToLog(`${JSON.stringify(GLOBALS.BETTERS_OBJECT, null, ' ')}`, `./log/betters/${bettersUniqueIdFileName}.json`, true); // OVERRIDE THE FILE IF EXISTS, DON'T CARE
    
        // RESET ANALYTICS
        Analytics.resetAnalytics();
    }
};

module.exports = Analytics;