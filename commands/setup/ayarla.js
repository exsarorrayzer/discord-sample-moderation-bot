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
const antilink = require("../../pattern/antilink.json");
const protection = require("../../pattern/protection.json");

module.exports = {
  name: "ayarla",
  aliases: ["ac", "kapat", "degistir"],
  execute(message, args) {
    const isOwner = message.author.id === process.env.OWNER_ID;
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isYonetim = yetkirole.yonetim && message.member.roles.cache.has(yetkirole.yonetim);

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

    if (!args[0]) {
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
      const antilinkField = `🔗 **Durum**: ${antilink.status ? "🟢 `Aktif`" : "🔴 `Kapalı`"}\n🔓 **Discord**: ${antilink.allowDiscord ? "✅ `İzinli`" : "❌ `Yasak`"}\n📋 **Whitelist**: ${antilink.whitelist.length > 0 ? `\`${antilink.whitelist.length}\` site` : "🔴 `Boş`"}`;

      baseEmbed.addFields(
        { name: `🎭 YETKİ ROLLERİ`, value: roleField || "Veri yok.", inline: true },
        { name: `📁 KAYIT LOGLARI`, value: logField || "Veri yok.", inline: true },
        { name: `\u200B`, value: `\u200B`, inline: false },
        { name: `🤖 BOT KONTROL`, value: botField, inline: true },
        { name: `📸 FOTO CHAT`, value: fotoField, inline: true },
        { name: `\u200B`, value: `\u200B`, inline: false },
        { name: `🔗 ANTİ-LİNK`, value: antilinkField, inline: true },
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
    } else if (type === "antilink") {
      const action = args[1];

      if (!action) {
        baseEmbed.setDescription(`${emojis.info} Anti-Link Sistemi Komutları:`)
          .addFields(
            { name: "Aç/Kapat", value: "`ayarla antilink on/off`" },
            { name: "Discord İzni", value: "`ayarla antilink discord on/off`" },
            { name: "Whitelist Ekle", value: "`ayarla antilink whitelist add <domain>`" },
            { name: "Whitelist Çıkar", value: "`ayarla antilink whitelist remove <domain>`" },
            { name: "Whitelist Listele", value: "`ayarla antilink whitelist list`" }
          );
        return message.channel.send({ embeds: [baseEmbed] });
      }

      const onKeywords = ["ac", "enable", "on"];
      const offKeywords = ["kapa", "disable", "off"];

      if (onKeywords.includes(action)) {
        antilink.status = true;
        fs.writeFileSync(path.join(__dirname, "../..", "pattern", "antilink.json"), JSON.stringify(antilink, null, 2));
        baseEmbed.setTitle(`${emojis.success} Anti-Link Aktif`)
          .setDescription("Link paylaşımı engelleme sistemi başarıyla açıldı.");
        return message.channel.send({ embeds: [baseEmbed] });
      }

      if (offKeywords.includes(action)) {
        antilink.status = false;
        fs.writeFileSync(path.join(__dirname, "../..", "pattern", "antilink.json"), JSON.stringify(antilink, null, 2));
        baseEmbed.setTitle(`${emojis.success} Anti-Link Kapatıldı`)
          .setDescription("Link paylaşımı engelleme sistemi başarıyla kapatıldı.");
        return message.channel.send({ embeds: [baseEmbed] });
      }

      if (action === "discord") {
        const discordAction = args[2];
        
        if (onKeywords.includes(discordAction)) {
          antilink.allowDiscord = true;
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "antilink.json"), JSON.stringify(antilink, null, 2));
          baseEmbed.setTitle(`${emojis.success} Discord Linkleri İzinli`)
            .setDescription("Discord davet linkleri artık paylaşılabilir.");
          return message.channel.send({ embeds: [baseEmbed] });
        }

        if (offKeywords.includes(discordAction)) {
          antilink.allowDiscord = false;
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "antilink.json"), JSON.stringify(antilink, null, 2));
          baseEmbed.setTitle(`${emojis.success} Discord Linkleri Yasaklandı`)
            .setDescription("Discord davet linkleri artık engellenecek.");
          return message.channel.send({ embeds: [baseEmbed] });
        }
      }

      if (action === "whitelist") {
        const subAction = args[2];
        const domain = args[3];

        if (subAction === "add") {
          if (!domain) {
            return message.reply(`${emojis.warn} Lütfen bir domain belirtiniz. Örnek: \`youtube.com\``);
          }

          const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");

          if (antilink.whitelist.includes(cleanDomain)) {
            return message.reply(`${emojis.error} Bu domain zaten whitelist'te bulunuyor.`);
          }

          antilink.whitelist.push(cleanDomain);
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "antilink.json"), JSON.stringify(antilink, null, 2));
          
          baseEmbed.setTitle(`${emojis.success} Whitelist Güncellendi`)
            .setDescription(`**${cleanDomain}** whitelist'e eklendi.`)
            .addFields({ name: "Toplam Whitelist", value: `\`${antilink.whitelist.length}\` site` });
          return message.channel.send({ embeds: [baseEmbed] });
        }

        if (subAction === "remove" || subAction === "delete") {
          if (!domain) {
            return message.reply(`${emojis.warn} Lütfen bir domain belirtiniz.`);
          }

          const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
          const index = antilink.whitelist.indexOf(cleanDomain);

          if (index === -1) {
            return message.reply(`${emojis.error} Bu domain whitelist'te bulunamadı.`);
          }

          antilink.whitelist.splice(index, 1);
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "antilink.json"), JSON.stringify(antilink, null, 2));
          
          baseEmbed.setTitle(`${emojis.success} Whitelist Güncellendi`)
            .setDescription(`**${cleanDomain}** whitelist'ten çıkarıldı.`)
            .addFields({ name: "Toplam Whitelist", value: `\`${antilink.whitelist.length}\` site` });
          return message.channel.send({ embeds: [baseEmbed] });
        }

        if (subAction === "list") {
          if (antilink.whitelist.length === 0) {
            return message.reply(`${emojis.info} Whitelist boş.`);
          }

          const list = antilink.whitelist.map((d, i) => `${i + 1}. \`${d}\``).join("\n");
          baseEmbed.setTitle("📋 Whitelist Siteleri")
            .setDescription(list)
            .setColor("#3498DB");
          return message.channel.send({ embeds: [baseEmbed] });
        }
      }

      return message.reply(`${emojis.warn} Geçersiz komut. \`ayarla antilink\` yazarak yardım alabilirsiniz.`);
    } else if (type === "koruma" || type === "protection") {
      const system = args[1];

      if (!system) {
        const protectionField = `🛡️ **Anti-Raid**: ${protection.antiraid.status ? "🟢" : "🔴"} | \`${protection.antiraid.limit}\` kullanıcı / \`${protection.antiraid.time}\`s | İşlem: \`${protection.antiraid.action}\`\n` +
          `💬 **Anti-Spam**: ${protection.antispam.status ? "🟢" : "🔴"} | \`${protection.antispam.limit}\` mesaj / \`${protection.antispam.time}\`s\n` +
          `😀 **Anti-Emoji**: ${protection.antiemoji.status ? "🟢" : "🔴"} | Limit: \`${protection.antiemoji.limit}\`\n` +
          `🔠 **Anti-Caps**: ${protection.anticaps.status ? "🟢" : "🔴"} | Yüzde: \`${protection.anticaps.percentage}%\`\n` +
          `📋 **Anti-Duplicate**: ${protection.antiduplicate.status ? "🟢" : "🔴"} | Tekrar: \`${protection.antiduplicate.count}\`\n` +
          `@️ **Anti-Mention**: ${protection.antimention.status ? "🟢" : "🔴"} | Limit: \`${protection.antimention.limit}\``;

        baseEmbed.setTitle("🛡️ Koruma Sistemleri")
          .setDescription("Sunucu koruma modüllerini buradan yönetebilirsiniz.")
          .addFields({ name: "Mevcut Sistemler", value: protectionField })
          .setColor("#E74C3C");
        return message.channel.send({ embeds: [baseEmbed] });
      }

      const onKeywords = ["ac", "enable", "on"];
      const offKeywords = ["kapa", "disable", "off"];

      if (system === "antiraid") {
        const action = args[2];
        
        if (onKeywords.includes(action)) {
          protection.antiraid.status = true;
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "protection.json"), JSON.stringify(protection, null, 2));
          baseEmbed.setTitle(`${emojis.success} Anti-Raid Aktif`)
            .setDescription("Toplu katılım koruması açıldı.");
          return message.channel.send({ embeds: [baseEmbed] });
        }

        if (offKeywords.includes(action)) {
          protection.antiraid.status = false;
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "protection.json"), JSON.stringify(protection, null, 2));
          baseEmbed.setTitle(`${emojis.success} Anti-Raid Kapatıldı`)
            .setDescription("Toplu katılım koruması kapatıldı.");
          return message.channel.send({ embeds: [baseEmbed] });
        }

        if (action === "ayarla" || action === "set") {
          const limit = parseInt(args[3]);
          const time = parseInt(args[4]);
          const raidAction = args[5];

          if (!limit || !time || !["kick", "ban"].includes(raidAction)) {
            return message.reply(`${emojis.warn} Kullanım: \`ayarla koruma antiraid ayarla <limit> <saniye> <kick/ban>\``);
          }

          protection.antiraid.limit = limit;
          protection.antiraid.time = time;
          protection.antiraid.action = raidAction;
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "protection.json"), JSON.stringify(protection, null, 2));
          
          baseEmbed.setTitle(`${emojis.success} Anti-Raid Ayarlandı`)
            .addFields(
              { name: "Limit", value: `\`${limit}\` kullanıcı`, inline: true },
              { name: "Süre", value: `\`${time}\` saniye`, inline: true },
              { name: "İşlem", value: `\`${raidAction}\``, inline: true }
            );
          return message.channel.send({ embeds: [baseEmbed] });
        }
      }

      if (system === "antispam") {
        const action = args[2];
        
        if (onKeywords.includes(action)) {
          protection.antispam.status = true;
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "protection.json"), JSON.stringify(protection, null, 2));
          baseEmbed.setTitle(`${emojis.success} Anti-Spam Aktif`);
          return message.channel.send({ embeds: [baseEmbed] });
        }

        if (offKeywords.includes(action)) {
          protection.antispam.status = false;
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "protection.json"), JSON.stringify(protection, null, 2));
          baseEmbed.setTitle(`${emojis.success} Anti-Spam Kapatıldı`);
          return message.channel.send({ embeds: [baseEmbed] });
        }

        if (action === "ayarla" || action === "set") {
          const limit = parseInt(args[3]);
          const time = parseInt(args[4]);

          if (!limit || !time) {
            return message.reply(`${emojis.warn} Kullanım: \`ayarla koruma antispam ayarla <limit> <saniye>\``);
          }

          protection.antispam.limit = limit;
          protection.antispam.time = time;
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "protection.json"), JSON.stringify(protection, null, 2));
          
          baseEmbed.setTitle(`${emojis.success} Anti-Spam Ayarlandı`)
            .addFields(
              { name: "Limit", value: `\`${limit}\` mesaj`, inline: true },
              { name: "Süre", value: `\`${time}\` saniye`, inline: true }
            );
          return message.channel.send({ embeds: [baseEmbed] });
        }
      }

      if (system === "antiemoji") {
        const action = args[2];
        
        if (onKeywords.includes(action)) {
          protection.antiemoji.status = true;
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "protection.json"), JSON.stringify(protection, null, 2));
          baseEmbed.setTitle(`${emojis.success} Anti-Emoji Aktif`);
          return message.channel.send({ embeds: [baseEmbed] });
        }

        if (offKeywords.includes(action)) {
          protection.antiemoji.status = false;
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "protection.json"), JSON.stringify(protection, null, 2));
          baseEmbed.setTitle(`${emojis.success} Anti-Emoji Kapatıldı`);
          return message.channel.send({ embeds: [baseEmbed] });
        }

        if (action === "ayarla" || action === "set") {
          const limit = parseInt(args[3]);

          if (!limit) {
            return message.reply(`${emojis.warn} Kullanım: \`ayarla koruma antiemoji ayarla <limit>\``);
          }

          protection.antiemoji.limit = limit;
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "protection.json"), JSON.stringify(protection, null, 2));
          
          baseEmbed.setTitle(`${emojis.success} Anti-Emoji Ayarlandı`)
            .addFields({ name: "Limit", value: `\`${limit}\` emoji` });
          return message.channel.send({ embeds: [baseEmbed] });
        }
      }

      if (system === "anticaps") {
        const action = args[2];
        
        if (onKeywords.includes(action)) {
          protection.anticaps.status = true;
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "protection.json"), JSON.stringify(protection, null, 2));
          baseEmbed.setTitle(`${emojis.success} Anti-Caps Aktif`);
          return message.channel.send({ embeds: [baseEmbed] });
        }

        if (offKeywords.includes(action)) {
          protection.anticaps.status = false;
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "protection.json"), JSON.stringify(protection, null, 2));
          baseEmbed.setTitle(`${emojis.success} Anti-Caps Kapatıldı`);
          return message.channel.send({ embeds: [baseEmbed] });
        }

        if (action === "ayarla" || action === "set") {
          const percentage = parseInt(args[3]);

          if (!percentage || percentage < 1 || percentage > 100) {
            return message.reply(`${emojis.warn} Kullanım: \`ayarla koruma anticaps ayarla <yüzde>\` (1-100)`);
          }

          protection.anticaps.percentage = percentage;
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "protection.json"), JSON.stringify(protection, null, 2));
          
          baseEmbed.setTitle(`${emojis.success} Anti-Caps Ayarlandı`)
            .addFields({ name: "Yüzde", value: `\`${percentage}%\`` });
          return message.channel.send({ embeds: [baseEmbed] });
        }
      }

      if (system === "antiduplicate") {
        const action = args[2];
        
        if (onKeywords.includes(action)) {
          protection.antiduplicate.status = true;
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "protection.json"), JSON.stringify(protection, null, 2));
          baseEmbed.setTitle(`${emojis.success} Anti-Duplicate Aktif`);
          return message.channel.send({ embeds: [baseEmbed] });
        }

        if (offKeywords.includes(action)) {
          protection.antiduplicate.status = false;
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "protection.json"), JSON.stringify(protection, null, 2));
          baseEmbed.setTitle(`${emojis.success} Anti-Duplicate Kapatıldı`);
          return message.channel.send({ embeds: [baseEmbed] });
        }

        if (action === "ayarla" || action === "set") {
          const count = parseInt(args[3]);

          if (!count || count < 2) {
            return message.reply(`${emojis.warn} Kullanım: \`ayarla koruma antiduplicate ayarla <tekrar-sayısı>\` (min: 2)`);
          }

          protection.antiduplicate.count = count;
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "protection.json"), JSON.stringify(protection, null, 2));
          
          baseEmbed.setTitle(`${emojis.success} Anti-Duplicate Ayarlandı`)
            .addFields({ name: "Tekrar Sayısı", value: `\`${count}\`` });
          return message.channel.send({ embeds: [baseEmbed] });
        }
      }

      if (system === "antimention") {
        const action = args[2];
        
        if (onKeywords.includes(action)) {
          protection.antimention.status = true;
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "protection.json"), JSON.stringify(protection, null, 2));
          baseEmbed.setTitle(`${emojis.success} Anti-Mention Aktif`);
          return message.channel.send({ embeds: [baseEmbed] });
        }

        if (offKeywords.includes(action)) {
          protection.antimention.status = false;
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "protection.json"), JSON.stringify(protection, null, 2));
          baseEmbed.setTitle(`${emojis.success} Anti-Mention Kapatıldı`);
          return message.channel.send({ embeds: [baseEmbed] });
        }

        if (action === "ayarla" || action === "set") {
          const limit = parseInt(args[3]);

          if (!limit) {
            return message.reply(`${emojis.warn} Kullanım: \`ayarla koruma antimention ayarla <limit>\``);
          }

          protection.antimention.limit = limit;
          fs.writeFileSync(path.join(__dirname, "../..", "pattern", "protection.json"), JSON.stringify(protection, null, 2));
          
          baseEmbed.setTitle(`${emojis.success} Anti-Mention Ayarlandı`)
            .addFields({ name: "Limit", value: `\`${limit}\` mention` });
          return message.channel.send({ embeds: [baseEmbed] });
        }
      }

      return message.reply(`${emojis.warn} Geçersiz sistem. Kullanım: \`ayarla koruma <antiraid/antispam/antiemoji/anticaps/antiduplicate/antimention>\``);
    } else {
      return message.reply(`${emojis.error} Hatalı bir kategori belirttiniz. Lütfen \`log\`, \`rol\`, \`botkomut\`, \`limit\`, \`fotochat\`, \`antilink\` veya \`koruma\` seçiniz.`);
    }
  }
};
