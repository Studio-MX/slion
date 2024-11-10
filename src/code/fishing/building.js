const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 낚시터를 건설하는 함수
function buildFishingSpot(interaction) {
  const dbPath = path.resolve(__dirname, '../../data/data.db');
  const db = new sqlite3.Database(dbPath);

  // 랜덤으로 features와 seasons 할당
  const fishingData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../data/fishing/index.json')));
  const featuresOptions = fishingData.features;
  const seasonsOptions = fishingData.seasons;

  const randomFeature = featuresOptions[Math.floor(Math.random() * featuresOptions.length)];
  const randomSeason = seasonsOptions[Math.floor(Math.random() * seasonsOptions.length)];

  // 채널 고유번호
  const channelId = interaction.channelId;

  // 서버 소유자
  const ownerId = interaction.guild.ownerId;

  // fishing 테이블에 삽입
  const insertQuery = `INSERT INTO fishing (number, features, fame, seasons, tier, owner) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(insertQuery, [channelId, randomFeature.value, 0, randomSeason.value, 1, ownerId], function(err) {
    if (err) {
      console.error(err.message);
      interaction.reply({ content: '낚시터 건설에 실패했습니다.', ephemeral: true });
    } else {
      interaction.reply({ content: '새로운 낚시터가 성공적으로 건설되었습니다!', ephemeral: false });
    }
  });

  db.close();
}

module.exports = { buildFishingSpot };
