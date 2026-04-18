const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../config.json");
const emojis = config.emojis;

module.exports = {
  name: "userinfo",
  aliases: ["ui", "kullanıcıbilgi", "kb", "profile"],
  async execute(message, args) {
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
    const { user } = member;

    const roles = member.roles.cache
      .filter(r => r.id !== message.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => r.toString());

    const roleDisplay = roles.length > 10 ? `${roles.slice(0, 10).join(", ")} ...` : (roles.length > 0 ? roles.join(", ") : "Bulunmuyor");
    
    const keyPermissions = member.permissions.toArray().filter(p => [
      "Administrator", "ManageGuild", "ManageRoles", "ManageChannels", "ManageMessages", "BanMembers", "KickMembers"
    ].includes(p)).map(p => `\`${p}\``).join(", ") || "Normal Üye";

    const statusMap = {
      online: `${emojis.online} Çevrimiçi`,
      dnd: `${emojis.dnd} Rahatsız Etmeyin`,
      idle: `${emojis.idle} Boşta`,
      offline: `${emojis.offline} Çevrimdışı`,
      invisible: `${emojis.invisible} Görünmez`
    };

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${user.tag} | Kullanıcı Bilgileri`, iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor(member.displayHexColor || "#2B2D31")
      .addFields(
        { name: `${emojis.user || "👤"} Kullanıcı Bilgisi`, value: `**Etiket**: ${user.tag}\n**ID**: \`${user.id}\`\n**Bot**: ${user.bot ? "Evet" : "Hayır"}`, inline: true },
        { name: `${emojis.id || "🆔"} Durum Bilgisi`, value: `**Durum**: ${statusMap[member.presence?.status] || "⚪ Belirsiz"}\n**Etkinlik**: ${member.presence?.activities[0]?.name || "Bulunmuyor"}`, inline: true },
        { name: `${emojis.calendar || "📅"} Tarihler`, value: `**Oluşturulma**: <t:${Math.floor(user.createdTimestamp / 1000)}:R>\n**Katılma**: <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: false },
        { name: `${emojis.role || "🎭"} Rol Bilgileri`, value: `**En Yüksek Rol**: ${member.roles.highest}\n**Rol Sayısı**: ${roles.length}\n**Bazı Roller**: ${roleDisplay}`, inline: false },
        { name: `🛡️ Yetki Bilgileri`, value: `**Önemli Yetkiler**: ${keyPermissions}`, inline: false }
      )
      .setFooter({ text: `Kullanan: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
