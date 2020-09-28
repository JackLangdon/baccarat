import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      deck_id: '',
      playerTurn: true,
      playerHand: [],
      houseHand: [],
      firstDeal: true,
      playerScore: 0,
      houseScore: 0,
      houseHidden: true,
      hidden: [],
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
      deck_id: json.deck_id,
    });

    // LOG ERROR
  }

  async reshuffle() {
    this.setState({
      isLoaded: false,
    });
    // Shuffle deck with API
    const response = await fetch(
      `https://deckofcardsapi.com/api/deck/${this.state.deck_id}/shuffle/`
    );
    const json = await response.json();

    // Reset the state
    this.setState({
      error: null,
      isLoaded: true,
      playerTurn: true,
      playerHand: [],
      houseHand: [],
      firstDeal: true,
      playerScore: 0,
      houseScore: 0,
      houseHidden: true,
      hidden: [],
    });
  }

  calcCardValue(cardCode) {
    // Remove suit character from end of code
    let value = cardCode.slice(0, -1);

    switch (value) {
      case '0':
      case 'J':
      case 'Q':
      case 'K':
        return 10;
      case 'A':
        return 11;
      default:
        // return the given card value
        return parseInt(value, 10);
    }
  }

  async drawCard() {
    // Pull a card from the deck
    const response = await fetch(
      `https://deckofcardsapi.com/api/deck/${this.state.deck_id}/draw/?count=1`
    );
    const json = await response.json();

    console.log(json.cards[0].code);
    // Return card information
    return json;
  }

  async firstDeal() {
    // Deal cards to player and house
    console.log('Card to player:');
    await this.dealPlayer();
    console.log('Card to house:');
    await this.dealHouse();
    console.log('Card to player:');
    await this.dealPlayer();
    console.log('Hidden card to house:');
    // await this.dealHouse();
    await this.dealHouseHidden();

    // Update state
    this.setState({
      firstDeal: false,
    });
  }

  async dealPlayer() {
    let playerHand = this.state.playerHand.map((card) => {
      return card;
    });
    let playerScore = this.state.playerScore;

    let json = await this.drawCard();

    playerHand.push(json.cards[0]);

    let value = this.calcCardValue(json.cards[0].code);

    playerScore += value;

    this.setState({
      playerHand,
      playerScore,
    });
  }

  async dealHouse() {
    let houseHand = this.state.houseHand.map((card) => {
      return card;
    });
    let houseScore = this.state.houseScore;

    let json = await this.drawCard();

    houseHand.push(json.cards[0]);

    let value = this.calcCardValue(json.cards[0].code);

    houseScore += value;

    this.setState({
      houseHand,
      houseScore,
    });
  }

  async dealHouseHidden() {
    let hidden = this.state.hidden.map((card) => {
      return card;
    });

    let json = await this.drawCard();

    hidden.push(json.cards[0]);

    let houseHand = this.state.houseHand.map((card) => {
      return card;
    });

    houseHand.push({
      image: `${process.env.PUBLIC_URL}/img/card-back.jpg`,
      value: 'UNKNOWN',
      suit: 'UNKNOWN',
      code: '??',
    });

    this.setState({
      hidden,
      houseHand,
    });
  }

  revealHouse() {
    // Get hidden card array
    let hidden = this.state.hidden.map((card) => {
      return card;
    });

    // Caclulate hidden card score
    let houseScore = this.state.houseScore;
    let value = this.calcCardValue(hidden[0].code);

    // Get house hand array
    let houseHand = this.state.houseHand.map((card) => {
      return card;
    });

    // Remove temporary card from houseHand and add hidden card
    houseHand.pop();
    houseHand.push(hidden.shift());

    // Update house score
    houseScore += value;

    this.setState({
      houseHand,
      hidden,
      houseScore,
      houseHidden: false,
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
              <button onClick={() => this.firstDeal()}>Deal</button>
            ) : (
              <div>
                <button onClick={() => this.dealPlayer()}>+1 Player</button>

                {this.state.houseHidden ? (
                  <button onClick={() => this.revealHouse()}>
                    Reveal House
                  </button>
                ) : (
                  <button onClick={() => this.dealHouse()}>+1 House</button>
                )}

                <button onClick={() => this.reshuffle()}>reshuffle</button>
              </div>
            )}
          </div>
          <div className="playerHand">
            <h2>Player</h2>
            <h3>Score: {this.state.playerScore % 10}</h3>
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
            <h3>Score: {this.state.houseScore % 10}</h3>
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
