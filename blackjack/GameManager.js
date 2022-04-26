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

  drawForPlayer(numCards) {
    var randomCard;
    switch (this.gameMode) {
      case "practiceSurrenders":
        randomCard = new Card(getRandomInt(4, 14));
        var secondCard;
        if (randomCard.value == 4) {
          secondCard = new Card(1);
        } else if (randomCard.value == 5) {
          secondCard = new Card(getRandomInt(11, 14));
        } else if (randomCard.value == 6) {
          secondCard = new Card(getRandomInt(11, 13));
        } else {
          secondCard = new Card(getRandomInt(15, 16) - randomCard.value);
        }
        return [randomCard, secondCard];
      case "practiceSplits":
        randomCard = new Card(getRandomInt(1, 13));
        return [randomCard, randomCard];
      case "practiceSoftTotals":
        randomCard = new Card(getRandomInt(2, 13));
        var randomAce = new Card(1);
        return getRandomInt(0, 1) == 0 ? [randomAce, randomCard] : [randomCard, randomAce];
      case "practiceHardTotals":
        randomCard = new Card(getRandomInt(2, 13));
        var randomSecondCard = new Card(getRandomInt(2, 13));
        return [randomCard, randomSecondCard];
      case "standard":
      case "practiceFull":
      default:
        return this.draw(numCards);
    }
  }

  drawForDealer(numCards) {
    switch (this.gameMode) {
      case "practiceSurrenders":
      case "practiceSplits":
      case "practiceSoftTotals":
      case "practiceHardTotals":
        return [new Card(getRandomInt(1, 13)), new Card(getRandomInt(1, 13))];
      case "standard":
      case "practiceFull":
      default:
        return this.draw(numCards);
    }
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

  constructor(gameMode, numDecks, minCardsBeforeShuffle, forceShowFullDealerHand, playerCanSurrender) {
    this.gameMode = gameMode;
    this.numDecks = numDecks;
    this.minCardsBeforeShuffle = minCardsBeforeShuffle;
    this.forceShowFullDealerHand = forceShowFullDealerHand;
    this.playerCanSurrender = playerCanSurrender;

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
    this.playerHand = this.shoeManager.drawForPlayer(2);
    this.dealerHand = this.shoeManager.drawForDealer(2);
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
      this.outcome = "You bust. Dealer wins.";
    } else if (dealerScore <= 21 && dealerScore > playerScore) {
      this.outcome = "Dealer wins.";
    } else if (dealerScore > 21) {
      this.outcome = "Dealer bust. You win!";
    } else if (playerScore > dealerScore) {
      this.outcome = "You win!";
    } else {
      this.outcome = "Push (Tie)!!";
    }
    this.outcome += " You: " + playerScore + ", Dealer: " + dealerScore;
  }

  getOptimalPlayerAction() {
    var dealerFaceUpCardValue = this.dealerHand[0].value;
    var bestHandValue = this.bestHandValue(this.playerHand);
    // Surrenders
    if (this.playerCanSurrender && this.playerHand.length == 2) {
      if (bestHandValue == 16 && [9, 10, 11].includes(dealerFaceUpCardValue)) {
        return "surrender";
      }
      if (bestHandValue == 15 && dealerFaceUpCardValue == 10) {
        return "surrender";
      }
    }
    if (this.playerHand.length == 2 && this.playerHand[0].value == this.playerHand[1].value) {
      switch (this.playerHand[0].value) {
        case 11:
          return "split";
        case 10:
          return "stand";
        case 9:
          return [2, 3, 4, 5, 6, 8, 9].includes(dealerFaceUpCardValue) ? "split" : "stand";
        case 8:
          return "split";
        case 6:
          return [2, 3, 4, 5, 6].includes(dealerFaceUpCardValue) ? "split" : "hit";
        case 5:
          return [2, 3, 4, 5, 6, 7, 8, 9].includes(dealerFaceUpCardValue) ? "double" : "hit";
        case 4:
          return [5, 6].includes(dealerFaceUpCardValue) ? "split" : "hit";
        case 7:
        case 3:
        case 2:
          return [2, 3, 4, 5, 6, 7].includes(dealerFaceUpCardValue) ? "split" : "hit";
        default:
          return "invalid";
      }
    }
    return "something else";
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
