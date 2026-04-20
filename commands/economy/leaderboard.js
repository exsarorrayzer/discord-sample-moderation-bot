const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;

const economyPath = path.join(__dirname, "../pattern/economy.json");

function loadEconomy() {
  if (!fs.existsSync(economyPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(economyPath, "utf-8"));
}

module.exports = {
  name: "leaderboard",
  aliases: ["lb", "sıralama", "top"],
  execute(message) {
    const data = loadEconomy();
    const users = Object.entries(data).map(([id, userData]) => ({
      id,
      total: userData.balance + userData.bank
    }));

    users.sort((a, b) => b.total - a.total);
    const top10 = users.slice(0, 10);

    if (top10.length === 0) {
      return message.reply(`${emojis.info} Henüz ekonomi verisi yok.`);
    }

    let description = "";
    top10.forEach((user, index) => {
      const member = message.guild.members.cache.get(user.id);
      const username = member ? member.user.tag : "Bilinmeyen Kullanıcı";
      const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
      description += `${medal} **${username}** - \`${user.total}\` coin\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle("🏆 Ekonomi Sıralaması")
      .setDescription(description)
      .setColor("#FFD700")
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
