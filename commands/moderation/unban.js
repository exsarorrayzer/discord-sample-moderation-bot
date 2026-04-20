const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;
const yetkirole = require("../../pattern/yetkirole.json");
const logkanallari = require("../../pattern/logkanallari.json");
const guard = require("../../pattern/guard.js");

module.exports = {
  name: "unban",
  async execute(message, args) {
    const isOwner = message.author.id === process.env.OWNER_ID;
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const hasYetki = yetkirole.unban && message.member.roles.cache.has(yetkirole.unban);
    const isYonetim = yetkirole.yonetim && message.member.roles.cache.has(yetkirole.yonetim);

    if (!isOwner && !isAdmin && !hasYetki && !isYonetim) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz bulunmamaktadır.`);
    }

    if (!isOwner && await guard(message, "unban")) return;

    if (!args[0]) return message.reply(`${emojis.warn} Lütfen yasaklaması kaldırılacak bir kullanıcı ID girin.`);

    const userId = args[0];
    let reason = args.slice(1).join(" ") || "Sebep belirtilmedi.";
    if (reason.length > 500) reason = reason.substring(0, 500);

    try {
      const ban = await message.guild.bans.fetch(userId).catch(() => null);
      if (!ban) return message.reply(`${emojis.error} Bu kullanıcı bu sunucuda yasaklı değil veya ID geçersiz.`);

      await message.guild.members.unban(userId, `${message.author.tag} tarafından: ${reason}`);

      const embed = new EmbedBuilder()
        .setAuthor({ name: "Yasaklama Kaldırıldı", iconURL: ban.user.displayAvatarURL({ dynamic: true }) })
        .setColor("#00FF00")
        .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: `${emojis.user} Kullanıcı`, value: `${ban.user.tag}\n(\`${ban.user.id}\`)`, inline: true },
          { name: `${emojis.shield} Yetkili`, value: `${message.author.tag}\n(\`${message.author.id}\`)`, inline: true },
          { name: `${emojis.reason} Sebep`, value: `\`\`\`${reason}\`\`\``, inline: false }
        )
        .setFooter({ text: `Yasaklamayı Kaldıran: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
      if (logkanallari.ban_log) {
        const logChannel = message.guild.channels.cache.get(logkanallari.ban_log);
        if (logChannel) logChannel.send({ embeds: [embed] });
      }
    } catch (e) {
      return message.reply(`${emojis.error} Yasaklama kaldırılırken bir hata oluştu. Lütfen ID'yi kontrol edin.`);
    }
  }
};
