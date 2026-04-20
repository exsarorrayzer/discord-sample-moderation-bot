const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;

const economyPath = path.join(__dirname, "../../pattern/economy.json");

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

const minerals = [
  { name: "🪨 Taş", value: 10 },
  { name: "⛏️ Demir", value: 30 },
  { name: "🥉 Bronz", value: 50 },
  { name: "🥈 Gümüş", value: 100 },
  { name: "🥇 Altın", value: 200 },
  { name: "💎 Elmas", value: 500 },
  { name: "💠 Safir", value: 400 },
  { name: "💚 Zümrüt", value: 450 },
  { name: "❤️ Yakut", value: 480 }
];

module.exports = {
  name: "mine",
  aliases: ["madencilik", "kaz"],
  execute(message) {
    const data = loadEconomy();
    if (!data[message.author.id]) {
      data[message.author.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0, lastMine: 0, inventory: [] };
    }

    const userData = data[message.author.id];
    const now = Date.now();
    const cooldown = 60 * 1000;

    if (now - userData.lastMine < cooldown) {
      const remaining = Math.ceil((cooldown - (now - userData.lastMine)) / 1000);
      return message.reply(`${emojis.time} Kazmanız hazır değil! \`${remaining}\` saniye bekleyin.`);
    }

    const found = minerals[Math.floor(Math.random() * minerals.length)];
    userData.balance += found.value;
    userData.lastMine = now;
    saveEconomy(data);

    const embed = new EmbedBuilder()
      .setTitle("⛏️ Madencilik")
      .setDescription(`${found.name} buldunuz!\n\n**+${found.value}** coin kazandınız!`)
      .setColor("#8B4513")
      .addFields({ name: "💰 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
