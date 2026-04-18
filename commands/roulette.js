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
  name: "roulette",
  aliases: ["rulet"],
  execute(message, args) {
    const data = loadEconomy();
    if (!data[message.author.id]) {
      data[message.author.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0, inventory: [] };
    }

    const userData = data[message.author.id];
    const bet = parseInt(args[0]);
    const choice = args[1]?.toLowerCase();

    if (!bet || isNaN(bet) || bet < 10 || !Number.isInteger(bet) || bet < 0) {
      return message.reply(`${emojis.warn} Kullanım: \`!roulette <bahis> <red/black/green>\`\nÖrnek: \`!roulette 100 red\``);
    }

    if (bet > 5000 || bet > Number.MAX_SAFE_INTEGER) {
      return message.reply(`${emojis.error} Maksimum bahis 5,000 coin!`);
    }

    if (!choice || !["red", "black", "green", "kırmızı", "siyah", "yeşil"].includes(choice)) {
      return message.reply(`${emojis.error} Geçerli renkler: red, black, green`);
    }

    if (userData.balance < bet) {
      return message.reply(`${emojis.error} Yeterli bakiyeniz yok! Bakiyeniz: \`${userData.balance}\` coin`);
    }

    userData.balance -= bet;
    saveEconomy(data);

    const weights = [48, 48, 4];
    const random = Math.random() * 100;
    let result;

    if (random < weights[0]) {
      result = "red";
    } else if (random < weights[0] + weights[1]) {
      result = "black";
    } else {
      result = "green";
    }

    const normalizedChoice = choice === "kırmızı" ? "red" : choice === "siyah" ? "black" : choice === "yeşil" ? "green" : choice;

    let winAmount = 0;

    if (result === normalizedChoice) {
      if (result === "green") {
        winAmount = bet * 15;
      } else {
        winAmount = bet * 2;
      }
      userData.balance += winAmount;
      saveEconomy(data);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.success} Kazandınız!`)
        .setDescription(`🎡 Sonuç: **${result === "red" ? "🔴 Kırmızı" : result === "black" ? "⚫ Siyah" : "🟢 Yeşil"}**\n\n**+${winAmount}** coin kazandınız!`)
        .setColor("#00FF00")
        .addFields({ name: "💰 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle(`${emojis.error} Kaybettiniz!`)
        .setDescription(`🎡 Sonuç: **${result === "red" ? "🔴 Kırmızı" : result === "black" ? "⚫ Siyah" : "🟢 Yeşil"}**\n\n**-${bet}** coin kaybettiniz!`)
        .setColor("#FF0000")
        .addFields({ name: "💰 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    }
  }
};
