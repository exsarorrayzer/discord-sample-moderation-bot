const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config.json");
const emojis = config.emojis;

const remindersPath = path.join(__dirname, "../pattern/reminders.json");

function loadReminders() {
  if (!fs.existsSync(remindersPath)) {
    fs.writeFileSync(remindersPath, JSON.stringify({}, null, 2));
    return {};
  }
  return JSON.parse(fs.readFileSync(remindersPath, "utf-8"));
}

function saveReminders(data) {
  fs.writeFileSync(remindersPath, JSON.stringify(data, null, 2));
}

function parseDuration(str) {
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) return null;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * multipliers[unit];
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} gün`;
  if (hours > 0) return `${hours} saat`;
  if (minutes > 0) return `${minutes} dakika`;
  return `${seconds} saniye`;
}

function checkReminders(client) {
  const reminders = loadReminders();
  const now = Date.now();
  let changed = false;
  
  for (const userId in reminders) {
    const userReminders = reminders[userId].filter(r => {
      if (now >= r.time) {
        const user = client.users.cache.get(userId);
        if (user) {
          const embed = new EmbedBuilder()
            .setTitle(`${emojis.alert} Hatırlatma!`)
            .setDescription(r.message)
            .setColor("#FFD700")
            .addFields(
              { name: "⏰ Ayarlandığı Zaman", value: `<t:${Math.floor(r.created / 1000)}:R>`, inline: true },
              { name: "📍 Kanal", value: r.channelName || "Bilinmiyor", inline: true }
            )
            .setFooter({ text: `ID: ${r.id}` })
            .setTimestamp();
          
          user.send({ embeds: [embed] }).catch(() => {});
        }
        changed = true;
        return false;
      }
      return true;
    });
    
    if (userReminders.length === 0) {
      delete reminders[userId];
    } else {
      reminders[userId] = userReminders;
    }
  }
  
  if (changed) saveReminders(reminders);
}

module.exports = {
  name: "remindme",
  aliases: ["remind", "hatırlat", "hatirlatma"],
  execute(message, args) {
    if (!args[0]) {
      return message.reply(`${emojis.warn} Kullanım:\n\`!remindme <süre> <mesaj>\` - Hatırlatma oluştur\n\`!remindme list\` - Hatırlatmalarını listele\n\`!remindme cancel <id>\` - Hatırlatmayı iptal et\n\nSüre formatı: \`10s\`, \`5m\`, \`2h\`, \`3d\``);
    }
    
    const subcommand = args[0].toLowerCase();
    
    if (subcommand === "list" || subcommand === "liste") {
      const reminders = loadReminders();
      const userReminders = reminders[message.author.id] || [];
      
      if (userReminders.length === 0) {
        return message.reply(`${emojis.info} Aktif hatırlatmanız bulunmuyor.`);
      }
      
      const embed = new EmbedBuilder()
        .setTitle(`${emojis.calendar} Hatırlatmalarınız`)
        .setColor("#3498DB")
        .setDescription(userReminders.map(r => {
          const remaining = r.time - Date.now();
          return `**ID:** \`${r.id}\`\n**Mesaj:** ${r.message.substring(0, 100)}\n**Kalan:** ${formatDuration(remaining)}\n**Zaman:** <t:${Math.floor(r.time / 1000)}:F>\n`;
        }).join("\n"))
        .setFooter({ text: `Toplam ${userReminders.length} hatırlatma` })
        .setTimestamp();
      
      return message.channel.send({ embeds: [embed] });
    }
    
    if (subcommand === "cancel" || subcommand === "iptal") {
      const id = args[1];
      if (!id) {
        return message.reply(`${emojis.warn} Kullanım: \`!remindme cancel <id>\``);
      }
      
      const reminders = loadReminders();
      const userReminders = reminders[message.author.id] || [];
      const index = userReminders.findIndex(r => r.id === id);
      
      if (index === -1) {
        return message.reply(`${emojis.error} Bu ID'ye sahip hatırlatma bulunamadı.`);
      }
      
      userReminders.splice(index, 1);
      
      if (userReminders.length === 0) {
        delete reminders[message.author.id];
      } else {
        reminders[message.author.id] = userReminders;
      }
      
      saveReminders(reminders);
      
      return message.reply(`${emojis.success} Hatırlatma iptal edildi.`);
    }
    
    const duration = parseDuration(args[0]);
    if (!duration) {
      return message.reply(`${emojis.error} Geçersiz süre formatı! Kullanım: \`10s\`, \`5m\`, \`2h\`, \`3d\``);
    }
    
    if (duration < 10000) {
      return message.reply(`${emojis.warn} Minimum hatırlatma süresi 10 saniyedir.`);
    }
    
    if (duration > 2592000000) {
      return message.reply(`${emojis.warn} Maximum hatırlatma süresi 30 gündür.`);
    }
    
    const reminderMessage = args.slice(1).join(" ");
    if (!reminderMessage || reminderMessage.length > 500) {
      return message.reply(`${emojis.warn} Hatırlatma mesajı 1-500 karakter arasında olmalıdır.`);
    }
    
    const reminders = loadReminders();
    if (!reminders[message.author.id]) {
      reminders[message.author.id] = [];
    }
    
    if (reminders[message.author.id].length >= 10) {
      return message.reply(`${emojis.error} Maximum 10 aktif hatırlatmanız olabilir.`);
    }
    
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    const reminder = {
      id: id,
      message: reminderMessage,
      time: Date.now() + duration,
      created: Date.now(),
      channelName: message.channel.name
    };
    
    reminders[message.author.id].push(reminder);
    saveReminders(reminders);
    
    const embed = new EmbedBuilder()
      .setTitle(`${emojis.success} Hatırlatma Oluşturuldu`)
      .setColor("#00FF00")
      .addFields(
        { name: "💬 Mesaj", value: reminderMessage, inline: false },
        { name: "⏰ Hatırlatma Zamanı", value: `<t:${Math.floor(reminder.time / 1000)}:F>`, inline: true },
        { name: "⏳ Süre", value: formatDuration(duration), inline: true },
        { name: "🆔 ID", value: `\`${id}\``, inline: true }
      )
      .setFooter({ text: "DM olarak hatırlatılacaksınız" })
      .setTimestamp();
    
    message.channel.send({ embeds: [embed] });
  },
  
  startReminderCheck(client) {
    setInterval(() => checkReminders(client), 10000);
  }
};
