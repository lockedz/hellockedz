const EMOJI_LIST = require('../txt/emoji-list');

const Emoji = { // FIXME: ADD GETTERS AND SETTERS TO ALL OBJECTS PROPERTIES
    LIST: EMOJI_LIST,
    VERBOSE: true,
    ACTIVE: false,
    totalMessagesAnalysed: 0,

    adjustEmojiList: (myObj) => { // transform myObj to one that has spaces between the quotes, to proper show the emojis in chat  (returns an Array)
        return Object.keys(myObj).map((v) => {
            let newObj = {};
            let newKey = ` ${v} `;

            newObj[newKey] = myObj[v];

            return newObj;
        });
    },

    getListSize: () => { return Object.keys(Emoji.LIST).length; },

    getTop: (top) => { // RETURNS THE TOP (TOP IS AN INTEGER 'X') X HIGHEST VALUES IN Emoji.LIST. AS AN OBJECT
	// FIXME:	IT STILL WON'T RETURN ALL THE KEYS THAT HAVE THE SAME VALUE (EX: 'TOPEMOJI 1' AND THE TOP 3 ARE ALL EQUAL VALUES OF, LET'S SAY '8', THEN ONLY ONE WILL RETURN;
	//			SHOULDN'T ALL 3 BE RETURNED? ALL THREE ARE 'TOP ONE' WITH THE SAME VALUE...
        if (isNaN(top)) return false;
        if (top <= 0) { top = 1; }

        top = parseInt(top); // Explicity converting String argument to Integer

        let auxObject = {};
        let max = new Array(top).fill(-1);   // MAX LENGTH MUST BE EQUALS TO 'top' | FIXME: IF MAX IS INITIALIZED WITH '-1', DOES IT SOLVE THE EMPTY OBJECTS PROBLEM?
        //console.dir(max);
        let id = '';

         for (let i = 0; i < top; i++) { // ITERATE 'top' times
            Object.keys(Emoji.LIST).forEach((v, idx, a) => {
                if (Emoji.LIST[v] >= max[i] && !auxObject.hasOwnProperty(v)) {
                    max[i] = Emoji.LIST[v];
                    id = v;
                    //console.log(`ADDED NEW MAX = ${max[i]} AS ${id}`);
                }
            });
            auxObject[id] = max[i];
            if (max[i] === 0) { // THEN THERE'S NOTHING MORE THAN 0... LET'S END HERE
                break;
            }
            //console.log(`THE MAX OF THIS ${i} ROUND WAS ${id} WITH MAX = ${max[i]}`);
        }

        //console.dir(auxObject, {depth: null});
        // ADD A CHECK IF THERE IS ONLY ONE ID AND VALUE IS 0... THEN SHOW SOMETHING ELSE
        if (max[0] === 0) {
            auxObject = {'info' : 'no emojis still...'};
        }

        return auxObject;
    }
};

module.exports = Emoji;