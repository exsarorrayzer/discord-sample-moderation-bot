require("dotenv").config();
const { Client, GatewayIntentBits, ActivityType, PermissionFlagsBits, Collection, EmbedBuilder, Partials, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");
const emojis = config.emojis;
const yetkirole = require("./pattern/yetkirole.json");
const logkanallari = require("./pattern/logkanallari.json");
const botkomut = require("./pattern/botkomut.json");
const limitler = require("./pattern/limitler.json");
const fotochat = require("./pattern/fotochat.json");
const antilink = require("./pattern/antilink.json");
const blacklist = require("./pattern/blacklist.json");
const protection = require("./pattern/protection.json");

if (!process.env.TOKEN || !process.env.OWNER_ID) {
  console.error("CRITICAL: TOKEN or OWNER_ID not set in environment variables");
  process.exit(1);
}

const welcomePath = path.join(__dirname, "pattern/welcome.json");
const autorolePath = path.join(__dirname, "pattern/autorole.json");
const afkPath = path.join(__dirname, "pattern/afk.json");
const rrPath = path.join(__dirname, "pattern/reactionroles.json");

function loadJSON(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
    return {};
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction
  ]
});

const cooldownMap = new Map();
client.commands = new Collection();

function loadCommands(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      loadCommands(itemPath);
    } else if (item.endsWith('.js')) {
      const command = require(path.resolve(itemPath));
      client.commands.set(command.name, command);
    }
  }
}

loadCommands(path.join(__dirname, "commands"));

client.once('ready', () => {
  console.log(`[+] BOT ONLINE - ${client.user.tag}`);
  console.log(`[+] Serving ${client.guilds.cache.size} server(s)`);
  console.log(`[+] Prefix: ${config.prefix}`);

  client.user.setPresence({
    activities: [{ name: config.name, type: ActivityType[config.type] }],
    status: config.statusMode,
  });

  const remindmeCommand = client.commands.get("remindme");
  if (remindmeCommand && remindmeCommand.startReminderCheck) {
    remindmeCommand.startReminderCheck(client);
    console.log("[+] Reminder system initialized");
  }

  setInterval(() => {
    const tempmutesPath = path.join(__dirname, "pattern/tempmutes.json");
    if (!fs.existsSync(tempmutesPath)) return;
    
    const tempMutes = JSON.parse(fs.readFileSync(tempmutesPath, "utf-8"));
    const now = Date.now();
    
    Object.keys(tempMutes).forEach(userId => {
      const muteData = tempMutes[userId];
      if (now >= muteData.endTime) {
        const guild = client.guilds.cache.get(muteData.guildId);
        if (guild) {
          const member = guild.members.cache.get(userId);
          if (member && member.isCommunicationDisabled()) {
            member.timeout(null).catch(() => {});
          }
        }
        delete tempMutes[userId];
      }
    });
    
    fs.writeFileSync(tempmutesPath, JSON.stringify(tempMutes, null, 2));
  }, 30000);
  console.log("[+] Tempmute auto-removal initialized");
});

const xpCooldowns = new Map();

