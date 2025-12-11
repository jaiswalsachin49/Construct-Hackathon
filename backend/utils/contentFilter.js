const Filter = require('bad-words');

const filter = new Filter();

/**
 * Check if text contains profanity
 * @param {String} text - Text to check
 * @returns {Boolean} - True if profanity found
 */
const hasProfanity = (text) => {
    if (!text) return false;
    return filter.isProfane(text);
};

/**
 * Clean text (replace bad words with *)
 * @param {String} text 
 * @returns {String}
 */
const cleanText = (text) => {
    if (!text) return text;
    return filter.clean(text);
};

module.exports = {
    hasProfanity,
    cleanText
};
