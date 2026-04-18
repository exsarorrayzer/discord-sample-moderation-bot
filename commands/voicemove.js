const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../config.json");
const emojis = config.emojis;

module.exports = {
  name: "voicemove",
  aliases: ["vmove", "sestasi"],
  async execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;

    if (!isAdmin && !isOwner) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const fromChannel = message.mentions.channels.first();
    const toChannel = message.guild.channels.cache.get(args[1]);

    if (!fromChannel || !toChannel) {
      return message.reply(`${emojis.warn} Kullanım: \`!voicemove #kaynak-kanal #hedef-kanal\``);
    }

    if (fromChannel.type !== 2 || toChannel.type !== 2) {
      return message.reply(`${emojis.error} Her iki kanal da ses kanalı olmalı!`);
    }

    const members = fromChannel.members;

    if (members.size === 0) {
      return message.reply(`${emojis.error} Kaynak kanalda kimse yok!`);
    }

    let moved = 0;
    for (const [id, member] of members) {
      try {
        await member.voice.setChannel(toChannel);
        moved++;
      } catch (e) {
        console.error(`${member.user.tag} taşınamadı:`, e);
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.success} Toplu Ses Taşıma`)
      .setColor("#00FF00")
      .addFields(
        { name: "📤 Kaynak", value: `${fromChannel}`, inline: true },
        { name: "📥 Hedef", value: `${toChannel}`, inline: true },
        { name: "👥 Taşınan", value: `\`${moved}\` kişi`, inline: true }
      )
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
