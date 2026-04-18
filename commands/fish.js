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

const fish = [
  { name: "🐟 Küçük Balık", value: 20 },
  { name: "🐠 Tropikal Balık", value: 50 },
  { name: "🐡 Balon Balığı", value: 80 },
  { name: "🦈 Köpekbalığı", value: 200 },
  { name: "🐙 Ahtapot", value: 150 },
  { name: "🦞 Istakoz", value: 180 },
  { name: "🦀 Yengeç", value: 100 },
  { name: "🐚 İstiridye", value: 120 },
  { name: "⭐ Deniz Yıldızı", value: 90 },
  { name: "🗑️ Çöp", value: 5 }
];

module.exports = {
  name: "fish",
  aliases: ["balık", "balıktut"],
  execute(message) {
    const data = loadEconomy();
    if (!data[message.author.id]) {
      data[message.author.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0, lastFish: 0, inventory: [] };
    }

    const userData = data[message.author.id];
    const now = Date.now();
    const cooldown = 45 * 1000;

    if (now - userData.lastFish < cooldown) {
      const remaining = Math.ceil((cooldown - (now - userData.lastFish)) / 1000);
      return message.reply(`${emojis.time} Oltanız hazır değil! \`${remaining}\` saniye bekleyin.`);
    }

    const caught = fish[Math.floor(Math.random() * fish.length)];
    userData.balance += caught.value;
    userData.lastFish = now;
    saveEconomy(data);

    const embed = new EmbedBuilder()
      .setTitle("🎣 Balık Tutma")
      .setDescription(`${caught.name} yakaladınız!\n\n**+${caught.value}** coin kazandınız!`)
      .setColor("#3498DB")
      .addFields({ name: "💰 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
