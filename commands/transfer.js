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
  name: "transfer",
  aliases: ["pay", "gönder", "ver"],
  execute(message, args) {
    const data = loadEconomy();
    if (!data[message.author.id]) {
      data[message.author.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0, lastTransfer: 0, inventory: [] };
    }

    const userData = data[message.author.id];
    const now = Date.now();
    const cooldown = 30 * 1000;

    if (now - userData.lastTransfer < cooldown) {
      const remaining = Math.ceil((cooldown - (now - userData.lastTransfer)) / 1000);
      return message.reply(`${emojis.time} \`${remaining}\` saniye sonra tekrar transfer yapabilirsiniz.`);
    }

    const target = message.mentions.members.first();
    const amount = parseInt(args[1]);

    if (!target) {
      return message.reply(`${emojis.warn} Kullanım: \`!transfer @User <miktar>\`\nÖrnek: \`!transfer @User 500\``);
    }

    if (target.id === message.author.id) {
      return message.reply(`${emojis.error} Kendinize para gönderemezsiniz!`);
    }

    if (target.user.bot) {
      return message.reply(`${emojis.error} Botlara para gönderemezsiniz!`);
    }

    if (!amount || isNaN(amount) || amount < 1 || !Number.isInteger(amount)) {
      return message.reply(`${emojis.error} Geçerli bir tam sayı girin! (Minimum: 1 coin)`);
    }

    if (amount > 10000) {
      return message.reply(`${emojis.error} Maksimum transfer limiti: 10,000 coin!`);
    }

    if (amount < 0 || amount > Number.MAX_SAFE_INTEGER) {
      return message.reply(`${emojis.error} Geçersiz miktar!`);
    }

    if (userData.balance < amount) {
      return message.reply(`${emojis.error} Yeterli bakiyeniz yok! Bakiyeniz: \`${userData.balance}\` coin`);
    }

    if (!data[target.id]) {
      data[target.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0, inventory: [] };
    }

    userData.balance -= amount;
    data[target.id].balance += amount;
    userData.lastTransfer = now;
    saveEconomy(data);

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.success} Transfer Başarılı`)
      .setDescription(`**${target.user.tag}** kullanıcısına **${amount}** coin gönderildi!`)
      .setColor("#00FF00")
      .addFields(
        { name: "💵 Kalan Bakiye", value: `\`${userData.balance}\` coin`, inline: true }
      )
      .setTimestamp();

    message.channel.send({ embeds: [embed] });

    target.send(`${emojis.success} **${message.author.tag}** size **${amount}** coin gönderdi!`).catch(() => {});
  }
};
