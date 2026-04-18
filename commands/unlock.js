const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../config.json");
const emojis = config.emojis;
const yetkirole = require("../pattern/yetkirole.json");

module.exports = {
  name: "unlock",
  aliases: ["kilit_ac"],
  async execute(message, args) {
    const isOwner = message.author.id === process.env.OWNER_ID;
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const hasYetki = yetkirole.lock && message.member.roles.cache.has(yetkirole.lock);

    if (!isOwner && !isAdmin && !hasYetki) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz bulunmamaktadır.`);
    }

    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: true
    });

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.success} KANAL KİLİDİ AÇILDI`)
      .setColor("#2ECC71")
      .setDescription(`Kanal sohbet gönderimine başarıyla açılmıştır.`)
      .addFields(
        { name: "🛡️ Yetkili", value: `${message.author.tag}`, inline: true }
      )
      .setFooter({ text: "Kanal Güvenliği Pasif", iconURL: message.guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
