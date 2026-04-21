const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;
const yetkirole = require("../../pattern/yetkirole.json");

module.exports = {
  name: "emoji-id",
  aliases: ["emojiid", "emojiler"],
  async execute(message, args) {
    const isOwner = message.author.id === process.env.OWNER_ID;
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isYonetim = yetkirole.yonetim && message.member.roles.cache.has(yetkirole.yonetim);

    if (!isOwner && !isAdmin && !isYonetim) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok!`);
    }

    await message.guild.emojis.fetch();
    const guildEmojis = message.guild.emojis.cache;

    if (guildEmojis.size === 0) {
      return message.reply(`${emojis.warn} Bu sunucuda özel emoji bulunmuyor.`);
    }

    const emojiList = guildEmojis.map(emoji => `${emoji} - \`<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>\` - \`${emoji.id}\``).join("\n");

    const chunks = [];
    let currentChunk = "";

    emojiList.split("\n").forEach(line => {
      if ((currentChunk + line + "\n").length > 4000) {
        chunks.push(currentChunk);
        currentChunk = line + "\n";
      } else {
        currentChunk += line + "\n";
      }
    });

    if (currentChunk) chunks.push(currentChunk);

    chunks.forEach((chunk, index) => {
      const embed = new EmbedBuilder()
        .setTitle(`${emojis.infinity} Sunucu Emojileri ${chunks.length > 1 ? `(${index + 1}/${chunks.length})` : ""}`)
        .setDescription(chunk)
        .setColor("#5865F2")
        .setFooter({ text: `Toplam: ${guildEmojis.size} emoji`, iconURL: message.guild.iconURL({ dynamic: true }) })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    });
  }
};
