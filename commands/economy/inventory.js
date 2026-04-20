const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;

const economyPath = path.join(__dirname, "../../pattern/economy.json");

function loadEconomy() {
  if (!fs.existsSync(economyPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(economyPath, "utf-8"));
}

module.exports = {
  name: "inventory",
  aliases: ["inv", "envanter", "bag"],
  execute(message) {
    const data = loadEconomy();
    const target = message.mentions.members.first() || message.member;

    if (!data[target.id] || !data[target.id].inventory || data[target.id].inventory.length === 0) {
      return message.reply(`${emojis.info} ${target.user.tag} envanteri boş.`);
    }

    const inventory = data[target.id].inventory;
    let description = "";

    inventory.forEach((item, index) => {
      const date = new Date(item.boughtAt).toLocaleDateString("tr-TR");
      description += `**${index + 1}.** ${item.name}\n📅 Alındı: ${date}\n\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle(`🎒 ${target.user.tag} - Envanter`)
      .setDescription(description)
      .setColor("#3498DB")
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Toplam ${inventory.length} ürün` })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
