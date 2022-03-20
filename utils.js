function shouldInstaAccept(offer) {
  if(offer.itemsToGive.length == 0){
    return true;
  }
  return false;
}

function shouldInstaDecline(offer) {
  if ( offer.isGlitched() || offer.state === 11 || offer.itemsToReceive.length == 0){
    return true;
  }
  return false;
}

function myProfitFromOffer(offer, prices){
  let totalProfit = 0;

  for (let i = 0; i < offer.itemsToGive.length; i++) {
    totalProfit -= getItemValue(offer.itemsToGive[i], prices);
  }
  for (let i = 0; i < offer.itemsToReceive.length; i++) {
    totalProfit += getItemValue(offer.itemsToReceive[i], prices);
  }
  return totalProfit;
}

function getItemValue(item, prices) {
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

function printOffer(offer){
	console.log("My items: ");
	for (let i = 0; i < offer.itemsToGive.length; i++) {
		console.log(offer.itemsToGive[i].name);
	}
	console.log("");
	console.log("Their items: ");
	for (let i = 0; i < offer.itemsToReceive.length; i++) {
		console.log(offer.itemsToReceive[i].name);
	}
}

function getTheirItemValue(offer, prices){
	let value = 0;
	for (let i = 0; i < offer.itemsToReceive.length; i++) {
		value += getItemValue(offer.itemsToReceive[i], prices);
	}
	return value;
}

function getMyItemValue(offer, prices){
	let value = 0;
	for (let i = 0; i < offer.itemsToGive.length; i++) {
		value += getItemValue(offer.itemsToGive[i], prices);
	}
	return value;
}


function containsNonCsItems(offer){
	for (let i = 0; i < offer.itemsToGive.length; i++) {
		if(offer.itemsToGive[i].appid !== 730){
			return true;
		}
	}
	return false;
}


module.exports = {
    shouldInstaAccept,
    shouldInstaDecline,
    myProfitFromOffer,
    printOffer,
    getTheirItemValue,
    getMyItemValue,
    getItemValue
};
