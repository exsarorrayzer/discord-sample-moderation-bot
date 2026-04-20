const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;
const yetkirole = require("../../pattern/yetkirole.json");

module.exports = {
  name: "slowmode",
  aliases: ["yavaşmod", "sm"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;
    const hasRole = yetkirole.slowmode && message.member.roles.cache.has(yetkirole.slowmode);

    if (!isAdmin && !isOwner && !hasRole) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const channel = message.mentions.channels.first() || message.channel;
    const duration = args[0];

    if (!duration) {
      return message.reply(`${emojis.warn} Bir süre belirtmelisiniz. (0-21600 saniye)\nÖrnek: \`.slowmode 10\``);
    }

    const seconds = parseInt(duration);

    if (isNaN(seconds) || seconds < 0 || seconds > 21600 || !Number.isInteger(seconds)) {
      return message.reply(`${emojis.error} Geçersiz süre! 0 ile 21600 saniye arasında bir tam sayı girin.`);
    }

    channel.setRateLimitPerUser(seconds).then(() => {
      const embed = new EmbedBuilder()
        .setTitle(`${emojis.time} Yavaş Mod ${seconds === 0 ? "Kapatıldı" : "Ayarlandı"}`)
        .setColor(seconds === 0 ? "#FF0000" : "#00FF00")
        .addFields(
          { name: "📍 Kanal", value: `${channel}`, inline: true },
          { name: "⏱️ Süre", value: `\`${seconds} saniye\``, inline: true },
          { name: "👮 Yetkili", value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    }).catch(err => {
      message.reply(`${emojis.error} Yavaş mod ayarlanırken bir hata oluştu: ${err.message}`);
    });
  }
};
