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
      playerTurn: true,
      pulledCards: [],
      playerHand: [],
      houseHand: [],
      firstDeal: true,
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
      `https://deckofcardsapi.com/api/deck/${this.state.deck_id}/shuffle/`
    );
    const json = await response.json();

    this.state = {
      error: null,
      isLoaded: false,
      result: {},
      numDrawnCards: 0,
      playerTurn: true,
      pulledCards: [],
      playerHand: [],
      houseHand: [],
      firstDeal: true,
    };
  }

  calcCardValue(cardCode) {
    // Remove suit character from end of code
    let value = cardCode.slice(0, -1);

    switch (value) {
      case 0:
        // code for 10 is '0'
        return 10;
      case 'J':
        return 11;
      case 'Q':
        return 12;
      case 'K':
        return '13';
      case 'A':
        return '14';
      default:
        // return the given card value
        return value;
    }
  }

  async drawCard() {
    let numDrawnCards = this.state.numDrawnCards;
    const response = await fetch(
      `https://deckofcardsapi.com/api/deck/${this.state.deck_id}/draw/?count=1`
    );
    const json = await response.json();

    numDrawnCards++;

    this.setState({ numDrawnCards });

    console.log(json.cards[0].code);
    console.log(this.state.numDrawnCards);
    return json;
  }

  async deal() {
    let pulledCards = this.state.pulledCards.map((card) => {
      return card;
    });
    let playerHand = this.state.playerHand.map((card) => {
      return card;
    });
    let houseHand = this.state.houseHand.map((card) => {
      return card;
    });
    let playerTurn = this.state.playerTurn;

    for (let i = 0; i < 4; i++) {
      // Draw a new card
      let json = await this.drawCard();
      // Add new card to pulled cards array
      pulledCards.push(json.cards[0]);
      // Add new card to appropriate hand
    }

    pulledCards.map((card, index) => {
      if (index % 2 === 0) {
        playerHand.push(card);
      } else {
        houseHand.push(card);
      }
    });

    this.setState({
      pulledCards,
      playerHand,
      houseHand,
      playerTurn: !playerTurn,
      firstDeal: false,
    });
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
            {this.state.firstDeal ? (
              <button onClick={() => this.deal()}>Deal</button>
            ) : (
              <div>
                <button onClick={() => this.playerCard()}>+1 Player</button>
                <button onClick={() => this.hosueCard()}>+1 House</button>
              </div>
            )}
          </div>
          <div className="playerHand">
            <h2>Player</h2>
            <div className="card-display">
              {this.state.playerHand.map((card) => {
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
          <div className="houseHand">
            <h2>House</h2>
            <div className="card-display">
              {this.state.houseHand.map((card) => {
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
