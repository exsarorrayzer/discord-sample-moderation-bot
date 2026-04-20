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
  name: "rob",
  aliases: ["soy", "çal"],
  execute(message, args) {
    const data = loadEconomy();
    if (!data[message.author.id]) {
      data[message.author.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0, lastRob: 0, inventory: [] };
    }

    const userData = data[message.author.id];
    const now = Date.now();
    const cooldown = 2 * 60 * 60 * 1000;

    if (now - userData.lastRob < cooldown) {
      const remaining = cooldown - (now - userData.lastRob);
      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

      return message.reply(`${emojis.time} Polis sizi arıyor! \`${hours}s ${minutes}d\` sonra tekrar soygun yapabilirsiniz.`);
    }

    const target = message.mentions.members.first();
    if (!target) {
      return message.reply(`${emojis.warn} Bir kullanıcı belirtmelisiniz.\nÖrnek: \`.rob @User\``);
    }

    if (target.id === message.author.id) {
      return message.reply(`${emojis.error} Kendinizi soyamazsınız!`);
    }

    if (target.user.bot) {
      return message.reply(`${emojis.error} Botları soyamazsınız!`);
    }

    if (!data[target.id]) {
      data[target.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0, inventory: [] };
    }

    const targetData = data[target.id];

    if (targetData.balance < 100) {
      return message.reply(`${emojis.error} ${target.user.tag} çok fakir, soyacak bir şey yok! (Minimum: 100 coin)`);
    }

    if (userData.balance < 200) {
      return message.reply(`${emojis.error} Soygun yapmak için en az 200 coin'iniz olmalı!`);
    }

    if (targetData.lastRobbed && now - targetData.lastRobbed < 60 * 60 * 1000) {
      return message.reply(`${emojis.error} Bu kullanıcı yakın zamanda soyuldu. 1 saat sonra tekrar deneyin.`);
    }

    const success = Math.random() < 0.30;

    if (success) {
      const maxSteal = Math.min(targetData.balance * 0.20, 3000);
      const stolen = Math.floor(Math.random() * maxSteal * 0.5 + maxSteal * 0.5);
      userData.balance += stolen;
      targetData.balance -= stolen;
      userData.lastRob = now;
      targetData.lastRobbed = now;
      saveEconomy(data);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.success} Soygun Başarılı!`)
        .setDescription(`**${target.user.tag}** kullanıcısından **${stolen}** coin çaldınız!`)
        .setColor("#00FF00")
        .addFields({ name: "💰 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
      target.send(`${emojis.error} **${message.author.tag}** sizi soydu ve **${stolen}** coin çaldı!`).catch(() => {});
    } else {
      const fine = Math.min(Math.floor(userData.balance * 0.30), 2500);
      userData.balance = Math.max(0, userData.balance - fine);
      userData.lastRob = now;
      saveEconomy(data);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.error} Soygun Başarısız!`)
        .setDescription(`Yakalandınız ve **${fine}** coin ceza ödediniz!`)
        .setColor("#FF0000")
        .addFields({ name: "💰 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    }
  }
};
