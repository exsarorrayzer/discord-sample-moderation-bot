const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const ms = require("ms");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;
const yetkirole = require("../../pattern/yetkirole.json");
const logkanallari = require("../../pattern/logkanallari.json");

const tempbansPath = path.join(__dirname, "../pattern/tempbans.json");

function loadTempbans() {
  if (!fs.existsSync(tempbansPath)) {
    fs.writeFileSync(tempbansPath, JSON.stringify({}, null, 2));
    return {};
  }
  return JSON.parse(fs.readFileSync(tempbansPath, "utf-8"));
}

function saveTempbans(data) {
  fs.writeFileSync(tempbansPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "tempban",
  aliases: ["tban"],
  async execute(message, args) {
    const isOwner = message.author.id === process.env.OWNER_ID;
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const hasYetki = yetkirole.ban && message.member.roles.cache.has(yetkirole.ban);

    if (!isOwner && !isAdmin && !hasYetki) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const targetMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!targetMember) {
      return message.reply(`${emojis.warn} Bir kullanıcı belirtmelisiniz.`);
    }

    if (!targetMember.bannable) {
      return message.reply(`${emojis.error} Bu kullanıcı banlanamaz.`);
    }

    const durationStr = args[1];
    if (!durationStr) {
      return message.reply(`${emojis.warn} Bir süre belirtmelisiniz.\nÖrnek: \`.tempban @User 7d Sebep\``);
    }

    const duration = ms(durationStr);
    if (!duration || duration < 60000) {
      return message.reply(`${emojis.error} Minimum süre: 1 dakika`);
    }

    if (duration > 30 * 24 * 60 * 60 * 1000) {
      return message.reply(`${emojis.error} Maksimum süre: 30 gün`);
    }

    let reason = args.slice(2).join(" ") || "Sebep belirtilmedi";
    if (reason.length > 500) reason = reason.substring(0, 500);

    await targetMember.ban({ reason: `Geçici Ban - ${message.author.tag}: ${reason}` });

    const tempbans = loadTempbans();
    tempbans[targetMember.id] = {
      guildId: message.guild.id,
      unbanAt: Date.now() + duration,
      reason: reason,
      bannedBy: message.author.id
    };
    saveTempbans(tempbans);

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.success} Geçici Ban`)
      .setColor("#FF6B00")
      .addFields(
        { name: "👤 Kullanıcı", value: `${targetMember.user.tag}`, inline: true },
        { name: "⏰ Süre", value: `\`${durationStr}\``, inline: true },
        { name: "👮 Yetkili", value: `${message.author.tag}`, inline: true },
        { name: "📝 Sebep", value: `\`\`\`${reason}\`\`\``, inline: false }
      )
      .setThumbnail(targetMember.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    message.channel.send({ embeds: [embed] });

    if (logkanallari.ban_log) {
      const logChannel = message.guild.channels.cache.get(logkanallari.ban_log);
      if (logChannel) logChannel.send({ embeds: [embed] });
    }

    setTimeout(async () => {
      try {
        await message.guild.members.unban(targetMember.id, "Geçici ban süresi doldu");
        const tempbansUpdated = loadTempbans();
        delete tempbansUpdated[targetMember.id];
        saveTempbans(tempbansUpdated);

        if (logkanallari.ban_log) {
          const logChannel = message.guild.channels.cache.get(logkanallari.ban_log);
          if (logChannel) {
            const unbanEmbed = new EmbedBuilder()
              .setTitle("✅ Geçici Ban Süresi Doldu")
              .setDescription(`**${targetMember.user.tag}** banı otomatik olarak kaldırıldı.`)
              .setColor("#00FF00")
              .setTimestamp();
            logChannel.send({ embeds: [unbanEmbed] });
          }
        }
      } catch (e) {
        console.error("Tempban kaldırma hatası:", e);
      }
    }, duration);
  }
};
