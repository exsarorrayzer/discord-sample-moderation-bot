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
  name: "coinflip",
  aliases: ["cf", "yazıtura"],
  execute(message, args) {
    const data = loadEconomy();
    if (!data[message.author.id]) {
      data[message.author.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0 };
    }

    const userData = data[message.author.id];
    const bet = parseInt(args[0]);

    if (!bet || isNaN(bet) || bet < 1 || !Number.isInteger(bet) || bet < 0) {
      return message.reply(`${emojis.warn} Geçerli bir bahis miktarı girin.\nÖrnek: \`.coinflip 100\``);
    }

    if (bet > 10000 || bet > Number.MAX_SAFE_INTEGER) {
      return message.reply(`${emojis.error} Maksimum bahis 10,000 coin!`);
    }

    if (userData.balance < bet) {
      return message.reply(`${emojis.error} Yeterli bakiyeniz yok! Bakiyeniz: \`${userData.balance}\` coin`);
    }

    userData.balance -= bet;
    saveEconomy(data);

    const win = Math.random() < 0.5;

    if (win) {
      userData.balance += bet * 2;
      saveEconomy(data);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.success} Kazandınız!`)
        .setDescription(`**+${bet}** coin kazandınız!`)
        .setColor("#00FF00")
        .addFields({ name: "💰 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle(`${emojis.error} Kaybettiniz!`)
        .setDescription(`**-${bet}** coin kaybettiniz!`)
        .setColor("#FF0000")
        .addFields({ name: "💰 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    }
  }
};
