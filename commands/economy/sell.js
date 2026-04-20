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
  name: "sell",
  aliases: ["sat"],
  execute(message, args) {
    const data = loadEconomy();
    if (!data[message.author.id]) {
      data[message.author.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0, inventory: [] };
    }

    const userData = data[message.author.id];

    if (!userData.inventory || userData.inventory.length === 0) {
      return message.reply(`${emojis.error} Envanteriniz boş!`);
    }

    if (!args[0]) {
      return message.reply(`${emojis.warn} Kullanım: \`.sell <numara/id>\`\nÖrnek: \`.sell 1\` veya \`.sell laptop\``);
    }

    let itemIndex;
    const input = args[0].toLowerCase();

    if (!isNaN(input)) {
      itemIndex = parseInt(input) - 1;
    } else {
      itemIndex = userData.inventory.findIndex(i => i.id === input);
    }

    if (itemIndex === -1 || !userData.inventory[itemIndex]) {
      return message.reply(`${emojis.error} Geçersiz ürün!`);
    }

    const item = userData.inventory[itemIndex];
    const shop = loadShop();
    const shopItem = shop.items.find(i => i.id === item.id);

    const sellPrice = shopItem ? Math.floor(shopItem.price * 0.6) : 100;

    userData.balance += sellPrice;
    userData.inventory.splice(itemIndex, 1);
    saveEconomy(data);

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.success} Satış Başarılı`)
      .setDescription(`**${item.name}** sattınız!`)
      .setColor("#00FF00")
      .addFields(
        { name: "💰 Kazanılan", value: `\`${sellPrice}\` coin`, inline: true },
        { name: "💵 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true }
      )
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
