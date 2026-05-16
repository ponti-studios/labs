const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const SUITS = ['Hearts', 'Diamonds', 'Clubs', 'Spades']

function getSuit(suit) {
  switch (suit) {
    case 'H': return '♥'
    case 'D': return '♦'
    case 'C': return '♣'
    case 'S': return '♠'
    default: return suit
  }
}

function getRank(rank) {
  return rank
}

class Card {
  id
  suit
  rank
  value

  constructor(suit, rank) {
    this.id = `${suit} ${rank}`
    this.suit = getSuit(suit)
    this.rank = getRank(rank)
    this.value = SUITS.indexOf(suit) + RANKS.indexOf(rank) + 2
  }
}

class Deck {
  cards = []

  constructor() {
    this.cards = []
    for (const suit of SUITS.map((_, i) => ['H', 'D', 'C', 'S'][i])) {
      for (const rank of RANKS) {
        this.cards.push(new Card(suit, rank))
      }
    }
    this.shuffle()
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]
    }
  }

  deal() {
    return this.cards.pop()
  }
}

function createDeck() {
  const deck = []
  for (const suit of ['H', 'D', 'C', 'S']) {
    for (const rank of RANKS) {
      deck.push(new Card(suit, rank))
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export { Card, Deck, RANKS, SUITS, createDeck }
