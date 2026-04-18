const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");
const emojis = config.emojis;

module.exports = {
  name: "stats",
  aliases: ["botstats", "istatistik"],
  execute(message) {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const totalMemory = (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2);
    const usedMemory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.stats} Bot İstatistikleri`)
      .setColor("#3498DB")
      .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "🖥️ Sunucu Sayısı", value: `\`${message.client.guilds.cache.size}\``, inline: true },
        { name: "👥 Kullanıcı Sayısı", value: `\`${message.client.users.cache.size}\``, inline: true },
        { name: "📡 Kanal Sayısı", value: `\`${message.client.channels.cache.size}\``, inline: true },
        { name: "⏰ Çalışma Süresi", value: `\`${days}g ${hours}s ${minutes}d ${seconds}sn\``, inline: true },
        { name: "💾 Bellek Kullanımı", value: `\`${usedMemory}MB / ${totalMemory}MB\``, inline: true },
        { name: "🏓 Ping", value: `\`${message.client.ws.ping}ms\``, inline: true },
        { name: "📦 Node.js", value: `\`${process.version}\``, inline: true },
        { name: "📚 Discord.js", value: `\`v14.25.1\``, inline: true },
        { name: "🤖 Bot", value: `\`${message.client.user.tag}\``, inline: true }
      )
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
