const items = require('./testItems.js');

const donationOffer = {
    isGlitched(params) {
      return false;
    },
    id: '1',
    message: '',
    state: 2,
    itemsToGive: [],
    itemsToReceive: [
      items.evilGeniusesSticker
    ]
}

const givingItemAwayForFreeOffer = {
    isGlitched(params) {
      return false;
    },
    id: '1',
    message: '',
    state: 2,
    itemsToGive: [
      items.evilGeniusesSticker
    ],
    itemsToReceive: []
}

const evenOffer = {
    isGlitched(params) {
      return false;
    },
    id: '1',
    message: '',
    state: 2,
    itemsToGive: [
      items.evilGeniusesSticker
    ],
    itemsToReceive: [
      items.evilGeniusesSticker
    ]
}

const negativeValueTrade = {
    itemsToGive: [
      items.item100,
      items.item50,
      items.item50
    ],
    itemsToReceive: [
      items.item50,
      items.item1,
      items.item1,
      items.item1
    ]
}

const positiveValueTrade = {
    itemsToGive: [
      items.item50,
      items.item1
    ],
    itemsToReceive: [
      items.item100,
      items.unPricedItem
    ]
}




module.exports = {
    donationOffer,
    givingItemAwayForFreeOffer,
    evenOffer,
    negativeValueTrade,
    positiveValueTrade
};
