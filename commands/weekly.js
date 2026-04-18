const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config.json");
const emojis = config.emojis;

const economyPath = path.join(__dirname, "../pattern/economy.json");

function loadEconomy() {
  if (!fs.existsSync(economyPath)) {
    fs.writeFileSync(economyPath, JSON.stringify({}, null, 2));
    return {};
  }
  return JSON.parse(fs.readFileSync(economyPath, "utf-8"));
}

function saveEconomy(data) {
  fs.writeFileSync(economyPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "weekly",
  aliases: ["haftalık"],
  execute(message) {
    const data = loadEconomy();
    if (!data[message.author.id]) {
      data[message.author.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0 };
    }

    const userData = data[message.author.id];
    const now = Date.now();
    const cooldown = 7 * 24 * 60 * 60 * 1000;

    if (now - userData.lastWeekly < cooldown) {
      const remaining = cooldown - (now - userData.lastWeekly);
      const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
      const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

      return message.reply(`${emojis.time} Haftalık ödülünüzü zaten aldınız! \`${days}g ${hours}s\` sonra tekrar alabilirsiniz.`);
    }

    const reward = 3500;
    userData.balance += reward;
    userData.lastWeekly = now;
    saveEconomy(data);

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.success} Haftalık Ödül`)
      .setDescription(`**${reward}** coin kazandınız!`)
      .setColor("#00FF00")
      .addFields({ name: "💰 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
