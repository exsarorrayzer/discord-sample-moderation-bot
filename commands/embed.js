const { EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config.json");
const emojis = config.emojis;
const yetkirole = require("../pattern/yetkirole.json");
const cooldowns = require("../pattern/cooldowns.json");

module.exports = {
  name: "embed",
  aliases: ["e", "duyuru"],
  async execute(message, args) {
    const isOwner = message.author.id === process.env.OWNER_ID;
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isYonetim = yetkirole.yonetim && message.member.roles.cache.has(yetkirole.yonetim);
    const isEmbedYetki = yetkirole.embed && message.member.roles.cache.has(yetkirole.embed);

    if (!isOwner && !isAdmin && !isYonetim && !isEmbedYetki) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz bulunmamaktadır.`);
    }

    if (args[0] === "docs") {
      const lastDocs = cooldowns.docs[message.author.id] || 0;
      const now = Date.now();
      const delay = 7 * 24 * 60 * 60 * 1000;

      if (!isAdmin && !isOwner && (now - lastDocs < delay)) {
        const remaining = Math.ceil((delay - (now - lastDocs)) / (24 * 60 * 60 * 1000));
        return message.reply(`${emojis.warn} Yeniden döküman alabilmek için ${remaining} gün beklemelisiniz.`);
      }

      try {
        const file = new AttachmentBuilder(path.join(__dirname, "..", "embed_docs.txt"));
        await message.author.send({ 
          content: `${emojis.info} **Embed Documentation**\nFor any questions, please contact server administrators.`,
          files: [file] 
        });

        if (!isAdmin && !isOwner) {
          cooldowns.docs[message.author.id] = now;
          fs.writeFileSync(path.join(__dirname, "..", "pattern", "cooldowns.json"), JSON.stringify(cooldowns, null, 2));
        }

        return message.reply(`${emojis.success} Documentation sent via DM successfully.`);
      } catch (e) {
        return message.reply(`${emojis.error} Could not send documentation because your DMs are closed.`);
      }
    }

    const input = args.join(" ");
    if (!input || input.length > 4000) {
      return message.reply(`${emojis.warn} Kullanım: \`title=Başlık + [field1=Test, footer=GEKOMC, color=pink]\` (Max 4000 karakter)`);
    }

    try {
      const embed = new EmbedBuilder().setColor("#2B2D31");
      const regex = /(title|desc|description|color|footer|image|thumbnail|thumb|author|author_icon|footer_icon)\s*=\s*([^= ]+(?:\s+[^= ]+)*)(?=\s+\w+=|$)|\[([^\]]+)\]/gi;
      
      let match;
      const fields = [];

      while ((match = regex.exec(input)) !== null) {
        if (match[1]) {
          const key = match[1].toLowerCase();
          const val = match[2].trim();

          switch (key) {
            case "title": 
              if (val.length <= 256) embed.setTitle(val); 
              break;
            case "desc":
            case "description": 
              if (val.length <= 4096) embed.setDescription(val); 
              break;
            case "color":
              const colors = { 
                pink: "#FFC0CB", red: "#FF0000", blue: "#0000FF", green: "#00FF00", 
                yellow: "#FFFF00", black: "#000000", white: "#FFFFFF", purple: "#800080" 
              };
              embed.setColor(colors[val.toLowerCase()] || (val.startsWith("#") ? val : "#2B2D31"));
              break;
            case "footer": 
              if (val.length <= 2048) embed.setFooter({ text: val, iconURL: message.guild.iconURL({ dynamic: true }) }); 
              break;
            case "footer_icon": 
              if (val.startsWith("http://") || val.startsWith("https://")) {
                embed.setFooter({ text: embed.data.footer?.text || " ", iconURL: val }); 
              }
              break;
            case "author": 
              if (val.length <= 256) embed.setAuthor({ name: val, iconURL: message.guild.iconURL({ dynamic: true }) }); 
              break;
            case "author_icon": 
              if (val.startsWith("http://") || val.startsWith("https://")) {
                embed.setAuthor({ name: embed.data.author?.name || " ", iconURL: val }); 
              }
              break;
            case "image": 
              if (val.startsWith("http://") || val.startsWith("https://")) embed.setImage(val); 
              break;
            case "thumbnail":
            case "thumb": 
              if (val.startsWith("http://") || val.startsWith("https://")) embed.setThumbnail(val); 
              break;
          }
        } else if (match[3]) {
          const metaPairs = match[3].split(",").map(p => p.trim());
          metaPairs.forEach(pair => {
            const [mKey, ...mValParts] = pair.split("=");
            const mVal = mValParts.join("=").trim();
            const mk = mKey.toLowerCase();

            if (mk.startsWith("field")) {
              let fName = mKey;
              let fValue = mVal;
              
              if (mVal.includes("|")) {
                const parts = mVal.split("|");
                fName = parts[0].trim();
                fValue = parts.slice(1).join("|").trim();
              } else if (mVal.includes(":")) {
                const parts = mVal.split(":");
                fName = parts[0].trim();
                fValue = parts.slice(1).join(":").trim();
              }

              if (fields.length < 25 && fName.length <= 256 && fValue.length <= 1024) {
                fields.push({ name: fName || " ", value: fValue || " ", inline: true });
              }
            } else if (mk === "color") {
              const colors = { pink: "#FFC0CB", red: "#FF0000", blue: "#0000FF", green: "#00FF00" };
              embed.setColor(colors[mVal.toLowerCase()] || (mVal.startsWith("#") ? mVal : "#2B2D31"));
            } else if (mk === "footer") {
              embed.setFooter({ text: mVal, iconURL: message.guild.iconURL({ dynamic: true }) });
            }
          });
        }
      }

      if (fields.length > 0) embed.addFields(fields);

      if (!embed.data.title && !embed.data.description && fields.length === 0) {
        return message.reply(`${emojis.error} Hatalı dizilim. En azından bir başlık, açıklama veya alan belirtilmelidir.`);
      }

      message.delete().catch(() => {});
      return message.channel.send({ embeds: [embed] });

    } catch (e) {
      console.error(e);
      return message.reply(`${emojis.error} Algoritma işleme hatası: \`${e.message}\``);
    }
  }
};
