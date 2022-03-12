const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const Prices = require('./prices.json');

const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
	steam: client,
	community: community,
	language: 'en'
});
const config = require('./config.json')

const logOnOptions = {
  accountName: config.username,
  password: config.password,
  twoFactorCode: SteamTotp.generateAuthCode(config.shared_secret)
}

client.logOn(logOnOptions);

client.on('webSession', (sessionid, cookies) => {
  console.log('successfully logged on.');
  client.setPersona(2);
  client.gamesPlayed("Trading CSGO items");
  manager.setCookies(cookies);

  community.setCookies(cookies);
  community.startConfirmationChecker(10000, config.identity_secret);

});

function getItemValue(item) {
	if(item.appid !== 730){
		return 0;
	}
	if(Prices[item.name]){
		return Prices[item.name];
	}
  return 1;
}

function containsNonCsItems(offer){
	for (let i = 0; i < offer.itemsToGive.length; i++) {
		if(offer.itemsToGive[i].appid !== 730){
			return true;
		}
	}
	return false;
}

function acceptOffer(offer){
	offer.accept((err, status) => {
		if (err) {
			console.log(err);
		} else {
			console.log(`Accepted offer. Status: ${status}.`);
		}
	});
}
function declineOffer(offer){
	offer.decline((err, status) => {
		if (err) {
			console.log(err);
		} else {
			console.log(`Rejected offer. Status: ${status}.`);
		}
	});
}
function tryCountering(offer){
	let counterOffer = offer.counter()
	let theirOfferValue = 0;
	let myOfferValue = 0;
	for (let i = 0; i < counterOffer.itemsToGive.length; i++) {
		myOfferValue += getItemValue(counterOffer.itemsToGive[i]);
	}
	for (let i = 0; i < counterOffer.itemsToReceive.length; i++) {
		theirOfferValue += getItemValue(counterOffer.itemsToReceive[i]);
	}
	let itemsToGive = counterOffer.itemsToGive;
	let index = 0;
	while(myOfferValue>=theirOfferValue){
		let itemToRemove = counterOffer.itemsToGive[0];
		console.log("removing item "+itemToRemove.name);
		counterOffer.removeMyItem(itemToRemove);
		myOfferValue -= getItemValue(itemToRemove);
		index++;
	}
	counterOffer.setMessage("Value of your items: "+theirOfferValue+", Value of my items: "+myOfferValue);
	counterOffer.send((err, status) => {
		if (err) {
			console.log(err);
		} else {
			console.log(`Sent counter offer: ${status}.`);
		}
	});
}
function processOffer(offer){
	console.log('Offer came in');
	//console.log(offer);
	if ( offer.isGlitched() || offer.state === 11){
		console.log("got a glitched offer");
		declineOffer(offer);
	}
	if(offer.itemsToGive.length == 0){
		acceptOffer(offer);
		return;
	}
	if(offer.itemsToReceive.length == 0){
		declineOffer(offer);
		return;
	}
	if(containsNonCsItems(offer)){
		declineOffer(offer);
		return;
	}

	let theirOfferValue = 0;
	let myOfferValue = 0;
	for (let i = 0; i < offer.itemsToGive.length; i++) {
		myOfferValue += getItemValue(offer.itemsToGive[i]);
	}
	for (let i = 0; i < offer.itemsToReceive.length; i++) {
		theirOfferValue += getItemValue(offer.itemsToReceive[i]);
	}
	//console.log(offer);
	console.log("Their offer "+theirOfferValue);
	console.log("My offer "+myOfferValue);
	//console.log("I should "+ (theirOfferValue>myOfferValue?"accept":"reject"));


	if (theirOfferValue>myOfferValue){
		acceptOffer(offer);
		return;
	}
	else{
		tryCountering(offer);
		return;
	}
}


manager.on('newOffer', offer => {
	processOffer(offer);
});
//node bot.js
//docker build -t turtleman270/steambot:1.0 .
