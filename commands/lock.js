const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const ms = require("ms");
const config = require("../config.json");
const emojis = config.emojis;
const yetkirole = require("../pattern/yetkirole.json");

module.exports = {
  name: "lock",
  aliases: ["kilitle", "kilit"],
  async execute(message, args) {
    const isOwner = message.author.id === process.env.OWNER_ID;
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const hasYetki = yetkirole.lock && message.member.roles.cache.has(yetkirole.lock);

    if (!isOwner && !isAdmin && !hasYetki) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz bulunmamaktadır.`);
    }

    const durationStr = args[0];
    let duration = null;
    
    if (durationStr) {
      duration = ms(durationStr);
      if (!duration) return message.reply(`${emojis.error} Geçersiz süre formatı (Örn: 1h10m, 30s).`);
    }

    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: false
    });

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.lock} KANAL KİLİTLENDİ`)
      .setColor("#FF4500")
      .setDescription(`Bu kanal yönetici kararıyla sohbet gönderimine kapatılmıştır.`)
      .addFields(
        { name: "🔒 Mod", value: duration ? `Süreli Kilit (\`${durationStr}\`)` : "Kalıcı Kilit", inline: true },
        { name: "🛡️ Yetkili", value: `${message.author.tag}`, inline: true }
      )
      .setFooter({ text: "Kanal Güvenliği Aktif", iconURL: message.guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });

    if (duration) {
      setTimeout(async () => {
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
          SendMessages: true
        });
        const unlockEmbed = new EmbedBuilder()
          .setTitle(`${emojis.success} KANAL KİLİDİ AÇILDI`)
          .setColor("#00FF00")
          .setDescription("Süreli kilit sona erdi, kanal tekrar sohbete açılmıştır.")
          .setTimestamp();
        message.channel.send({ embeds: [unlockEmbed] });
      }, duration);
    }
  }
};
