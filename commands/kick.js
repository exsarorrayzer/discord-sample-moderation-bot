const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../config.json");
const emojis = config.emojis;
const yetkirole = require("../pattern/yetkirole.json");
const logkanallari = require("../pattern/logkanallari.json");
const guard = require("../pattern/guard.js");

module.exports = {
  name: "kick",
  async execute(message, args) {
    const isOwner = message.author.id === process.env.OWNER_ID;
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const hasYetki = yetkirole.kick && message.member.roles.cache.has(yetkirole.kick);

    if (!isOwner && !isAdmin && !hasYetki) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz bulunmamaktadır.`);
    }

    if (!isOwner && await guard(message, "kick")) return;

    const targetMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!targetMember) return message.reply(`${emojis.warn} Lütfen atılacak bir kullanıcı belirtiniz.`);

    if (!targetMember.kickable) return message.reply(`${emojis.error} Bu kullanıcı atılamaz (Yetki yetersizliği).`);
    
    let reason = args.slice(1).join(" ") || "Sebep belirtilmedi.";
    if (reason.length > 500) reason = reason.substring(0, 500);

    await targetMember.kick(`${message.author.tag} tarafından: ${reason}`);

    const embed = new EmbedBuilder()
      .setAuthor({ name: "Kullanıcı Sunucudan Atıldı", iconURL: targetMember.user.displayAvatarURL({ dynamic: true }) })
      .setColor("#FFA500")
      .setThumbnail(targetMember.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: `${emojis.user} Kullanıcı`, value: `${targetMember.user.tag}\n(\`${targetMember.id}\`)`, inline: true },
        { name: `${emojis.shield} Yetkili`, value: `${message.author.tag}\n(\`${message.author.id}\`)`, inline: true },
        { name: `${emojis.reason} Sebep`, value: `\`\`\`${reason}\`\`\``, inline: false }
      )
      .setFooter({ text: `Kullanan: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });

    if (logkanallari.ban_log) {
      const logChannel = message.guild.channels.cache.get(logkanallari.ban_log);
      if (logChannel) logChannel.send({ embeds: [embed] });
    }
  }
};
