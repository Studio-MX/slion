/* 역시 난 타입스크립트가 싫어 */
const { Client, GatewayIntentBits } = require('discord.js');
const token = "TOKEN";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`해당 계정에 로그인하였습니다: ${client.user?.tag}!`);
});

client.on('messageCreate', (message) => {
  if (message.content === '시론아 이프') {
    message.channel.send('머랭!');
  }
  if (message.content === '시론아 머랭') {
    message.channel.send('쿠키!');
  }
});

// 봇 로그인
client.login(token);
