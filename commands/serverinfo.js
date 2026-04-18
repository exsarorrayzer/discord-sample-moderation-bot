const { EmbedBuilder, ChannelType } = require("discord.js");
const config = require("../config.json");
const emojis = config.emojis;

module.exports = {
  name: "serverinfo",
  aliases: ["si", "sunucubilgi", "sb"],
  async execute(message, args) {
    const { guild } = message;
    
    const owner = await guild.fetchOwner();
    const totalMembers = guild.memberCount;
    const botCount = guild.members.cache.filter(m => m.user.bot).size;
    const userCount = totalMembers - botCount;

    const online = guild.members.cache.filter(m => m.presence?.status === 'online').size;
    const dnd = guild.members.cache.filter(m => m.presence?.status === 'dnd').size;
    const idle = guild.members.cache.filter(m => m.presence?.status === 'idle').size;
    const offline = totalMembers - (online + dnd + idle);

    const channels = guild.channels.cache;
    const textChannels = channels.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size;
    const categoryChannels = channels.filter(c => c.type === ChannelType.GuildCategory).size;

    const staticEmojis = guild.emojis.cache.filter(e => !e.animated).size;
    const animatedEmojis = guild.emojis.cache.filter(e => e.animated).size;
    const totalRoles = guild.roles.cache.size;

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${guild.name} | Sunucu Bilgileri`, iconURL: guild.iconURL({ dynamic: true }) })
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setColor("#2B2D31")
      .addFields(
        { name: `${emojis.owner} Sunucu Sahibi`, value: `${owner.user.tag}\n(${owner.id})`, inline: true },
        { name: `${emojis.calendar} Oluşturulma`, value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: `${emojis.id} Sunucu Kimliği`, value: `\`${guild.id}\``, inline: true },
        { name: `${emojis.members} Üye İstatistikleri`, value: `${emojis.user} Kullanıcı: **${userCount}**\n${emojis.bot} Bot: **${botCount}**\n${emojis.global} Toplam: **${totalMembers}**`, inline: true },
        { name: `${emojis.stats} Durum Bilgisi`, value: `${emojis.online} Çevrimiçi: **${online}**\n${emojis.dnd} R. Etmeyin: **${dnd}**\n${emojis.idle} Boşta: **${idle}**\n${emojis.offline} Kapalı: **${offline}**`, inline: true },
        { name: `${emojis.diamond} Diğer Bilgiler`, value: `${emojis.boost} Boost: **${guild.premiumSubscriptionCount}**\n${emojis.level} Seviye: **${guild.premiumTier}**\n${emojis.role} Rol: **${totalRoles}**`, inline: true },
        { name: `${emojis.folder} Kanal Bilgisi`, value: `${emojis.text} Metin: **${textChannels}**\n${emojis.voice} Ses: **${voiceChannels}**\n${emojis.category} Kategori: **${categoryChannels}**`, inline: true },
        { name: `${emojis.smile} Emoji Bilgisi`, value: `${emojis.sparkle} Hareketli: **${animatedEmojis}**\n${emojis.paperclip} Statik: **${staticEmojis}**\n${emojis.paint} Toplam: **${guild.emojis.cache.size}**`, inline: true },
        { name: `${emojis.lock} Güvenlik`, value: `${emojis.shield} AFK Kanalı: ${guild.afkChannel ? `<#${guild.afkChannelId}>` : "**Bulunmuyor**"}\n${emojis.time} AFK Süresi: **${guild.afkTimeout / 60} Dakika**`, inline: true }
      )
      .setFooter({ text: `Kullanan: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    if (guild.vanityURLCode) embed.addFields({ name: `${emojis.link} Özel URL`, value: `\`discord.gg/${guild.vanityURLCode}\``, inline: true });

    message.channel.send({ embeds: [embed] });
  }
};
