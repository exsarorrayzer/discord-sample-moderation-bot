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

const symbols = ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣"];

module.exports = {
  name: "slots",
  aliases: ["slot", "slotmachine"],
  execute(message, args) {
    const data = loadEconomy();
    if (!data[message.author.id]) {
      data[message.author.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0, inventory: [] };
    }

    const userData = data[message.author.id];
    const bet = parseInt(args[0]);

    if (!bet || isNaN(bet) || bet < 10 || !Number.isInteger(bet) || bet < 0) {
      return message.reply(`${emojis.warn} En az 10 coin bahis yapmalısınız.\nÖrnek: \`!slots 50\``);
    }

    if (bet > 5000 || bet > Number.MAX_SAFE_INTEGER) {
      return message.reply(`${emojis.error} Maksimum bahis 5,000 coin!`);
    }

    if (userData.balance < bet) {
      return message.reply(`${emojis.error} Yeterli bakiyeniz yok! Bakiyeniz: \`${userData.balance}\` coin`);
    }

    userData.balance -= bet;
    saveEconomy(data);

    const slot1 = symbols[Math.floor(Math.random() * symbols.length)];
    const slot2 = symbols[Math.floor(Math.random() * symbols.length)];
    const slot3 = symbols[Math.floor(Math.random() * symbols.length)];

    let winAmount = 0;
    let result = "";

    if (slot1 === slot2 && slot2 === slot3) {
      if (slot1 === "💎") {
        winAmount = bet * 10;
        result = "JACKPOT! 💎💎💎";
      } else if (slot1 === "7️⃣") {
        winAmount = bet * 7;
        result = "SÜPER KAZANÇ! 7️⃣7️⃣7️⃣";
      } else {
        winAmount = bet * 3;
        result = "3'LÜ EŞLEŞME!";
      }
      userData.balance += winAmount;
    } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
      winAmount = Math.floor(bet * 1.5);
      result = "2'Lİ EŞLEŞME!";
      userData.balance += winAmount;
    } else {
      winAmount = 0;
      result = "KAYBETTINIZ!";
    }

    saveEconomy(data);

    const embed = new EmbedBuilder()
      .setTitle("🎰 SLOT MACHINE")
      .setDescription(`${slot1} | ${slot2} | ${slot3}\n\n**${result}**`)
      .setColor(winAmount > 0 ? "#00FF00" : "#FF0000")
      .addFields(
        { name: "💰 Kazanç", value: winAmount > 0 ? `\`+${winAmount}\` coin` : `\`0\` coin`, inline: true },
        { name: "💵 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true }
      )
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