client.on("messageCreate", (message) => {
  if (message.author.bot || !message.guild) return;

  const blacklistData = blacklist.users || [];
  if (blacklistData.includes(message.author.id)) {
    return message.delete().catch(() => {});
  }

  const isOwner = message.author.id === process.env.OWNER_ID;
  const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);

  if (!isOwner && !isAdmin) {
    if (protection.antimention.status) {
      const mentionCount = (message.content.match(/<@[!&]?\d+>/g) || []).length;
      if (mentionCount > protection.antimention.limit) {
        message.delete().catch(() => {});
        return message.channel.send(`${emojis.error} **${message.author.tag}**, çok fazla mention kullandınız!`).then(msg => {
          setTimeout(() => msg.delete().catch(() => {}), 5000);
        }).catch(() => {});
      }
    }

    if (protection.antiemoji.status) {
      const emojiCount = (message.content.match(/<a?:\w+:\d+>|[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length;
      if (emojiCount > protection.antiemoji.limit) {
        message.delete().catch(() => {});
        return message.channel.send(`${emojis.error} **${message.author.tag}**, çok fazla emoji kullandınız!`).then(msg => {
          setTimeout(() => msg.delete().catch(() => {}), 5000);
        }).catch(() => {});
      }
    }

    if (protection.anticaps.status && message.content.length > 10) {
      const upperCount = (message.content.match(/[A-ZÇĞİÖŞÜ]/g) || []).length;
      const totalLetters = (message.content.match(/[A-ZÇĞİÖŞÜa-zçğıöşü]/g) || []).length;
      if (totalLetters > 0 && (upperCount / totalLetters) * 100 > protection.anticaps.percentage) {
        message.delete().catch(() => {});
        return message.channel.send(`${emojis.error} **${message.author.tag}**, çok fazla büyük harf kullandınız!`).then(msg => {
          setTimeout(() => msg.delete().catch(() => {}), 5000);
        }).catch(() => {});
      }
    }

    if (protection.antiduplicate.status) {
      if (!client.messageHistory) client.messageHistory = new Map();
      const userHistory = client.messageHistory.get(message.author.id) || [];
      userHistory.push(message.content);
      if (userHistory.length > protection.antiduplicate.count) userHistory.shift();
      client.messageHistory.set(message.author.id, userHistory);

      if (userHistory.length === protection.antiduplicate.count && userHistory.every(m => m === message.content)) {
        message.delete().catch(() => {});
        return message.channel.send(`${emojis.error} **${message.author.tag}**, aynı mesajı tekrar göndermeyin!`).then(msg => {
          setTimeout(() => msg.delete().catch(() => {}), 5000);
        }).catch(() => {});
      }
    }

    if (protection.antispam.status) {
      if (!client.spamTracker) client.spamTracker = new Map();
      const userSpam = client.spamTracker.get(message.author.id) || [];
      const now = Date.now();
      userSpam.push(now);
      const recentMessages = userSpam.filter(t => now - t < protection.antispam.time * 1000);
      client.spamTracker.set(message.author.id, recentMessages);

      if (recentMessages.length > protection.antispam.limit) {
        message.delete().catch(() => {});
        message.member.timeout(60000, "Spam koruması").catch(() => {});
        return message.channel.send(`${emojis.error} **${message.author.tag}** spam yaptığı için 1 dakika susturuldu!`).then(msg => {
          setTimeout(() => msg.delete().catch(() => {}), 5000);
        }).catch(() => {});
      }
    }
  }

  const levelsPath = path.join(__dirname, "pattern/levels.json");
  function loadLevels() {
    if (!fs.existsSync(levelsPath)) {
      fs.writeFileSync(levelsPath, JSON.stringify({}, null, 2));
      return {};
    }
    return JSON.parse(fs.readFileSync(levelsPath, "utf-8"));
  }
  function saveLevels(data) {
    fs.writeFileSync(levelsPath, JSON.stringify(data, null, 2));
  }

  const now = Date.now();
  const xpCooldown = 60000;
  const lastXP = xpCooldowns.get(message.author.id) || 0;

  if (now - lastXP >= xpCooldown && message.content.length >= 5 && message.content.length <= 2000) {
    const levels = loadLevels();
    if (!levels[message.author.id]) {
      levels[message.author.id] = { xp: 0, level: 0, messages: 0, lastXP: 0 };
    }

    const xpGain = Math.floor(Math.random() * 10) + 15;
    levels[message.author.id].xp += xpGain;
    levels[message.author.id].messages += 1;
    levels[message.author.id].lastXP = now;

    xpCooldowns.set(message.author.id, now);

    const oldLevel = Math.floor(0.1 * Math.sqrt(levels[message.author.id].xp - xpGain));
    const newLevel = Math.floor(0.1 * Math.sqrt(levels[message.author.id].xp));

    if (newLevel > oldLevel) {
      const levelUpEmbed = new EmbedBuilder()
        .setDescription(`${emojis.sparkle} **${message.author.tag}** seviye atladı! **Seviye ${newLevel}**`)
        .setColor("#FFD700");
      message.channel.send({ embeds: [levelUpEmbed] }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      });
    }

    saveLevels(levels);
  }

  const afkData = loadJSON(afkPath);
  if (afkData[message.author.id]) {
    delete afkData[message.author.id];
    saveJSON(afkPath, afkData);
    message.reply(`${emojis.success} AFK modundan çıktınız.`).then(msg => {
      setTimeout(() => msg.delete().catch(() => {}), 5000);
    });
  }

  message.mentions.users.forEach(user => {
    if (afkData[user.id]) {
      const afkInfo = afkData[user.id];
      const duration = Math.floor((Date.now() - afkInfo.timestamp) / 1000 / 60);
      message.reply(`${emojis.info} **${user.tag}** AFK: ${afkInfo.reason} (${duration} dakika önce)`).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 5000);
      });
    }
  });

  if (fotochat[message.channel.id] && message.attachments.size === 0 && !message.member.permissions.has(PermissionFlagsBits.Administrator)) {
    message.delete().catch(() => {});
    return message.channel.send(`${emojis.warn} **${message.author.tag}**, bu kanalda sadece görsel paylaşımına izin verilmektedir.`).then(msg => {
      setTimeout(() => msg.delete().catch(() => {}), 5000);
    }).catch(() => {});
  }
  
  if (antilink.status && !message.member.permissions.has(PermissionFlagsBits.Administrator) && !isOwner) {
    const hasAntilinkBypass = yetkirole.antilink_bypass && message.member.roles.cache.has(yetkirole.antilink_bypass);
    
    if (!hasAntilinkBypass) {
      const urlRegex = /(https?:\/\/[^\s]+)/gi;
      const discordInviteRegex = /(discord\.gg\/|discord\.com\/invite\/|discordapp\.com\/invite\/)[a-zA-Z0-9]+/gi;
      
      const hasUrl = urlRegex.test(message.content);
      const hasDiscordInvite = discordInviteRegex.test(message.content);

      if (hasDiscordInvite && !antilink.allowDiscord) {
        message.delete().catch(() => {});
        return message.channel.send(`${emojis.error} **${message.author.tag}**, Discord davet linki paylaşımı yasaktır!`).then(msg => {
          setTimeout(() => msg.delete().catch(() => {}), 5000);
        }).catch(() => {});
      }

      if (hasUrl) {
        const urls = message.content.match(urlRegex) || [];
        const isWhitelisted = urls.every(url => {
          return antilink.whitelist.some(whitelisted => url.toLowerCase().includes(whitelisted.toLowerCase()));
        });

        if (!isWhitelisted) {
          message.delete().catch(() => {});
          return message.channel.send(`${emojis.error} **${message.author.tag}**, link paylaşımı yasaktır!`).then(msg => {
            setTimeout(() => msg.delete().catch(() => {}), 5000);
          }).catch(() => {});
        }
      }
    }
  }

  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const rawCommandName = args.shift();
  
  if (rawCommandName.length > 50) return;

  function normalizeText(text) {
    const turkishMap = {
      'ç': 'c', 'Ç': 'c',
      'ğ': 'g', 'Ğ': 'g',
      'ı': 'i', 'I': 'i', 'İ': 'i',
      'ö': 'o', 'Ö': 'o',
      'ş': 's', 'Ş': 's',
      'ü': 'u', 'Ü': 'u'
    };
    
    return text.split('').map(char => turkishMap[char] || char).join('').toLowerCase();
  }

  const commandName = normalizeText(rawCommandName);

  const command = client.commands.get(commandName) || 
    client.commands.find(cmd => {
      if (normalizeText(cmd.name) === commandName) return true;
      if (cmd.aliases) {
        return cmd.aliases.some(alias => normalizeText(alias) === commandName);
      }
      return false;
    });

  if (!command) return;

  const isYonetim = yetkirole.yonetim && message.member.roles.cache.has(yetkirole.yonetim);

  if (botkomut.only && !isOwner && !isAdmin && !isYonetim) {
    if (message.channel.id !== botkomut.kanal) return;
  }

  const limitData = limitler[command.name];
  if (limitData && limitData.cooldown > 0 && !isOwner) {
    const key = `${message.author.id}_${command.name}`;
    const lastUsed = cooldownMap.get(key) || 0;
    const now = Date.now();
    const cooldownAmount = limitData.cooldown * 1000;

    if (now - lastUsed < cooldownAmount) {
      const remaining = ((cooldownAmount - (now - lastUsed)) / 1000).toFixed(1);
      const cooldownEmbed = new EmbedBuilder()
        .setDescription(`${emojis.warn} **${command.name}** komutunu tekrar kullanmak için \`${remaining}\` saniye beklemelisiniz.`)
        .setColor("#F1C40F");
      return message.reply({ embeds: [cooldownEmbed] }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 5000);
      });
    }
    cooldownMap.set(key, now);
  }

  try {
    command.execute(message, args);
  } catch (error) {
    console.error("Command execution error:", error);
    message.reply(`${emojis.error} Komut çalıştırılırken bir hata oluştu.`).catch(() => {});
  }
});

