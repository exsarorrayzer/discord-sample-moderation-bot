const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;

module.exports = {
  name: "nuke",
  aliases: ["temizle-kanal"],
  async execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;

    if (!isAdmin && !isOwner) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const channel = message.channel;
    const position = channel.position;
    const parent = channel.parent;

    const confirmEmbed = new EmbedBuilder()
      .setTitle("⚠️ UYARI")
      .setDescription(`Bu kanalı silip yeniden oluşturmak istediğinize emin misiniz?\n\n**Tüm mesajlar silinecek!**\n\n30 saniye içinde \`evet\` yazın.`)
      .setColor("#FF0000")
      .setTimestamp();

    await message.channel.send({ embeds: [confirmEmbed] });

    const filter = m => m.author.id === message.author.id && m.content.toLowerCase() === "evet";
    const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 });

    collector.on("collect", async () => {
      const newChannel = await channel.clone();
      await newChannel.setPosition(position);
      await channel.delete();

      const embed = new EmbedBuilder()
        .setTitle("💥 Kanal Temizlendi")
        .setDescription(`Bu kanal **${message.author.tag}** tarafından temizlendi.`)
        .setColor("#00FF00")
        .setImage("https://media.giphy.com/media/HhTXt43pk1I1W/giphy.gif")
        .setTimestamp();

      newChannel.send({ embeds: [embed] });
    });

    collector.on("end", collected => {
      if (collected.size === 0) {
        message.channel.send(`${emojis.error} İşlem iptal edildi.`);
      }
    });
  }
};
