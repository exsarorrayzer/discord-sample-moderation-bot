const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
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

const crimes = [
  { success: true, text: "Bir bankayı soydunuz ve {amount} coin çaldınız!", min: 500, max: 2000 },
  { success: true, text: "Bir mağazadan {amount} coin değerinde eşya çaldınız!", min: 200, max: 800 },
  { success: false, text: "Yakalandınız ve {amount} coin ceza ödediniz!", min: 300, max: 1000 },
  { success: true, text: "Bir ATM'yi hacklediniz ve {amount} coin kazandınız!", min: 400, max: 1500 },
  { success: false, text: "Polis sizi yakaladı! {amount} coin ceza!", min: 500, max: 1200 },
  { success: true, text: "Bir araba çaldınız ve {amount} coin'e sattınız!", min: 600, max: 1800 }
];

module.exports = {
  name: "crime",
  aliases: ["suç", "heist"],
  execute(message) {
    const data = loadEconomy();
    if (!data[message.author.id]) {
      data[message.author.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0, lastCrime: 0, inventory: [] };
    }

    const userData = data[message.author.id];
    const now = Date.now();
    const cooldown = 90 * 60 * 1000;

    if (now - userData.lastCrime < cooldown) {
      const remaining = cooldown - (now - userData.lastCrime);
      const minutes = Math.floor(remaining / (60 * 1000));

      return message.reply(`${emojis.time} Polis sizi arıyor! \`${minutes}\` dakika sonra tekrar suç işleyebilirsiniz.`);
    }

    const crime = crimes[Math.floor(Math.random() * crimes.length)];
    const amount = Math.floor(Math.random() * (crime.max - crime.min + 1)) + crime.min;

    userData.lastCrime = now;

    if (crime.success) {
      userData.balance += amount;
      saveEconomy(data);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.success} Suç Başarılı!`)
        .setDescription(crime.text.replace("{amount}", amount))
        .setColor("#00FF00")
        .addFields({ name: "💰 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    } else {
      userData.balance = Math.max(0, userData.balance - amount);
      saveEconomy(data);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.error} Yakalandınız!`)
        .setDescription(crime.text.replace("{amount}", amount))
        .setColor("#FF0000")
        .addFields({ name: "💰 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    }
  }
};
