const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config.json");
const emojis = config.emojis;

const economyPath = path.join(__dirname, "../pattern/economy.json");

function loadEconomy() {
  if (!fs.existsSync(economyPath)) {
    fs.writeFileSync(economyPath, JSON.stringify({}, null, 2));
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(economyPath, "utf-8"));
  } catch (error) {
    console.error("Economy file parse error:", error);
    return {};
  }
}

function saveEconomy(data) {
  try {
    fs.writeFileSync(economyPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Economy file write error:", error);
  }
}

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const jobs = [
  { 
    id: "developer",
    name: "💻 Yazılımcı", 
    min: 200, 
    max: 500,
    tasks: [
      { text: "Bug'ı buldunuz ve düzelttiniz", bonus: 1.2 },
      { text: "Kod review yaptınız", bonus: 1.0 },
      { text: "Yeni özellik geliştirdiniz", bonus: 1.5 },
      { text: "Deployment yaptınız", bonus: 1.1 },
      { text: "Stack Overflow'da cevap buldunuz", bonus: 0.9 }
    ]
  },
  { 
    id: "doctor",
    name: "⚕️ Doktor", 
    min: 300, 
    max: 600,
    tasks: [
      { text: "Acil ameliyat yaptınız", bonus: 1.5 },
      { text: "Hasta muayene ettiniz", bonus: 1.0 },
      { text: "Reçete yazdınız", bonus: 0.8 },
      { text: "Hayat kurtardınız", bonus: 2.0 },
      { text: "Nöbet tuttunuz", bonus: 1.3 }
    ]
  },
  { 
    id: "teacher",
    name: "📚 Öğretmen", 
    min: 150, 
    max: 400,
    tasks: [
      { text: "Ders anlattınız", bonus: 1.0 },
      { text: "Sınav hazırladınız", bonus: 0.9 },
      { text: "Öğrencilere yardım ettiniz", bonus: 1.2 },
      { text: "Veli toplantısı yaptınız", bonus: 0.8 },
      { text: "Proje değerlendirdiniz", bonus: 1.1 }
    ]
  },
  { 
    id: "waiter",
    name: "🍽️ Garson", 
    min: 100, 
    max: 250,
    tasks: [
      { text: "Sipariş aldınız", bonus: 1.0 },
      { text: "Büyük bahşiş aldınız", bonus: 1.8 },
      { text: "Masaları temizlediniz", bonus: 0.9 },
      { text: "Müşteri memnuniyeti sağladınız", bonus: 1.3 },
      { text: "Yoğun saatte çalıştınız", bonus: 1.4 }
    ]
  },
  { 
    id: "cleaner",
    name: "🧹 Temizlikçi", 
    min: 80, 
    max: 200,
    tasks: [
      { text: "Ofisi temizlediniz", bonus: 1.0 },
      { text: "Derin temizlik yaptınız", bonus: 1.3 },
      { text: "Cam sildiniz", bonus: 0.9 },
      { text: "Ekstra mesai yaptınız", bonus: 1.5 },
      { text: "Hızlı iş bitirdiniz", bonus: 1.1 }
    ]
  },
  { 
    id: "driver",
    name: "🚕 Taksici", 
    min: 120, 
    max: 300,
    tasks: [
      { text: "Yolcu taşıdınız", bonus: 1.0 },
      { text: "Havaalanı seferi yaptınız", bonus: 1.5 },
      { text: "Gece vardiyası çalıştınız", bonus: 1.4 },
      { text: "İyi bahşiş aldınız", bonus: 1.6 },
      { text: "Trafikte beklediniz", bonus: 0.8 }
    ]
  },
  { 
    id: "chef",
    name: "👨‍🍳 Aşçı", 
    min: 150, 
    max: 350,
    tasks: [
      { text: "Yemek pişirdiniz", bonus: 1.0 },
      { text: "Özel menü hazırladınız", bonus: 1.5 },
      { text: "Müşteri övgü aldı", bonus: 1.4 },
      { text: "Yeni tarif denediniz", bonus: 1.2 },
      { text: "Mutfak yönettiniz", bonus: 1.3 }
    ]
  },
  { 
    id: "engineer",
    name: "⚙️ Mühendis", 
    min: 250, 
    max: 550,
    tasks: [
      { text: "Proje tamamladınız", bonus: 1.3 },
      { text: "Teknik çizim yaptınız", bonus: 1.0 },
      { text: "Arıza giderdiniz", bonus: 1.4 },
      { text: "Yenilik geliştirdiniz", bonus: 1.6 },
      { text: "Saha çalışması yaptınız", bonus: 1.2 }
    ]
  },
  { 
    id: "lawyer",
    name: "⚖️ Avukat", 
    min: 300, 
    max: 700,
    tasks: [
      { text: "Dava kazandınız", bonus: 1.8 },
      { text: "Müvekkil görüşmesi yaptınız", bonus: 1.0 },
      { text: "Sözleşme hazırladınız", bonus: 1.2 },
      { text: "Mahkemede savunma yaptınız", bonus: 1.5 },
      { text: "Hukuki danışmanlık verdiniz", bonus: 1.1 }
    ]
  },
  { 
    id: "police",
    name: "👮 Polis", 
    min: 200, 
    max: 450,
    tasks: [
      { text: "Devriye gezdiniz", bonus: 1.0 },
      { text: "Suçlu yakaladınız", bonus: 1.6 },
      { text: "Trafik kontrolü yaptınız", bonus: 0.9 },
      { text: "Acil müdahale ettiniz", bonus: 1.5 },
      { text: "Rapor yazdınız", bonus: 0.8 }
    ]
  }
];

const activeWorkSessions = new Map();

module.exports = {
  name: "work",
  aliases: ["çalış", "iş"],
  activeWorkSessions: activeWorkSessions,
  execute(message) {
    const data = loadEconomy();
    if (!data[message.author.id]) {
      data[message.author.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0, lastWork: 0, inventory: [], currentJob: null };
    }

    const userData = data[message.author.id];
    const now = Date.now();
    const cooldown = 60 * 60 * 1000;

    if (now - userData.lastWork < cooldown) {
      const remaining = cooldown - (now - userData.lastWork);
      const minutes = Math.floor(remaining / (60 * 1000));

      return message.reply(`${emojis.time} Çok yorgunsunuz! \`${minutes}\` dakika sonra tekrar çalışabilirsiniz.`);
    }

    if (activeWorkSessions.has(message.author.id)) {
      return message.reply(`${emojis.warn} Zaten aktif bir iş göreviniz var!`);
    }

    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const task = job.tasks[Math.floor(Math.random() * job.tasks.length)];
    const baseEarned = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

    activeWorkSessions.set(message.author.id, {
      job: job,
      task: task,
      baseEarned: baseEarned,
      timestamp: now
    });

    const embed = new EmbedBuilder()
      .setTitle(`${job.name} - İş Görevi`)
      .setDescription(`**Görev:** ${task.text}\n\nGörevi kabul ediyor musunuz?`)
      .setColor("#3498DB")
      .addFields(
        { name: "💰 Temel Ücret", value: `\`${baseEarned}\` coin`, inline: true },
        { name: "📊 Bonus Çarpanı", value: `\`x${task.bonus}\``, inline: true },
        { name: "💵 Toplam Kazanç", value: `\`${Math.floor(baseEarned * task.bonus)}\` coin`, inline: true }
      )
      .setFooter({ text: "30 saniye içinde karar verin!" })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`work_accept_${message.author.id}`)
          .setLabel("Kabul Et")
          .setEmoji("✅")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`work_decline_${message.author.id}`)
          .setLabel("Reddet")
          .setEmoji("❌")
          .setStyle(ButtonStyle.Danger)
      );

    message.channel.send({ embeds: [embed], components: [row] }).then(msg => {
      setTimeout(() => {
        if (activeWorkSessions.has(message.author.id)) {
          activeWorkSessions.delete(message.author.id);
          msg.edit({ 
            content: `${emojis.error} Süre doldu! Görev iptal edildi.`, 
            embeds: [], 
            components: [] 
          }).catch(() => {});
        }
      }, 30000);
    });
  }
};
