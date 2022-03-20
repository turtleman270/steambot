const util = require('./../utils.js');
const offer = require('./testOffers.js');
const items = require('./testItems.js');
const prices = require('./testPrices.js');

test('donations are accepted', () => {
  expect(util.shouldInstaAccept(offer.donationOffer)).toBe(true);
});

test('giving away items for free trades are declined', () => {
  expect(util.shouldInstaDecline(offer.givingItemAwayForFreeOffer)).toBe(true);
});

test('even trades are not insta accepted/declined', () => {
  expect(util.shouldInstaAccept(offer.evenOffer)).toBe(false);
  expect(util.shouldInstaDecline(offer.evenOffer)).toBe(false);
});

test('non-csgo items are worth nothing', () => {
  expect(util.getItemValue(items.rsPartyHat, prices.prices)).toBe(0);
});

test('unpriced items are worth the default price', () => {
  expect(util.getItemValue(items.unPricedItem, prices.prices)).toBe(2);
});

test('properly calculats negative value trades', () => {
  expect(util.myProfitFromOffer(offer.negativeValueTrade, prices.prices)).toBe(-147);
});

test('properly calculats positive value trades', () => {
  expect(util.myProfitFromOffer(offer.positiveValueTrade, prices.prices)).toBe(51);
});
