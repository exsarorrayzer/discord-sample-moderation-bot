const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;

const lotteryPath = path.join(__dirname, "../../pattern/lottery.json");
const economyPath = path.join(__dirname, "../../pattern/economy.json");

function loadLottery() {
  if (!fs.existsSync(lotteryPath)) {
    fs.writeFileSync(lotteryPath, JSON.stringify({ pot: 0, tickets: {}, drawTime: Date.now() + 86400000 }, null, 2));
    return { pot: 0, tickets: {}, drawTime: Date.now() + 86400000 };
  }
  return JSON.parse(fs.readFileSync(lotteryPath, "utf-8"));
}

function saveLottery(data) {
  fs.writeFileSync(lotteryPath, JSON.stringify(data, null, 2));
}

function loadEconomy() {
  if (!fs.existsSync(economyPath)) return {};
  return JSON.parse(fs.readFileSync(economyPath, "utf-8"));
}

function saveEconomy(data) {
  fs.writeFileSync(economyPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "lottery",
  aliases: ["piyango"],
  execute(message, args) {
    const lottery = loadLottery();
    const now = Date.now();

    if (now >= lottery.drawTime) {
      const allTickets = Object.entries(lottery.tickets).flatMap(([userId, count]) => 
        Array(count).fill(userId)
      );

      if (allTickets.length > 0) {
        const winner = allTickets[Math.floor(Math.random() * allTickets.length)];
        const economy = loadEconomy();
        
        if (!economy[winner]) {
          economy[winner] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0, inventory: [] };
        }

        economy[winner].balance += lottery.pot;
        saveEconomy(economy);

        const winnerUser = message.guild.members.cache.get(winner);
        const embed = new EmbedBuilder()
          .setTitle("🎉 PİYANGO SONUÇLANDI!")
          .setDescription(`**Kazanan:** ${winnerUser ? winnerUser.user.tag : winner}\n**Ödül:** ${lottery.pot} coin`)
          .setColor("#FFD700")
          .setTimestamp();

        message.channel.send({ embeds: [embed] });
      }

      lottery.pot = 0;
      lottery.tickets = {};
      lottery.drawTime = now + 86400000;
      saveLottery(lottery);
    }

    const action = args[0]?.toLowerCase();

    if (action === "buy" || action === "al") {
      const amount = parseInt(args[1]) || 1;
      const ticketPrice = 100;

      if (isNaN(amount) || amount < 1 || amount > 10 || !Number.isInteger(amount)) {
        return message.reply(`${emojis.error} 1 ile 10 arasında tam sayı bilet alabilirsiniz.`);
      }

      const totalCost = ticketPrice * amount;

      const economy = loadEconomy();
      if (!economy[message.author.id]) {
        economy[message.author.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0, inventory: [] };
      }

      if (economy[message.author.id].balance < totalCost) {
        return message.reply(`${emojis.error} Yeterli bakiyeniz yok! Gerekli: ${totalCost} coin`);
      }

      const currentTickets = lottery.tickets[message.author.id] || 0;
      if (currentTickets + amount > 25) {
        return message.reply(`${emojis.error} Maksimum 25 bilet alabilirsiniz! Şu anki: ${currentTickets}`);
      }

      economy[message.author.id].balance -= totalCost;
      saveEconomy(economy);

      if (!lottery.tickets[message.author.id]) {
        lottery.tickets[message.author.id] = 0;
      }
      lottery.tickets[message.author.id] += amount;
      lottery.pot += totalCost;
      saveLottery(lottery);

      return message.reply(`${emojis.success} ${amount} bilet aldınız! Toplam biletiniz: ${lottery.tickets[message.author.id]}`);
    }

    const totalTickets = Object.values(lottery.tickets).reduce((a, b) => a + b, 0);
    const userTickets = lottery.tickets[message.author.id] || 0;
    const timeLeft = lottery.drawTime - now;
    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

    const embed = new EmbedBuilder()
      .setTitle("🎰 PİYANGO")
      .setColor("#FFD700")
      .addFields(
        { name: "💰 Ödül Havuzu", value: `\`${lottery.pot}\` coin`, inline: true },
        { name: "🎫 Toplam Bilet", value: `\`${totalTickets}\``, inline: true },
        { name: "🎟️ Sizin Biletiniz", value: `\`${userTickets}\``, inline: true },
        { name: "⏰ Kalan Süre", value: `\`${hours}s ${minutes}d\``, inline: false },
        { name: "💵 Bilet Fiyatı", value: "`100 coin`", inline: true },
        { name: "🎯 Max Bilet", value: "`25 bilet/kişi`", inline: true }
      )
      .setFooter({ text: "!lottery buy <miktar> ile bilet alın" })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
