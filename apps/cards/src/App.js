import React, { useState } from 'react';
import './App.css';
import Deck from './models/Deck';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Hand from './components/Hand';

const useStyles = makeStyles({
  root: {
    maxWidth: '600px',
    margin: '0 auto'
  },
  button: {
    backgroundColor: 'white'
  },
  buttonContainer: {
    marginTop: '2rem',
    marginBottom: '2rem'
  },
  winner: {
    color: 'green',
    backgroundColor: 'green'
  }
})

function App() {
  const [deck, setDeck] = useState(new Deck())
  const [hands, setHands] = useState([])
  const [ winner, setWinner ] = useState(undefined)
  const styles = useStyles()

  function onCreateHand() {
    const hand = deck.deal()
    
    if (winner && hand.score > winner.score) setWinner(hand)
    else if (winner === undefined) setWinner(hand)

    setHands([...hands, hand])
  }

  function onCollectHands() {
    deck.collectHands()
    setHands([])
    setDeck(new Deck())
  }

  return (
    <div className="App">
        <h1>Luck Of The Draw</h1>
        <Grid container className={styles.root}>
          {hands.map((hand) => (
              <Hand 
                key={hand.id} 
                {...hand} 
                isWinner={winner.id === hand.id}
              />
          ))}
        </Grid>
        <div className={styles.buttonContainer}>
          <Button 
            color="primary"
            variant="outlined" 
            onClick={onCreateHand}
            className={styles.button}
            disabled={deck.cards.length < 5}
          >
            Deal Hand
          </Button>
          <Button
            color="primary"
            variant="outlined"
            onClick={onCollectHands}
          >
            Collect hands
          </Button>
        </div>
    </div>
  );
}

export default App;
