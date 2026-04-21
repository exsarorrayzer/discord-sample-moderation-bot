const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const config = require("../../config.json");
const emojis = config.emojis;
const yetkirole = require("../../pattern/yetkirole.json");
const endpoints = require("../../pattern/endpoints.json");
const fs = require("fs");
const path = require("path");
const https = require("https");

const aiConfigPath = path.join(__dirname, "../../pattern/aiconfig.json");
const promptPath = path.join(__dirname, "../../pattern/prompt.txt");

function loadAIConfig() {
  return JSON.parse(fs.readFileSync(aiConfigPath, "utf-8"));
}

function loadPrompt() {
  return fs.readFileSync(promptPath, "utf-8").trim();
}

function saveAIConfig(data) {
  fs.writeFileSync(aiConfigPath, JSON.stringify(data, null, 2));
}

function makeAPIRequest(url, options, postData) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || "POST",
      headers: options.headers || {}
    };

    const req = https.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on("error", reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function callAI(provider, model, messages, apiKey) {
  const endpoint = endpoints[provider];
  if (!endpoint) throw new Error("Geçersiz provider");

  const aiConfig = loadAIConfig();
  let url = endpoint.url;
  let headers = { "Content-Type": "application/json" };
  let body = {
    model: model,
    messages: messages,
    max_tokens: aiConfig.max_tokens,
    temperature: aiConfig.temperature
  };

  switch (provider) {
    case "openai":
      headers["Authorization"] = `Bearer ${apiKey}`;
      break;
    case "groq":
      headers["Authorization"] = `Bearer ${apiKey}`;
      break;
    case "qwen":
      headers["Authorization"] = `Bearer ${apiKey}`;
      break;
    case "gemini":
      url = `${endpoint.url}/${model}:generateContent?key=${apiKey}`;
      body = {
        contents: messages.map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }))
      };
      break;
    case "openrouter":
      headers["Authorization"] = `Bearer ${apiKey}`;
      headers["HTTP-Referer"] = "https://discord.com";
      break;
  }

  const response = await makeAPIRequest(url, { method: "POST", headers }, body);

  if (provider === "gemini") {
    return response.candidates?.[0]?.content?.parts?.[0]?.text || "Yanıt alınamadı";
  }

  return response.choices?.[0]?.message?.content || "Yanıt alınamadı";
}

