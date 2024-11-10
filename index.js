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

// 상호작용 처리
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const commandFolders = fs.readdirSync(commandsPath);
  for (const folder of commandFolders) {
    const commandFolder = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(commandFolder).filter(file => file.endsWith('.js') || file.endsWith('.ts'));
    for (const file of commandFiles) {
      const filePath = path.join(commandFolder, file);
      const command = require(filePath);
      if (interaction.commandName === command.data.name) {
        try {
          await command.execute(interaction);
        } catch (error) {
          console.error(error);
          await interaction.reply({ content: '명령어 실행 중 오류가 발생했습니다.', ephemeral: true });
        }
        return;
      }
    }
  }
});

// 데이터베이스 초기화
const dbPath = path.resolve(__dirname, 'data', 'data.db');
const db = new sqlite3.Database(dbPath);

const initSql = fs.readFileSync(path.resolve(__dirname, 'data', 'data.db'), 'utf-8');
db.exec(initSql, (err) => {
  if (err) {
    console.error('데이터베이스 초기화 중 오류 발생:', err.message);
  } else {
    console.log('데이터베이스가 성공적으로 초기화되었습니다.');
  }
});

db.close();

// 봇 로그인
client.login(token);
