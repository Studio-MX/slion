import {TextChannel} from 'discord.js';
export function createCommandResult(content, success = true, ephemeral = false) {
    return {content, success, ephemeral};
}
export function isTextChannel(interaction) {
    return interaction.channel instanceof TextChannel;
}
export function requireTextChannel(interaction) {
    if (!isTextChannel(interaction)) {
        return createCommandResult('이 채널에서는 이 명령어를 사용할 수 없습니다!', false, true);
    }
    return null;
}
