const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;

const economyPath = path.join(__dirname, "../pattern/economy.json");
const shopPath = path.join(__dirname, "../pattern/shop.json");

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

function loadShop() {
  if (!fs.existsSync(shopPath)) {
    return { items: [] };
  }
  return JSON.parse(fs.readFileSync(shopPath, "utf-8"));
}

module.exports = {
  name: "buy",
  aliases: ["satınAl", "al"],
  execute(message, args) {
    const data = loadEconomy();
    if (!data[message.author.id]) {
      data[message.author.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0, inventory: [] };
    }

    const userData = data[message.author.id];
    const shop = loadShop();

    if (!args[0]) {
      return message.reply(`${emojis.warn} Kullanım: \`.buy <numara/id>\`\nÖrnek: \`.buy 1\` veya \`.buy laptop\``);
    }

    let item;
    const input = args[0].toLowerCase();

    if (!isNaN(input)) {
      const index = parseInt(input) - 1;
      item = shop.items[index];
    } else {
      item = shop.items.find(i => i.id === input);
    }

    if (!item) {
      return message.reply(`${emojis.error} Geçersiz ürün!`);
    }

    if (userData.balance < item.price) {
      return message.reply(`${emojis.error} Yeterli bakiyeniz yok! Fiyat: \`${item.price}\` coin`);
    }

    if (!userData.inventory) userData.inventory = [];

    if (userData.inventory.find(i => i.id === item.id)) {
      return message.reply(`${emojis.warn} Bu ürüne zaten sahipsiniz!`);
    }

    userData.balance -= item.price;
    userData.inventory.push({ id: item.id, name: item.name, boughtAt: Date.now() });
    saveEconomy(data);

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.success} Satın Alma Başarılı`)
      .setDescription(`**${item.name}** satın aldınız!`)
      .setColor("#00FF00")
      .addFields(
        { name: "💰 Ödenen", value: `\`${item.price}\` coin`, inline: true },
        { name: "💵 Kalan Bakiye", value: `\`${userData.balance}\` coin`, inline: true }
      )
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
