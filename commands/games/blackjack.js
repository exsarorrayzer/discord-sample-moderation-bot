const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");
const emojis = config.emojis;

const economyPath = path.join(__dirname, "../../pattern/economy.json");

function loadEconomy() {
  if (!fs.existsSync(economyPath)) {
    fs.writeFileSync(economyPath, JSON.stringify({}, null, 2));
    return {};
  }
  return JSON.parse(fs.readFileSync(economyPath, "utf-8"));
}

function saveEconomy(data) {
  fs.writeFileSync(economyPath, JSON.stringify(data, null, 2));
}

const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const suits = ["♠️", "♥️", "♦️", "♣️"];

function drawCard() {
  const card = cards[Math.floor(Math.random() * cards.length)];
  const suit = suits[Math.floor(Math.random() * suits.length)];
  return `${card}${suit}`;
}

function calculateHand(hand) {
  let total = 0;
  let aces = 0;

  hand.forEach(card => {
    const value = card.slice(0, -1);
    if (value === "A") {
      aces++;
      total += 11;
    } else if (["J", "Q", "K"].includes(value)) {
      total += 10;
    } else {
      total += parseInt(value);
    }
  });

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

const activeGames = new Map();

module.exports = {
  name: "blackjack",
  aliases: ["bj", "21"],
  activeGames: activeGames,
  execute(message, args) {
    if (activeGames.has(message.author.id)) {
      return message.reply(`${emojis.error} Zaten aktif bir blackjack oyununuz var!`);
    }

    const data = loadEconomy();
    if (!data[message.author.id]) {
      data[message.author.id] = { balance: 0, bank: 0, lastDaily: 0, lastWeekly: 0, inventory: [] };
    }

    const userData = data[message.author.id];
    const bet = parseInt(args[0]);

    if (!bet || isNaN(bet) || bet < 10 || !Number.isInteger(bet) || bet < 0) {
      return message.reply(`${emojis.warn} En az 10 coin bahis yapmalısınız.\nÖrnek: \`.blackjack 100\``);
    }

    if (bet > 10000 || bet > Number.MAX_SAFE_INTEGER) {
      return message.reply(`${emojis.error} Maksimum bahis 10,000 coin!`);
    }

    if (userData.balance < bet) {
      return message.reply(`${emojis.error} Yeterli bakiyeniz yok! Bakiyeniz: \`${userData.balance}\` coin`);
    }

    userData.balance -= bet;
    saveEconomy(data);

    const playerHand = [drawCard(), drawCard()];
    const dealerHand = [drawCard(), drawCard()];

    const playerTotal = calculateHand(playerHand);
    const dealerTotal = calculateHand(dealerHand);

    activeGames.set(message.author.id, { playerHand, dealerHand, bet });

    const embed = new EmbedBuilder()
      .setTitle("🃏 BLACKJACK")
      .setColor("#3498DB")
      .addFields(
        { name: "🎴 Sizin Kartlarınız", value: `${playerHand.join(" ")} = **${playerTotal}**`, inline: false },
        { name: "🎴 Krupiye", value: `${dealerHand[0]} ❓`, inline: false },
        { name: "💰 Bahis", value: `\`${bet}\` coin`, inline: true }
      )
      .setTimestamp();

    if (playerTotal === 21) {
      const winAmount = Math.floor(bet * 2.5);
      userData.balance += winAmount;
      saveEconomy(data);
      activeGames.delete(message.author.id);

      embed.setDescription(`${emojis.success} **BLACKJACK!** +${winAmount} coin kazandınız!`)
        .setColor("#00FF00")
        .addFields({ name: "💵 Yeni Bakiye", value: `\`${userData.balance}\` coin`, inline: true });

      return message.channel.send({ embeds: [embed] });
    }

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`bj_hit_${message.author.id}`)
          .setLabel("Kart Çek")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`bj_stand_${message.author.id}`)
          .setLabel("Dur")
          .setStyle(ButtonStyle.Success)
      );

    message.channel.send({ embeds: [embed], components: [row] }).then(msg => {
      setTimeout(() => {
        if (activeGames.has(message.author.id)) {
          activeGames.delete(message.author.id);
          userData.balance += bet;
          saveEconomy(data);
          msg.edit({ 
            content: `${emojis.error} Süre doldu! Bahis iade edildi.`, 
            embeds: [], 
            components: [] 
          }).catch(() => {});
        }
      }, 60000);
    });
  }
};
