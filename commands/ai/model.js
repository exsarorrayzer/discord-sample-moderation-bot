const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;
const yetkirole = require("../../pattern/yetkirole.json");
const endpoints = require("../../pattern/endpoints.json");
const fs = require("fs");
const path = require("path");

const aiConfigPath = path.join(__dirname, "../../pattern/aiconfig.json");

function loadAIConfig() {
  return JSON.parse(fs.readFileSync(aiConfigPath, "utf-8"));
}

function saveAIConfig(data) {
  fs.writeFileSync(aiConfigPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "model",
  aliases: ["aimodel", "setmodel"],
  async execute(message, args) {
    const isOwner = message.author.id === process.env.OWNER_ID;
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const hasAIRole = yetkirole.ai_kullanim && message.member.roles.cache.has(yetkirole.ai_kullanim);

    if (!isOwner && !isAdmin && !hasAIRole) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok!`);
    }

    const aiConfig = loadAIConfig();

    if (!args[0]) {
      const providerList = Object.keys(endpoints).map(p => {
        let models;
        if (p === "gemini") {
          const normalModels = endpoints[p].models.normal.join(", ");
          const imageModels = endpoints[p].models.image.join(", ");
          const voiceModels = endpoints[p].models.voice.join(", ");
          return `**${p.toUpperCase()}**\n└ Normal: ${normalModels}\n└ Image: ${imageModels}\n└ Voice: ${voiceModels}`;
        } else {
          models = endpoints[p].models.join(", ");
          return `**${p.toUpperCase()}**\n└ ${models}`;
        }
      }).join("\n\n");

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.bot} AI Model Ayarları`)
        .setDescription(`**Mevcut Ayarlar:**\n**Provider:** \`${aiConfig.default_provider}\`\n**Model:** \`${aiConfig.default_model}\`\n**Max Tokens:** \`${aiConfig.max_tokens}\`\n**Temperature:** \`${aiConfig.temperature}\`\n\n**Kullanım:**\n\`${config.prefix}model set <provider> <model>\`\n\`${config.prefix}model tokens <sayı>\`\n\`${config.prefix}model temp <0.0-2.0>\`\n\n**Mevcut Providerlar ve Modeller:**\n${providerList}`)
        .setColor("#5865F2")
        .setFooter({ text: `${message.author.tag} tarafından istendi`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    const subCommand = args[0].toLowerCase();

    if (subCommand === "set") {
      if (!args[1] || !args[2]) {
        return message.reply(`${emojis.error} Kullanım: \`${config.prefix}model set <provider> <model>\``);
      }

      const provider = args[1].toLowerCase();
      const model = args.slice(2).join(" ");

      if (!endpoints[provider]) {
        return message.reply(`${emojis.error} Geçersiz provider! Mevcut: \`${Object.keys(endpoints).join(", ")}\``);
      }

      let validModel = false;
      if (provider === "gemini") {
        validModel = endpoints[provider].models.normal.includes(model) || endpoints[provider].models.image.includes(model) || endpoints[provider].models.voice.includes(model);
      } else {
        validModel = endpoints[provider].models.includes(model);
      }

      if (!validModel) {
        let modelList;
        if (provider === "gemini") {
          modelList = `Normal: ${endpoints[provider].models.normal.join(", ")}\nImage: ${endpoints[provider].models.image.join(", ")}\nVoice: ${endpoints[provider].models.voice.join(", ")}`;
        } else {
          modelList = endpoints[provider].models.join(", ");
        }
        return message.reply(`${emojis.error} Bu provider için geçersiz model! Mevcut modeller:\n\`${modelList}\``);
      }

      aiConfig.default_provider = provider;
      aiConfig.default_model = model;
      saveAIConfig(aiConfig);

      return message.reply(`${emojis.success} Model ayarlandı: **${provider}** - **${model}**`);
    }

    if (subCommand === "tokens") {
      const tokens = parseInt(args[1]);
      if (isNaN(tokens) || tokens < 100 || tokens > 8000) {
        return message.reply(`${emojis.error} Geçersiz token sayısı! (100-8000 arası)`);
      }

      aiConfig.max_tokens = tokens;
      saveAIConfig(aiConfig);

      return message.reply(`${emojis.success} Max tokens ayarlandı: **${tokens}**`);
    }

    if (subCommand === "temp" || subCommand === "temperature") {
      const temp = parseFloat(args[1]);
      if (isNaN(temp) || temp < 0 || temp > 2) {
        return message.reply(`${emojis.error} Geçersiz temperature değeri! (0.0-2.0 arası)`);
      }

      aiConfig.temperature = temp;
      saveAIConfig(aiConfig);

      return message.reply(`${emojis.success} Temperature ayarlandı: **${temp}**`);
    }

    if (subCommand === "list") {
      const providerList = Object.keys(endpoints).map(p => {
        const isCurrent = p === aiConfig.default_provider;
        let models;
        if (p === "gemini") {
          const normalModels = endpoints[p].models.normal.map(m => `\`${m}\``).join(", ");
          const imageModels = endpoints[p].models.image.map(m => `\`${m}\``).join(", ");
          const voiceModels = endpoints[p].models.voice.map(m => `\`${m}\``).join(", ");
          return `${isCurrent ? "🟢" : "⚪"} **${p.toUpperCase()}**\nNormal: ${normalModels}\nImage: ${imageModels}\nVoice: ${voiceModels}`;
        } else {
          models = endpoints[p].models.map(m => `\`${m}\``).join(", ");
          return `${isCurrent ? "🟢" : "⚪"} **${p.toUpperCase()}**\n${models}`;
        }
      }).join("\n\n");

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.bot} Mevcut AI Modelleri`)
        .setDescription(providerList)
        .setColor("#5865F2")
        .setFooter({ text: "🟢 = Aktif Provider" })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    return message.reply(`${emojis.error} Geçersiz alt komut! Kullanım: \`${config.prefix}model\``);
  }
};
