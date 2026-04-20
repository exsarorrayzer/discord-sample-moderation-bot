const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;

const levelsPath = path.join(__dirname, "../../pattern/levels.json");

function loadLevels() {
  if (!fs.existsSync(levelsPath)) {
    fs.writeFileSync(levelsPath, JSON.stringify({}, null, 2));
    return {};
  }
  return JSON.parse(fs.readFileSync(levelsPath, "utf-8"));
}

function saveLevels(data) {
  fs.writeFileSync(levelsPath, JSON.stringify(data, null, 2));
}

function calculateLevel(xp) {
  return Math.floor(0.1 * Math.sqrt(xp));
}

module.exports = {
  name: "setxp",
  aliases: ["xpset"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;

    if (!isAdmin && !isOwner) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const target = message.mentions.members.first();
    const amount = parseInt(args[1]);

    if (!target) {
      return message.reply(`${emojis.warn} Kullanım: \`.setxp @User <miktar>\`\nÖrnek: \`.setxp @User 1000\``);
    }

    if (isNaN(amount) || amount < 0 || !Number.isInteger(amount) || amount > Number.MAX_SAFE_INTEGER) {
      return message.reply(`${emojis.error} Geçerli bir XP miktarı girin! (0 veya üzeri)`);
    }

    if (amount > 10000000) {
      return message.reply(`${emojis.error} Maksimum XP: 10,000,000`);
    }

    const levels = loadLevels();
    if (!levels[target.id]) {
      levels[target.id] = { xp: 0, level: 0, messages: 0 };
    }

    const oldXP = levels[target.id].xp;
    const oldLevel = calculateLevel(oldXP);

    levels[target.id].xp = amount;
    const newLevel = calculateLevel(amount);

    saveLevels(levels);

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.success} XP Ayarlandı`)
      .setColor("#00FF00")
      .addFields(
        { name: "👤 Kullanıcı", value: `${target.user.tag}`, inline: true },
        { name: "⭐ Eski XP", value: `\`${oldXP}\` (Seviye ${oldLevel})`, inline: true },
        { name: "✨ Yeni XP", value: `\`${amount}\` (Seviye ${newLevel})`, inline: true }
      )
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
