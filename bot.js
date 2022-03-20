const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');

const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
	steam: client,
	community: community,
	language: 'en'
});

const util = require('./utils.js');
const config = require('./config.json');
const prices = require('./prices.json');

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




function acceptOffer(offer){
	offer.accept((err, status) => {
		if (err) {
			console.log(err);
		} else {
			console.log(`Accepted offer. Status: ${status}.`);
		}
	});
	return "accepted";
}
function declineOffer(offer){
	offer.decline((err, status) => {
		if (err) {
			console.log(err);
		} else {
			console.log(`Rejected offer. Status: ${status}.`);
		}
	});
	return "rejected";
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
	for (let i = 0; i < myInventory.length; i++) {
		myInventory[i].price =  util.getItemValue(myInventory[i], prices);
	}
	myInventory.sort((a, b) => {
		return b.price-a.price;
 	});
	//for (let i = 0; i < myInventory.length; i+=5) {
	//	console.log(myInventory[i]);
	//}

	let counterOffer = offer.counter();
	let myProfit = util.myProfitFromOffer(counterOffer, prices);

	for (let i = 0; i < myInventory.length; i++) {
		if(myProfit<=0){
			let removed = counterOffer.removeMyItem(myInventory[i]);
			if(removed){
				myProfit+=myInventory[i].price;
			}
		}
		else if(myProfit>myInventory[i].price){
			let added = counterOffer.addMyItem(myInventory[i]);
			if(added){
				myProfit-=myInventory[i].price;
			}
		}
	}


	counterOffer.setMessage("Value of your items: "+util.getTheirItemValue(counterOffer, prices)+
													", Value of my items: "+(util.getTheirItemValue(counterOffer, prices)-myProfit));
	if(util.myProfitFromOffer(counterOffer, prices)>0){
		counterOffer.send((err, status) => {
			if (err) {
				console.log(err);
			} else {
				console.log(`Sent counter offer: ${status}.`);
			}
		});
		return "countered";
	}
	else{
		return declineOffer(offer);
	}
}



async function processOffer(offer){
	console.log('Offer came in');
	util.printOffer(offer);
	if ( util.shouldInstaDecline(offer)){
		return declineOffer(offer);
	}
	if(util.shouldInstaAccept(offer)){
		return acceptOffer(offer);
	}

	if(util.myProfitFromOffer(offer, prices)>0){
		return acceptOffer(offer);
	}
	else{
		return tryCountering(offer, prices);
	}
}


manager.on('newOffer', offer => {
	processOffer(offer);
});
