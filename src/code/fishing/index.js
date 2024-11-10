const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.resolve(__dirname, '../../data/data.db');
async function startFishing(interaction) {
const db = new sqlite3.Database(dbPath);

  db.get('SELECT * FROM fishing WHERE number = ? LIMIT 1', [interaction.channelId], (err, row) => {
    if (err) {
      console.error(err.message);
      interaction.reply({ content: '오류가 발생했어...\n 오류 정보:' + err, ephemeral: true });
      return;
    }

    if (!row) {
      interaction.reply({ content: '이 채널에 등록된 낚시터가 없습니다. 먼저 낚시터를 건설해주세요.', ephemeral: true });
      return;
    }

    // 낚시 시작 임베드 메시지
    const embed = new MessageEmbed()
      .setTitle('**낚시찌를 던졌다! :fishing_pole_and_fish:**')
      .setColor('TEAL');

    interaction.reply({ embeds: [embed], fetchReply: true }).then(async (message) => {
      let updateCount = 0;
      const maxUpdates = 5;
      let isFishing = true;

      const rowButtons = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('pull_line')
            .setLabel(':fishing_pole_and_fish: 낚싯줄 당기기')
            .setStyle('PRIMARY'),
          new MessageButton()
            .setCustomId('stop_fishing')
            .setLabel('그만두기')
            .setStyle('DANGER'),
        );

      const filter = i => i.user.id === interaction.user.id;
      const collector = message.createMessageComponentCollector({ filter, time: 30000 });

      collector.on('collect', async i => {
        if (i.customId === 'pull_line') {
          if (!isFishing) return;
          isFishing = false;
          collector.stop('pulled');
          const failEmbed = new MessageEmbed()
            .setTitle('**낚시 실패...**')
            .setDescription('찌를 올렸지만 아무 것도 없었다...')
            .setColor('GREY');
          await i.update({ embeds: [failEmbed], components: [] });
        } else if (i.customId === 'stop_fishing') {
          if (!isFishing) return;
          isFishing = false;
          collector.stop('stopped');
          const stopEmbed = new MessageEmbed()
            .setTitle('**낚시 중지**')
            .setDescription('낚싯대와 장비들을 정리했다.')
            .setColor('GREY');
          await i.update({ embeds: [stopEmbed], components: [] });
        }
      });

      collector.on('end', async (collected, reason) => {
        if (reason === 'time' && isFishing) {
          // 최대 업데이트 횟수 초과 시
          const timeoutEmbed = new MessageEmbed()
            .setTitle('**낚시 실패...**')
            .setDescription('터를 잘못 잡았나 본데?')
            .setColor('GREY');
          await message.edit({ embeds: [timeoutEmbed], components: [] });
        }
      });

      // 낚시 진행 로직
      const fishingInterval = setInterval(() => {
        if (!isFishing) {
          clearInterval(fishingInterval);
          return;
        }
        updateCount += 1;
        if (updateCount > maxUpdates) {
          clearInterval(fishingInterval);
          if (isFishing) {
            const timeoutEmbed = new MessageEmbed()
              .setTitle('**낚시 실패...**')
              .setDescription('터를 잘못 잡았나 본데?')
              .setColor('GREY');
            message.edit({ embeds: [timeoutEmbed], components: [] });
          }
          return;
        }

        const db = new sqlite3.Database(dbPath);
        db.get('SELECT * FROM fishing WHERE number = ? LIMIT 1', [interaction.channelId], (err, row) => {
          if (err) {
            console.error(err.message);
            clearInterval(fishingInterval);
            return;
          }

          const fishingData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../data/fishing/index.json')));
          if (!row) {
            clearInterval(fishingInterval);
            return;
          }

          // 물고기 잡힘 여부 결정
          const fishCaught = Math.random() < 0.3; // 30% 확률로 물고기 잡힘

          if (!fishCaught) {
            // 물고기 기다리는 중
            const waitMessages = fishingData.fishing_wait;
            const randomWait = waitMessages[Math.floor(Math.random() * waitMessages.length)];

            const waitEmbed = new MessageEmbed()
              .setTitle('**물고기를 기다리는 중...**')
              .setDescription(randomWait)
              .setColor('TEAL');

            message.edit({ embeds: [waitEmbed], components: [rowButtons] });
          } else {
            // 물고기 잡힘
            const isFake = Math.random() < 0.5 ? 1 : 0;

            if (isFake === 1) {
              // 가짜 물고기
              const fakeMessages = fishingData.fishing_fake;
              const randomFake = fakeMessages[Math.floor(Math.random() * fakeMessages.length)];

              const fakeEmbed = new MessageEmbed()
                .setTitle('**앗 :exclamation::exclamation::exclamation:**')
                .setDescription(randomFake)
                .setColor('RED');

              message.edit({ embeds: [fakeEmbed], components: [] });
              clearInterval(fishingInterval);
            } else {
              // 진짜 물고기
              const fishData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../data/fishing/fish.json')));
              const fishTypes = ['trash', 'common', 'uncommon', 'epic', 'legendery'];
              const randomType = fishTypes[Math.floor(Math.random() * fishTypes.length)];
              const fish = fishData.fish.find(f => f.type === randomType);

              const typeColors = {
                'trash': 'BROWN',
                'common': 'GREY',
                'uncommon': 'GREEN',
                'epic': 'YELLOW',
                'legendery': 'ORANGE',
              };

              const successEmbed = new MessageEmbed()
                .setTitle(`**:fishing_pole_and_fish: ${fish.name}을 낚았다!**`)
                .setDescription('머랭!')
                .setColor(typeColors[randomType]);

              message.edit({ embeds: [successEmbed], components: [] });
              clearInterval(fishingInterval);
            }
          }
        });

        db.close();
      }, 4000); // 4초 간격
    });
  });

  db.close();
}

module.exports = { startFishing };
