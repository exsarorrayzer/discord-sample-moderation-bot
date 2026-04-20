const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;

const rrPath = path.join(__dirname, "../pattern/reactionroles.json");

function loadRR() {
  if (!fs.existsSync(rrPath)) {
    fs.writeFileSync(rrPath, JSON.stringify({}, null, 2));
    return {};
  }
  return JSON.parse(fs.readFileSync(rrPath, "utf-8"));
}

function saveRR(data) {
  fs.writeFileSync(rrPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "reactionrole",
  aliases: ["rr", "reaksiyonrol"],
  execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;

    if (!isAdmin && !isOwner) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const action = args[0]?.toLowerCase();

    if (action === "create") {
      const emoji = args[1];
      const role = message.mentions.roles.first();

      if (!emoji || !role) {
        return message.reply(`${emojis.warn} Kullanım: \`.rr create <emoji> @Role\``);
      }

      const embed = new EmbedBuilder()
        .setTitle("🎭 Reaksiyon Rol Sistemi")
        .setDescription(`${emoji} - ${role}`)
        .setColor("#3498DB")
        .setFooter({ text: "Rol almak için emoji'ye tıklayın" })
        .setTimestamp();

      message.channel.send({ embeds: [embed] }).then(msg => {
        msg.react(emoji).catch(() => {
          return message.reply(`${emojis.error} Geçersiz emoji!`);
        });

        const rrData = loadRR();
        rrData[msg.id] = { emoji: emoji, roleId: role.id, channelId: message.channel.id };
        saveRR(rrData);

        message.reply(`${emojis.success} Reaksiyon rol sistemi oluşturuldu.`);
      });
    } else {
      message.reply(`${emojis.warn} Kullanım: \`.rr create <emoji> @Role\``);
    }
  }
};
