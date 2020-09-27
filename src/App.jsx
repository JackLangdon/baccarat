import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      result: {},
      deck_id: '',
      numDrawnCards: 0,
      playerOneTurn: true,
      pulledCards: [],
      playerOneHand: [],
      playerTwoHand: [],
    };
  }

  async componentDidMount() {
    const response = await fetch(
      'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'
    );
    const json = await response.json();

    console.log(json);

    this.setState({
      isLoaded: true,
      result: json,
      deck_id: json.deck_id,
    });

    // LOG ERROR
  }

  async reshuffle() {
    const response = await fetch(
      `https://deckofcardsapi.com/api/deck/${this.state.result.deck_id}/shuffle/`
    );
    const json = await response.json();

    this.setState({
      // reset defaults
    });
  }

  async drawCard() {
    let pulledCards = this.state.pulledCards.map((card) => {
      return card;
    });
    let playerOneHand = this.state.playerOneHand.map((card) => {
      return card;
    });
    let playerTwoHand = this.state.playerTwoHand.map((card) => {
      return card;
    });
    let playerOneTurn = this.state.playerOneTurn;

    const response = await fetch(
      `https://deckofcardsapi.com/api/deck/${this.state.deck_id}/draw/?count=1`
    );
    const json = await response.json();

    // Add new card to pulled cards array
    pulledCards.push(json.cards[0]);

    // Add new card to appropriate hand
    if (this.state.playerOneTurn) {
      playerOneHand.push(json.cards[0]);
    } else {
      playerTwoHand.push(json.cards[0]);
    }

    this.setState({
      pulledCards,
      playerOneHand,
      playerTwoHand,
      playerOneTurn: !playerOneTurn,
    });
  }

  async deal() {
    for (let i = 0; i < 4; i++) {
      await this.drawCard();
    }
  }

  render() {
    const { error, isLoaded } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading deck...</div>;
    } else {
      return (
        <div className="contianer">
          <div>
            <button onClick={() => this.deal()}>Deal</button>
          </div>
          <div className="playerOneHand">
            <h2>Player One</h2>
            <div className="card-display">
              {this.state.playerOneHand.map((card) => {
                return (
                  <img
                    key={card.code}
                    className="card-image"
                    src={`${card.image}`}
                    alt={`${card.value} OF ${card.suit}`}
                  />
                );
              })}
            </div>
          </div>
          <div className="playerTwoHand">
            <h2>Player Two</h2>
            <div className="card-display">
              {this.state.playerTwoHand.map((card) => {
                return (
                  <img
                    key={card.code}
                    className="card-image"
                    src={`${card.image}`}
                    alt={`${card.value} OF ${card.suit}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      );
    }
  }
}

export default App;
