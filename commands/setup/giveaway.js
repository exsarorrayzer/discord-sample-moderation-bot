const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const ms = require("ms");
const config = require("../../config.json");
const emojis = config.emojis;

module.exports = {
  name: "giveaway",
  aliases: ["çekiliş", "gstart"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;

    if (!isAdmin && !isOwner) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    if (!args[0] || !args[1]) {
      return message.reply(`${emojis.warn} Kullanım: \`.giveaway <süre> <kazanan_sayısı> <ödül>\`\nÖrnek: \`.giveaway 1h 1 Nitro\``);
    }

    const duration = ms(args[0]);
    if (!duration) {
      return message.reply(`${emojis.error} Geçersiz süre formatı! Örnek: 10m, 1h, 1d`);
    }

    const maxDuration = 30 * 24 * 60 * 60 * 1000;
    if (duration > maxDuration) {
      return message.reply(`${emojis.error} Maksimum çekiliş süresi 30 gün!`);
    }

    const winnerCount = parseInt(args[1]);
    if (isNaN(winnerCount) || winnerCount < 1 || winnerCount > 20) {
      return message.reply(`${emojis.error} Kazanan sayısı 1 ile 20 arasında olmalı!`);
    }

    const prize = args.slice(2).join(" ");
    if (!prize || prize.length > 200) {
      return message.reply(`${emojis.warn} Bir ödül belirtmelisiniz (Max 200 karakter).`);
    }
    if (!prize) {
      return message.reply(`${emojis.warn} Bir ödül belirtmelisiniz.`);
    }

    const endTime = Date.now() + duration;

    const embed = new EmbedBuilder()
      .setTitle(`🎉 ÇEKİLİŞ 🎉`)
      .setDescription(`**Ödül:** ${prize}\n**Kazanan:** ${winnerCount} kişi\n**Bitiş:** <t:${Math.floor(endTime / 1000)}:R>\n\n🎉 Katılmak için tıklayın!`)
      .setColor("#FF00FF")
      .setFooter({ text: `Düzenleyen: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp(endTime);

    message.channel.send({ embeds: [embed] }).then(msg => {
      msg.react("🎉");

      setTimeout(() => {
        msg.fetch().then(fetchedMsg => {
          const reaction = fetchedMsg.reactions.cache.get("🎉");
          if (!reaction) {
            return msg.channel.send(`${emojis.error} Çekilişe kimse katılmadı.`);
          }

          reaction.users.fetch().then(users => {
            const participants = users.filter(u => !u.bot);
            if (participants.size === 0) {
              return msg.channel.send(`${emojis.error} Çekilişe kimse katılmadı.`);
            }

            const winners = participants.random(Math.min(winnerCount, participants.size));
            const winnerArray = Array.isArray(winners) ? winners : [winners];

            const winnerMentions = winnerArray.map(w => `<@${w.id}>`).join(", ");

            const winEmbed = new EmbedBuilder()
              .setTitle(`🎉 ÇEKİLİŞ BİTTİ 🎉`)
              .setDescription(`**Ödül:** ${prize}\n**Kazanan(lar):** ${winnerMentions}`)
              .setColor("#00FF00")
              .setTimestamp();

            msg.channel.send({ content: `Tebrikler ${winnerMentions}!`, embeds: [winEmbed] });

            const endEmbed = EmbedBuilder.from(embed)
              .setDescription(`**Ödül:** ${prize}\n**Kazanan(lar):** ${winnerMentions}\n\n✅ Çekiliş sona erdi!`)
              .setColor("#808080");

            msg.edit({ embeds: [endEmbed] });
          });
        });
      }, duration);
    });

    message.delete().catch(() => {});
  }
};
