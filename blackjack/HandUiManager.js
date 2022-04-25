class HandUiManager {
  constructor() {
    this.currPositionList = [];
    this.endPositionList = [];
    this.positionIncrementList = [];

    this.currOpacityList = [];
    this.endOpacityList = [];
    this.opacityIncrementList = [];

    this.numCards = 0;
  }

  resetUiTracker() {
    this.currPositionList = [];
    this.endPositionList = [];
    this.positionIncrementList = [];

    this.currOpacityList = [];
    this.endOpacityList = [];
    this.opacityIncrementList = [];

    this.numCards = 0;
  }

  addCard(currPosition, endPosition, positionIncrement, currOpacity, endOpacity, opacityIncrement) {
    this.currPositionList.push(currPosition);
    this.endPositionList.push(endPosition);
    this.positionIncrementList.push(positionIncrement);
    this.currOpacityList.push(currOpacity);
    this.endOpacityList.push(endOpacity);
    this.opacityIncrementList.push(opacityIncrement);

    this.numCards += 1;
    return this.numCards;
  }

  getNextPositionList() {
    for (let i = 0; i < this.numCards; i++) {
      if (this.currPositionList[i] != this.endPositionList[i]) {
        this.currPositionList[i] += this.positionIncrementList[i];
      }
    }
    return this.currPositionList;
  }

  getNextOpacityList() {
    for (let i = 0; i < this.numCards; i++) {
      if (this.currOpacityList[i] != this.endOpacityList[i]) {
        this.currOpacityList[i] += this.opacityIncrementList[i];
      }
    }
    return this.currOpacityList;
  }

  getFinalPositionList() {
    this.currPositionList = this.endPositionList;
    return this.currPositionList;
  }

  getFinalOpacityList() {
    this.currOpacityList = this.endOpacityList;
    return this.getFinalOpacityList;
  }

  doneAnimating() {
    for (let i = 0; i < this.numCards; i++) {
      if (this.currPositionList[i] != this.endPositionList[i]) {
        return false;
      }
    }
    for (let i = 0; i < this.numCards; i++) {
      if (this.currOpacityList[i] != this.endOpacityList[i]) {
        return false;
      }
    }
    return true;
  }
}
