const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;
const fs = require("fs");
const path = require("path");

const settingsPath = path.join(__dirname, "../../pattern/commandsettings.json");

function loadSettings() {
  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, JSON.stringify({}, null, 2));
    return {};
  }
  return JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
}

function saveSettings(data) {
  fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2));
}

const categories = {
  moderation: {
    name: `${emojis.shield} Moderasyon`,
    desc: "Sunucu yönetimi ve moderasyon komutları",
    commands: ["ban", "kick", "mute", "unmute", "warn", "clearwarns", "warnings", "tempban", "softban", "unban", "purge", "lock", "unlock", "slowmode", "nuke"]
  },
  general: {
    name: `${emojis.book} Genel`,
    desc: "Genel amaçlı kullanıcı komutları",
    commands: ["help", "ping", "serverinfo", "userinfo", "avatar", "afk", "poll", "remindme", "stats"]
  },
  economy: {
    name: `${emojis.economy} Ekonomi`,
    desc: "Para kazanma ve harcama komutları",
    commands: ["bakiye", "daily", "weekly", "beg", "work", "crime", "fish", "mine", "deposit", "withdraw", "transfer", "rob", "buy", "sell", "shop", "inventory", "leaderboard", "lottery"]
  },
  games: {
    name: `${emojis.sparkle} Oyunlar`,
    desc: "Eğlence ve oyun komutları",
    commands: ["8ball", "coinflip", "dice", "rps", "blackjack", "slots", "roulette", "trivia", "quest"]
  },
  level: {
    name: `${emojis.level} Seviye Sistemi`,
    desc: "XP ve seviye takip komutları",
    commands: ["level", "rank", "setxp"]
  },
  setup: {
    name: `${emojis.paint} Kurulum`,
    desc: "Bot yapılandırma ve kurulum komutları",
    commands: ["ayarla", "welcome", "autorole", "reactionrole", "ticketsetup", "giveaway", "announce", "embed"]
  },
  utility: {
    name: `${emojis.folder} Araçlar`,
    desc: "Yardımcı araçlar ve özellikler",
    commands: ["role", "massrole", "nick", "voicemove", "ticket", "history", "banlist", "jobinfo", "yazdir"]
  }
};

module.exports = {
  name: "help",
  aliases: ["yardim", "h", "komutlar"],
  async execute(message, args) {
    const settings = loadSettings();
    const isOwner = message.author.id === process.env.OWNER_ID;
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);

    if (args[0] === "ayarlar" && (isOwner || isAdmin)) {
      const categoryOptions = Object.keys(categories).map(key => ({
        label: categories[key].name,
        value: `toggle_${key}`,
        description: `${categories[key].commands.length} komut`,
        emoji: settings[key] === false ? "❌" : "✅"
      }));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("help_settings")
        .setPlaceholder("Kategori seçin")
        .addOptions(categoryOptions);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.paint} Sunucu Ayarları - Komut Kategorileri`)
        .setDescription(`Kategorileri açıp kapatarak hangi komutların sunucunuzda görüneceğini kontrol edebilirsiniz.\n\n${emojis.success} = Aktif\n${emojis.error} = Kapalı`)
        .setColor("#3498DB")
        .setFooter({ text: "Sadece yöneticiler bu ayarları değiştirebilir" })
        .setTimestamp();

      return message.channel.send({ embeds: [embed], components: [row] });
    }

    const activeCategories = Object.keys(categories).filter(key => settings[key] !== false);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("help_category")
      .setPlaceholder(`${emojis.folder} Kategori seçin`)
      .addOptions(
        activeCategories.map(key => ({
          label: categories[key].name,
          value: key,
          description: categories[key].desc,
          emoji: categories[key].name.split(" ")[0]
        }))
      );

    const row1 = new ActionRowBuilder().addComponents(selectMenu);

    const settingsButton = new ButtonBuilder()
      .setCustomId("help_settings_btn")
      .setLabel("Sunucu Ayarları")
      .setEmoji(emojis.paint)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!isOwner && !isAdmin);

    const row2 = new ActionRowBuilder().addComponents(settingsButton);

    const totalCommands = activeCategories.reduce((sum, key) => sum + categories[key].commands.length, 0);

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.book} Yardım Paneli`)
      .setDescription(`Merhaba **${message.author.username}**!\n\nKomut kategorilerini aşağıdan seçerek detaylı bilgi alabilirsiniz.\n\n**Prefix:** \`${config.prefix}\`\n**Toplam Komut:** \`${totalCommands}\`\n**Aktif Kategori:** \`${activeCategories.length}/${Object.keys(categories).length}\``)
      .setColor("#5865F2")
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .addFields(
        activeCategories.slice(0, 6).map(key => ({
          name: categories[key].name,
          value: `\`${categories[key].commands.length}\` komut`,
          inline: true
        }))
      )
      .setFooter({ text: `${message.author.tag} tarafından istendi`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    message.channel.send({ embeds: [embed], components: [row1, row2] });
  }
};
