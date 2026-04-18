const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../config.json");
const emojis = config.emojis;
const yetkirole = require("../pattern/yetkirole.json");

module.exports = {
  name: "purge",
  aliases: ["clear", "sil", "temizle"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;
    const hasRole = yetkirole.mesaj_silme && message.member.roles.cache.has(yetkirole.mesaj_silme);

    if (!isAdmin && !isOwner && !hasRole) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    if (!args[0]) {
      return message.reply(`${emojis.warn} Silinecek mesaj sayısını belirtmelisiniz.\nÖrnek: \`!purge 50\` veya \`!purge 20 @User\``);
    }

    let amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100 || !Number.isInteger(amount)) {
      return message.reply(`${emojis.error} 1 ile 100 arasında bir tam sayı girmelisiniz.`);
    }

    const target = message.mentions.members.first();

    message.channel.messages.fetch({ limit: Math.min(amount + 1, 100) }).then(messages => {
      let toDelete = messages;

      if (target) {
        toDelete = messages.filter(m => m.author.id === target.id);
      }

      const filteredMessages = toDelete.filter(m => {
        const age = Date.now() - m.createdTimestamp;
        return age < 14 * 24 * 60 * 60 * 1000;
      });

      message.channel.bulkDelete(filteredMessages, true).then(deleted => {
        const embed = new EmbedBuilder()
          .setTitle(`${emojis.success} Mesajlar Silindi`)
          .setColor("#00FF00")
          .addFields(
            { name: "🗑️ Silinen Mesaj", value: `\`${deleted.size}\``, inline: true },
            { name: "👮 Yetkili", value: `${message.author.tag}`, inline: true },
            { name: "📍 Kanal", value: `${message.channel}`, inline: true }
          )
          .setTimestamp();

        if (target) {
          embed.addFields({ name: "👤 Hedef", value: `${target.user.tag}`, inline: true });
        }

        message.channel.send({ embeds: [embed] }).then(msg => {
          setTimeout(() => msg.delete().catch(() => {}), 5000);
        });
      }).catch(err => {
        message.reply(`${emojis.error} Mesajlar silinirken bir hata oluştu: ${err.message}`);
      });
    });
  }
};
