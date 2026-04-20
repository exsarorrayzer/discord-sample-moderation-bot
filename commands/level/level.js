const { EmbedBuilder } = require("discord.js");
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

function calculateLevel(xp) {
  return Math.floor(0.1 * Math.sqrt(xp));
}

function xpForNextLevel(level) {
  return Math.pow((level + 1) / 0.1, 2);
}

module.exports = {
  name: "level",
  aliases: ["seviye", "lvl"],
  execute(message, args) {
    const target = message.mentions.members.first() || message.member;
    const levels = loadLevels();

    if (!levels[target.id]) {
      levels[target.id] = { xp: 0, level: 0, messages: 0 };
    }

    const userData = levels[target.id];
    const currentLevel = calculateLevel(userData.xp);
    const nextLevelXP = xpForNextLevel(currentLevel);
    const currentLevelXP = currentLevel > 0 ? xpForNextLevel(currentLevel - 1) : 0;
    const progress = userData.xp - currentLevelXP;
    const needed = nextLevelXP - currentLevelXP;
    const percentage = Math.floor((progress / needed) * 100);

    const progressBar = "█".repeat(Math.floor(percentage / 10)) + "░".repeat(10 - Math.floor(percentage / 10));

    const embed = new EmbedBuilder()
      .setTitle(`📊 Seviye Bilgisi`)
      .setColor("#3498DB")
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "👤 Kullanıcı", value: target.user.tag, inline: true },
        { name: "📈 Seviye", value: `\`${currentLevel}\``, inline: true },
        { name: "⭐ XP", value: `\`${userData.xp}\``, inline: true },
        { name: "📊 İlerleme", value: `${progressBar} \`${percentage}%\`\n\`${progress}/${needed} XP\``, inline: false },
        { name: "💬 Mesaj Sayısı", value: `\`${userData.messages || 0}\``, inline: true }
      )
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
