const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../config.json");
const emojis = config.emojis;

const activeGames = new Map();

module.exports = {
  name: "rps",
  aliases: ["taşkağıtmakas", "tkm"],
  execute(message, args) {
    if (activeGames.has(message.author.id)) {
      return message.reply(`${emojis.error} Zaten aktif bir oyununuz var!`);
    }

    const embed = new EmbedBuilder()
      .setTitle("✊✋✌️ Taş Kağıt Makas")
      .setDescription("Seçiminizi yapın!")
      .setColor("#3498DB")
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`rps_rock_${message.author.id}`)
          .setLabel("Taş")
          .setEmoji("✊")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`rps_paper_${message.author.id}`)
          .setLabel("Kağıt")
          .setEmoji("✋")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`rps_scissors_${message.author.id}`)
          .setLabel("Makas")
          .setEmoji("✌️")
          .setStyle(ButtonStyle.Danger)
      );

    message.channel.send({ embeds: [embed], components: [row] }).then(msg => {
      activeGames.set(message.author.id, { messageId: msg.id });

      setTimeout(() => {
        if (activeGames.has(message.author.id)) {
          activeGames.delete(message.author.id);
          msg.edit({ 
            content: `${emojis.error} Süre doldu!`, 
            embeds: [], 
            components: [] 
          }).catch(() => {});
        }
      }, 30000);
    });
  }
};
