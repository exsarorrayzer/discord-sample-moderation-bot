const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;

const economyPath = path.join(__dirname, "../pattern/economy.json");

function loadEconomy() {
  if (!fs.existsSync(economyPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(economyPath, "utf-8"));
}

const jobs = {
  developer: { name: "💻 Yazılımcı", desc: "Kod yazarak para kazanın" },
  doctor: { name: "⚕️ Doktor", desc: "Hayat kurtararak para kazanın" },
  teacher: { name: "📚 Öğretmen", desc: "Öğreterek para kazanın" },
  waiter: { name: "🍽️ Garson", desc: "Servis yaparak para kazanın" },
  cleaner: { name: "🧹 Temizlikçi", desc: "Temizlik yaparak para kazanın" },
  driver: { name: "🚕 Taksici", desc: "Yolcu taşıyarak para kazanın" },
  chef: { name: "👨‍🍳 Aşçı", desc: "Yemek pişirerek para kazanın" },
  engineer: { name: "⚙️ Mühendis", desc: "Proje yaparak para kazanın" },
  lawyer: { name: "⚖️ Avukat", desc: "Dava kazanarak para kazanın" },
  police: { name: "👮 Polis", desc: "Suçlu yakalayarak para kazanın" }
};

module.exports = {
  name: "jobinfo",
  aliases: ["işbilgi", "meslek"],
  execute(message) {
    const data = loadEconomy();
    const target = message.mentions.members.first() || message.member;

    if (!data[target.id] || !data[target.id].currentJob) {
      return message.reply(`${emojis.info} ${target.user.tag} henüz hiç çalışmamış.`);
    }

    const jobId = data[target.id].currentJob;
    const job = jobs[jobId];

    if (!job) {
      return message.reply(`${emojis.error} Meslek bilgisi bulunamadı.`);
    }

    const embed = new EmbedBuilder()
      .setTitle(`${job.name}`)
      .setDescription(job.desc)
      .setColor("#3498DB")
      .addFields(
        { name: "👤 Çalışan", value: `${target.user.tag}`, inline: true },
        { name: "💼 Meslek", value: job.name, inline: true }
      )
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
