const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;

const economyPath = path.join(__dirname, "../../pattern/economy.json");
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;
const DAILY_REWARD = 500;

function loadEconomy() {
  if (!fs.existsSync(economyPath)) {
    fs.writeFileSync(economyPath, JSON.stringify({}, null, 2));
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(economyPath, "utf-8"));
  } catch (error) {
    console.error("Economy file parse error:", error);
    return {};
  }
}

function saveEconomy(data) {
  try {
    fs.writeFileSync(economyPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Economy file write error:", error);
  }
}

module.exports = {
  name: "daily",
  aliases: ["gunluk"],
  execute(message) {
    const data = loadEconomy();
    if (!data[message.author.id]) {
      data[message.author.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0 };
    }

    const userData = data[message.author.id];
    const now = Date.now();

    if (now - (userData.lastDaily || 0) < DAILY_COOLDOWN) {
      const remaining = DAILY_COOLDOWN - (now - userData.lastDaily);
      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

      return message.reply(`${emojis.time} Günlük ödülünüzü zaten aldınız! \`${hours}s ${minutes}d\` sonra tekrar alabilirsiniz.`);
    }

    userData.balance += DAILY_REWARD;
    userData.lastDaily = now;
    saveEconomy(data);

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.success} Günlük Ödül`)
      .setDescription(`**${DAILY_REWARD}** coin kazandınız!`)
      .setColor("#00FF00")
      .addFields({ name: "💰 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
