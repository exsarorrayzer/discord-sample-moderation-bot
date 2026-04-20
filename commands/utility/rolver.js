const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;
const yetkirole = require("../../pattern/yetkirole.json");

module.exports = {
  name: "rolver",
  aliases: ["rol-ver", "giverole"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;
    const hasRolVerPermission = yetkirole.rol_ver && message.member.roles.cache.has(yetkirole.rol_ver);

    if (!isAdmin && !isOwner && !hasRolVerPermission) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const target = message.mentions.members.first();
    const role = message.mentions.roles.first();

    if (!target || !role) {
      return message.reply(`${emojis.warn} Kullanım: \`.rolver @User @Role\``);
    }

    const protectedRoles = Object.values(yetkirole).filter(r => r && r !== "");
    if (protectedRoles.includes(role.id)) {
      return message.reply(`${emojis.error} Bu rol yetki rolü olarak tanımlanmış, verilemez.`);
    }

    if (role.position >= message.guild.members.me.roles.highest.position) {
      return message.reply(`${emojis.error} Bu rolü yönetmek için yeterli yetkim yok.`);
    }

    if (role.position >= message.member.roles.highest.position && !isOwner) {
      return message.reply(`${emojis.error} Bu rolü yönetmek için yeterli yetkiniz yok.`);
    }

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
  }
};
