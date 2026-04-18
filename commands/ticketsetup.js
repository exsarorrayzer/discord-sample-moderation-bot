const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config.json");
const emojis = config.emojis;

const ticketConfigPath = path.join(__dirname, "../pattern/ticketconfig.json");

function loadTicketConfig() {
  if (!fs.existsSync(ticketConfigPath)) {
    fs.writeFileSync(ticketConfigPath, JSON.stringify({}, null, 2));
    return {};
  }
  return JSON.parse(fs.readFileSync(ticketConfigPath, "utf-8"));
}

function saveTicketConfig(data) {
  fs.writeFileSync(ticketConfigPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "ticketsetup",
  aliases: ["ticketkur", "destek-kur"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;

    if (!isAdmin && !isOwner) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const action = args[0]?.toLowerCase();

    if (action === "panel") {
      const embed = new EmbedBuilder()
        .setTitle("🎫 Destek Ticket Sistemi")
        .setDescription("Destek talebi oluşturmak için aşağıdaki kategorilerden birini seçin:")
        .setColor("#3498DB")
        .addFields(
          { name: "💬 Genel Destek", value: "Genel sorularınız için", inline: true },
          { name: "⚠️ Şikayet", value: "Şikayet bildirimi için", inline: true },
          { name: "💰 Satın Alma", value: "Satın alma desteği için", inline: true },
          { name: "🔧 Teknik Destek", value: "Teknik sorunlar için", inline: true },
          { name: "👤 Hesap", value: "Hesap sorunları için", inline: true },
          { name: "❓ Diğer", value: "Diğer konular için", inline: true }
        )
        .setFooter({ text: "Ticket açmak için butona tıklayın" })
        .setTimestamp();

      const row1 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("ticket_general")
            .setLabel("Genel Destek")
            .setEmoji("💬")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("ticket_complaint")
            .setLabel("Şikayet")
            .setEmoji("⚠️")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("ticket_purchase")
            .setLabel("Satın Alma")
            .setEmoji("💰")
            .setStyle(ButtonStyle.Success)
        );

      const row2 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("ticket_technical")
            .setLabel("Teknik Destek")
            .setEmoji("🔧")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("ticket_account")
            .setLabel("Hesap")
            .setEmoji("👤")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("ticket_other")
            .setLabel("Diğer")
            .setEmoji("❓")
            .setStyle(ButtonStyle.Secondary)
        );

      message.channel.send({ embeds: [embed], components: [row1, row2] });
      message.delete().catch(() => {});
    } else if (action === "category") {
      const category = message.mentions.channels.first();
      if (!category) {
        return message.reply(`${emojis.warn} Bir kategori belirtmelisiniz.\nÖrnek: \`!ticketsetup category #Tickets\``);
      }

      const ticketConfig = loadTicketConfig();
      ticketConfig.categoryId = category.id;
      saveTicketConfig(ticketConfig);

      message.reply(`${emojis.success} Ticket kategorisi ${category} olarak ayarlandı.`);
    } else if (action === "role") {
      const role = message.mentions.roles.first();
      if (!role) {
        return message.reply(`${emojis.warn} Bir rol belirtmelisiniz.\nÖrnek: \`!ticketsetup role @Destek\``);
      }

      const ticketConfig = loadTicketConfig();
      ticketConfig.supportRoleId = role.id;
      saveTicketConfig(ticketConfig);

      message.reply(`${emojis.success} Destek rolü ${role} olarak ayarlandı.`);
    } else if (action === "log") {
      const channel = message.mentions.channels.first();
      if (!channel) {
        return message.reply(`${emojis.warn} Bir kanal belirtmelisiniz.\nÖrnek: \`!ticketsetup log #ticket-logs\``);
      }

      const ticketConfig = loadTicketConfig();
      ticketConfig.logChannelId = channel.id;
      saveTicketConfig(ticketConfig);

      message.reply(`${emojis.success} Ticket log kanalı ${channel} olarak ayarlandı.`);
    } else {
      const embed = new EmbedBuilder()
        .setTitle("🎫 Ticket Sistemi Kurulumu")
        .setDescription("Ticket sistemini kurmak için aşağıdaki komutları kullanın:")
        .setColor("#3498DB")
        .addFields(
          { name: "Panel Oluştur", value: "`!ticketsetup panel`", inline: false },
          { name: "Kategori Ayarla", value: "`!ticketsetup category #kategori`", inline: false },
          { name: "Destek Rolü Ayarla", value: "`!ticketsetup role @rol`", inline: false },
          { name: "Log Kanalı Ayarla", value: "`!ticketsetup log #kanal`", inline: false }
        )
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    }
  }
};
