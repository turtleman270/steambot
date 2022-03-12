const axios = require('axios')

const prices = axios
  .get('https://raw.githubusercontent.com/SteamSwapperBot/csgo/main/prices.json')
  .then(res => {
    let prices = res.data
    console.log(prices['Danger Zone Case']);
    //let j = JSON.parse(prices)
    return res.data;
  })
  .catch(error => {
    console.error(error)
  })
  console.log(prices);
//console.log(await (prices));
/*
//const Fetch = require('node-fetch');

import fetch from 'node-fetch';


var d = JSON.parse(await(fetch('https://raw.githubusercontent.com/SteamSwapperBot/csgo/main/prices.json')
    .then(res => res.text()).then(data => {
      return data;
    }).catch(err => console.log('fetch error', err))));

console.log(d);
*/
