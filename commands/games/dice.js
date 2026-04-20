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

module.exports = {
  name: "dice",
  aliases: ["zar", "roll"],
  execute(message, args) {
    const data = loadEconomy();
    if (!data[message.author.id]) {
      data[message.author.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0, inventory: [] };
    }

    const userData = data[message.author.id];
    const bet = parseInt(args[0]);
    const guess = parseInt(args[1]);

    if (!bet || isNaN(bet) || bet < 1 || !Number.isInteger(bet) || bet < 0) {
      return message.reply(`${emojis.warn} Kullanım: \`.dice <bahis> <tahmin(1-6)>\`\nÖrnek: \`.dice 100 5\``);
    }

    if (bet > 5000 || bet > Number.MAX_SAFE_INTEGER) {
      return message.reply(`${emojis.error} Maksimum bahis 5,000 coin!`);
    }

    if (!guess || isNaN(guess) || guess < 1 || guess > 6 || !Number.isInteger(guess)) {
      return message.reply(`${emojis.error} 1 ile 6 arasında bir tam sayı tahmin edin!`);
    }

    if (userData.balance < bet) {
      return message.reply(`${emojis.error} Yeterli bakiyeniz yok! Bakiyeniz: \`${userData.balance}\` coin`);
    }

    userData.balance -= bet;
    saveEconomy(data);

    const roll = Math.floor(Math.random() * 6) + 1;

    if (roll === guess) {
      const winAmount = bet * 6;
      userData.balance += winAmount;
      saveEconomy(data);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.success} Kazandınız!`)
        .setDescription(`🎲 Zar: **${roll}**\n🎯 Tahmininiz: **${guess}**\n\n**+${winAmount}** coin kazandınız!`)
        .setColor("#00FF00")
        .addFields({ name: "💰 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle(`${emojis.error} Kaybettiniz!`)
        .setDescription(`🎲 Zar: **${roll}**\n🎯 Tahmininiz: **${guess}**\n\n**-${bet}** coin kaybettiniz!`)
        .setColor("#FF0000")
        .addFields({ name: "💰 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    }
  }
};
