const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;

module.exports = {
  name: "lockdown",
  aliases: ["kilitle-hepsi"],
  execute(message, args) {
    const isOwner = message.author.id === process.env.OWNER_ID;

    if (!isOwner) {
      return message.reply(`${emojis.error} Bu komutu sadece bot sahibi kullanabilir.`);
    }

    const action = args[0]?.toLowerCase();
    
    if (!action || !["on", "off", "ac", "kapat"].includes(action)) {
      return message.reply(`${emojis.warn} Kullanım: \`.lockdown on/off\``);
    }

    const shouldLock = ["on", "ac"].includes(action);
    const channels = message.guild.channels.cache.filter(ch => ch.isTextBased() && ch.type === 0);
    
    let success = 0;
    let failed = 0;

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.loading} Lockdown İşlemi Başlatıldı`)
      .setDescription(`${channels.size} kanal ${shouldLock ? "kilitleniyor" : "kilidi açılıyor"}...`)
      .setColor("#FFA500")
      .setTimestamp();

    message.channel.send({ embeds: [embed] }).then(async (msg) => {
      for (const [, channel] of channels) {
        try {
          await channel.permissionOverwrites.edit(message.guild.id, {
            SendMessages: shouldLock ? false : null
          });
          success++;
        } catch {
          failed++;
        }
      }

      const resultEmbed = new EmbedBuilder()
        .setTitle(`${emojis.success} Lockdown ${shouldLock ? "Aktif" : "Devre Dışı"}`)
        .setColor(shouldLock ? "#FF0000" : "#00FF00")
        .addFields(
          { name: "✅ Başarılı", value: `\`${success}\` kanal`, inline: true },
          { name: "❌ Başarısız", value: `\`${failed}\` kanal`, inline: true },
          { name: "👮 Yetkili", value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

      msg.edit({ embeds: [resultEmbed] });
    });
  }
};
