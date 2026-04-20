const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;
const yetkirole = require("../../pattern/yetkirole.json");
const logkanallari = require("../../pattern/logkanallari.json");

module.exports = {
  name: "unmute",
  aliases: ["untimeout"],
  async execute(message, args) {
    const isOwner = message.author.id === process.env.OWNER_ID;
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const hasYetki = yetkirole.timeout && message.member.roles.cache.has(yetkirole.timeout);

    if (!isOwner && !isAdmin && !hasYetki) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const targetMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!targetMember) {
      return message.reply(`${emojis.warn} Bir kullanıcı belirtmelisiniz.`);
    }

    if (!targetMember.isCommunicationDisabled()) {
      return message.reply(`${emojis.error} Bu kullanıcı zaten susturulmamış.`);
    }

    let reason = args.slice(1).join(" ") || "Sebep belirtilmedi";
    if (reason.length > 500) reason = reason.substring(0, 500);

    try {
      await targetMember.timeout(null, `${message.author.tag} tarafından: ${reason}`);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.success} Susturma Kaldırıldı`)
        .setColor("#00FF00")
        .addFields(
          { name: "👤 Kullanıcı", value: `${targetMember.user.tag}`, inline: true },
          { name: "👮 Yetkili", value: `${message.author.tag}`, inline: true },
          { name: "📝 Sebep", value: `\`\`\`${reason}\`\`\``, inline: false }
        )
        .setThumbnail(targetMember.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      message.channel.send({ embeds: [embed] });

      if (logkanallari.timeout_log) {
        const logChannel = message.guild.channels.cache.get(logkanallari.timeout_log);
        if (logChannel) logChannel.send({ embeds: [embed] });
      }
    } catch (e) {
      message.reply(`${emojis.error} Susturma kaldırılırken bir hata oluştu: ${e.message}`);
    }
  }
};
