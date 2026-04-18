const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const ms = require("ms");
const config = require("../config.json");
const emojis = config.emojis;
const yetkirole = require("../pattern/yetkirole.json");
const logkanallari = require("../pattern/logkanallari.json");
const guard = require("../pattern/guard.js");

module.exports = {
  name: "mute",
  aliases: ["timeout", "sustur"],
  async execute(message, args) {
    const isOwner = message.author.id === process.env.OWNER_ID;
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const hasYetki = yetkirole.timeout && message.member.roles.cache.has(yetkirole.timeout);

    if (!isOwner && !isAdmin && !hasYetki) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz bulunmamaktadır.`);
    }

    if (!isOwner && await guard(message, "mute")) return;

    const targetMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!targetMember) return message.reply(`${emojis.warn} Lütfen susturulacak bir kullanıcı belirtiniz.`);

    const durationStr = args[1];
    if (!durationStr) return message.reply(`${emojis.warn} Lütfen bir süre belirtiniz (Örn: 10m, 1h, 1d).`);

    const duration = ms(durationStr);
    if (!duration || duration < 10000 || duration > 2419200000) {
      return message.reply(`${emojis.error} Geçersiz süre. 10 saniye ile 28 gün arasında bir süre giriniz.`);
    }

    let reason = args.slice(2).join(" ") || "Sebep belirtilmedi.";
    if (reason.length > 500) reason = reason.substring(0, 500);

    try {
      await targetMember.timeout(duration, `${message.author.tag} tarafından: ${reason}`);

      const embed = new EmbedBuilder()
        .setAuthor({ name: "Kullanıcı Susturuldu", iconURL: targetMember.user.displayAvatarURL({ dynamic: true }) })
        .setColor("#F1C40F")
        .setThumbnail(targetMember.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: `${emojis.user} Kullanıcı`, value: `${targetMember.user.tag}\n(\`${targetMember.id}\`)`, inline: true },
          { name: `${emojis.shield} Yetkili`, value: `${message.author.tag}\n(\`${message.author.id}\`)`, inline: true },
          { name: `${emojis.time} Süre`, value: `\`${durationStr}\``, inline: true },
          { name: `${emojis.reason} Sebep`, value: `\`\`\`${reason}\`\`\``, inline: false }
        )
        .setFooter({ text: `Kullanan: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });

      if (logkanallari.timeout_log) {
        const logChannel = message.guild.channels.cache.get(logkanallari.timeout_log);
        if (logChannel) logChannel.send({ embeds: [embed] });
      }
    } catch (e) {
      console.error(e);
      return message.reply(`${emojis.error} Kullanıcı susturulurken bir hata oluştu.`);
    }
  }
};
