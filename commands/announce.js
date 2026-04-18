const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../config.json");
const emojis = config.emojis;

module.exports = {
  name: "announce",
  aliases: ["duyuru"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;

    if (!isAdmin && !isOwner) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply(`${emojis.warn} Bir kanal belirtmelisiniz.\nÖrnek: \`!announce #duyurular Mesajınız\``);
    }

    const content = args.slice(1).join(" ");
    if (!content || content.length > 2000) {
      return message.reply(`${emojis.warn} Bir mesaj yazmalısınız (Max 2000 karakter).`);
    }

    const embed = new EmbedBuilder()
      .setTitle("📢 DUYURU")
      .setDescription(content)
      .setColor("#3498DB")
      .setFooter({ text: `Duyuran: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    channel.send({ content: "@everyone", embeds: [embed] }).then(() => {
      message.reply(`${emojis.success} Duyuru ${channel} kanalına gönderildi.`);
    }).catch(err => {
      message.reply(`${emojis.error} Duyuru gönderilirken bir hata oluştu: ${err.message}`);
    });
  }
};
