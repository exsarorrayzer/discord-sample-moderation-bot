const { PermissionFlagsBits } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;
const yetkirole = require("../../pattern/yetkirole.json");

module.exports = {
  name: "yazdir",
  aliases: ["say", "duyur"],
  execute(message, args) {
    const isOwner = message.author.id === process.env.OWNER_ID;
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isYonetim = yetkirole.yonetim && message.member.roles.cache.has(yetkirole.yonetim);

    if (!isOwner && !isAdmin && !isYonetim) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz bulunmamaktadır.`);
    }

    const content = args.join(" ");
    if (!content || content.length > 2000) {
      return message.reply(`${emojis.warn} Lütfen yazdırılacak bir metin giriniz (Max 2000 karakter).`);
    }

    message.delete().catch(() => {});
    message.channel.send(content).catch(() => {});
  }
};