async function executeAction(action, message) {
  try {
    const params = action.parameters;
    
    if (params.user_mention === "{{user}}") {
      params.user_mention = message.author.id;
    }
    
    switch (action.type) {
      case "send_message":
        const channel = message.guild.channels.cache.find(c => c.name === params.channel_name);
        if (channel) await channel.send(params.message_text);
        return `✅ Mesaj ${params.channel_name} kanalına gönderildi`;
      
      case "create_channel":
        const channelType = params.channel_type === "voice" ? ChannelType.GuildVoice : ChannelType.GuildText;
        await message.guild.channels.create({ name: params.channel_name, type: channelType });
        return `✅ ${params.channel_name} kanalı oluşturuldu`;
      
      case "delete_channel":
        const delChannel = message.guild.channels.cache.find(c => c.name === params.channel_name);
        if (delChannel) {
          await delChannel.delete();
          return `✅ ${params.channel_name} kanalı silindi`;
        }
        return `❌ ${params.channel_name} kanalı bulunamadı`;
      
      case "create_role":
        const roleOptions = { name: params.role_name };
        if (params.color) roleOptions.color = params.color;
        if (params.permissions && Array.isArray(params.permissions)) {
          roleOptions.permissions = params.permissions;
        }
        await message.guild.roles.create(roleOptions);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `✅ ${params.role_name} rolü oluşturuldu`;
      
      case "edit_role":
        const editRole = message.guild.roles.cache.find(r => r.name === params.role_name);
        if (editRole) {
          const editOptions = {};
          if (params.color) editOptions.color = params.color;
          if (params.permissions && Array.isArray(params.permissions)) {
            editOptions.permissions = params.permissions;
          }
          await editRole.edit(editOptions);
          return `✅ ${params.role_name} rolü güncellendi`;
        }
        return `❌ ${params.role_name} rolü bulunamadı`;
      
      case "delete_role":
        const delRole = message.guild.roles.cache.find(r => r.name === params.role_name);
        if (delRole) {
          await delRole.delete();
          return `✅ ${params.role_name} rolü silindi`;
        }
        return `❌ ${params.role_name} rolü bulunamadı`;
      
      case "assign_role":
        const member = params.user_mention === message.author.id ? message.member : message.mentions.members.first();
        const assignRole = message.guild.roles.cache.find(r => r.name === params.role_name);
        if (member && assignRole) {
          await member.roles.add(assignRole);
          return `✅ ${params.role_name} rolü ${member.user.tag} kullanıcısına verildi`;
        }
        return `❌ Kullanıcı veya rol bulunamadı`;
      
      case "remove_role":
        const rmMember = message.mentions.members.first();
        const rmRole = message.guild.roles.cache.find(r => r.name === params.role_name);
        if (rmMember && rmRole) {
          await rmMember.roles.remove(rmRole);
          return `✅ ${params.role_name} rolü ${rmMember.user.tag} kullanıcısından alındı`;
        }
        return `❌ Kullanıcı veya rol bulunamadı`;
      
      case "kick_member":
        const kickMember = message.mentions.members.first();
        if (kickMember) {
          await kickMember.kick(params.reason);
          return `✅ ${kickMember.user.tag} sunucudan atıldı`;
        }
        return `❌ Kullanıcı bulunamadı`;
      
      case "ban_member":
        const banMember = message.mentions.members.first();
        if (banMember) {
          await banMember.ban({ reason: params.reason });
          return `✅ ${banMember.user.tag} sunucudan yasaklandı`;
        }
        return `❌ Kullanıcı bulunamadı`;
      
      case "unban_member":
        await message.guild.members.unban(params.user_id);
        return `✅ Kullanıcının yasağı kaldırıldı`;
      
      case "mute_member":
        const muteMember = message.mentions.members.first();
        if (muteMember) {
          await muteMember.timeout(params.duration || 600000, params.reason);
          return `✅ ${muteMember.user.tag} susturuldu`;
        }
        return `❌ Kullanıcı bulunamadı`;
      
      case "unmute_member":
        const unmuteMember = message.mentions.members.first();
        if (unmuteMember) {
          await unmuteMember.timeout(null);
          return `✅ ${unmuteMember.user.tag} susturması kaldırıldı`;
        }
        return `❌ Kullanıcı bulunamadı`;
      
      case "edit_channel":
        const editChannel = message.guild.channels.cache.find(c => c.name === params.channel_name);
        if (editChannel) {
          const editOptions = {};
          if (params.new_name) editOptions.name = params.new_name;
          if (params.topic) editOptions.topic = params.topic;
          if (params.slowmode !== undefined) editOptions.rateLimitPerUser = params.slowmode;
          if (params.nsfw !== undefined) editOptions.nsfw = params.nsfw;
          await editChannel.edit(editOptions);
          return `✅ ${params.channel_name} kanalı güncellendi`;
        }
        return `❌ ${params.channel_name} kanalı bulunamadı`;
      
      case "move_channel":
        const moveChannel = message.guild.channels.cache.find(c => c.name === params.channel_name);
        const targetCategory = message.guild.channels.cache.find(c => c.name === params.category_name && c.type === ChannelType.GuildCategory);
        if (moveChannel && targetCategory) {
          await moveChannel.setParent(targetCategory.id);
          return `✅ ${params.channel_name} kanalı ${params.category_name} kategorisine taşındı`;
        }
        return `❌ Kanal veya kategori bulunamadı`;
      
      case "create_category":
        await message.guild.channels.create({ name: params.category_name, type: ChannelType.GuildCategory });
        return `✅ ${params.category_name} kategorisi oluşturuldu`;
      
      case "delete_category":
        const delCategory = message.guild.channels.cache.find(c => c.name === params.category_name && c.type === ChannelType.GuildCategory);
        if (delCategory) {
          await delCategory.delete();
          return `✅ ${params.category_name} kategorisi silindi`;
        }
        return `❌ ${params.category_name} kategorisi bulunamadı`;
      
      case "delete_messages":
        const purgeChannel = message.guild.channels.cache.find(c => c.name === params.channel_name);
        if (purgeChannel && purgeChannel.isTextBased()) {
          const amount = Math.min(params.amount || 10, 100);
          await purgeChannel.bulkDelete(amount, true);
          return `✅ ${params.channel_name} kanalından ${amount} mesaj silindi`;
        }
        return `❌ Kanal bulunamadı veya metin kanalı değil`;
      
      case "pin_message":
        const pinChannel = message.guild.channels.cache.find(c => c.name === params.channel_name);
        if (pinChannel && pinChannel.isTextBased()) {
          const messages = await pinChannel.messages.fetch({ limit: 10 });
          const targetMsg = messages.find(m => m.content.includes(params.message_content));
          if (targetMsg) {
            await targetMsg.pin();
            return `✅ Mesaj sabitlendi`;
          }
          return `❌ Mesaj bulunamadı`;
        }
        return `❌ Kanal bulunamadı`;
      
      case "change_nickname":
        const nickMember = params.user_mention === message.author.id ? message.member : message.mentions.members.first();
        if (nickMember) {
          await nickMember.setNickname(params.nickname);
          return `✅ ${nickMember.user.tag} kullanıcısının adı ${params.nickname} olarak değiştirildi`;
        }
        return `❌ Kullanıcı bulunamadı`;
      
      case "move_member":
        const moveMember = message.mentions.members.first();
        const targetVoice = message.guild.channels.cache.find(c => c.name === params.voice_channel && c.type === ChannelType.GuildVoice);
        if (moveMember && targetVoice) {
          await moveMember.voice.setChannel(targetVoice);
          return `✅ ${moveMember.user.tag} kullanıcısı ${params.voice_channel} kanalına taşındı`;
        }
        return `❌ Kullanıcı veya sesli kanal bulunamadı`;
      
      case "deafen_member":
        const deafMember = message.mentions.members.first();
        if (deafMember) {
          await deafMember.voice.setDeaf(params.deafen !== false);
          return `✅ ${deafMember.user.tag} ${params.deafen !== false ? 'sağırlaştırıldı' : 'sağırlık kaldırıldı'}`;
        }
        return `❌ Kullanıcı bulunamadı`;
      
      case "voice_disconnect":
        const dcMember = message.mentions.members.first();
        if (dcMember && dcMember.voice.channel) {
          await dcMember.voice.disconnect();
          return `✅ ${dcMember.user.tag} sesten atıldı`;
        }
        return `❌ Kullanıcı bulunamadı veya sesli kanalda değil`;
      
      case "edit_server":
        const editOptions = {};
        if (params.name) editOptions.name = params.name;
        if (params.icon) editOptions.icon = params.icon;
        await message.guild.edit(editOptions);
        return `✅ Sunucu ayarları güncellendi`;
      
      case "create_invite":
        const inviteChannel = message.guild.channels.cache.find(c => c.name === params.channel_name);
        if (inviteChannel) {
          const invite = await inviteChannel.createInvite({
            maxAge: params.max_age || 86400,
            maxUses: params.max_uses || 0
          });
          return `✅ Davet linki oluşturuldu: ${invite.url}`;
        }
        return `❌ Kanal bulunamadı`;
      
      case "create_webhook":
        const webhookChannel = message.guild.channels.cache.find(c => c.name === params.channel_name);
        if (webhookChannel && webhookChannel.isTextBased()) {
          const webhook = await webhookChannel.createWebhook({ name: params.webhook_name });
          return `✅ Webhook oluşturuldu: ${webhook.url}`;
        }
        return `❌ Kanal bulunamadı`;
      
      case "create_emoji":
        const emoji = await message.guild.emojis.create({ attachment: params.emoji_url, name: params.emoji_name });
        return `✅ ${emoji.name} emojisi oluşturuldu`;
      
      case "delete_emoji":
        const delEmoji = message.guild.emojis.cache.find(e => e.name === params.emoji_name);
        if (delEmoji) {
          await delEmoji.delete();
          return `✅ ${params.emoji_name} emojisi silindi`;
        }
        return `❌ Emoji bulunamadı`;
      
      case "create_thread":
        const threadChannel = message.guild.channels.cache.find(c => c.name === params.channel_name);
        if (threadChannel && threadChannel.isTextBased()) {
          const thread = await threadChannel.threads.create({
            name: params.thread_name,
            autoArchiveDuration: params.auto_archive || 60
          });
          return `✅ ${params.thread_name} thread'i oluşturuldu`;
        }
        return `❌ Kanal bulunamadı`;
      
      case "send_dm":
        const dmUser = params.user_mention === message.author.id ? message.author : message.mentions.users.first();
        if (dmUser) {
          await dmUser.send(params.message_text);
          return `✅ ${dmUser.tag} kullanıcısına DM gönderildi`;
        }
        return `❌ Kullanıcı bulunamadı`;
      
      default:
        return `❌ Bilinmeyen aksiyon: ${action.type}`;
    }
  } catch (error) {
    return `❌ Hata: ${error.message}`;
  }
}

