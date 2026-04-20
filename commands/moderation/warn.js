const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;
const yetkirole = require("../../pattern/yetkirole.json");

const warningsPath = path.join(__dirname, "../../pattern/warnings.json");
const MAX_REASON_LENGTH = 500;
const MAX_WARNINGS = 50;

function loadWarnings() {
  if (!fs.existsSync(warningsPath)) {
    fs.writeFileSync(warningsPath, JSON.stringify({}, null, 2));
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(warningsPath, "utf-8"));
  } catch (error) {
    console.error("Warnings file parse error:", error);
    return {};
  }
}

function saveWarnings(data) {
  try {
    fs.writeFileSync(warningsPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Warnings file write error:", error);
  }
}

module.exports = {
  name: "warn",
  aliases: ["uyar"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;
    const hasRole = yetkirole.warn && message.member.roles.cache.has(yetkirole.warn);

    if (!isAdmin && !isOwner && !hasRole) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.reply(`${emojis.warn} Bir kullanıcı belirtmelisiniz.`);
    }

    if (target.id === message.author.id) {
      return message.reply(`${emojis.error} Kendinize uyarı veremezsiniz.`);
    }

    if (target.id === message.guild.ownerId) {
      return message.reply(`${emojis.error} Sunucu sahibine uyarı veremezsiniz.`);
    }

    if (target.user.bot) {
      return message.reply(`${emojis.error} Botlara uyarı veremezsiniz.`);
    }

    if (target.roles.highest.position >= message.member.roles.highest.position && !isOwner) {
      return message.reply(`${emojis.error} Bu kullanıcı sizinle aynı veya daha yüksek yetkiye sahip.`);
    }

    let reason = args.slice(1).join(" ") || "Sebep belirtilmedi";
    reason = reason.substring(0, MAX_REASON_LENGTH);

    const warnings = loadWarnings();
    if (!warnings[target.id]) {
      warnings[target.id] = [];
    }

    if (warnings[target.id].length >= MAX_WARNINGS) {
      return message.reply(`${emojis.error} Bu kullanıcı maksimum uyarı sayısına ulaştı (${MAX_WARNINGS}). Lütfen uyarıları temizleyin.`);
    }

    const warnData = {
      id: warnings[target.id].length + 1,
      reason: reason,
      moderator: message.author.id,
      timestamp: Date.now(),
      guildId: message.guild.id
    };

    warnings[target.id].push(warnData);
    saveWarnings(warnings);

    const warnCount = warnings[target.id].length;

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.warn} Kullanıcı Uyarıldı`)
      .setColor("#FFA500")
      .addFields(
        { name: "👤 Kullanıcı", value: `${target.user.tag} (${target.id})`, inline: true },
        { name: "👮 Yetkili", value: `${message.author.tag}`, inline: true },
        { name: "📊 Toplam Uyarı", value: `\`${warnCount}\``, inline: true },
        { name: "📝 Sebep", value: `\`\`\`${reason}\`\`\``, inline: false }
      )
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    message.channel.send({ embeds: [embed] });

    target.send(`${emojis.warn} **${message.guild.name}** sunucusunda uyarıldınız!\n**Sebep:** ${reason}\n**Toplam Uyarı:** ${warnCount}`).catch(() => {});

    if (warnCount >= 3) {
      message.channel.send(`${emojis.alert} **${target.user.tag}** 3 veya daha fazla uyarıya sahip! Gerekli işlem yapılabilir.`);
    }
  }
};
