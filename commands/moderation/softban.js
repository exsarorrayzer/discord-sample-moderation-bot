const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;
const yetkirole = require("../../pattern/yetkirole.json");

module.exports = {
  name: "softban",
  aliases: ["yumusakban"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;
    const hasRole = yetkirole.ban && message.member.roles.cache.has(yetkirole.ban);

    if (!isAdmin && !isOwner && !hasRole) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.reply(`${emojis.warn} Bir kullanıcı belirtmelisiniz.`);
    }

    if (target.id === message.author.id) {
      return message.reply(`${emojis.error} Kendinizi banlayamazsınız.`);
    }

    if (target.id === message.guild.ownerId) {
      return message.reply(`${emojis.error} Sunucu sahibini banlayamazsınız.`);
    }

    let reason = args.slice(1).join(" ") || "Sebep belirtilmedi";
    if (reason.length > 500) reason = reason.substring(0, 500);

    target.ban({ deleteMessageSeconds: 604800, reason: reason }).then(() => {
      message.guild.members.unban(target.id).then(() => {
        const embed = new EmbedBuilder()
          .setTitle(`${emojis.success} Softban Uygulandı`)
          .setColor("#FFA500")
          .addFields(
            { name: "👤 Kullanıcı", value: `${target.user.tag} (${target.id})`, inline: true },
            { name: "👮 Yetkili", value: `${message.author.tag}`, inline: true },
            { name: "📝 Sebep", value: `\`\`\`${reason}\`\`\``, inline: false }
          )
          .setDescription("Kullanıcı banlandı ve hemen kaldırıldı. Mesajları silindi.")
          .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
          .setTimestamp();

        message.channel.send({ embeds: [embed] });
      });
    }).catch(err => {
      message.reply(`${emojis.error} Softban uygulanırken bir hata oluştu: ${err.message}`);
    });
  }
};
