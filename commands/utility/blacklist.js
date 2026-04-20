const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;

const blacklistPath = path.join(__dirname, "../../pattern/blacklist.json");

function loadBlacklist() {
  if (!fs.existsSync(blacklistPath)) {
    return { users: [] };
  }
  return JSON.parse(fs.readFileSync(blacklistPath, "utf-8"));
}

function saveBlacklist(data) {
  fs.writeFileSync(blacklistPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "blacklist",
  aliases: ["karaliste", "bl"],
  execute(message, args) {
    const isOwner = message.author.id === process.env.OWNER_ID;

    if (!isOwner) {
      return message.reply(`${emojis.error} Bu komutu sadece bot sahibi kullanabilir.`);
    }

    const action = args[0]?.toLowerCase();
    
    if (!action || !["add", "remove", "list", "ekle", "cikar", "liste"].includes(action)) {
      return message.reply(`${emojis.warn} Kullanım: \`.blacklist add/remove/list <@User veya ID>\``);
    }

    const blacklist = loadBlacklist();

    if (["list", "liste"].includes(action)) {
      if (blacklist.users.length === 0) {
        return message.reply(`${emojis.info} Blacklist boş.`);
      }

      const list = blacklist.users.map((id, i) => `${i + 1}. <@${id}> (\`${id}\`)`).join("\n");
      const embed = new EmbedBuilder()
        .setTitle("📋 Blacklist Kullanıcıları")
        .setDescription(list)
        .setColor("#FF0000")
        .setFooter({ text: `Toplam: ${blacklist.users.length} kullanıcı` })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    const target = message.mentions.users.first() || message.client.users.cache.get(args[1]);
    const userId = target?.id || args[1];

    if (!userId || !/^\d{17,19}$/.test(userId)) {
      return message.reply(`${emojis.warn} Geçerli bir kullanıcı veya ID belirtmelisiniz.`);
    }

    if (["add", "ekle"].includes(action)) {
      if (blacklist.users.includes(userId)) {
        return message.reply(`${emojis.error} Bu kullanıcı zaten blacklist'te.`);
      }

      blacklist.users.push(userId);
      saveBlacklist(blacklist);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.success} Blacklist'e Eklendi`)
        .setDescription(`<@${userId}> (\`${userId}\`) blacklist'e eklendi.`)
        .setColor("#FF0000")
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    if (["remove", "cikar"].includes(action)) {
      const index = blacklist.users.indexOf(userId);
      
      if (index === -1) {
        return message.reply(`${emojis.error} Bu kullanıcı blacklist'te değil.`);
      }

      blacklist.users.splice(index, 1);
      saveBlacklist(blacklist);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.success} Blacklist'ten Çıkarıldı`)
        .setDescription(`<@${userId}> (\`${userId}\`) blacklist'ten çıkarıldı.`)
        .setColor("#00FF00")
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }
  }
};
