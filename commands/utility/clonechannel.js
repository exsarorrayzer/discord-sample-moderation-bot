const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;

module.exports = {
  name: "clonechannel",
  aliases: ["kanalklonla", "clone"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;

    if (!isAdmin && !isOwner) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const targetChannel = message.mentions.channels.first() || message.channel;

    targetChannel.clone().then(cloned => {
      const embed = new EmbedBuilder()
        .setTitle(`${emojis.success} Kanal Klonlandı`)
        .setColor("#00FF00")
        .addFields(
          { name: "📍 Orijinal Kanal", value: `${targetChannel}`, inline: true },
          { name: "📍 Yeni Kanal", value: `${cloned}`, inline: true },
          { name: "👮 Yetkili", value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    }).catch(err => {
      message.reply(`${emojis.error} Kanal klonlanırken hata oluştu: ${err.message}`);
    });
  }
};
