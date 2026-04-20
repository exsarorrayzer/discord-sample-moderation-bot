const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;
const yetkirole = require("../../pattern/yetkirole.json");

const warningsPath = path.join(__dirname, "../../pattern/warnings.json");

function loadWarnings() {
  if (!fs.existsSync(warningsPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(warningsPath, "utf-8"));
}

function saveWarnings(data) {
  fs.writeFileSync(warningsPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "clearwarns",
  aliases: ["uyarisil", "removewarn"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;
    const hasRole = yetkirole.warn && message.member.roles.cache.has(yetkirole.warn);

    if (!isAdmin && !isOwner && !hasRole) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.reply(`${emojis.warn} Bir kullanıcı belirtmelisiniz.`);
    }

    const warnings = loadWarnings();
    const userWarnings = warnings[target.id] || [];

    if (userWarnings.length === 0) {
      return message.reply(`${emojis.info} **${target.user.tag}** adlı kullanıcının zaten uyarısı yok.`);
    }

    const warnCount = userWarnings.length;
    delete warnings[target.id];
    saveWarnings(warnings);

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.success} Uyarılar Temizlendi`)
      .setColor("#00FF00")
      .addFields(
        { name: "👤 Kullanıcı", value: `${target.user.tag} (${target.id})`, inline: true },
        { name: "👮 Yetkili", value: `${message.author.tag}`, inline: true },
        { name: "🗑️ Silinen Uyarı", value: `\`${warnCount}\``, inline: true }
      )
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
