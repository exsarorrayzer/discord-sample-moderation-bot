const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../config.json");
const emojis = config.emojis;

module.exports = {
  name: "banlist",
  aliases: ["bans", "banlistesi"],
  async execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;

    if (!isAdmin && !isOwner) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    try {
      const bans = await message.guild.bans.fetch();

      if (bans.size === 0) {
        return message.reply(`${emojis.info} Bu sunucuda hiç ban yok.`);
      }

      const banList = bans.map((ban, index) => {
        const reason = ban.reason || "Sebep belirtilmemiş";
        return `**${index + 1}.** ${ban.user.tag} (\`${ban.user.id}\`)\n└ Sebep: ${reason}`;
      }).slice(0, 10).join("\n\n");

      const embed = new EmbedBuilder()
        .setTitle("🔨 Ban Listesi")
        .setDescription(banList)
        .setColor("#FF0000")
        .setFooter({ text: `Toplam ${bans.size} ban` })
        .setTimestamp();

      if (bans.size > 10) {
        embed.setFooter({ text: `Toplam ${bans.size} ban (İlk 10 gösteriliyor)` });
      }

      message.channel.send({ embeds: [embed] });
    } catch (e) {
      message.reply(`${emojis.error} Ban listesi alınırken bir hata oluştu: ${e.message}`);
    }
  }
};
