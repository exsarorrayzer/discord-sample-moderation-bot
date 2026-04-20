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
  name: "casehistory",
  aliases: ["ceza-gecmisi", "ch"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;

    if (!isAdmin && !isOwner) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const target = message.mentions.users.first() || message.client.users.cache.get(args[0]);
    
    if (!target) {
      return message.reply(`${emojis.warn} Kullanım: \`.casehistory @User\``);
    }

    const cases = loadCases();
    const userCases = Object.values(cases.cases).filter(c => c.userId === target.id && c.guildId === message.guild.id);

    if (userCases.length === 0) {
      return message.reply(`${emojis.info} Bu kullanıcının ceza geçmişi bulunamadı.`);
    }

    const caseList = userCases.slice(0, 10).map(c => {
      const date = new Date(c.timestamp).toLocaleDateString("tr-TR");
      return `**#${c.id}** | ${c.action} | ${date}\n└ ${c.reason.substring(0, 50)}${c.reason.length > 50 ? "..." : ""}`;
    }).join("\n\n");

    const embed = new EmbedBuilder()
      .setTitle(`📋 Ceza Geçmişi - ${target.tag}`)
      .setDescription(caseList)
      .setColor("#E74C3C")
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Toplam ${userCases.length} ceza kaydı` })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
