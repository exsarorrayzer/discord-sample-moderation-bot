const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;

const warningsPath = path.join(__dirname, "../pattern/warnings.json");

function loadWarnings() {
  if (!fs.existsSync(warningsPath)) return {};
  return JSON.parse(fs.readFileSync(warningsPath, "utf-8"));
}

module.exports = {
  name: "history",
  aliases: ["cezalar", "infractions"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;

    if (!isAdmin && !isOwner) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.reply(`${emojis.warn} Bir kullanıcı belirtmelisiniz.`);
    }

    const warnings = loadWarnings();
    const userWarnings = warnings[target.id] || [];

    const embed = new EmbedBuilder()
      .setTitle(`📋 Ceza Geçmişi`)
      .setColor("#3498DB")
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`**Kullanıcı:** ${target.user.tag}\n**ID:** ${target.id}\n**Toplam Uyarı:** ${userWarnings.length}`)
      .setTimestamp();

    if (userWarnings.length === 0) {
      embed.addFields({ name: "✅ Temiz Kayıt", value: "Bu kullanıcının hiç uyarısı yok.", inline: false });
    } else {
      userWarnings.slice(0, 10).forEach((warn, index) => {
        const moderator = message.guild.members.cache.get(warn.moderator);
        const modTag = moderator ? moderator.user.tag : "Bilinmiyor";
        const date = new Date(warn.timestamp).toLocaleString("tr-TR");

        embed.addFields({
          name: `⚠️ Uyarı #${warn.id}`,
          value: `**Sebep:** ${warn.reason}\n**Yetkili:** ${modTag}\n**Tarih:** ${date}`,
          inline: false
        });
      });

      if (userWarnings.length > 10) {
        embed.setFooter({ text: `${userWarnings.length - 10} uyarı daha var...` });
      }
    }

    message.channel.send({ embeds: [embed] });
  }
};
