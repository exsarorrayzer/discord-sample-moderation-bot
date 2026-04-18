const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require("discord.js");
const config = require("../config.json");
const emojis = config.emojis;

module.exports = {
  name: "ticket",
  aliases: ["destek"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;

    if (!isAdmin && !isOwner) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const action = args[0]?.toLowerCase();

    if (action === "setup") {
      const embed = new EmbedBuilder()
        .setTitle("🎫 Destek Sistemi")
        .setDescription("Destek talebi oluşturmak için aşağıdaki butona tıklayın.")
        .setColor("#3498DB")
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("ticket_create")
            .setLabel("Ticket Oluştur")
            .setEmoji("🎫")
            .setStyle(ButtonStyle.Primary)
        );

      message.channel.send({ embeds: [embed], components: [row] });
      message.delete().catch(() => {});
    } else {
      message.reply(`${emojis.warn} Kullanım: \`!ticket setup\``);
    }
  }
};
