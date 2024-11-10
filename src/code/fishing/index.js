const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const fishingDataPath = path.join(__dirname, '../../data/fishing/index.json');
const fishDataPath = path.join(__dirname, '../../data/fishing/fish.json');
const fishingData = JSON.parse(fs.readFileSync(fishingDataPath, 'utf-8'));
const fishData = JSON.parse(fs.readFileSync(fishDataPath, 'utf-8')).fish;
const fishingSessions = new Map();

async function startFishing(interaction) {
    // 이미 낚시 중인 경우
    if (fishingSessions.has(interaction.user.id)) {
        return interaction.reply({ content: '이미 낚시하고 있잖아!', ephemeral: true });
    }

    // 초기 임베드 메시지 생성
    const embed = new EmbedBuilder()
        .setTitle('낚시찌를 던졌다! 🎣')
        .setColor('#008080'); // 청록색

    // 버튼 생성
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('pull_line')
                .setLabel('낚싯줄 당기기')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎣'),
            new ButtonBuilder()
                .setCustomId('stop_fishing')
                .setLabel('그만두기')
                .setStyle(ButtonStyle.Secondary)
        );

    // 메시지 전송
    await interaction.reply({ embeds: [embed], components: [row] });
    const message = await interaction.fetchReply();

    // 세션 데이터 초기화
    const session = {
        interaction: interaction,
        message: message,
        updateCount: 0,
        isFishing: true,
        isHooked: false,
        isFake: false,
    };

    fishingSessions.set(interaction.user.id, session);

    // 낚시 진행 함수
    const fishingLoop = async () => {
        // 임의의 시간 (3~5초) 후 실행
        const timeout = Math.floor(Math.random() * 3000) + 3000;
        setTimeout(async () => {
            const currentSession = fishingSessions.get(interaction.user.id);
            if (!currentSession || !currentSession.isFishing) return;

            currentSession.updateCount += 1;

            // 5번 이상 업데이트되면 실패
            if (currentSession.updateCount > 5) {
                const failEmbed = new EmbedBuilder()
                    .setTitle('낚시 실패...')
                    .setDescription('터를 잘못 잡았나 본데?')
                    .setColor('#808080'); // 회색

                await currentSession.message.edit({ embeds: [failEmbed], components: [] });
                fishingSessions.delete(interaction.user.id);
                return;
            }

            // 랜덤으로 물고기 잡힘 여부 결정
            const hooked = Math.random() < 0.3; // 30% 확률로 물고기 걸림

            if (hooked) {
                // IsFake 결정
                const isFake = Math.random() < 0.5 ? 1 : 0;
                currentSession.isHooked = true;
                currentSession.isFake = isFake;

                if (isFake === 1) {
                    // 가짜 물고기
                    const fakeMessage = fishingData.fishing_fake[Math.floor(Math.random() * fishingData.fishing_fake.length)];

                    const fakeEmbed = new EmbedBuilder()
                        .setTitle('앗:exclamation::exclamation::exclamation:')
                        .setDescription(fakeMessage)
                        .setColor('#FF0000'); // 빨간색

                    await currentSession.message.edit({ embeds: [fakeEmbed], components: [] });
                } else {
                    // 진짜 물고기
                    const trueMessage = fishingData.fishing_true[Math.floor(Math.random() * fishingData.fishing_true.length)];

                    const trueEmbed = new EmbedBuilder()
                        .setTitle('앗:exclamation::exclamation::exclamation:')
                        .setDescription(trueMessage)
                        .setColor('#FF0000'); // 빨간색

                    await currentSession.message.edit({ embeds: [trueEmbed], components: [] });
                }

                // 버튼 추가
                const newRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('pull_line_real')
                            .setLabel('낚싯줄 당기기')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('🎣'),
                        new ButtonBuilder()
                            .setCustomId('stop_fishing_real')
                            .setLabel('그만두기')
                            .setStyle(ButtonStyle.Secondary)
                    );

                await currentSession.message.edit({ components: [newRow] });
                return;
            } else {
                // 물고기 기다리는 중...
                const waitMessage = fishingData.fishing_wait[Math.floor(Math.random() * fishingData.fishing_wait.length)];

                const waitEmbed = new EmbedBuilder()
                    .setTitle('물고기를 기다리는 중...')
                    .setDescription(waitMessage)
                    .setColor('#008080'); // 청록색

                await currentSession.message.edit({ embeds: [waitEmbed] });

                // 낚시 루프 계속
                fishingLoop();
            }
        }, timeout);
    };

    // 낚시 루프 시작
    fishingLoop();

    // 버튼 인터랙션 수집기 설정
    const filter = i => i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
        const currentSession = fishingSessions.get(interaction.user.id);
        if (!currentSession || !currentSession.isFishing) return;

        if (i.customId === 'pull_line' || i.customId === 'pull_line_real') {
            if (currentSession.isHooked) {
                if (currentSession.isFake) {
                    // 낚시 실패 메시지
                    const failEmbed = new EmbedBuilder()
                        .setTitle('낚시 실패...')
                        .setDescription('찌를 올렸지만 아무 것도 없었다...')
                        .setColor('#808080'); // 회색

                    await i.update({ embeds: [failEmbed], components: [] });
                } else {
                    // 낚시 성공 메시지
                    const fishType = Math.floor(Math.random() * 5); // 0 to 4
                    const fish = fishData.find(f => f.type === fishType);
                    const fishColorMap = {
                        0: '#A52A2A', // 갈색
                        1: '#808080', // 회색
                        2: '#32CD32', // 연두색
                        3: '#FFFF00', // 노란색
                        4: '#FFA500', // 주황색
                    };

                    const successEmbed = new EmbedBuilder()
                        .setTitle(`:fishing_pole_and_fish: ${fish.name}을 낚았다!`)
                        .setDescription('머랭!')
                        .setColor(fishColorMap[fishType]);

                    await i.update({ embeds: [successEmbed], components: [] });
                }
                // 세션 종료
                fishingSessions.delete(interaction.user.id);
                collector.stop();
            } else {
                // 물고기 안 걸림
                const failEmbed = new EmbedBuilder()
                    .setTitle('낚시 실패...')
                    .setDescription('찌를 올렸지만 아무 것도 없었다...')
                    .setColor('#808080'); // 회색

                await i.update({ embeds: [failEmbed], components: [] });
                fishingSessions.delete(interaction.user.id);
                collector.stop();
            }
        } else if (i.customId === 'stop_fishing' || i.customId === 'stop_fishing_real') {
            // 낚시 중지 메시지
            const stopEmbed = new EmbedBuilder()
                .setTitle('낚시 중지')
                .setDescription('낚싯대와 장비들을 정리했다.')
                .setColor('#808080'); // 회색

            await i.update({ embeds: [stopEmbed], components: [] });
            fishingSessions.delete(interaction.user.id);
            collector.stop();
        }
    });

    collector.on('end', () => {
        if (fishingSessions.has(interaction.user.id)) {
            // 시간 초과 시 낚시 실패 메시지
            const timeoutEmbed = new EmbedBuilder()
                .setTitle('낚시 실패...')
                .setDescription('터를 잘못 잡았나 본데?')
                .setColor('#808080'); // 회색

            interaction.editReply({ embeds: [timeoutEmbed], components: [] });
            fishingSessions.delete(interaction.user.id);
        }
    });
}

module.exports = { startFishing };
