class Card {
  constructor(cardNumber) {
    this.cardNumber = cardNumber; // Card number starts from 1 being Ace, up to 13 being King.
  }

  toString() {
    var moddedCardNumber = this.cardNumber % 13;
    if (moddedCardNumber == 1) {
      return "A";
    } else if (moddedCardNumber == 11) {
      return "J";
    } else if (moddedCardNumber == 12) {
      return "Q";
    } else if (moddedCardNumber == 0) {
      return "K";
    } else {
      return moddedCardNumber;
    }
  }

  get value() {
    var moddedCardNumber = this.cardNumber % 13;
    if (moddedCardNumber == 1) {
      return 11;
    } else if (moddedCardNumber == 11 || moddedCardNumber == 12 || moddedCardNumber == 0) {
      return 10;
    } else {
      return moddedCardNumber;
    }
  }

  isAce() {
    return this.cardNumber % 13 == 1;
  }
}

class ShoeManager {
  constructor(numDecks, gameMode) {
    this.numDecks = numDecks;
    this.gameMode = gameMode;

    this.shoe = [];

    this.newShoe();
  }

  get remainingCards() {
    return this.shoe.length;
  }

  newShoe() {
    this.shoe = Array.from({length: this.numDecks * 52}, (x, i) => new Card(i + 1));
    this.shuffle();
    console.log("New shoe created from " + this.numDecks + " deck(s): " + this.shoe);
  }

  shuffle() {
    this.shoe = this.shoe
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  draw(numCards) {
    if (this.shoe.length < numCards) {
      console.log("Not enough cards. Making new shoe.");
      this.newShoe();
    }
    return Array.from({length: numCards}, x => this.shoe.pop());
  }
}

class GameManager {

  constructor(gameMode, numDecks, minCardsBeforeShuffle, forceShowFullDealerHand) {
    this.gameMode = gameMode;
    this.numDecks = numDecks;
    this.minCardsBeforeShuffle = minCardsBeforeShuffle;
    this.forceShowFullDealerHand = forceShowFullDealerHand;

    this.playerHand = [];
    this.dealerHand = [];
    this.partialDealerHand = true;
    this.outcome = "?";

    this.shoeManager = new ShoeManager(numDecks, gameMode);
  }

  get remainingCardsInShoe() {
    return this.shoeManager.remainingCards;
  }

  newRound() {
    if (this.remainingCardsInShoe < this.minCardsBeforeShuffle) {
      console.log("Shoe too small. Making new shoe.");
      this.shoeManager.newShoe();
    }
    this.playerHand = this.shoeManager.draw(2);
    this.dealerHand = this.shoeManager.draw(2);
    console.log("Player hand: " + this.playerHand);
    console.log("Dealer hand: " + this.dealerHand);
    this.partialDealerHand = true;
    this.outcome = "?";
  }

  showPlayerHand() {
    if (!this.dealerHand.length) {
      return "empty"
    } else {
      return this.playerHand.toString();
    }
  }

  showDealerHand() {
    if (!this.dealerHand.length) {
      return "empty"
    } else if (this.forceShowFullDealerHand || !this.partialDealerHand) {
      return this.dealerHand.toString();
    } else {
      return this.dealerHand.slice(0, 1).toString() + ",?";
    }
  }

  bestHandValue(hand) {
    var totalValue = 0;
    var numAces = 0;
    for (const card of hand) {
      if (card.value == 11) {
        numAces += 1;
      }
      totalValue += card.value;
      if (totalValue > 21 && numAces > 0) {
        totalValue -= 10;
        numAces -= 1;
      }
    }
    return totalValue;
  }

  // returns true player busts.
  playerActionHit() {
    this.playerHand.push(...this.shoeManager.draw(1));
    var bestHandValue = this.bestHandValue(this.playerHand);
    if (bestHandValue > 21) {
      this.setOutcome();
      return true;
    }
    return false;
  }

  dealerActionPlayUntilFinish() {
    this.partialDealerHand = false;
    while (this.bestHandValue(this.dealerHand) < 17) {
      this.dealerHand.push(...this.shoeManager.draw(1));
    }
    console.log("final dealer hand " + this.bestHandValue(this.dealerHand));
    this.setOutcome();
  }

  setOutcome() {
    var playerScore = this.bestHandValue(this.playerHand);
    var dealerScore = this.bestHandValue(this.dealerHand);
    if (playerScore > 21) {
      this.outcome = "Player bust. Dealer wins.";
    } else if (dealerScore <= 21 && dealerScore > playerScore) {
      this.outcome = "Dealer wins.";
    } else if (dealerScore > 21) {
      this.outcome = "Dealer bust. Player wins!";
    } else if (playerScore > dealerScore) {
      this.outcome = "Player wins!";
    } else {
      this.outcome = "Push (Tie)!!";
    }
    this.outcome += " Player: " + playerScore + ", Dealer: " + dealerScore;
  }
}
