import React from 'react'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import PlayingCard from '../components/PlayingCard'
import clsx from 'clsx'

const useStyles = makeStyles({
    root: {
        color: 'white',
        marginTop: '1rem',
        paddingTop: '1rem',
        paddingBottom: '1rem',
    },
    winner: {
        backgroundColor: '#6bb36b'
    },
    loser: {
        backgroundColor: '#d81d1d'
    }
})

export default function Hand({ cards, id, score, isWinner }) {
    const styles = useStyles()

    return (
        <Grid container data-test-id="hand" className={clsx(styles.root, isWinner ? styles.winner : styles.loser)}>
            <Grid item xs={12}>
                Score: {score}
                <p>
                    {isWinner ? 'WINNER!!' : 'LOSER 👎'}
                </p>
            </Grid>
            <Grid container direction="row" justify="center" spacing={2}>
                {cards.map((card, idx) => (
                    <Grid item xs={2} key={card.id}>
                        <PlayingCard {...card} />
                    </Grid>
                ))}
            </Grid>
        </Grid>
    )
}