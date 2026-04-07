import { getRank, getSuit, RANKS, SUITS } from '../constants';

class Card {
    /**
     * @type {String}
     */
    id;

    /**
     * @type {String}
     */
    suit;

    /**
     * @type {String}
     */
    rank;

    /**
     * @type {Number}
     */
    value;

    /**
     * @description Create card
     * @param {String} suit 
     * @param {String} rank 
     */
    constructor(suit, rank) {
        this.id = `${suit} ${rank}`
        this.suit = getSuit(suit)
        this.rank = getRank(rank)
        // NOTE: Add 2 to adjust for 0-indexing
        this.value = SUITS.indexOf(suit) + RANKS.indexOf(rank) + 2
    }
}

export default Card