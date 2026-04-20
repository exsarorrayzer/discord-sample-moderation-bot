const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;

const welcomePath = path.join(__dirname, "../pattern/welcome.json");

function loadWelcome() {
  if (!fs.existsSync(welcomePath)) {
    fs.writeFileSync(welcomePath, JSON.stringify({}, null, 2));
    return {};
  }
  return JSON.parse(fs.readFileSync(welcomePath, "utf-8"));
}

function saveWelcome(data) {
  fs.writeFileSync(welcomePath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "welcome",
  aliases: ["karşılama", "hoşgeldin"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;

    if (!isAdmin && !isOwner) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const action = args[0]?.toLowerCase();

    if (action === "set") {
      const channel = message.mentions.channels.first();
      if (!channel) {
        return message.reply(`${emojis.warn} Bir kanal belirtmelisiniz.\nÖrnek: \`.welcome set #hoşgeldin\``);
      }

      const welcomeData = loadWelcome();
      welcomeData.channelId = channel.id;
      saveWelcome(welcomeData);

      message.reply(`${emojis.success} Karşılama kanalı ${channel} olarak ayarlandı.`);
    } else if (action === "message") {
      const msg = args.slice(1).join(" ");
      if (!msg || msg.length > 500) {
        return message.reply(`${emojis.warn} Bir mesaj yazmalısınız (Max 500 karakter).\nDeğişkenler: {user}, {server}, {memberCount}`);
      }

      const welcomeData = loadWelcome();
      welcomeData.message = msg;
      saveWelcome(welcomeData);

      message.reply(`${emojis.success} Karşılama mesajı ayarlandı.`);
    } else if (action === "off") {
      const welcomeData = loadWelcome();
      delete welcomeData.channelId;
      saveWelcome(welcomeData);

      message.reply(`${emojis.success} Karşılama sistemi kapatıldı.`);
    } else {
      message.reply(`${emojis.info} Kullanım:\n\`.welcome set #kanal\` - Kanal ayarla\n\`.welcome message <mesaj>\` - Mesaj ayarla\n\`.welcome off\` - Kapat`);
    }
  }
};
