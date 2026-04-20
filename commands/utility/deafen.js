const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;
const yetkirole = require("../../pattern/yetkirole.json");

module.exports = {
  name: "deafen",
  aliases: ["sagirlas", "deaf"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;
    const hasRole = yetkirole.timeout && message.member.roles.cache.has(yetkirole.timeout);

    if (!isAdmin && !isOwner && !hasRole) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    
    if (!target) {
      return message.reply(`${emojis.warn} Kullanım: \`.deafen @User\``);
    }

    if (!target.voice.channel) {
      return message.reply(`${emojis.error} Kullanıcı bir ses kanalında değil.`);
    }

    if (target.id === message.author.id) {
      return message.reply(`${emojis.error} Kendinizi sağırlaştıramazsınız.`);
    }

    if (target.id === message.guild.ownerId) {
      return message.reply(`${emojis.error} Sunucu sahibini sağırlaştıramazsınız.`);
    }

    if (target.roles.highest.position >= message.member.roles.highest.position && !isOwner) {
      return message.reply(`${emojis.error} Bu kullanıcı sizinle aynı veya daha yüksek yetkiye sahip.`);
    }

    const shouldDeafen = !target.voice.serverDeaf;

    target.voice.setDeaf(shouldDeafen).then(() => {
      const embed = new EmbedBuilder()
        .setTitle(`${emojis.success} Kullanıcı ${shouldDeafen ? "Sağırlaştırıldı" : "Sağırlaştırma Kaldırıldı"}`)
        .setColor(shouldDeafen ? "#FF0000" : "#00FF00")
        .addFields(
          { name: "👤 Kullanıcı", value: `${target.user.tag}`, inline: true },
          { name: "🎧 Kanal", value: `${target.voice.channel}`, inline: true },
          { name: "👮 Yetkili", value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    }).catch(err => {
      message.reply(`${emojis.error} İşlem sırasında hata oluştu: ${err.message}`);
    });
  }
};
