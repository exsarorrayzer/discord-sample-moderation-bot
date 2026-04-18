const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config.json");
const emojis = config.emojis;

const afkPath = path.join(__dirname, "../pattern/afk.json");

function loadAFK() {
  if (!fs.existsSync(afkPath)) {
    fs.writeFileSync(afkPath, JSON.stringify({}, null, 2));
    return {};
  }
  return JSON.parse(fs.readFileSync(afkPath, "utf-8"));
}

function saveAFK(data) {
  fs.writeFileSync(afkPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "afk",
  aliases: [],
  execute(message, args) {
    let reason = args.join(" ") || "AFK";
    if (reason.length > 100) reason = reason.substring(0, 100);

    const afkData = loadAFK();
    afkData[message.author.id] = {
      reason: reason,
      timestamp: Date.now()
    };
    saveAFK(afkData);

    const embed = new EmbedBuilder()
      .setDescription(`${emojis.success} AFK moduna geçtiniz: **${reason}**`)
      .setColor("#FFA500");

    message.reply({ embeds: [embed] });
  }
};
