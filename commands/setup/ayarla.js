const fs = require("fs");
const path = require("path");
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;
const yetkirole = require("../../pattern/yetkirole.json");
const logkanallari = require("../../pattern/logkanallari.json");
const botkomut = require("../../pattern/botkomut.json");
const limitler = require("../../pattern/limitler.json");
const fotochat = require("../../pattern/fotochat.json");

module.exports = {
  name: "ayarla",
  aliases: ["ac", "kapat", "degistir"],
  execute(message, args) {
    const isOwner = message.author.id === process.env.OWNER_ID;
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isYonetim = yetkirole.yonetim && message.member.roles.cache.has(yetkirole.yonetim);

    const commandName = message.content.slice(config.prefix.length).trim().split(/ +/)[0].toLowerCase();

    if (!isOwner && !isAdmin && !isYonetim) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz bulunmamaktadır.`);
    }

    if (message.member.roles.highest.position <= message.guild.members.me.roles.highest.position && !isOwner) {
      return message.reply(`${emojis.error} Yetki hiyerarşisi nedeniyle bu işlemi yapamazsınız.`);
    }

    const baseEmbed = new EmbedBuilder()
      .setAuthor({ name: `${message.guild.name} | Yönetici Paneli`, iconURL: message.guild.iconURL({ dynamic: true }) })
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .setColor("#2B2D31")
      .setFooter({ text: `Yetkili: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    if (!args[0] && !isAlias) {
      baseEmbed.setTitle(`💎 SISTEM YÖNETIM MERKEZI`)
        .setDescription("Sunucu üzerindeki tüm modüllerin durumlarını ve yapılandırmalarını buradan yönetebilirsiniz.");
      
      const roleField = Object.entries(yetkirole).map(([k, v]) => `● **${k.charAt(0).toUpperCase() + k.slice(1)}**: ${v ? `<@&${v}>` : "🔴 `Ayarlanmamış`"}`).join("\n");
      const logField = Object.entries(logkanallari).map(([k, v]) => `● **${k.split('_')[0].toUpperCase()}**: ${v ? `<#${v}>` : "🔴 `Kapalı`"}`).join("\n");
      
      const limitField = Object.entries(limitler).map(([k, v]) => 
        `🛡️ **${k.toUpperCase()}**: ${v.status ? "🟢 `Aktif`" : "🔴 `Kapalı`"}\n` +
        `├ \`Limit:\` ${v.sayi}/${v.dakika}dk | \`CD:\` ${v.cooldown}s`
      ).join("\n\n");

      const botField = `📍 **Kanal**: ${botkomut.kanal ? `<#${botkomut.kanal}>` : "🔴 `Pasif`"}\n🔒 **Durum**: \`${botkomut.only ? "Kısıtlı Mod" : "Serbest Mod"}\``;
      const fotoField = Object.entries(fotochat).filter(([k,v]) => v).map(([k]) => `📸 <#${k}>`).join(", ") || "🔴 `Kanal Yok`";

      baseEmbed.addFields(
        { name: `🎭 YETKİ ROLLERİ`, value: roleField || "Veri yok.", inline: true },
        { name: `📁 KAYIT LOGLARI`, value: logField || "Veri yok.", inline: true },
        { name: `\u200B`, value: `\u200B`, inline: false },
        { name: `🤖 BOT KONTROL`, value: botField, inline: true },
        { name: `📸 FOTO CHAT`, value: fotoField, inline: true },
        { name: `\u200B`, value: `\u200B`, inline: false },
        { name: `🛡️ LIMITs`, value: limitField || "Veri yok.", inline: false }
      );
      
      return message.channel.send({ embeds: [baseEmbed] });
    }

    const type = args[0];
    const sub = args[1];

    if (type === "rol") {
      const keys = Object.keys(yetkirole);
      if (!args[1]) {
        baseEmbed.setDescription(`${emojis.info} Ayarlanabilir tüm roller aşağıda listelenmiştir.`);
        baseEmbed.addFields({ name: "Mevcut Kategoriler", value: `\`${keys.join(", ")}\`` });
        return message.channel.send({ embeds: [baseEmbed] });
      }

      if (!keys.includes(args[1])) {
        return message.reply(`${emojis.error} Belirtilen kategori geçerli bir rol tanımı içermiyor.`);
      }

      const roleId = message.mentions.roles.first()?.id || args[2];
      if (!roleId) {
        return message.reply(`${emojis.warn} Lütfen geçerli bir rol etiketleyiniz veya bir ID giriniz.`);
      }

      yetkirole[args[1]] = roleId;
      fs.writeFileSync(path.join(__dirname, "../..", "pattern", "yetkirole.json"), JSON.stringify(yetkirole, null, 2));
      
      baseEmbed.setTitle(`${emojis.success} Yapılandırma Güncellendi`)
        .setDescription(`**${args[1]}** yetki kategorisi için rol ataması yapıldı.`)
        .addFields({ name: "Yeni Atama", value: `<@&${roleId}>` });
      return message.channel.send({ embeds: [baseEmbed] });
    }
    else if (type === "log") {
      const target = sub;
      const logKeys = Object.keys(logkanallari);
      
      if (!target) {
        baseEmbed.setDescription(`${emojis.info} Ayarlanabilir tüm log kanalları aşağıda listelenmiştir.`);
        baseEmbed.addFields({ name: "Log Tipleri", value: `\`${logKeys.join(", ")}\`` });
        return message.channel.send({ embeds: [baseEmbed] });
      }

      if (!logKeys.includes(target)) {
        return message.reply(`${emojis.error} Belirtilen log tipi yapılandırma içerisinde bulunamadı.`);
      }

      const channelId = message.mentions.channels.first()?.id || args[2];
      
      if (sub === "kapat") {
        logkanallari[target] = "";
        fs.writeFileSync(path.join(__dirname, "../..", "pattern", "logkanallari.json"), JSON.stringify(logkanallari, null, 2));
        baseEmbed.setTitle(`${emojis.success} Log Kanalı Kapatıldı`)
          .setDescription(`**${target}** log kanalı başarıyla devre dışı bırakıldı.`);
        return message.channel.send({ embeds: [baseEmbed] });
      }

      if (!channelId) {
        return message.reply(`${emojis.warn} Lütfen bir metin kanalı etiketleyiniz veya geçerli bir ID giriniz.`);
      }

      logkanallari[target] = channelId;
      fs.writeFileSync(path.join(__dirname, "../..", "pattern", "logkanallari.json"), JSON.stringify(logkanallari, null, 2));
      
      baseEmbed.setTitle(`${emojis.success} Kayıt Kanalı Atandı`)
        .setDescription(`**${target}** log kaydı için artık aşağıdaki kanal kullanılacaktır.`)
        .addFields({ name: "Yeni Kanal", value: `<#${channelId}>` });
      return message.channel.send({ embeds: [baseEmbed] });
    }
    else if (type === "botkomut") {
      const mode = args[1];
      if (!mode) {
        baseEmbed.setDescription(`${emojis.info} Bot komut kullanım sınırlandırma modları:`)
          .addFields(
            { name: "Sadece Kanal (Only)", value: "Komutları sadece bir kanal ile kısıtlar." },
            { name: "Kanal Değiştir (Change)", value: "Kısıtlamanın olacağı kanalı ayarlar." },
            { name: "Devre Dışı (Off)", value: "Kısıtlamayı tamamen kapatır." }
          );
        return message.channel.send({ embeds: [baseEmbed] });
      }

      if (mode === "only") {
        if (!botkomut.kanal) {
          return message.reply(`${emojis.error} Lütfen önce bir bot komut kanalı belirleyin.`);
        }
        botkomut.only = true;
        fs.writeFileSync(path.join(__dirname, "../..", "pattern", "botkomut.json"), JSON.stringify(botkomut, null, 2));
        baseEmbed.setTitle(`${emojis.success} Komut Kısıtlaması Aktif`)
          .setDescription("Gelişmiş güvenlik ve düzen amacıyla artık bot komutları sadece belirlenen kanalda çalışacaktır.");
        return message.channel.send({ embeds: [baseEmbed] });
      }

      if (mode === "change") {
        const channelId = message.mentions.channels.first()?.id || args[2];
        if (!channelId) {
          return message.reply(`${emojis.warn} Lütfen geçerli bir kanal belirtiniz.`);
        }
        botkomut.kanal = channelId;
        fs.writeFileSync(path.join(__dirname, "../..", "pattern", "botkomut.json"), JSON.stringify(botkomut, null, 2));
        baseEmbed.setTitle(`${emojis.success} Komut Kanalı Güncellendi`)
          .addFields({ name: "Hedef Kanal", value: `<#${channelId}>` });
        return message.channel.send({ embeds: [baseEmbed] });
      }

      if (mode === "off") {
        botkomut.only = false;
        fs.writeFileSync(path.join(__dirname, "../..", "pattern", "botkomut.json"), JSON.stringify(botkomut, null, 2));
        baseEmbed.setTitle(`${emojis.success} Kısıtlama Kaldırıldı`)
          .setDescription("Bot komutları artık sunucu genelindeki tüm kanallarda serbest bırakılmıştır.");
        return message.channel.send({ embeds: [baseEmbed] });
      }
    } else if (type === "fotochat") {
      const channelId = message.mentions.channels.first()?.id || args[1];
      const mode = args[2] || args[1];

      if (!channelId) {
        return message.reply(`${emojis.warn} Lütfen bir kanal belirtiniz.`);
      }

      const onKeywords = ["ac", "enable", "on"];
      const offKeywords = ["kapa", "kapat", "disable", "off"];

      if (onKeywords.includes(mode)) {
        fotochat[channelId] = true;
        fs.writeFileSync(path.resolve(__dirname, "../..", "pattern", "fotochat.json"), JSON.stringify(fotochat, null, 2));
        baseEmbed.setTitle(`${emojis.success} Foto Chat Aktif`)
          .setDescription(`<#${channelId}> kanalında artık sadece görselli mesajlara izin verilecektir.`);
        return message.channel.send({ embeds: [baseEmbed] });
      }

      if (offKeywords.includes(mode)) {
        fotochat[channelId] = false;
        fs.writeFileSync(path.resolve(__dirname, "../..", "pattern", "fotochat.json"), JSON.stringify(fotochat, null, 2));
        baseEmbed.setTitle(`${emojis.success} Foto Chat Kapatıldı`)
          .setDescription(`<#${channelId}> kanalı normal sohbet moduna döndürüldü.`);
        return message.channel.send({ embeds: [baseEmbed] });
      }

      return message.reply(`${emojis.warn} Kullanım: \`ayarla fotochat <#kanal> <ac/kapa>\``);
    } else if (type === "limit") {
      const target = args[1];
      const val2 = args[2];
      const val3 = args[3];

      if (!["ban", "kick", "mute"].includes(target)) {
        return message.reply(`${emojis.warn} Kullanım: \`limit <ban/kick/mute> <sayı> <dakika>\` veya \`cooldown <saniye>\` veya \`on/off\``);
      }

      const onKeywords = ["ac", "enable", "on"];
      const offKeywords = ["kapa", "disable", "off"];

      if (onKeywords.includes(val2)) {
        limitler[target].status = true;
        fs.writeFileSync(path.join(__dirname, "../..", "pattern", "limitler.json"), JSON.stringify(limitler, null, 2));
        baseEmbed.setTitle(`${emojis.success} Limit Guard Aktif`)
          .setDescription(`**${target}** işlemi için koruma sistemi başarıyla **açıldı**.`);
        return message.channel.send({ embeds: [baseEmbed] });
      }

      if (offKeywords.includes(val2)) {
        limitler[target].status = false;
        fs.writeFileSync(path.join(__dirname, "../..", "pattern", "limitler.json"), JSON.stringify(limitler, null, 2));
        baseEmbed.setTitle(`${emojis.success} Limit Guard Devre Dışı`)
          .setDescription(`**${target}** işlemi için koruma sistemi başarıyla **kapatıldı**.`);
        return message.channel.send({ embeds: [baseEmbed] });
      }

      if (val2 === "cooldown" || val2 === "saniye") {
        const seconds = parseInt(val3);
        if (isNaN(seconds)) return message.reply(`${emojis.warn} Lütfen geçerli bir saniye giriniz.`);
        limitler[target].cooldown = seconds;
        fs.writeFileSync(path.join(__dirname, "../..", "pattern", "limitler.json"), JSON.stringify(limitler, null, 2));
        baseEmbed.setTitle(`${emojis.success} Cooldown Güncellendi`)
          .setDescription(`**${target}** komutu için saniye bazlı spam koruması ayarlandı.`)
          .addFields({ name: "Yeni Limiti", value: `\`${seconds}\` saniye` });
        return message.channel.send({ embeds: [baseEmbed] });
      }

      const count = parseInt(val2);
      const minute = parseInt(val3);

      if (isNaN(count) || isNaN(minute)) {
        return message.reply(`${emojis.warn} Lütfen geçerli sayı ve dakika giriniz.`);
      }

      limitler[target].sayi = count;
      limitler[target].dakika = minute;
      limitler[target].status = true;
      fs.writeFileSync(path.join(__dirname, "../..", "pattern", "limitler.json"), JSON.stringify(limitler, null, 2));
      
      baseEmbed.setTitle(`${emojis.success} Limit Yapılandırması`)
        .setDescription(`**${target}** işlemi için koruma limiti başarıyla ayarlandı.`)
        .addFields({ name: "Limit Detayları", value: `\`${minute}\` dakika içinde maksimum \`${count}\` işlem yapılabilir.` });
      return message.channel.send({ embeds: [baseEmbed] });
    } else {
      return message.reply(`${emojis.error} Hatalı bir kategori belirttiniz. Lütfen \`log\`, \`rol\`, \`botkomut\`, \`limit\` veya \`fotochat\` seçiniz.`);
    }
  }
};
