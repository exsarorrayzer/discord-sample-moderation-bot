const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;

module.exports = {
  name: "moveall",
  aliases: ["hepsini-tasi", "tasihepsi"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;

    if (!isAdmin && !isOwner) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    if (!message.member.voice.channel) {
      return message.reply(`${emojis.error} Bir ses kanalında olmalısınız.`);
    }

    const targetChannel = message.mentions.channels.first();
    
    if (!targetChannel || !targetChannel.isVoiceBased()) {
      return message.reply(`${emojis.warn} Kullanım: \`.moveall #ses-kanalı\``);
    }

    const sourceChannel = message.member.voice.channel;
    const members = sourceChannel.members.filter(m => !m.user.bot);

    if (members.size === 0) {
      return message.reply(`${emojis.warn} Kaynak kanalda taşınacak kullanıcı yok.`);
    }

    let moved = 0;
    let failed = 0;

    members.forEach(member => {
      member.voice.setChannel(targetChannel).then(() => {
        moved++;
      }).catch(() => {
        failed++;
      });
    });

    setTimeout(() => {
      const embed = new EmbedBuilder()
        .setTitle(`${emojis.success} Toplu Taşıma Tamamlandı`)
        .setColor("#00FF00")
        .addFields(
          { name: "📍 Kaynak", value: `${sourceChannel}`, inline: true },
          { name: "📍 Hedef", value: `${targetChannel}`, inline: true },
          { name: "✅ Taşınan", value: `\`${moved}\` kullanıcı`, inline: true },
          { name: "❌ Başarısız", value: `\`${failed}\` kullanıcı`, inline: true },
          { name: "👮 Yetkili", value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    }, 2000);
  }
};
