const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../config.json");
const emojis = config.emojis;

module.exports = {
  name: "massrole",
  aliases: ["toplurol"],
  async execute(message, args) {
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = message.author.id === process.env.OWNER_ID;

    if (!isAdmin && !isOwner) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok.`);
    }

    const action = args[0]?.toLowerCase();
    const role = message.mentions.roles.first();

    if (!action || !["add", "remove", "ekle", "çıkar"].includes(action)) {
      return message.reply(`${emojis.warn} Kullanım: \`!massrole add/remove @Role\``);
    }

    if (!role) {
      return message.reply(`${emojis.warn} Bir rol belirtmelisiniz.`);
    }

    if (role.position >= message.guild.members.me.highestRole.position) {
      return message.reply(`${emojis.error} Bu rolü yönetmek için yeterli yetkim yok.`);
    }

    const isAdd = ["add", "ekle"].includes(action);

    const statusMsg = await message.channel.send(`${emojis.loading} İşlem başlatılıyor...`);

    const members = await message.guild.members.fetch();
    let success = 0;
    let failed = 0;

    for (const [id, member] of members) {
      if (member.user.bot) continue;

      try {
        if (isAdd) {
          if (!member.roles.cache.has(role.id)) {
            await member.roles.add(role);
            success++;
          }
        } else {
          if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role);
            success++;
          }
        }
      } catch (e) {
        failed++;
      }

      if ((success + failed) % 10 === 0) {
        await statusMsg.edit(`${emojis.loading} İşleniyor... ${success + failed}/${members.size}`);
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.success} Toplu Rol ${isAdd ? "Ekleme" : "Çıkarma"}`)
      .setColor("#00FF00")
      .addFields(
        { name: "🎭 Rol", value: `${role}`, inline: true },
        { name: "✅ Başarılı", value: `\`${success}\``, inline: true },
        { name: "❌ Başarısız", value: `\`${failed}\``, inline: true }
      )
      .setTimestamp();

    statusMsg.edit({ content: "", embeds: [embed] });
  }
};
