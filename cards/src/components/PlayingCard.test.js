import React from 'react'
import { render } from '@testing-library/react'
import PlayingCard from './PlayingCard'

describe('<PlayingCard/>', () => {
    test('should render suit and rank', () => {
        const suit = 'hearts'
        const rank = 'king'
        const { getByText } = render(<PlayingCard suit={suit} rank={rank} value="15" />)
        expect(getByText(rank)).toBeInTheDocument()
        expect(getByText(suit)).toBeInTheDocument()
    })
})