const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;
const yetkirole = require("../../pattern/yetkirole.json");
const logkanallari = require("../../pattern/logkanallari.json");
const guard = require("../../pattern/guard.js");

const MAX_REASON_LENGTH = 500;
const USER_ID_REGEX = /^\d{17,19}$/;

module.exports = {
  name: "ban",
  async execute(message, args) {
    const isOwner = message.author.id === process.env.OWNER_ID;
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const hasYetki = yetkirole.ban && message.member.roles.cache.has(yetkirole.ban);
    const isYonetim = yetkirole.yonetim && message.member.roles.cache.has(yetkirole.yonetim);

    if (!isOwner && !isAdmin && !hasYetki && !isYonetim) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz bulunmamaktadır.`);
    }

    if (!isOwner && await guard(message, "ban")) return;

    if (!args[0]) {
      return message.reply(`${emojis.warn} Lütfen yasaklanacak bir kullanıcı etiketleyin veya ID girin.`);
    }

    const targetMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    let reason = args.slice(1).join(" ") || "Sebep belirtilmedi.";
    reason = reason.substring(0, MAX_REASON_LENGTH);

    if (targetMember) {
      if (targetMember.id === message.author.id) {
        return message.reply(`${emojis.error} Kendinizi yasaklayamazsınız.`);
      }

      if (targetMember.id === message.guild.ownerId) {
        return message.reply(`${emojis.error} Sunucu sahibini yasaklayamazsınız.`);
      }

      if (targetMember.roles.highest.position >= message.member.roles.highest.position && !isOwner) {
        return message.reply(`${emojis.error} Bu kullanıcı sizinle aynı veya daha yüksek yetkiye sahip.`);
      }

      if (!targetMember.bannable) {
        return message.reply(`${emojis.error} Bu kullanıcı yasaklanamaz (Yetki yetersizliği).`);
      }
      
      await targetMember.ban({ reason: `${message.author.tag} tarafından: ${reason}` });

      const embed = new EmbedBuilder()
        .setAuthor({ name: "Kullanıcı Yasaklandı", iconURL: targetMember.user.displayAvatarURL({ dynamic: true }) })
        .setColor("#FF0000")
        .setThumbnail(targetMember.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: `${emojis.user} Kullanıcı`, value: `${targetMember.user.tag}\n(\`${targetMember.id}\`)`, inline: true },
          { name: `${emojis.shield} Yetkili`, value: `${message.author.tag}\n(\`${message.author.id}\`)`, inline: true },
          { name: `${emojis.reason} Sebep`, value: `\`\`\`${reason}\`\`\``, inline: false }
        )
        .setFooter({ text: `Banlayan: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
      
      if (logkanallari.ban_log) {
        const logChannel = message.guild.channels.cache.get(logkanallari.ban_log);
        if (logChannel) logChannel.send({ embeds: [embed] }).catch(console.error);
      }
    } else {
      const userId = args[0];
      
      if (!USER_ID_REGEX.test(userId)) {
        return message.reply(`${emojis.error} Geçersiz kullanıcı ID formatı.`);
      }

      try {
        await message.guild.members.ban(userId, { reason: `${message.author.tag} tarafından (Force Ban): ${reason}` });
        
        const embed = new EmbedBuilder()
          .setTitle("🛡️ FORCE BAN (ID BAN)")
          .setColor("#8B0000")
          .setDescription(`Sunucuda bulunmayan bir kullanıcı başarıyla yasaklandı.`)
          .addFields(
            { name: `${emojis.id} ID`, value: `\`${userId}\``, inline: true },
            { name: `${emojis.shield} Yetkili`, value: `${message.author.tag}`, inline: true },
            { name: `${emojis.reason} Sebep`, value: `\`\`\`${reason}\`\`\``, inline: false }
          )
          .setTimestamp();

        message.channel.send({ embeds: [embed] });
        
        if (logkanallari.ban_log) {
          const logChannel = message.guild.channels.cache.get(logkanallari.ban_log);
          if (logChannel) logChannel.send({ embeds: [embed] }).catch(console.error);
        }
      } catch (e) {
        console.error("Ban error:", e);
        return message.reply(`${emojis.error} Belirtilen ID geçersiz veya kullanıcı zaten yasaklı.`);
      }
    }
  }
};
