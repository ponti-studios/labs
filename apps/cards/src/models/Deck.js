import { v4 as uuidv4 } from 'uuid'
import { RANKS, SUITS } from '../constants'
import Card from './Card'

/**
 * @description Class representing a deck of cards.
 */
class Deck {
    /**
     * @type {[{ id: string, suit: string, rank: string }]}
     */
    cards = []
    
    /**
     * @type {Map<String, [Card]>}
     */
    hands = new Map()

    /**
     * Create a deck of cards
     */
    constructor() {
        this.id = uuidv4()
        
        // Create suite of each suit
        for (const suit of SUITS) {
            // Create card for each rank in each suit
            for (const rank of RANKS) {
                this.cards.push(new Card(suit, rank))
            }
        }
    }

    /**
     * @description Get random card from deck
     * @returns {Card}
     */
    pullCard() {
        /**
         * NOTE: We use `this.cards.length` instead of 52 because the length of the deck will
         * change as cards are dealt
         * @type {Number}
         */
        const cardIdx = Math.floor(Math.random() * Math.floor(this.cards.length))

        // Remove card from deck
        return this.cards.splice(cardIdx, 1)[0]
    }
    
    /**
     * @description Create a new hand
     * @param {Number} length - Length of hand
     * @returns {{ id: String, cards: [Card], score: Number }}
     */
    deal(length = 5) {
        const id = uuidv4()
        let score = 0
        // Add cards to hand
        // const cards = Array.from({ length }, () => this.pullCard())

        const cards = Array.from({ length }, () => {
            const card = this.pullCard()
            score += card.value
            return card
        })

        // Add hand to current hands
        this.hands.set(id, cards)
        
        return { 
            id, 
            cards, 
            score
        }
    }

    /**
     * @description Collect all hands and return to deck
     * @returns {Deck}
     */
    collectHands() {
        for (let hand of this.hands.values()) {
            for (const card of hand) {
                this.cards.push(card)
            }
        }
        
        // Empty `hands` Map
        this.hands.clear()
        
        // Return Deck to allow for method chaining
        return this
    }

    /**
     * @description Pull card from deck and add to hand
     * @param {String} handId - Id of hand
     * @returns {Deck}
     */
    dealToHand(handId) {
        this.hands.set(
            handId, 
            [...this.hands.get(handId), this.pullCard()]
        )
        
        // Return Deck to allow for method chaining
        return this
    }
}

export default Deck