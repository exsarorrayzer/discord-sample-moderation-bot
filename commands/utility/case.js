const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;

const casesPath = path.join(__dirname, "../../pattern/cases.json");

function loadCases() {
  if (!fs.existsSync(casesPath)) {
    return { counter: 0, cases: {} };
  }
  return JSON.parse(fs.readFileSync(casesPath, "utf-8"));
}

module.exports = {
  name: "case",
  aliases: ["vaka", "ceza-bilgi"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;

    if (!isAdmin && !isOwner) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const caseId = parseInt(args[0]);
    
    if (!caseId || isNaN(caseId)) {
      return message.reply(`${emojis.warn} Kullanım: \`.case <ID>\``);
    }

    const cases = loadCases();
    const caseData = cases.cases[caseId];

    if (!caseData) {
      return message.reply(`${emojis.error} Bu ID'ye sahip bir case bulunamadı.`);
    }

    const embed = new EmbedBuilder()
      .setTitle(`📋 Case #${caseId}`)
      .setColor("#3498DB")
      .addFields(
        { name: "⚖️ İşlem", value: `\`${caseData.action}\``, inline: true },
        { name: "👤 Kullanıcı", value: `<@${caseData.userId}> (\`${caseData.userId}\`)`, inline: true },
        { name: "👮 Yetkili", value: `<@${caseData.moderatorId}>`, inline: true },
        { name: "📝 Sebep", value: `\`\`\`${caseData.reason}\`\`\``, inline: false },
        { name: "🕒 Tarih", value: `<t:${Math.floor(caseData.timestamp / 1000)}:F>`, inline: true }
      )
      .setTimestamp();

    if (caseData.duration) {
      const durationMinutes = Math.floor(caseData.duration / 60000);
      embed.addFields({ name: "⏱️ Süre", value: `\`${durationMinutes}\` dakika`, inline: true });
    }

    message.channel.send({ embeds: [embed] });
  }
};
