const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const axios = require('axios')


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

class ItemWithPrice {
  constructor(item, price) {
    this.item = item;
    this.price = price;
  }
}

function getItemValue(item, prices) {
	console.log(item.appid);
	console.log(item['appid']);
	if(item.appid !== 730 && item.appid !== '730'){
		return 0;
	}
	if(prices[item.name]){
		return parseInt(prices[item.name]);
	}
	if(prices["Default"]){
		return parseInt(prices["Default"]);
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

const getMyInventory = () => {
	return new Promise((resolve, reject) => {
			manager.loadInventory(730, 2, true, (err, inventory) => {
			resolve(inventory);
		});
	})
}

async function tryCountering(offer, prices){


	let myInventory = await getMyInventory();
	//console.log(myInventory);
	let myItems = [];
	for (let i = 0; i < myInventory.length; i++) {
		myItems.push(new ItemWithPrice(myInventory[i], getItemValue(myInventory[i], prices)));
	}
	myItems.sort((a, b) => {
		return a['price']-b['price'];
 	});
	for (let i = 0; i < myItems.length; i++) {
		console.log(myItems[i]);
	}

	let counterOffer = offer.counter();
	let theirOfferValue = 0;
	let myOfferValue = 0;
	for (let i = 0; i < counterOffer.itemsToGive.length; i++) {
		myOfferValue += getItemValue(counterOffer.itemsToGive[i], prices);
	}
	for (let i = 0; i < counterOffer.itemsToReceive.length; i++) {
		theirOfferValue += getItemValue(counterOffer.itemsToReceive[i], prices);
	}
	let itemsToGive = counterOffer.itemsToGive;
	let index = 0;
	while(myOfferValue>=theirOfferValue){
		let itemToRemove = counterOffer.itemsToGive[0];
		console.log("removing item "+itemToRemove.name);
		counterOffer.removeMyItem(itemToRemove);
		myOfferValue -= getItemValue(itemToRemove, prices);
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
async function processOffer(offer){
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

	console.log("getting prices");
	const prices = await axios
	  .get('https://raw.githubusercontent.com/SteamSwapperBot/csgo/main/prices.json')
	  .then(res => {
	    return res.data;
	  })
	  .catch(error => {
	    console.error(error)
	  })
	  console.log(prices);
		console.log(prices['Default'])
		console.log(prices['Prisma Case'])

	let theirOfferValue = 0;
	let myOfferValue = 0;
	for (let i = 0; i < offer.itemsToGive.length; i++) {
		myOfferValue += getItemValue(offer.itemsToGive[i], prices);
	}
	for (let i = 0; i < offer.itemsToReceive.length; i++) {
		theirOfferValue += getItemValue(offer.itemsToReceive[i], prices);
	}
	console.log(offer);
	console.log("Their offer "+theirOfferValue);
	console.log("My offer "+myOfferValue);
	//console.log("I should "+ (theirOfferValue>myOfferValue?"accept":"reject"));


	if (theirOfferValue>myOfferValue){
		acceptOffer(offer);
		return;
	}
	else{
		tryCountering(offer, prices);
		return;
	}
}


manager.on('newOffer', offer => {
	processOffer(offer);
});
//node bot.js
//docker build -t turtleman270/steambot:1.0 .
