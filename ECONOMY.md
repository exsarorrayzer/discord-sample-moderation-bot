# Ekonomi Sistemi Komutları

Prefix: `!` (config.json'dan değiştirilebilir)

## Para Kazanma Komutları

### Daily
**Kullanım:** `!daily`  
**Aliases:** `günlük`  
**Cooldown:** 24 saat  
**Ödül:** 500 coin  
**Açıklama:** Günlük ücretsiz ödülünüzü alın.

### Weekly
**Kullanım:** `!weekly`  
**Aliases:** `haftalık`  
**Cooldown:** 7 gün  
**Ödül:** 3500 coin  
**Açıklama:** Haftalık ücretsiz ödülünüzü alın.

### Work
**Kullanım:** `!work`  
**Aliases:** `çalış`, `iş`  
**Cooldown:** 1 saat  
**Ödül:** 80-700 coin (mesleğe göre)  
**Açıklama:** Çalışarak para kazanın. Her seferinde rastgele bir meslek seçilir.

**Meslekler:**
- Yazılımcı: 200-500 coin
- Doktor: 300-600 coin
- Öğretmen: 150-400 coin
- Garson: 100-250 coin
- Temizlikçi: 80-200 coin
- Taksici: 120-300 coin
- Aşçı: 150-350 coin
- Mühendis: 250-550 coin
- Avukat: 300-700 coin
- Polis: 200-450 coin

### Beg
**Kullanım:** `!beg`  
**Aliases:** `dilenci`, `dilenmek`  
**Cooldown:** 30 saniye  
**Ödül:** 5-100 coin (başarılıysa)  
**Açıklama:** Dilenerek para kazanmaya çalışın. Bazen başarısız olabilirsiniz.

### Fish
**Kullanım:** `!fish`  
**Aliases:** `balık`, `balıktut`  
**Cooldown:** 45 saniye  
**Ödül:** 5-200 coin  
**Açıklama:** Balık tutarak para kazanın.

**Yakalanabilecekler:**
- 🐟 Küçük Balık: 20 coin
- 🐠 Tropikal Balık: 50 coin
- 🐡 Balon Balığı: 80 coin
- 🦈 Köpekbalığı: 200 coin
- 🐙 Ahtapot: 150 coin
- 🦞 Istakoz: 180 coin
- 🦀 Yengeç: 100 coin
- 🐚 İstiridye: 120 coin
- ⭐ Deniz Yıldızı: 90 coin
- 🗑️ Çöp: 5 coin

### Mine
**Kullanım:** `!mine`  
**Aliases:** `madencilik`, `kaz`  
**Cooldown:** 1 dakika  
**Ödül:** 10-500 coin  
**Açıklama:** Madencilik yaparak değerli mineraller bulun.

**Bulunanlar:**
- 🪨 Taş: 10 coin
- ⛏️ Demir: 30 coin
- 🥉 Bronz: 50 coin
- 🥈 Gümüş: 100 coin
- 🥇 Altın: 200 coin
- 💎 Elmas: 500 coin
- 💠 Safir: 400 coin
- 💚 Zümrüt: 450 coin
- ❤️ Yakut: 480 coin

### Crime
**Kullanım:** `!crime`  
**Aliases:** `suç`, `heist`  
**Cooldown:** 90 dakika  
**Ödül/Ceza:** 200-2000 coin  
**Açıklama:** Suç işleyerek büyük paralar kazanın veya yakalanıp ceza ödeyin.

**Risk:** %40 başarı şansı. Başarısız olursanız ceza ödersiniz.

### Rob
**Kullanım:** `!rob @User`  
**Aliases:** `soy`, `çal`  
**Cooldown:** 2 saat  
**Gereksinim:** En az 200 coin  
**Açıklama:** Başka bir kullanıcıyı soymaya çalışın.

**Kurallar:**
- Hedefin en az 100 coin'i olmalı
- %40 başarı şansı
- Başarılı: Hedefin %10-30'unu çalarsınız
- Başarısız: Bakiyenizin %20'si ceza

## Kumar Oyunları

### Coinflip
**Kullanım:** `!coinflip <bahis>`  
**Aliases:** `cf`, `yazıtura`  
**Açıklama:** Yazı-tura atın. %50 kazanma şansı.

**Örnek:**
```
!coinflip 100
```

### Dice
**Kullanım:** `!dice <bahis> <tahmin(1-6)>`  
**Aliases:** `zar`, `roll`  
**Açıklama:** Zar atın ve tahminde bulunun. Doğru tahmin 5x kazanç.

**Örnek:**
```
!dice 100 5
```

### Slots
**Kullanım:** `!slots <bahis>`  
**Aliases:** `slot`, `slotmachine`  
**Min Bahis:** 10 coin  
**Açıklama:** Slot makinesi oynayın.

**Kazançlar:**
- 💎💎💎 = 10x (JACKPOT)
- 7️⃣7️⃣7️⃣ = 7x
- 3'lü eşleşme = 3x
- 2'li eşleşme = 1.5x

**Örnek:**
```
!slots 50
```

### Roulette
**Kullanım:** `!roulette <bahis> <red/black/green>`  
**Aliases:** `rulet`  
**Min Bahis:** 10 coin  
**Açıklama:** Rulet oynayın.

**Kazançlar:**
- Kırmızı/Siyah: 2x (%48 şans)
- Yeşil: 14x (%4 şans)

**Örnek:**
```
!roulette 100 red
!roulette 100 kırmızı
```

### Blackjack
**Kullanım:** `!blackjack <bahis>`  
**Aliases:** `bj`, `21`  
**Min Bahis:** 10 coin  
**Açıklama:** Blackjack oynayın. 21'e en yakın olan kazanır.

**Kazançlar:**
- Blackjack (ilk 2 kart 21): 2.5x
- Normal kazanç: 2x
- Beraberlik: Bahis iadesi

**Örnek:**
```
!blackjack 100
```

## Banka İşlemleri

### Economy
**Kullanım:** `!economy [balance] [@user]`  
**Aliases:** `eco`, `ekonomi`  
**Açıklama:** Bakiyenizi veya başka birinin bakiyesini görüntüleyin.

**Örnekler:**
```
!economy
!economy @User
!eco balance
```

### Deposit
**Kullanım:** `!deposit <miktar/all>`  
**Aliases:** `dep`, `yatır`  
**Açıklama:** Cüzdanınızdaki parayı bankaya yatırın. Bankadaki para soygunlardan korunur.

**Örnekler:**
```
!deposit 500
!deposit all
```

### Withdraw
**Kullanım:** `!withdraw <miktar/all>`  
**Aliases:** `with`, `çek`  
**Açıklama:** Bankadan para çekin.

**Örnekler:**
```
!withdraw 500
!withdraw all
```

### Transfer
**Kullanım:** `!transfer @User <miktar>`  
**Aliases:** `pay`, `gönder`, `ver`  
**Açıklama:** Başka bir kullanıcıya para gönderin.

**Örnek:**
```
!transfer @User 500
```

## Mağaza Sistemi

### Shop
**Kullanım:** `!shop`  
**Aliases:** `mağaza`, `market`  
**Açıklama:** Mağazadaki ürünleri görüntüleyin.

**Ürünler:**
1. 💻 Laptop - 5,000 coin
2. 📱 Telefon - 3,000 coin
3. 🚗 Araba - 50,000 coin
4. 🏠 Ev - 500,000 coin
5. ⌚ Saat - 2,000 coin
6. 🚲 Bisiklet - 1,000 coin
7. 🎸 Gitar - 1,500 coin
8. 📷 Kamera - 4,000 coin
9. 🎧 Kulaklık - 800 coin
10. 🎮 Konsol - 6,000 coin

### Buy
**Kullanım:** `!buy <numara/id>`  
**Aliases:** `satınAl`, `al`  
**Açıklama:** Mağazadan ürün satın alın.

**Örnekler:**
```
!buy 1
!buy laptop
```

### Sell
**Kullanım:** `!sell <numara/id>`  
**Aliases:** `sat`  
**Açıklama:** Envanterinizdeki bir ürünü satın. Satış fiyatı alış fiyatının %60'ıdır.

**Örnekler:**
```
!sell 1
!sell laptop
```

### Inventory
**Kullanım:** `!inventory [@user]`  
**Aliases:** `inv`, `envanter`, `bag`  
**Açıklama:** Envanterinizi veya başka birinin envanterini görüntüleyin.

**Örnekler:**
```
!inventory
!inv @User
```

## Sıralama

### Leaderboard
**Kullanım:** `!leaderboard`  
**Aliases:** `lb`, `sıralama`, `top`  
**Açıklama:** En zengin 10 kullanıcıyı görüntüleyin.

**Örnek:**
```
!leaderboard
```

## Notlar

- Tüm ekonomi verileri `pattern/economy.json` dosyasında saklanır
- Mağaza ürünleri `pattern/shop.json` dosyasında yapılandırılabilir
- Cooldown süreleri komut başına değişir
- Bankadaki para soygunlardan korunur
- Envanterdeki ürünler kalıcıdır

## Stratejiler

1. **Günlük Rutin:** Daily ve weekly ödüllerinizi almayı unutmayın
2. **Çalışma:** Her saat work komutuyla düzenli gelir elde edin
3. **Banka Kullanımı:** Büyük miktarları bankada tutun
4. **Kumar Riski:** Sadece kaybetmeyi göze alabileceğiniz miktarlarla kumar oynayın
5. **Yatırım:** Pahalı ürünler satın alıp daha sonra satarak kar edebilirsiniz
6. **Suç:** Yüksek risk, yüksek ödül - dikkatli kullanın