client.on("messageDelete", (message) => {
  if (message.author?.bot || !message.guild || !message.content) return;

  const logId = logkanallari.mesaj_log;
  if (!logId) return;

  const logChannel = message.guild.channels.cache.get(logId);
  if (!logChannel) return;

  const safeContent = message.content.substring(0, 1000);

  const embed = new EmbedBuilder()
    .setTitle(`${emojis.error} Mesaj Silindi`)
    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
    .setColor("#FF0000")
    .addFields(
      { name: "📝 Kullanıcı", value: `${message.author.tag} (${message.author.id})`, inline: true },
      { name: "📍 Kanal", value: `<#${message.channel.id}>`, inline: true },
      { name: "💭 İçerik", value: `\`\`\`${safeContent || "Mesaj içeriği bulunamadı (Görsel veya Embed olabilir)."}\`\`\``, inline: false }
    )
    .setFooter({ text: `Mesaj Silme Logu`, iconURL: message.guild.iconURL({ dynamic: true }) })
    .setTimestamp();

  logChannel.send({ embeds: [embed] }).catch(() => {});
});

client.on("voiceStateUpdate", (oldState, newState) => {
  if (newState.member.user.bot) return;

  const logId = logkanallari.voice_log;
  if (!logId) return;

  const logChannel = newState.guild.channels.cache.get(logId);
  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setAuthor({ name: `${newState.member.user.tag} | Ses Aktifliği`, iconURL: newState.member.user.displayAvatarURL({ dynamic: true }) })
    .setFooter({ text: "Ses Log Sistemi", iconURL: newState.guild.iconURL({ dynamic: true }) })
    .setTimestamp();

  if (!oldState.channelId && newState.channelId) {
    embed.setTitle(`${emojis.voice} Odaya Katıldı`)
      .setColor("#00FF00")
      .setDescription(`**Kanal**: <#${newState.channelId}> (\`${newState.channelId}\`)`)
      .setThumbnail(newState.member.user.displayAvatarURL({ dynamic: true }));
    return logChannel.send({ embeds: [embed] });
  }

  if (oldState.channelId && !newState.channelId) {
    embed.setTitle(`${emojis.voice_leave} Odadan Ayrıldı`)
      .setColor("#FF0000")
      .setDescription(`**Kanal**: <#${oldState.channelId}> (\`${oldState.channelId}\`)`)
      .setThumbnail(newState.member.user.displayAvatarURL({ dynamic: true }));
    return logChannel.send({ embeds: [embed] });
  }

  if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
    embed.setTitle(`${emojis.voice_move} Oda Değiştirdi`)
      .setColor("#3498DB")
      .addFields(
        { name: "Eski Kanal", value: `<#${oldState.channelId}>`, inline: true },
        { name: "Yeni Kanal", value: `<#${newState.channelId}>`, inline: true }
      );
    return logChannel.send({ embeds: [embed] });
  }

  if (oldState.selfMute !== newState.selfMute) {
    embed.setTitle(`🎤 Susturma Durumu: ${newState.selfMute ? "Aktif" : "Pasif"}`)
      .setColor(newState.selfMute ? "#E67E22" : "#2ECC71")
      .setDescription(`Kullanıcı mikrofonunu **${newState.selfMute ? "kapattı" : "açtı"}**.`);
    return logChannel.send({ embeds: [embed] });
  }

  if (oldState.selfDeaf !== newState.selfDeaf) {
    embed.setTitle(`🎧 Sağırlaştırma Durumu: ${newState.selfDeaf ? "Aktif" : "Pasif"}`)
      .setColor(newState.selfDeaf ? "#E67E22" : "#2ECC71")
      .setDescription(`Kullanıcı hoparlörünü **${newState.selfDeaf ? "kapattı" : "açtı"}**.`);
    return logChannel.send({ embeds: [embed] });
  }
});

