const SteamUser = require('steam-user');
const client = new SteamUser();
const config = require('./config.json')

const logOnOptions = {
  accountName: config.username,
  password: config.password
}

client.logOn(logOnOptions);

client.on('loggedOn', () => {
  console.log('successfully logged on.');
  client.setPersona(2);
  client.gamesPlayed("Surfing youtube 🏄");
});
