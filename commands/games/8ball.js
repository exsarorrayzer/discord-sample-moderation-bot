const { EmbedBuilder } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;

const answers = [
  "Kesinlikle evet!",
  "Kesinlikle hayır!",
  "Evet, kesinlikle.",
  "Hayır, asla.",
  "Belki.",
  "Şüphesiz.",
  "Bence evet.",
  "Bence hayır.",
  "Muhtemelen.",
  "Pek sanmıyorum.",
  "Şu an söyleyemem.",
  "Tekrar sor.",
  "Daha sonra tekrar dene.",
  "İyi görünüyor.",
  "Pek iyi görünmüyor.",
  "Evet ama dikkatli ol.",
  "Hayır ama şansını dene.",
  "Kesinlikle öyle.",
  "Hiç sanmıyorum.",
  "Tabii ki!"
];

module.exports = {
  name: "8ball",
  aliases: ["sihirli", "falcı"],
  execute(message, args) {
    let question = args.join(" ");

    if (!question || question.length > 200) {
      return message.reply(`${emojis.warn} Bir soru sormalısınız (Max 200 karakter)!\nÖrnek: \`.8ball Bugün şanslı mıyım?\``);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    const embed = new EmbedBuilder()
      .setTitle("🎱 Sihirli 8-Ball")
      .setColor("#8B00FF")
      .addFields(
        { name: "❓ Soru", value: question, inline: false },
        { name: "💬 Cevap", value: answer, inline: false }
      )
      .setFooter({ text: `Soran: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
