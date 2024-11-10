const { SlashCommandBuilder } = require('discord.js');
const fishingLogic = require('../../code/fishing/index');

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName('낚시')
            .setDescription('낚시를 시작합니다.'),
        async execute(interaction) {
            await fishingLogic.startFishing(interaction);
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('ㄴㅅ')
            .setDescription('낚시를 시작합니다.'),
        async execute(interaction) {
            await fishingLogic.startFishing(interaction);
        },
    },
];
