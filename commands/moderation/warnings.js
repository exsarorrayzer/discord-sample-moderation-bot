const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;

const warningsPath = path.join(__dirname, "../pattern/warnings.json");

function loadWarnings() {
  if (!fs.existsSync(warningsPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(warningsPath, "utf-8"));
}

module.exports = {
  name: "warnings",
  aliases: ["uyarilar", "infractions"],
  execute(message, args) {
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;

    const warnings = loadWarnings();
    const userWarnings = warnings[target.id] || [];

    if (userWarnings.length === 0) {
      return message.reply(`${emojis.success} **${target.user.tag}** adlı kullanıcının hiç uyarısı yok.`);
    }

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.warn} Uyarı Geçmişi`)
      .setColor("#FFA500")
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`**Kullanıcı:** ${target.user.tag} (${target.id})\n**Toplam Uyarı:** ${userWarnings.length}`)
      .setTimestamp();

    userWarnings.forEach((warn, index) => {
      const moderator = message.guild.members.cache.get(warn.moderator);
      const modTag = moderator ? moderator.user.tag : "Bilinmiyor";
      const date = new Date(warn.timestamp).toLocaleString("tr-TR");

      embed.addFields({
        name: `Uyarı #${warn.id}`,
        value: `**Sebep:** ${warn.reason}\n**Yetkili:** ${modTag}\n**Tarih:** ${date}`,
        inline: false
      });
    });

    message.channel.send({ embeds: [embed] });
  }
};
