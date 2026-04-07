const { SUITS, RANKS, getSuit, getRank } = require("../constants")
const { default: Card } = require("./Card")

describe('Card', () => {
    let card
    const suit = SUITS[2]
    const rank = RANKS[1]

    beforeEach(() => {
        card = new Card(suit, rank)
    })

    afterEach(() => {
        card = null
    })

    test('should have id, suit, rank, and value', () => {
        expect(card.value).toEqual(5)
        expect(card.suit).toEqual(getSuit(suit))
        expect(card.rank).toEqual(getRank(rank))
        expect(card.id).toEqual(`${suit} ${rank}`)
    })
})