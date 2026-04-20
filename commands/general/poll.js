const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;

module.exports = {
  name: "poll",
  aliases: ["anket", "oylama"],
  execute(message, args) {
    if (!args[0]) {
      return message.reply(`${emojis.warn} Kullanım: \`.poll Soru? | Seçenek1 | Seçenek2 | ...\`\nÖrnek: \`.poll En sevdiğiniz renk? | Kırmızı | Mavi | Yeşil\``);
    }

    const input = args.join(" ");
    if (input.length > 2000) {
      return message.reply(`${emojis.error} Anket metni çok uzun (Max 2000 karakter).`);
    }
    const parts = input.split("|").map(p => p.trim());

    if (parts.length < 3) {
      return message.reply(`${emojis.error} En az bir soru ve iki seçenek belirtmelisiniz.`);
    }

    const question = parts[0];
    const options = parts.slice(1);

    if (options.length > 10) {
      return message.reply(`${emojis.error} Maksimum 10 seçenek ekleyebilirsiniz.`);
    }

    const emojis_poll = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

    let description = "";
    options.forEach((opt, i) => {
      description += `${emojis_poll[i]} ${opt}\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle(`📊 ${question}`)
      .setDescription(description)
      .setColor("#3498DB")
      .setFooter({ text: `Anket: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    message.channel.send({ embeds: [embed] }).then(msg => {
      options.forEach((opt, i) => {
        msg.react(emojis_poll[i]);
      });
    });

    message.delete().catch(() => {});
  }
};
