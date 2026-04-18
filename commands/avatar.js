const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");
const emojis = config.emojis;

module.exports = {
  name: "avatar",
  aliases: ["av", "pp", "pfp"],
  execute(message, args) {
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;

    const embed = new EmbedBuilder()
      .setTitle(`${target.user.tag} - Avatar`)
      .setColor("#3498DB")
      .setImage(target.user.displayAvatarURL({ dynamic: true, size: 4096 }))
      .setDescription(`[PNG](${target.user.displayAvatarURL({ extension: "png", size: 4096 })}) | [JPG](${target.user.displayAvatarURL({ extension: "jpg", size: 4096 })}) | [WEBP](${target.user.displayAvatarURL({ extension: "webp", size: 4096 })})`)
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
