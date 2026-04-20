const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;
const yetkirole = require("../../pattern/yetkirole.json");

const tempmutesPath = path.join(__dirname, "../../pattern/tempmutes.json");
const casesPath = path.join(__dirname, "../../pattern/cases.json");

function loadTempMutes() {
  if (!fs.existsSync(tempmutesPath)) return {};
  return JSON.parse(fs.readFileSync(tempmutesPath, "utf-8"));
}

function saveTempMutes(data) {
  fs.writeFileSync(tempmutesPath, JSON.stringify(data, null, 2));
}

function loadCases() {
  if (!fs.existsSync(casesPath)) {
    return { counter: 0, cases: {} };
  }
  return JSON.parse(fs.readFileSync(casesPath, "utf-8"));
}

function saveCases(data) {
  fs.writeFileSync(casesPath, JSON.stringify(data, null, 2));
}

function createCase(guildId, userId, moderatorId, action, reason, duration = null) {
  const cases = loadCases();
  cases.counter++;
  const caseId = cases.counter;
  
  cases.cases[caseId] = {
    id: caseId,
    guildId,
    userId,
    moderatorId,
    action,
    reason,
    duration,
    timestamp: Date.now()
  };
  
  saveCases(cases);
  return caseId;
}

module.exports = {
  name: "tempmute",
  aliases: ["tmute", "gecicisustur"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;
    const hasRole = yetkirole.timeout && message.member.roles.cache.has(yetkirole.timeout);

    if (!isAdmin && !isOwner && !hasRole) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.reply(`${emojis.warn} Kullanım: \`.tempmute @User <süre> <sebep>\` (Örnek: 10m, 1h, 1d)`);
    }

    if (target.id === message.author.id) {
      return message.reply(`${emojis.error} Kendinizi susturamaz sınız.`);
    }

    if (target.id === message.guild.ownerId) {
      return message.reply(`${emojis.error} Sunucu sahibini susturamazsınız.`);
    }

    if (target.user.bot) {
      return message.reply(`${emojis.error} Botları susturamazsınız.`);
    }

    if (target.roles.highest.position >= message.member.roles.highest.position && !isOwner) {
      return message.reply(`${emojis.error} Bu kullanıcı sizinle aynı veya daha yüksek yetkiye sahip.`);
    }

    const durationArg = args[1];
    if (!durationArg) {
      return message.reply(`${emojis.warn} Süre belirtmelisiniz. (Örnek: 10m, 1h, 1d)`);
    }

    const timeRegex = /^(\d+)([smhd])$/;
    const match = durationArg.match(timeRegex);
    
    if (!match) {
      return message.reply(`${emojis.error} Geçersiz süre formatı. Kullanım: 10s, 5m, 2h, 1d`);
    }

    const amount = parseInt(match[1]);
    const unit = match[2];
    
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    const duration = amount * multipliers[unit];

    if (duration > 2419200000) {
      return message.reply(`${emojis.error} Maksimum susturma süresi 28 gündür.`);
    }

    let reason = args.slice(2).join(" ") || "Sebep belirtilmedi";
    reason = reason.substring(0, 500);

    target.timeout(duration, reason).then(() => {
      const caseId = createCase(message.guild.id, target.id, message.author.id, "TEMPMUTE", reason, duration);
      
      const tempMutes = loadTempMutes();
      tempMutes[target.id] = {
        guildId: message.guild.id,
        endTime: Date.now() + duration,
        caseId
      };
      saveTempMutes(tempMutes);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.success} Kullanıcı Geçici Susturuldu`)
        .setColor("#FFA500")
        .addFields(
          { name: "👤 Kullanıcı", value: `${target.user.tag} (${target.id})`, inline: true },
          { name: "👮 Yetkili", value: `${message.author.tag}`, inline: true },
          { name: "⏱️ Süre", value: `\`${durationArg}\``, inline: true },
          { name: "📋 Case ID", value: `\`#${caseId}\``, inline: true },
          { name: "📝 Sebep", value: `\`\`\`${reason}\`\`\``, inline: false }
        )
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
      target.send(`${emojis.warn} **${message.guild.name}** sunucusunda geçici olarak susturuldunuz!\n**Süre:** ${durationArg}\n**Sebep:** ${reason}\n**Case ID:** #${caseId}`).catch(() => {});
    }).catch(err => {
      message.reply(`${emojis.error} Kullanıcı susturulurken hata oluştu: ${err.message}`);
    });
  }
};
