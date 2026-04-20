const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;

const shopPath = path.join(__dirname, "../pattern/shop.json");

function loadShop() {
  if (!fs.existsSync(shopPath)) {
    const defaultShop = {
      items: [
        { id: "laptop", name: "💻 Laptop", price: 5000, description: "Güçlü bir laptop" },
        { id: "phone", name: "📱 Telefon", price: 3000, description: "Son model telefon" },
        { id: "car", name: "🚗 Araba", price: 50000, description: "Lüks bir araba" },
        { id: "house", name: "🏠 Ev", price: 500000, description: "Büyük bir ev" },
        { id: "watch", name: "⌚ Saat", price: 2000, description: "Pahalı bir saat" },
        { id: "bike", name: "🚲 Bisiklet", price: 1000, description: "Spor bisiklet" },
        { id: "guitar", name: "🎸 Gitar", price: 1500, description: "Elektro gitar" },
        { id: "camera", name: "📷 Kamera", price: 4000, description: "Profesyonel kamera" },
        { id: "headphones", name: "🎧 Kulaklık", price: 800, description: "Kablosuz kulaklık" },
        { id: "console", name: "🎮 Konsol", price: 6000, description: "Oyun konsolu" }
      ]
    };
    fs.writeFileSync(shopPath, JSON.stringify(defaultShop, null, 2));
    return defaultShop;
  }
  return JSON.parse(fs.readFileSync(shopPath, "utf-8"));
}

module.exports = {
  name: "shop",
  aliases: ["mağaza", "market"],
  execute(message) {
    const shop = loadShop();

    let description = "";
    shop.items.forEach((item, index) => {
      description += `**${index + 1}.** ${item.name} - \`${item.price}\` coin\n${item.description}\n\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle("🛒 MAĞAZA")
      .setDescription(description)
      .setColor("#3498DB")
      .setFooter({ text: "Satın almak için: !buy <numara> veya !buy <id>" })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