client.on("guildMemberAdd", (member) => {
  if (!member || !member.guild) return;

  if (protection.antiraid.status) {
    if (!client.raidTracker) client.raidTracker = new Map();
    const guildJoins = client.raidTracker.get(member.guild.id) || [];
    const now = Date.now();
    guildJoins.push({ userId: member.id, timestamp: now });
    const recentJoins = guildJoins.filter(j => now - j.timestamp < protection.antiraid.time * 1000);
    client.raidTracker.set(member.guild.id, recentJoins);

    if (recentJoins.length > protection.antiraid.limit) {
      const action = protection.antiraid.action;
      if (action === "kick") {
        member.kick("Anti-raid koruması").catch(() => {});
      } else if (action === "ban") {
        member.ban({ reason: "Anti-raid koruması" }).catch(() => {});
      }
      
      const logId = logkanallari.mod_log;
      if (logId) {
        const logChannel = member.guild.channels.cache.get(logId);
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setTitle("🛡️ Anti-Raid Koruması Tetiklendi")
            .setDescription(`**${member.user.tag}** ${action === "kick" ? "atıldı" : "yasaklandı"}`)
            .setColor("#FF0000")
            .addFields(
              { name: "👤 Kullanıcı", value: `${member.user.tag} (${member.id})`, inline: true },
              { name: "⚡ İşlem", value: `\`${action.toUpperCase()}\``, inline: true },
              { name: "📊 Son Katılımlar", value: `\`${recentJoins.length}\` kullanıcı / \`${protection.antiraid.time}\`s`, inline: true }
            )
            .setTimestamp();
          logChannel.send({ embeds: [embed] });
        }
      }
      return;
    }
  }

  const welcomeData = loadJSON(welcomePath);
  if (welcomeData.channelId) {
    const channel = member.guild.channels.cache.get(welcomeData.channelId);
    if (channel) {
      const message = (welcomeData.message || "Hoş geldin {user}! Sunucumuzda {memberCount} üye olduk!").substring(0, 500);
      const formatted = message
        .replace("{user}", `<@${member.id}>`)
        .replace("{server}", member.guild.name)
        .replace("{memberCount}", member.guild.memberCount);

      const embed = new EmbedBuilder()
        .setTitle("👋 Hoş Geldin!")
        .setDescription(formatted)
        .setColor("#00FF00")
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      channel.send({ embeds: [embed] }).catch(() => {});
    }
  }

  const autoroleData = loadJSON(autorolePath);
  if (autoroleData.roleId) {
    const role = member.guild.roles.cache.get(autoroleData.roleId);
    if (role && role.position < member.guild.members.me.roles.highest.position) {
      member.roles.add(role).catch(console.error);
    }
  }
});

client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      return;
    }
  }

  const rrData = loadJSON(rrPath);
  const config = rrData[reaction.message.id];

  if (config && reaction.emoji.name === config.emoji) {
    const guild = reaction.message.guild;
    const member = guild.members.cache.get(user.id);
    const role = guild.roles.cache.get(config.roleId);

    if (member && role) {
      member.roles.add(role).catch(console.error);
    }
  }
});

