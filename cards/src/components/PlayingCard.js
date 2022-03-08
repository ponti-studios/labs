import React from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles({
    card: {
        height: '125px',
    },
    rankWithEmoji: {
        paddingTop: '12px'
    }
})

export default function PlayingCard({ suit, rank }) {
    const styles = useStyles()
    
    return (
        <Card className={styles.card}>
            <CardHeader title={suit} />
            <CardContent>{rank}</CardContent>
        </Card>
    )   
}