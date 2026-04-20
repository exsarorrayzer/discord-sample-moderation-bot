const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;

const questsPath = path.join(__dirname, "../../pattern/quests.json");
const economyPath = path.join(__dirname, "../../pattern/economy.json");

function loadQuests() {
  if (!fs.existsSync(questsPath)) {
    fs.writeFileSync(questsPath, JSON.stringify({}, null, 2));
    return {};
  }
  return JSON.parse(fs.readFileSync(questsPath, "utf-8"));
}

function saveQuests(data) {
  fs.writeFileSync(questsPath, JSON.stringify(data, null, 2));
}

function loadEconomy() {
  if (!fs.existsSync(economyPath)) return {};
  return JSON.parse(fs.readFileSync(economyPath, "utf-8"));
}

function saveEconomy(data) {
  fs.writeFileSync(economyPath, JSON.stringify(data, null, 2));
}

const dailyQuests = [
  { id: "messages", name: "Mesaj Gönder", desc: "10 mesaj gönder", target: 10, reward: 500, emoji: "💬" },
  { id: "work", name: "Çalış", desc: "3 kez çalış", target: 3, reward: 300, emoji: "💼" },
  { id: "gamble", name: "Kumar Oyna", desc: "5 kumar oyunu oyna", target: 5, reward: 400, emoji: "🎰" },
  { id: "fish", name: "Balık Tut", desc: "5 balık tut", target: 5, reward: 350, emoji: "🎣" },
  { id: "mine", name: "Madencilik", desc: "5 kez madencilik yap", target: 5, reward: 350, emoji: "⛏️" }
];

module.exports = {
  name: "quest",
  aliases: ["görev", "quests"],
  execute(message, args) {
    const quests = loadQuests();
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    if (!quests[message.author.id] || quests[message.author.id].lastReset < oneDayAgo) {
      const randomQuest = dailyQuests[Math.floor(Math.random() * dailyQuests.length)];
      quests[message.author.id] = {
        quest: randomQuest,
        progress: 0,
        lastReset: now,
        completed: false
      };
      saveQuests(quests);
    }

    const userQuest = quests[message.author.id];
    const quest = userQuest.quest;

    if (args[0] === "claim" || args[0] === "al") {
      if (!userQuest.completed) {
        return message.reply(`${emojis.error} Görevi henüz tamamlamadınız!`);
      }

      if (userQuest.claimed) {
        return message.reply(`${emojis.error} Bu görevin ödülünü zaten aldınız!`);
      }

      const economy = loadEconomy();
      if (!economy[message.author.id]) {
        economy[message.author.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0, inventory: [] };
      }

      economy[message.author.id].balance += quest.reward;
      saveEconomy(economy);

      userQuest.claimed = true;
      saveQuests(quests);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.success} Görev Ödülü Alındı!`)
        .setDescription(`**${quest.reward}** coin kazandınız!`)
        .setColor("#00FF00")
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    const progressBar = "█".repeat(Math.floor((userQuest.progress / quest.target) * 10)) + "░".repeat(10 - Math.floor((userQuest.progress / quest.target) * 10));

    const embed = new EmbedBuilder()
      .setTitle(`${quest.emoji} Günlük Görev`)
      .setColor(userQuest.completed ? "#00FF00" : "#3498DB")
      .addFields(
        { name: "📋 Görev", value: `**${quest.name}**\n${quest.desc}`, inline: false },
        { name: "📊 İlerleme", value: `${progressBar}\n\`${userQuest.progress}/${quest.target}\``, inline: false },
        { name: "💰 Ödül", value: `\`${quest.reward}\` coin`, inline: true },
        { name: "⏰ Durum", value: userQuest.completed ? (userQuest.claimed ? "✅ Alındı" : "✅ Tamamlandı") : "🔄 Devam Ediyor", inline: true }
      )
      .setFooter({ text: userQuest.completed && !userQuest.claimed ? "!quest claim ile ödülü alabilirsiniz" : "Görevi tamamlayın!" })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