client.on("messageReactionRemove", async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      return;
    }
  }

  const rrData = loadJSON(rrPath);
  const config = rrData[reaction.message.id];

  if (config && reaction.emoji.name === config.emoji) {
    const guild = reaction.message.guild;
    const member = guild.members.cache.get(user.id);
    const role = guild.roles.cache.get(config.roleId);

    if (member && role) {
      member.roles.remove(role).catch(console.error);
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "help_category") {
      const category = interaction.values[0];
      const categories = {
        moderation: {
          name: "🛡️ Moderasyon",
          desc: "Sunucu yönetimi ve moderasyon komutları",
          commands: ["ban", "kick", "mute", "unmute", "warn", "clearwarns", "warnings", "tempban", "softban", "unban", "purge", "lock", "unlock", "slowmode", "nuke"]
        },
        general: {
          name: "📋 Genel",
          desc: "Genel amaçlı kullanıcı komutları",
          commands: ["help", "ping", "serverinfo", "userinfo", "avatar", "afk", "poll", "remindme", "stats"]
        },
        economy: {
          name: "💰 Ekonomi",
          desc: "Para kazanma ve harcama komutları",
          commands: ["economy", "daily", "weekly", "beg", "work", "crime", "fish", "mine", "deposit", "withdraw", "transfer", "rob", "buy", "sell", "shop", "inventory", "leaderboard", "lottery"]
        },
        games: {
          name: "🎮 Oyunlar",
          desc: "Eğlence ve oyun komutları",
          commands: ["8ball", "coinflip", "dice", "rps", "blackjack", "slots", "roulette", "trivia", "quest"]
        },
        level: {
          name: "📊 Seviye Sistemi",
          desc: "XP ve seviye takip komutları",
          commands: ["level", "rank", "setxp"]
        },
        setup: {
          name: "⚙️ Kurulum",
          desc: "Bot yapılandırma ve kurulum komutları",
          commands: ["ayarla", "welcome", "autorole", "reactionrole", "ticketsetup", "giveaway", "announce", "embed"]
        },
        utility: {
          name: "🔧 Araçlar",
          desc: "Yardımcı araçlar ve özellikler",
          commands: ["role", "massrole", "nick", "voicemove", "ticket", "history", "banlist", "jobinfo", "yazdir"]
        }
      };

      const selectedCategory = categories[category];
      const commandList = selectedCategory.commands.map(cmd => `\`${config.prefix}${cmd}\``).join(", ");

      const embed = new EmbedBuilder()
        .setTitle(selectedCategory.name)
        .setDescription(`${selectedCategory.desc}\n\n**Komutlar:**\n${commandList}\n\n**Detaylı bilgi için:** \`${config.prefix}komut_adı\``)
        .setColor("#5865F2")
        .setFooter({ text: `${interaction.user.tag} tarafından istendi`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      return interaction.update({ embeds: [embed] });
    }

    if (interaction.customId === "help_settings") {
      const isOwner = interaction.user.id === process.env.OWNER_ID;
      const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
      
      if (!isOwner && !isAdmin) {
        return interaction.reply({ content: `${emojis.error} Bu ayarları sadece yöneticiler değiştirebilir!`, ephemeral: true });
      }

      const settingsPath = path.join(__dirname, "pattern/commandsettings.json");
      function loadSettings() {
        if (!fs.existsSync(settingsPath)) return {};
        return JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
      }
      function saveSettings(data) {
        fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2));
      }

      const settings = loadSettings();
      const action = interaction.values[0];
      const categoryKey = action.replace("toggle_", "");

      settings[categoryKey] = settings[categoryKey] === false ? true : false;
      saveSettings(settings);

      const categories = {
        moderation: { name: "🛡️ Moderasyon", desc: "Sunucu yönetimi ve moderasyon komutları", commands: ["ban", "kick", "mute", "unmute", "warn", "clearwarns", "warnings", "tempban", "softban", "unban", "purge", "lock", "unlock", "slowmode", "nuke"] },
        general: { name: "📋 Genel", desc: "Genel amaçlı kullanıcı komutları", commands: ["help", "ping", "serverinfo", "userinfo", "avatar", "afk", "poll", "remindme", "stats"] },
        economy: { name: "💰 Ekonomi", desc: "Para kazanma ve harcama komutları", commands: ["economy", "daily", "weekly", "beg", "work", "crime", "fish", "mine", "deposit", "withdraw", "transfer", "rob", "buy", "sell", "shop", "inventory", "leaderboard", "lottery"] },
        games: { name: "🎮 Oyunlar", desc: "Eğlence ve oyun komutları", commands: ["8ball", "coinflip", "dice", "rps", "blackjack", "slots", "roulette", "trivia", "quest"] },
        level: { name: "📊 Seviye Sistemi", desc: "XP ve seviye takip komutları", commands: ["level", "rank", "setxp"] },
        setup: { name: "⚙️ Kurulum", desc: "Bot yapılandırma ve kurulum komutları", commands: ["ayarla", "welcome", "autorole", "reactionrole", "ticketsetup", "giveaway", "announce", "embed"] },
        utility: { name: "🔧 Araçlar", desc: "Yardımcı araçlar ve özellikler", commands: ["role", "massrole", "nick", "voicemove", "ticket", "history", "banlist", "jobinfo", "yazdir"] }
      };

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
        .setTitle("⚙️ Sunucu Ayarları - Komut Kategorileri")
        .setDescription(`${emojis.success} **${categories[categoryKey].name}** kategorisi ${settings[categoryKey] === false ? "kapatıldı" : "açıldı"}!\n\nKategorileri açıp kapatarak hangi komutların sunucunuzda görüneceğini kontrol edebilirsiniz.\n\n✅ = Aktif\n❌ = Kapalı`)
        .setColor("#3498DB")
        .setFooter({ text: "Sadece yöneticiler bu ayarları değiştirebilir" })
        .setTimestamp();

      return interaction.update({ embeds: [embed], components: [row] });
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === "help_settings_btn") {
      const isOwner = interaction.user.id === process.env.OWNER_ID;
      const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
      
      if (!isOwner && !isAdmin) {
        return interaction.reply({ content: `${emojis.error} Bu ayarları sadece yöneticiler değiştirebilir!`, ephemeral: true });
      }

      const settingsPath = path.join(__dirname, "pattern/commandsettings.json");
      function loadSettings() {
        if (!fs.existsSync(settingsPath)) return {};
        return JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
      }

      const settings = loadSettings();
      const categories = {
        moderation: { name: "🛡️ Moderasyon", desc: "Sunucu yönetimi ve moderasyon komutları", commands: ["ban", "kick", "mute", "unmute", "warn", "clearwarns", "warnings", "tempban", "softban", "unban", "purge", "lock", "unlock", "slowmode", "nuke"] },
        general: { name: "📋 Genel", desc: "Genel amaçlı kullanıcı komutları", commands: ["help", "ping", "serverinfo", "userinfo", "avatar", "afk", "poll", "remindme", "stats"] },
        economy: { name: "💰 Ekonomi", desc: "Para kazanma ve harcama komutları", commands: ["economy", "daily", "weekly", "beg", "work", "crime", "fish", "mine", "deposit", "withdraw", "transfer", "rob", "buy", "sell", "shop", "inventory", "leaderboard", "lottery"] },
        games: { name: "🎮 Oyunlar", desc: "Eğlence ve oyun komutları", commands: ["8ball", "coinflip", "dice", "rps", "blackjack", "slots", "roulette", "trivia", "quest"] },
        level: { name: "📊 Seviye Sistemi", desc: "XP ve seviye takip komutları", commands: ["level", "rank", "setxp"] },
        setup: { name: "⚙️ Kurulum", desc: "Bot yapılandırma ve kurulum komutları", commands: ["ayarla", "welcome", "autorole", "reactionrole", "ticketsetup", "giveaway", "announce", "embed"] },
        utility: { name: "🔧 Araçlar", desc: "Yardımcı araçlar ve özellikler", commands: ["role", "massrole", "nick", "voicemove", "ticket", "history", "banlist", "jobinfo", "yazdir"] }
      };

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
        .setTitle("⚙️ Sunucu Ayarları - Komut Kategorileri")
        .setDescription("Kategorileri açıp kapatarak hangi komutların sunucunuzda görüneceğini kontrol edebilirsiniz.\n\n✅ = Aktif\n❌ = Kapalı")
        .setColor("#3498DB")
        .setFooter({ text: "Sadece yöneticiler bu ayarları değiştirebilir" })
        .setTimestamp();

      return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
  }

  if (!interaction.isButton()) return;

  if (interaction.customId === "ticket_create") {
    const { ChannelType, PermissionFlagsBits } = require("discord.js");
    
    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username.substring(0, 20)}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      type: ChannelType.GuildText,
      parent: interaction.channel.parentId,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
      ],
    });

    const embed = new EmbedBuilder()
      .setTitle("🎫 Destek Talebi")
      .setDescription(`Merhaba ${interaction.user}, destek ekibimiz en kısa sürede size yardımcı olacaktır.`)
      .setColor("#3498DB")
      .setTimestamp();

    const closeButton = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_close")
          .setLabel("Ticket'ı Kapat")
          .setEmoji("🔒")
          .setStyle(ButtonStyle.Danger)
      );

    ticketChannel.send({ embeds: [embed], components: [closeButton] });

    await interaction.reply({ content: `${emojis.success} Ticket oluşturuldu: ${ticketChannel}`, ephemeral: true });
  }

  if (interaction.customId === "ticket_close") {
    await interaction.reply({ content: `${emojis.loading} Ticket kapatılıyor...`, ephemeral: true });
    setTimeout(() => {
      interaction.channel.delete().catch(console.error);
    }, 3000);
  }

  if (interaction.customId.startsWith("ticket_")) {
    const { ChannelType, PermissionFlagsBits } = require("discord.js");
    
    const ticketConfigPath = path.join(__dirname, "pattern/ticketconfig.json");
    function loadTicketConfig() {
      if (!fs.existsSync(ticketConfigPath)) return {};
      return JSON.parse(fs.readFileSync(ticketConfigPath, "utf-8"));
    }

    const ticketConfig = loadTicketConfig();
    const ticketTypes = {
      ticket_general: { name: "Genel Destek", emoji: "💬", color: "#3498DB" },
      ticket_complaint: { name: "Şikayet", emoji: "⚠️", color: "#E74C3C" },
      ticket_purchase: { name: "Satın Alma", emoji: "💰", color: "#2ECC71" },
      ticket_technical: { name: "Teknik Destek", emoji: "🔧", color: "#95A5A6" },
      ticket_account: { name: "Hesap", emoji: "👤", color: "#9B59B6" },
      ticket_other: { name: "Diğer", emoji: "❓", color: "#34495E" }
    };

    if (interaction.customId !== "ticket_close" && interaction.customId !== "ticket_claim" && interaction.customId !== "ticket_transcript") {
      const ticketType = ticketTypes[interaction.customId];
      if (!ticketType) return;

      const existingTicket = interaction.guild.channels.cache.find(
        ch => ch.name === `ticket-${interaction.user.username.substring(0, 20)}`.toLowerCase().replace(/[^a-z0-9-]/g, '-') && ch.topic?.includes(interaction.user.id)
      );

      if (existingTicket) {
        return interaction.reply({ 
          content: `${emojis.error} Zaten açık bir ticket'ınız var: ${existingTicket}`, 
          ephemeral: true 
        });
      }

      const categoryId = ticketConfig.categoryId;
      const supportRoleId = ticketConfig.supportRoleId;

      const permissionOverwrites = [
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles],
        }
      ];

      if (supportRoleId) {
        permissionOverwrites.push({
          id: supportRoleId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages],
        });
      }

      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username.substring(0, 20)}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        type: ChannelType.GuildText,
        parent: categoryId || interaction.channel.parentId,
        topic: `Ticket sahibi: ${interaction.user.id} | Kategori: ${ticketType.name}`,
        permissionOverwrites: permissionOverwrites
      });

      const embed = new EmbedBuilder()
        .setTitle(`${ticketType.emoji} ${ticketType.name}`)
        .setDescription(`Merhaba ${interaction.user},\n\nDestek talebiniz oluşturuldu. Ekibimiz en kısa sürede size yardımcı olacaktır.\n\n**Kategori:** ${ticketType.name}\n**Durum:** 🟢 Açık`)
        .setColor(ticketType.color)
        .setFooter({ text: `Ticket ID: ${ticketChannel.id}` })
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("ticket_close")
            .setLabel("Ticket'ı Kapat")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("ticket_claim")
            .setLabel("Ticket'ı Üstlen")
            .setEmoji("✋")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("ticket_transcript")
            .setLabel("Transkript Al")
            .setEmoji("📄")
            .setStyle(ButtonStyle.Secondary)
        );

      const welcomeMsg = await ticketChannel.send({ 
        content: supportRoleId ? `<@&${supportRoleId}>` : "", 
        embeds: [embed], 
        components: [row] 
      });
      welcomeMsg.pin().catch(() => {});

      await interaction.reply({ 
        content: `${emojis.success} Ticket oluşturuldu: ${ticketChannel}`, 
        ephemeral: true 
      });

      if (ticketConfig.logChannelId) {
        const logChannel = interaction.guild.channels.cache.get(ticketConfig.logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setTitle("🎫 Yeni Ticket Oluşturuldu")
            .setColor("#00FF00")
            .addFields(
              { name: "👤 Kullanıcı", value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
              { name: "📂 Kategori", value: ticketType.name, inline: true },
              { name: "📍 Kanal", value: `${ticketChannel}`, inline: true }
            )
            .setTimestamp();
          logChannel.send({ embeds: [logEmbed] });
        }
      }
    }
  }

  if (interaction.customId === "ticket_close") {
    if (!interaction.channel.name.startsWith("ticket-")) {
      return interaction.reply({ content: `${emojis.error} Bu bir ticket kanalı değil!`, ephemeral: true });
    }

    const ticketConfigPath = path.join(__dirname, "pattern/ticketconfig.json");
    function loadTicketConfig() {
      if (!fs.existsSync(ticketConfigPath)) return {};
      return JSON.parse(fs.readFileSync(ticketConfigPath, "utf-8"));
    }

    const ticketConfig = loadTicketConfig();

    const embed = new EmbedBuilder()
      .setTitle("🔒 Ticket Kapatılıyor")
      .setDescription(`Ticket ${interaction.user} tarafından kapatılıyor...\n\n5 saniye içinde kanal silinecek.`)
      .setColor("#FF0000")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    if (ticketConfig.logChannelId) {
      const logChannel = interaction.guild.channels.cache.get(ticketConfig.logChannelId);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle("🔒 Ticket Kapatıldı")
          .setColor("#FF0000")
          .addFields(
            { name: "📍 Kanal", value: interaction.channel.name, inline: true },
            { name: "👤 Kapatan", value: `${interaction.user.tag}`, inline: true },
            { name: "🕒 Kapatılma Zamanı", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
          )
          .setTimestamp();
        logChannel.send({ embeds: [logEmbed] });
      }
    }

    setTimeout(() => {
      interaction.channel.delete().catch(console.error);
    }, 5000);
  }

  if (interaction.customId === "ticket_claim") {
    if (!interaction.channel.name.startsWith("ticket-")) {
      return interaction.reply({ content: `${emojis.error} Bu bir ticket kanalı değil!`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setDescription(`${emojis.success} ${interaction.user} bu ticket'ı üstlendi!`)
      .setColor("#00FF00")
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }

  if (interaction.customId === "ticket_transcript") {
    if (!interaction.channel.name.startsWith("ticket-")) {
      return interaction.reply({ content: `${emojis.error} Bu bir ticket kanalı değil!`, ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    let transcript = `Ticket Transkript - ${interaction.channel.name}\n`;
    transcript += `Oluşturulma: ${new Date(interaction.channel.createdTimestamp).toLocaleString("tr-TR")}\n`;
    transcript += `${"=".repeat(50)}\n\n`;

    messages.reverse().forEach(msg => {
      const timestamp = new Date(msg.createdTimestamp).toLocaleString("tr-TR");
      const safeContent = msg.content.substring(0, 500);
      transcript += `[${timestamp}] ${msg.author.tag}: ${safeContent}\n`;
      if (msg.attachments.size > 0) {
        msg.attachments.forEach(att => {
          transcript += `  📎 ${att.url}\n`;
        });
      }
      transcript += "\n";
    });

    if (transcript.length > 1000000) {
      transcript = transcript.substring(0, 1000000);
    }

    const buffer = Buffer.from(transcript, "utf-8");

    await interaction.editReply({ 
      content: `${emojis.success} Transkript hazırlandı!`,
      files: [{ attachment: buffer, name: `transcript-${interaction.channel.name}.txt` }]
    });
  }

  if (interaction.customId.startsWith("rps_")) {
    const [, choice, userId] = interaction.customId.split("_");
    
    if (interaction.user.id !== userId) {
      return interaction.reply({ content: `${emojis.error} Bu oyun size ait değil!`, ephemeral: true });
    }

    const rpsCommand = client.commands.get("rps");
    const activeGames = rpsCommand ? new Map() : new Map();

    if (!activeGames.has(userId)) {
      return interaction.reply({ content: `${emojis.error} Oyun bulunamadı!`, ephemeral: true });
    }

    const choices = ["rock", "paper", "scissors"];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    const choiceEmojis = {
      rock: "✊",
      paper: "✋",
      scissors: "✌️"
    };

    const choiceNames = {
      rock: "Taş",
      paper: "Kağıt",
      scissors: "Makas"
    };

    let result;
    let color;

    if (choice === botChoice) {
      result = "Berabere!";
      color = "#FFA500";
    } else if (
      (choice === "rock" && botChoice === "scissors") ||
      (choice === "paper" && botChoice === "rock") ||
      (choice === "scissors" && botChoice === "paper")
    ) {
      result = "Kazandınız!";
      color = "#00FF00";
    } else {
      result = "Kaybettiniz!";
      color = "#FF0000";
    }

    const embed = new EmbedBuilder()
      .setTitle("✊✋✌️ Taş Kağıt Makas - Sonuç")
      .setDescription(`**${result}**`)
      .setColor(color)
      .addFields(
        { name: "Sizin Seçiminiz", value: `${choiceEmojis[choice]} ${choiceNames[choice]}`, inline: true },
        { name: "Bot'un Seçimi", value: `${choiceEmojis[botChoice]} ${choiceNames[botChoice]}`, inline: true }
      )
      .setTimestamp();

    activeGames.delete(userId);
    interaction.update({ embeds: [embed], components: [] });
  }

  if (interaction.customId.startsWith("work_")) {
    const userId = interaction.customId.split("_")[2];
    if (interaction.user.id !== userId) {
      return interaction.reply({ content: `${emojis.error} Bu iş size ait değil!`, ephemeral: true });
    }

    const workCommand = client.commands.get("work");
    const activeWorkSessions = workCommand.activeWorkSessions || new Map();

    const session = activeWorkSessions.get(userId);
    if (!session) {
      return interaction.reply({ content: `${emojis.error} İş görevi bulunamadı!`, ephemeral: true });
    }

    const economyPath = path.join(__dirname, "pattern/economy.json");
    function loadEconomy() {
      if (!fs.existsSync(economyPath)) return {};
      return JSON.parse(fs.readFileSync(economyPath, "utf-8"));
    }
    function saveEconomy(data) {
      fs.writeFileSync(economyPath, JSON.stringify(data, null, 2));
    }

    const data = loadEconomy();
    const userData = data[userId];

    if (interaction.customId.startsWith("work_accept_")) {
      const earned = Math.floor(session.baseEarned * session.task.bonus);
      userData.balance += earned;
      userData.lastWork = Date.now();
      userData.currentJob = session.job.id;
      saveEconomy(data);

      activeWorkSessions.delete(userId);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.success} İş Tamamlandı!`)
        .setDescription(`**${session.job.name}** olarak çalıştınız!\n**Görev:** ${session.task.text}`)
        .setColor("#00FF00")
        .addFields(
          { name: "💰 Kazanılan", value: `\`${earned}\` coin`, inline: true },
          { name: "💵 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true }
        )
        .setTimestamp();

      return interaction.update({ embeds: [embed], components: [] });
    }

    if (interaction.customId.startsWith("work_decline_")) {
      activeWorkSessions.delete(userId);

      const embed = new EmbedBuilder()
        .setDescription(`${emojis.error} İş görevini reddettiniz.`)
        .setColor("#FF0000");

      return interaction.update({ embeds: [embed], components: [] });
    }
  }

  if (interaction.customId.startsWith("bj_")) {
    const economyPath = path.join(__dirname, "pattern/economy.json");
    const activeGames = require("./commands/blackjack").activeGames || new Map();
    
    function loadEconomy() {
      if (!fs.existsSync(economyPath)) return {};
      return JSON.parse(fs.readFileSync(economyPath, "utf-8"));
    }
    
    function saveEconomy(data) {
      fs.writeFileSync(economyPath, JSON.stringify(data, null, 2));
    }
    
    function calculateHand(hand) {
      let total = 0;
      let aces = 0;
      hand.forEach(card => {
        const value = card.slice(0, -1);
        if (value === "A") {
          aces++;
          total += 11;
        } else if (["J", "Q", "K"].includes(value)) {
          total += 10;
        } else {
          total += parseInt(value);
        }
      });
      while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
      }
      return total;
    }
    
    const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const suits = ["♠️", "♥️", "♦️", "♣️"];
    function drawCard() {
      return `${cards[Math.floor(Math.random() * cards.length)]}${suits[Math.floor(Math.random() * suits.length)]}`;
    }
    
    const userId = interaction.customId.split("_")[2];
    if (interaction.user.id !== userId) {
      return interaction.reply({ content: `${emojis.error} Bu oyun size ait değil!`, ephemeral: true });
    }
    
    const gameData = activeGames.get(userId);
    if (!gameData) {
      return interaction.reply({ content: `${emojis.error} Oyun bulunamadı!`, ephemeral: true });
    }
    
    const data = loadEconomy();
    const userData = data[userId];
    
    if (interaction.customId.startsWith("bj_hit_")) {
      gameData.playerHand.push(drawCard());
      const playerTotal = calculateHand(gameData.playerHand);
      
      if (playerTotal > 21) {
        userData.balance -= gameData.bet;
        saveEconomy(data);
        activeGames.delete(userId);
        
        const embed = new EmbedBuilder()
          .setTitle("🃏 BLACKJACK - BUST!")
          .setDescription(`${emojis.error} **${playerTotal}** - Battınız!`)
          .setColor("#FF0000")
          .addFields(
            { name: "🎴 Sizin Kartlarınız", value: `${gameData.playerHand.join(" ")} = **${playerTotal}**`, inline: false },
            { name: "💰 Kayıp", value: `\`-${gameData.bet}\` coin`, inline: true },
            { name: "💵 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true }
          )
          .setTimestamp();
        
        return interaction.update({ embeds: [embed], components: [] });
      }
      
      const embed = new EmbedBuilder()
        .setTitle("🃏 BLACKJACK")
        .setColor("#3498DB")
        .addFields(
          { name: "🎴 Sizin Kartlarınız", value: `${gameData.playerHand.join(" ")} = **${playerTotal}**`, inline: false },
          { name: "🎴 Krupiye", value: `${gameData.dealerHand[0]} ❓`, inline: false }
        )
        .setTimestamp();
      
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`bj_hit_${userId}`)
            .setLabel("Kart Çek")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`bj_stand_${userId}`)
            .setLabel("Dur")
            .setStyle(ButtonStyle.Success)
        );
      
      return interaction.update({ embeds: [embed], components: [row] });
    }
    
    if (interaction.customId.startsWith("bj_stand_")) {
      let dealerTotal = calculateHand(gameData.dealerHand);
      
      while (dealerTotal < 17) {
        gameData.dealerHand.push(drawCard());
        dealerTotal = calculateHand(gameData.dealerHand);
      }
      
      const playerTotal = calculateHand(gameData.playerHand);
      let result, winAmount, color;
      
      if (dealerTotal > 21 || playerTotal > dealerTotal) {
        winAmount = gameData.bet * 2;
        userData.balance += winAmount;
        result = `${emojis.success} Kazandınız! +${winAmount} coin`;
        color = "#00FF00";
      } else if (playerTotal === dealerTotal) {
        userData.balance += gameData.bet;
        result = `${emojis.info} Berabere! Bahsiniz iade edildi.`;
        color = "#FFA500";
      } else {
        result = `${emojis.error} Kaybettiniz! -${gameData.bet} coin`;
        color = "#FF0000";
      }
      
      saveEconomy(data);
      activeGames.delete(userId);
      
      const embed = new EmbedBuilder()
        .setTitle("🃏 BLACKJACK - Sonuç")
        .setDescription(result)
        .setColor(color)
        .addFields(
          { name: "🎴 Sizin Kartlarınız", value: `${gameData.playerHand.join(" ")} = **${playerTotal}**`, inline: false },
          { name: "🎴 Krupiye", value: `${gameData.dealerHand.join(" ")} = **${dealerTotal}**`, inline: false },
          { name: "💵 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true }
        )
        .setTimestamp();
      
      return interaction.update({ embeds: [embed], components: [] });
    }
  }

  if (interaction.customId.startsWith("rapor_gonder")) {
    const [,, userId, type] = interaction.customId.split("_");
    const logId = logkanallari.rapor_log;
    
    const embed = new EmbedBuilder()
      .setTitle("🚨 Limit Guard İtiraz Raporu")
      .setColor("#3498DB")
      .addFields(
        { name: "👤 Kullanıcı", value: `<@${userId}> (\`${userId}\`)`, inline: true },
        { name: "🛡️ İşlem Tipi", value: `\`${type}\``, inline: true },
        { name: "🕒 Talep Zamanı", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
      )
      .setDescription("Kullanıcı limit aşımı nedeniyle engellendi ve itiraz talebinde bulundu.")
      .setTimestamp();
    
    if (logId && interaction.guild) {
      const channel = interaction.guild.channels.cache.get(logId);
      if (channel) {
        channel.send({ embeds: [embed] }).catch(console.error);
      }
    }

    await interaction.update({ content: `${emojis.success} İtiraz raporunuz yönetime iletildi.`, embeds: [], components: [] });
  }
});

client.login(process.env.TOKEN).catch(error => {
  console.error("Login failed:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});
