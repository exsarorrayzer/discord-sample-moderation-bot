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

function getUser(userId) {
  const data = loadEconomy();
  if (!data[userId]) {
    data[userId] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0 };
    saveEconomy(data);
  }
  return data[userId];
}

module.exports = {
  name: "economy",
  aliases: ["eco", "ekonomi"],
  execute(message, args) {
    const action = args[0]?.toLowerCase();

    if (!action || action === "balance" || action === "bal") {
      const target = message.mentions.members.first() || message.member;
      const userData = getUser(target.id);

      const embed = new EmbedBuilder()
        .setTitle(`💰 ${target.user.tag} - Bakiye`)
        .setColor("#FFD700")
        .addFields(
          { name: "💵 Cüzdan", value: `\`${userData.balance}\` coin`, inline: true },
          { name: "🏦 Banka", value: `\`${userData.bank}\` coin`, inline: true },
          { name: "💎 Toplam", value: `\`${userData.balance + userData.bank}\` coin`, inline: true }
        )
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    } else {
      message.reply(`${emojis.info} Kullanım: \`.economy balance [@user]\``);
    }
  }
};
