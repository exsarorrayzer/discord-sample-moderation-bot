const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;

const autorolePath = path.join(__dirname, "../pattern/autorole.json");

function loadAutorole() {
  if (!fs.existsSync(autorolePath)) {
    fs.writeFileSync(autorolePath, JSON.stringify({}, null, 2));
    return {};
  }
  return JSON.parse(fs.readFileSync(autorolePath, "utf-8"));
}

function saveAutorole(data) {
  fs.writeFileSync(autorolePath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "autorole",
  aliases: ["otorol"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;

    if (!isAdmin && !isOwner) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const action = args[0]?.toLowerCase();

    if (action === "set") {
      const role = message.mentions.roles.first();
      if (!role) {
        return message.reply(`${emojis.warn} Bir rol belirtmelisiniz.\nÖrnek: \`.autorole set @Üye\``);
      }

      const autoroleData = loadAutorole();
      autoroleData.roleId = role.id;
      saveAutorole(autoroleData);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.success} Otorol Ayarlandı`)
        .setDescription(`Yeni üyelere otomatik olarak ${role} rolü verilecek.`)
        .setColor("#00FF00")
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    } else if (action === "off") {
      const autoroleData = loadAutorole();
      delete autoroleData.roleId;
      saveAutorole(autoroleData);

      message.reply(`${emojis.success} Otorol sistemi kapatıldı.`);
    } else {
      const autoroleData = loadAutorole();
      const roleId = autoroleData.roleId;

      if (!roleId) {
        return message.reply(`${emojis.info} Otorol sistemi aktif değil.\nAyarlamak için: \`.autorole set @Rol\``);
      }

      const role = message.guild.roles.cache.get(roleId);
      message.reply(`${emojis.info} Otorol: ${role || "Rol bulunamadı"}\n\nKapatmak için: \`.autorole off\``);
    }
  }
};
