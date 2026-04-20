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
    const hasRolVerPermission = yetkirole.rol_ver && message.member.roles.cache.has(yetkirole.rol_ver);
    const hasRolAlPermission = yetkirole.rol_al && message.member.roles.cache.has(yetkirole.rol_al);

    const action = args[0]?.toLowerCase();
    const isGiveAction = ["ver", "give"].includes(action);
    const isRemoveAction = ["al", "remove"].includes(action);

    if (isGiveAction && !isAdmin && !isOwner && !hasRolVerPermission) {
      return message.reply(`${emojis.error} Rol vermek için yetkiniz yok.`);
    }

    if (isRemoveAction && !isAdmin && !isOwner && !hasRolAlPermission) {
      return message.reply(`${emojis.error} Rol almak için yetkiniz yok.`);
    }

    if (!isAdmin && !isOwner && !hasRolVerPermission && !hasRolAlPermission) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    if (!action || !["ver", "al", "give", "remove"].includes(action)) {
      return message.reply(`${emojis.warn} Kullanım: \`.role ver/al @User @Role\``);
    }

    const target = message.mentions.members.first();
    const role = message.mentions.roles.first();

    if (!target || !role) {
      return message.reply(`${emojis.warn} Bir kullanıcı ve rol belirtmelisiniz.`);
    }

    const protectedRoles = Object.values(yetkirole).filter(r => r && r !== "");
    if (protectedRoles.includes(role.id)) {
      return message.reply(`${emojis.error} Bu rol yetki rolü olarak tanımlanmış, verilemez veya alınamaz.`);
    }

    if (role.position >= message.guild.members.me.roles.highest.position) {
      return message.reply(`${emojis.error} Bu rolü yönetmek için yeterli yetkim yok.`);
    }

    if (role.position >= message.member.roles.highest.position && !isOwner) {
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
