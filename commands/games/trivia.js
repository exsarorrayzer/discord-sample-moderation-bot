const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;

const economyPath = path.join(__dirname, "../../pattern/economy.json");

function loadEconomy() {
  if (!fs.existsSync(economyPath)) return {};
  return JSON.parse(fs.readFileSync(economyPath, "utf-8"));
}

function saveEconomy(data) {
  fs.writeFileSync(economyPath, JSON.stringify(data, null, 2));
}

const questions = [
  { q: "Türkiye'nin başkenti neresidir?", a: ["ankara"], reward: 100 },
  { q: "Dünyanın en büyük okyanusu hangisidir?", a: ["pasifik", "büyük okyanus"], reward: 150 },
  { q: "Güneş sisteminde kaç gezegen vardır?", a: ["8", "sekiz"], reward: 120 },
  { q: "Python hangi tür bir dildir?", a: ["programlama", "programlama dili"], reward: 200 },
  { q: "Discord hangi yıl kuruldu?", a: ["2015"], reward: 250 },
  { q: "JavaScript'i kim geliştirdi?", a: ["brendan eich"], reward: 300 },
  { q: "HTTP'nin açılımı nedir?", a: ["hypertext transfer protocol"], reward: 200 },
  { q: "1 GB kaç MB'dir?", a: ["1024"], reward: 150 },
  { q: "İlk bilgisayar virüsünün adı nedir?", a: ["creeper"], reward: 300 },
  { q: "HTML'in açılımı nedir?", a: ["hypertext markup language"], reward: 180 }
];

const activeTrivia = new Map();

module.exports = {
  name: "trivia",
  aliases: ["bilgi", "quiz"],
  execute(message, args) {
    if (activeTrivia.has(message.channel.id)) {
      return message.reply(`${emojis.error} Bu kanalda zaten aktif bir trivia var!`);
    }

    const question = questions[Math.floor(Math.random() * questions.length)];

    const embed = new EmbedBuilder()
      .setTitle("🧠 Trivia Sorusu")
      .setDescription(`**${question.q}**\n\n30 saniye içinde cevap verin!`)
      .setColor("#3498DB")
      .addFields({ name: "💰 Ödül", value: `\`${question.reward}\` coin`, inline: true })
      .setFooter({ text: "Cevabı sohbete yazın!" })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });

    activeTrivia.set(message.channel.id, { question, answered: new Set() });

    const filter = m => {
      if (m.author.bot) return false;
      const data = activeTrivia.get(message.channel.id);
      if (data.answered.has(m.author.id)) return false;
      
      const answer = m.content.toLowerCase().trim();
      return question.a.some(a => answer.includes(a));
    };

    const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 });

    collector.on("collect", m => {
      const data = activeTrivia.get(message.channel.id);
      data.answered.add(m.author.id);

      const economy = loadEconomy();
      if (!economy[m.author.id]) {
        economy[m.author.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0, inventory: [] };
      }

      economy[m.author.id].balance += question.reward;
      saveEconomy(economy);

      const winEmbed = new EmbedBuilder()
        .setTitle(`${emojis.success} Doğru Cevap!`)
        .setDescription(`**${m.author.tag}** doğru cevap verdi ve **${question.reward}** coin kazandı!`)
        .setColor("#00FF00")
        .setTimestamp();

      message.channel.send({ embeds: [winEmbed] });
      activeTrivia.delete(message.channel.id);
    });

    collector.on("end", collected => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setDescription(`${emojis.error} Süre doldu! Doğru cevap: **${question.a[0]}**`)
          .setColor("#FF0000");

        message.channel.send({ embeds: [timeoutEmbed] });
        activeTrivia.delete(message.channel.id);
      }
    });
  }
};
