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
  name: "deposit",
  aliases: ["dep", "yatır"],
  execute(message, args) {
    const data = loadEconomy();
    if (!data[message.author.id]) {
      data[message.author.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0 };
    }

    const userData = data[message.author.id];
    let amount;

    if (args[0] === "all" || args[0] === "hepsi") {
      amount = userData.balance;
    } else {
      amount = parseInt(args[0]);
    }

    if (!amount || isNaN(amount) || amount < 1 || !Number.isInteger(amount) || amount < 0 || amount > Number.MAX_SAFE_INTEGER) {
      return message.reply(`${emojis.warn} Geçerli bir miktar girin.\nÖrnek: \`!deposit 500\` veya \`!deposit all\``);
    }

    if (userData.balance < amount) {
      return message.reply(`${emojis.error} Yeterli bakiyeniz yok! Bakiyeniz: \`${userData.balance}\` coin`);
    }

    userData.balance -= amount;
    userData.bank += amount;
    saveEconomy(data);

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.success} Para Yatırıldı`)
      .setDescription(`**${amount}** coin bankaya yatırıldı.`)
      .setColor("#00FF00")
      .addFields(
        { name: "💵 Cüzdan", value: `\`${userData.balance}\` coin`, inline: true },
        { name: "🏦 Banka", value: `\`${userData.bank}\` coin`, inline: true }
      )
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