module.exports = {
  name: "ai",
  aliases: ["yapayze", "gpt"],
  async execute(message, args) {
    const isOwner = message.author.id === process.env.OWNER_ID;
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const hasAIRole = yetkirole.ai_kullanim && message.member.roles.cache.has(yetkirole.ai_kullanim);

    if (!isOwner && !isAdmin && !hasAIRole) {
      return message.reply(`${emojis.error} Bu komutu kullanmak için yetkiniz yok!`);
    }

    const aiConfig = loadAIConfig();

    if (!args[0]) {
      const currentPrompt = loadPrompt();
      const promptPreview = currentPrompt.length > 100 ? currentPrompt.substring(0, 100) + "..." : currentPrompt;

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.bot} AI Sistemi`)
        .setDescription(`**Mevcut Ayarlar:**\n\n**Provider:** \`${aiConfig.default_provider}\`\n**Model:** \`${aiConfig.default_model}\`\n**Max Tokens:** \`${aiConfig.max_tokens}\`\n**Temperature:** \`${aiConfig.temperature}\`\n**System Prompt:** \`${promptPreview}\`\n\n**Kullanım:**\n\`${config.prefix}ai <mesaj>\` - AI ile konuş\n\`${config.prefix}ai reset\` - Konuşma geçmişini sil\n\`${config.prefix}model\` - Model ayarlarını görüntüle`)
        .setColor("#5865F2")
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    }

    if (args[0].toLowerCase() === "reset") {
      aiConfig.conversation_history[message.author.id] = [];
      saveAIConfig(aiConfig);
      return message.reply(`${emojis.success} Konuşma geçmişiniz silindi!`);
    }

    const userMessage = args.join(" ");

    if (!aiConfig.conversation_history[message.author.id]) {
      aiConfig.conversation_history[message.author.id] = [];
    }

    const history = aiConfig.conversation_history[message.author.id];
    history.push({ role: "user", content: userMessage });

    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    const systemPrompt = loadPrompt();
    const messages = [
      { role: "system", content: systemPrompt },
      ...history
    ];

    const loadingMsg = await message.reply(`${emojis.loading} AI düşünüyor...`);

    try {
      const provider = aiConfig.default_provider;
      const model = aiConfig.default_model;
      const apiKeyMap = {
        openai: process.env.OPENAI_API_KEY,
        groq: process.env.GROQ_API_KEY,
        qwen: process.env.QWEN_API_KEY,
        gemini: process.env.GEMINI_API_KEY,
        openrouter: process.env.OPENROUTER_API_KEY
      };

      const apiKey = apiKeyMap[provider];
      if (!apiKey) {
        return loadingMsg.edit(`${emojis.error} ${provider.toUpperCase()} API key bulunamadı!`);
      }

      let response = await callAI(provider, model, messages, apiKey);

      let jsonResponse;
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonResponse = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        jsonResponse = { response: response, actions: [] };
      }

      let finalResponse = jsonResponse.response || response;
      const actionResults = [];

      if (jsonResponse.actions && jsonResponse.actions.length > 0) {
        for (const action of jsonResponse.actions) {
          const result = await executeAction(action, message);
          actionResults.push(result);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (actionResults.length > 0) {
        finalResponse += "\n\n**Aksiyonlar:**\n" + actionResults.join("\n");
      }

      history.push({ role: "assistant", content: response });
      saveAIConfig(aiConfig);

      const chunks = finalResponse.match(/[\s\S]{1,1900}/g) || [finalResponse];
      
      await loadingMsg.delete().catch(() => {});

      for (let i = 0; i < chunks.length; i++) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
          .setDescription(chunks[i])
          .setColor("#5865F2")
          .setFooter({ text: `${provider} • ${model}${chunks.length > 1 ? ` • ${i + 1}/${chunks.length}` : ""}` })
          .setTimestamp();

        await message.channel.send({ embeds: [embed] });
      }

    } catch (error) {
      console.error("AI Error:", error);
      loadingMsg.edit(`${emojis.error} AI yanıt verirken hata oluştu: ${error.message}`);
    }
  }
};
