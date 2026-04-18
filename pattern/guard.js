const fs = require("fs");
const path = require("path");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const configMain = require("../config.json");
const emojis = configMain.emojis;

module.exports = async (message, type) => {
  let limitler, tracking;
  try {
    limitler = JSON.parse(fs.readFileSync(path.join(__dirname, "limitler.json")));
    const trackingPath = path.join(__dirname, "limit_tracking.json");
    tracking = JSON.parse(fs.readFileSync(trackingPath));
  } catch (error) {
    console.error("Guard file read error:", error);
    return false;
  }

  const config = limitler[type];
  if (!config || config.status === false) return false;

  const now = Date.now();
  const userId = message.author.id;

  if (!tracking[userId]) tracking[userId] = {};
  if (!tracking[userId][type]) tracking[userId][type] = [];

  const timeframe = config.dakika * 60 * 1000;
  tracking[userId][type] = tracking[userId][type].filter(t => now - t < timeframe);

  if (tracking[userId][type].length >= config.sayi) {
    const embed = new EmbedBuilder()
      .setTitle("🛡️ LIMIT GUARD | UYARI")
      .setColor("#FF0000")
      .setDescription(`**GÜVENLİK İHLALİ TESPİT EDİLDİ!**\n\nKısa süre içerisinde çok fazla **${type}** işlemi gerçekleştirdiğiniz için sistem tarafından engellendiniz.\n\nEğer bunun bir hata olduğunu düşünüyorsanız aşağıdaki butona tıklayarak itiraz raporu gönderebilirsiniz.`)
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`rapor_gonder_${userId}_${type}`)
        .setLabel("İtiraz Raporu Gönder")
        .setStyle(ButtonStyle.Danger)
    );

    try {
      await message.author.send({ embeds: [embed], components: [row] });
    } catch (e) {
      message.reply(`${emojis.error} Limit aşımı! Güvenlik nedeniyle işleminiz durduruldu. (DM kutunuz kapalı olduğu için detaylar iletilemedi.)`);
    }

    return true; 
  }

  tracking[userId][type].push(now);
  try {
    fs.writeFileSync(trackingPath, JSON.stringify(tracking, null, 2));
  } catch (error) {
    console.error("Guard tracking write error:", error);
  }
  return false; 
};
