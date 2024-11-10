/* i hate typescript */
import { Client, GatewayIntentBits } from 'discord.js';
const token = "TOKEN_INSERT"
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
