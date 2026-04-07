const { default: Deck } = require("./Deck")
const { uniq } = require('lodash')

describe('Deck', () => {
    /**
     * @type {Deck}
     */
    let deck
    
    beforeEach(() => {
        deck = new Deck()
    })

    afterEach(() => {
        deck = null
    })
    
    test('it should have 52 cards', () => {
        expect(deck.id).not.toBeNull()
        expect(deck.cards.length).toEqual(52)
        expect(deck.cards.find(c => c.id === 'spades 10')).not.toEqual(undefined)
        expect(deck.cards.find(c => c.id === 'diamonds K')).not.toEqual(undefined)
        expect(deck.cards.find(c => c.id === 'hearts A')).not.toEqual(undefined)
        expect(deck.cards.find(c => c.id === 'clubs 5')).not.toEqual(undefined)
        expect(deck.cards.find(c => c.id === 'clubs 1')).toEqual(undefined)
    })

    test('it should add value to cards', () => {
        const twoOfHearts = deck.cards.find(c => c.id === 'hearts 2')
        const twoOfDiamonds = deck.cards.find(c => c.id === 'diamonds 2')
        const twoOfSpades = deck.cards.find(c => c.id === 'spades 2')
        expect(twoOfHearts.value).toBeGreaterThan(twoOfDiamonds.value)
        expect(twoOfHearts.value).toBeLessThan(twoOfSpades.value)
    })

    describe('.deal()', () => {
        test('should deal cards to hand with length provided', () => {
            let i = 1
            const handLength = 3
            while (deck.cards.length > handLength) {
                const hand = deck.deal(handLength)
                expect(hand.cards.length).toEqual(handLength)
                expect(hand.score).toEqual(hand.cards.reduce((sum, c) => sum + c.value, 0))
                expect(deck.cards.length).toEqual(52 - (handLength * i))
                expect(deck.hands.size).toEqual(i)
                i += 1
            }
        })
        test('should deal 5 cards if no length provided', () => {
            const hand = deck.deal()
            expect(hand.cards.length).toEqual(5)
        })
    })
    
    describe('.pullCard()', () => {
        test('should remove card from deck', () => {
            const card = deck.pullCard()
            expect(deck.cards.find(c => c.id === card.id)).toEqual(undefined)
            expect(card).not.toBeNull()
        })
    })

    describe('.collectHands()', () => {
        test('should return hands to deck', () => {
            while (deck.cards.length >= 5) {
                deck.deal()
            }
            expect(deck.cards.length < 5).toEqual(true)
            deck.collectHands()
            expect(uniq(deck.cards.map(c => c.id)).length).toEqual(52)
            expect(deck.hands.size).toEqual(0)
        })
    })
    
    describe('.dealToHand()', () => {
        test('should add card to hand', () => {
            const hand = deck.deal()
            expect(deck.cards.length).toEqual(52 - 5)
            
            deck.dealToHand(hand.id)
            expect(deck.hands.get(hand.id).length).toEqual(6)
            expect(deck.cards.length).toEqual(52 - 5 - 1)
            
            deck.dealToHand(hand.id)
            expect(deck.hands.get(hand.id).length).toEqual(7)
            expect(deck.cards.length).toEqual(52 - 5 - 2)
        })    
    })
})