const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const { buildFishingSpot } = require('../../code/fishing/building');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('낚시터')
    .setDescription('낚시터를 건설합니다.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('건설')
        .setDescription('새로운 낚시터를 건설합니다.')
    ),
  async execute(interaction) {
    await buildFishingSpot(interaction);
  },
};
