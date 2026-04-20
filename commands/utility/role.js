const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;
const yetkirole = require("../../pattern/yetkirole.json");

module.exports = {
  name: "role",
  aliases: ["rol"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;

    if (!isAdmin && !isOwner) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const action = args[0]?.toLowerCase();
    if (!action || !["ver", "al", "give", "remove"].includes(action)) {
      return message.reply(`${emojis.warn} Kullanım: \`.role ver/al @User @Role\``);
    }

    const target = message.mentions.members.first();
    const role = message.mentions.roles.first();

    if (!target || !role) {
      return message.reply(`${emojis.warn} Bir kullanıcı ve rol belirtmelisiniz.`);
    }

    if (role.position >= message.guild.members.me.highestRole.position) {
      return message.reply(`${emojis.error} Bu rolü yönetmek için yeterli yetkim yok.`);
    }

    if (role.position >= message.member.highestRole.position && !isOwner) {
      return message.reply(`${emojis.error} Bu rolü yönetmek için yeterli yetkiniz yok.`);
    }

    const isGive = ["ver", "give"].includes(action);

    if (isGive) {
      if (target.roles.cache.has(role.id)) {
        return message.reply(`${emojis.warn} Kullanıcıda bu rol zaten var.`);
      }

      target.roles.add(role).then(() => {
        const embed = new EmbedBuilder()
          .setTitle(`${emojis.success} Rol Verildi`)
          .setColor("#00FF00")
          .addFields(
            { name: "👤 Kullanıcı", value: `${target.user.tag}`, inline: true },
            { name: "🎭 Rol", value: `${role}`, inline: true },
            { name: "👮 Yetkili", value: `${message.author.tag}`, inline: true }
          )
          .setTimestamp();

        message.channel.send({ embeds: [embed] });
      }).catch(err => {
        message.reply(`${emojis.error} Rol verilirken bir hata oluştu: ${err.message}`);
      });
    } else {
      if (!target.roles.cache.has(role.id)) {
        return message.reply(`${emojis.warn} Kullanıcıda bu rol zaten yok.`);
      }

      target.roles.remove(role).then(() => {
        const embed = new EmbedBuilder()
          .setTitle(`${emojis.success} Rol Alındı`)
          .setColor("#FF0000")
          .addFields(
            { name: "👤 Kullanıcı", value: `${target.user.tag}`, inline: true },
            { name: "🎭 Rol", value: `${role}`, inline: true },
            { name: "👮 Yetkili", value: `${message.author.tag}`, inline: true }
          )
          .setTimestamp();

        message.channel.send({ embeds: [embed] });
      }).catch(err => {
        message.reply(`${emojis.error} Rol alınırken bir hata oluştu: ${err.message}`);
      });
    }
  }
};
