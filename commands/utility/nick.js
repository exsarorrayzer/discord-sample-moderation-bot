const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;
const yetkirole = require("../../pattern/yetkirole.json");

module.exports = {
  name: "nick",
  aliases: ["isim", "n"],
  async execute(message, args) {
    const isOwner = message.author.id === process.env.OWNER_ID;
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const hasYetki = yetkirole.nick && message.member.roles.cache.has(yetkirole.nick);
    const isYonetim = yetkirole.yonetim && message.member.roles.cache.has(yetkirole.yonetim);

    if (!isOwner && !isAdmin && !hasYetki && !isYonetim) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz bulunmamaktadır.`);
    }

    if (!args[0]) {
      return message.reply(`${emojis.warn} Kullanım: \`nick <@etiket/id> <yeni isim>\` veya \`nick reset <@etiket/id>\``);
    }

    let targetMember;
    let newNick;

    if (args[0] === "reset") {
      targetMember = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
      if (!targetMember) return message.reply(`${emojis.error} Lütfen geçerli bir kullanıcı belirtiniz.`);
      newNick = null; 
    } else {
      targetMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      if (!targetMember) return message.reply(`${emojis.error} Lütfen geçerli bir kullanıcı belirtiniz.`);
      newNick = args.slice(1).join(" ");
      if (!newNick || newNick.length > 32) return message.reply(`${emojis.warn} Lütfen ayarlamak istediğiniz ismi giriniz (Max 32 karakter).`);
    }

    if (targetMember.roles.highest.position >= message.member.roles.highest.position && !isOwner) {
      return message.reply(`${emojis.error} Sizden üstte veya aynı yetkideki birinin ismini değiştiremezsiniz.`);
    }

    try {
      await targetMember.setNickname(newNick);
      
      const embed = new EmbedBuilder()
        .setTitle(`${emojis.success} İSİM GÜNCELLEMESİ`)
        .setColor("#3498DB")
        .setDescription(`${targetMember} kullanıcısının ismi başarıyla güncellendi.`)
        .addFields(
          { name: "👤 Kullanıcı", value: `${targetMember.user.tag}`, inline: true },
          { name: "🛡️ Yetkili", value: `${message.author.tag}`, inline: true },
          { name: "📝 Yeni Nick", value: `\`${newNick || "Sıfırlandı"}\``, inline: false }
        )
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } catch (e) {
      return message.reply(`${emojis.error} Yetkim yetersiz olduğu için isim değiştirilemedi.`);
    }
  }
};
