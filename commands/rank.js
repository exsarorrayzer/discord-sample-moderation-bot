const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config.json");
const emojis = config.emojis;

const levelsPath = path.join(__dirname, "../pattern/levels.json");

function loadLevels() {
  if (!fs.existsSync(levelsPath)) return {};
  return JSON.parse(fs.readFileSync(levelsPath, "utf-8"));
}

function calculateLevel(xp) {
  return Math.floor(0.1 * Math.sqrt(xp));
}

module.exports = {
  name: "rank",
  aliases: ["sıralama", "leaderboard-level"],
  execute(message) {
    const levels = loadLevels();
    const users = Object.entries(levels).map(([id, data]) => ({
      id,
      xp: data.xp,
      level: calculateLevel(data.xp),
      messages: data.messages || 0
    }));

    users.sort((a, b) => b.xp - a.xp);
    const top10 = users.slice(0, 10);

    if (top10.length === 0) {
      return message.reply(`${emojis.info} Henüz seviye verisi yok.`);
    }

    let description = "";
    top10.forEach((user, index) => {
      const member = message.guild.members.cache.get(user.id);
      const username = member ? member.user.tag : "Bilinmeyen";
      const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
      description += `${medal} **${username}** - Seviye \`${user.level}\` (\`${user.xp} XP\`)\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle("🏆 Seviye Sıralaması")
      .setDescription(description)
      .setColor("#FFD700")
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
