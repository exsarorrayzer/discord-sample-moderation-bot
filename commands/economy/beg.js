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

const responses = [
  { success: true, text: "Bir hayırsever size {amount} coin verdi!", min: 10, max: 100 },
  { success: true, text: "Yerde {amount} coin buldunuz!", min: 5, max: 50 },
  { success: true, text: "Biri cebinden {amount} coin düşürdü!", min: 20, max: 80 },
  { success: false, text: "Kimse size para vermedi..." },
  { success: false, text: "Güvenlik sizi kovdu..." },
  { success: true, text: "Yaşlı bir teyze size {amount} coin verdi!", min: 15, max: 60 }
];

module.exports = {
  name: "beg",
  aliases: ["dilenci", "dilenmek"],
  execute(message, args) {
    const data = loadEconomy();
    if (!data[message.author.id]) {
      data[message.author.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0, lastBeg: 0, inventory: [] };
    }

    const userData = data[message.author.id];
    const now = Date.now();
    const cooldown = 30 * 1000;

    if (now - userData.lastBeg < cooldown) {
      const remaining = Math.ceil((cooldown - (now - userData.lastBeg)) / 1000);
      return message.reply(`${emojis.time} \`${remaining}\` saniye sonra tekrar dilenebilirsiniz.`);
    }

    const response = responses[Math.floor(Math.random() * responses.length)];
    userData.lastBeg = now;

    if (response.success) {
      const amount = Math.floor(Math.random() * (response.max - response.min + 1)) + response.min;
      userData.balance += amount;
      saveEconomy(data);

      const embed = new EmbedBuilder()
        .setDescription(`${emojis.success} ${response.text.replace("{amount}", amount)}`)
        .setColor("#00FF00")
        .addFields({ name: "💰 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    } else {
      saveEconomy(data);

      const embed = new EmbedBuilder()
        .setDescription(`${emojis.error} ${response.text}`)
        .setColor("#FF0000")
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    }
  }
};
