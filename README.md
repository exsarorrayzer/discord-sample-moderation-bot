# Discord Moderation & Economy Bot

Production-ready Discord bot with comprehensive moderation, economy system, leveling, and advanced security features.

## Features

### Moderation
- Ban/Unban/Kick/Mute/Timeout with reason tracking
- Warning system with history
- Temporary bans with auto-expiry
- Softban (ban + immediate unban to clear messages)
- Message purge with user filtering
- Channel lock/unlock with timed duration
- Nickname management
- Mass role assignment
- Voice channel user movement

### Economy System
- Virtual currency (coins)
- Bank system (deposit/withdraw)
- Daily/Weekly rewards
- Work system with multiple jobs and tasks
- Gambling games (Blackjack, Slots, Roulette, Dice, Coinflip)
- Crime system with risk/reward
- Fishing and mining
- Rob other users
- Transfer coins between users
- Shop system with inventory
- Lottery with ticket purchases

### Leveling & XP
- Message-based XP gain
- Level-up notifications
- Leaderboard system
- XP management commands
- Rank display with progress bars

### Utility
- Server/User information
- Avatar display
- AFK system with mentions
- Welcome messages
- Auto-role on join
- Reaction roles
- Ticket system with categories
- Giveaway system
- Poll creation
- Trivia games
- 8ball fortune teller
- Rock-Paper-Scissors game

### Advanced Features
- Interactive help panel with category selection
- Custom embed builder with documentation
- Photo-only channel enforcement
- Bot command channel restrictions
- Comprehensive logging system
- Rate limiting with guard system
- Role-based permission control
- Configurable cooldowns per command
- Turkish character normalization in commands

## Installation

```bash
git clone https://github.com/exsarorrayzer/discord-sample-moderation-bot.git
cd discord-sample-moderation-bot
npm install
```

## Configuration

### 1. Environment Variables

Create `.env` file:
```env
TOKEN=YOUR_BOT_TOKEN_HERE
OWNER_ID=YOUR_DISCORD_USER_ID
```

### 2. Bot Settings

Edit `config.json`:
```json
{
  "prefix": ".",
  "statusMode": "online",
  "name": "Discord Bot",
  "type": "WATCHING"
}
```

### 3. Start Bot

```bash
npm start
```

## Command Structure

Commands are organized in categories:

```
commands/
├── moderation/    (15 commands: ban, kick, mute, warn, etc.)
├── general/       (8 commands: help, serverinfo, userinfo, etc.)
├── economy/       (18 commands: daily, work, shop, etc.)
├── games/         (9 commands: blackjack, slots, rps, etc.)
├── level/         (3 commands: level, rank, setxp)
├── setup/         (8 commands: ayarla, welcome, embed, etc.)
└── utility/       (9 commands: role, ticket, nick, etc.)
```

## Help System

Interactive help panel with dropdown menus:

```
.help                    # Main help panel
.help ayarlar           # Server settings (admin only)
```

Features:
- Category-based command organization
- Server-specific category toggle (admin)
- Dynamic command count display
- Prefix-aware documentation

## Command Categories

### Moderation Commands
```
.ban <user> [reason]
.unban <userID> [reason]
.kick <user> [reason]
.mute <user> <duration> [reason]
.unmute <user> [reason]
.tempban <user> <duration> [reason]
.softban <user> [reason]
.warn <user> [reason]
.clearwarns <user>
.warnings [user]
.history <user>
.purge <amount> [@user]
.lock [duration]
.unlock
.slowmode <seconds>
.nick <user> <nickname>
.nick reset <user>
.role <add/remove> <user> <role>
.massrole <add/remove> <role>
.voicemove <#from> <#to>
.nuke
```

### Economy Commands
```
.economy / .bal [@user]
.daily
.weekly
.work
.beg
.crime
.fish
.mine
.rob <user>
.transfer <user> <amount>
.deposit <amount/all>
.withdraw <amount/all>
.shop
.buy <item>
.sell <item>
.inventory [@user]
.blackjack <bet>
.slots <bet>
.roulette <bet> <red/black/green>
.dice <bet> <guess>
.coinflip <bet>
.lottery [buy <amount>]
```

### Leveling Commands
```
.level [@user]
.rank
.leaderboard
.setxp <user> <amount>
```

### Information Commands
```
.serverinfo
.userinfo [@user]
.avatar [@user]
.stats
.banlist
.jobinfo [@user]
```

### Utility Commands
```
.afk [reason]
.8ball <question>
.poll <question> | <option1> | <option2> | ...
.trivia
.rps
.giveaway <duration> <winners> <prize>
.quest
.announce <#channel> <message>
.yazdir <text>
.embed <parameters>
.embed docs
```

### Setup Commands
```
.welcome set <#channel>
.welcome message <text>
.welcome off
.autorole set <@role>
.autorole off
.reactionrole create <emoji> <@role>
.ticketsetup panel
.ticketsetup category <#category>
.ticketsetup role <@role>
.ticketsetup log <#channel>
.ticket setup
```

### Configuration (Admin)
```
.ayarla                                    # View all settings
.ayarla rol <category> <@role>            # Set permission roles
.ayarla log <type> <#channel>             # Set log channels
.ayarla botkomut <only/change/off>        # Bot command restrictions
.ayarla fotochat <#channel> <ac/kapa>     # Photo-only channels
.ayarla limit <ban/kick/mute> <count> <minutes>  # Rate limits
.ayarla limit <type> cooldown <seconds>   # Command cooldowns
.ayarla limit <type> <on/off>             # Toggle limits
```

## Permission Roles

Configure via `.ayarla rol <category> <@role>`:

- `ban` - Ban/unban commands
- `kick` - Kick command
- `timeout` - Mute/timeout commands
- `warn` - Warning system
- `lock` - Channel lock/unlock
- `slowmode` - Slowmode management
- `mesaj_silme` - Message purge
- `nick` - Nickname management
- `embed` - Embed creation
- `yonetim` - Full management access

## Logging Channels

Configure via `.ayarla log <type> <#channel>`:

- `mesaj_log` - Message deletions
- `ban_log` - Ban/unban/kick actions
- `voice_log` - Voice activity
- `timeout_log` - Mute/timeout actions
- `rol_log` - Role changes
- `kanal_log` - Channel modifications
- `rapor_log` - Security reports

## Security System

### Rate Limiting

Prevents command spam and abuse:
```
.ayarla limit ban 3 10
.ayarla limit kick 10 2
.ayarla limit mute 5 5
```

Format: `<command> <max_uses> <time_window_minutes>`

### Guard System

Automatic protection against:
- Rapid ban/kick/mute actions
- Command flooding
- Permission abuse
- Resource exhaustion

Users can appeal via automatic DM system.

### Input Validation

All inputs sanitized:
- Integer overflow protection (MAX_SAFE_INTEGER checks)
- String length limits (500 chars for reasons)
- URL validation (http/https only)
- User ID format validation (17-19 digits)
- Embed field limits (25 fields max)
- Role hierarchy checks
- Self-action prevention
- Bot protection

### Turkish Character Support

Commands work with Turkish characters:
```
.yardım = .yardim = .YARDIM
.çalış = .calis = .ÇALIŞ
.günlük = .gunluk = .GÜNLÜK
```

Automatic normalization: ç→c, ğ→g, ı→i, ö→o, ş→s, ü→u

## File Structure

```
├── commands/
│   ├── moderation/    # 15 moderation commands
│   ├── general/       # 8 general commands
│   ├── economy/       # 18 economy commands
│   ├── games/         # 9 game commands
│   ├── level/         # 3 leveling commands
│   ├── setup/         # 8 setup commands
│   └── utility/       # 9 utility commands
├── pattern/           # Configuration & data storage
│   ├── guard.js       # Rate limiting logic
│   ├── limitler.json  # Rate limit config
│   ├── yetkirole.json # Permission roles
│   ├── logkanallari.json # Log channels
│   ├── commandsettings.json # Help panel settings
│   └── cooldowns.json # Command cooldowns
├── index.js           # Main bot file
├── config.json        # Bot configuration
└── .env              # Environment variables
```

## Data Storage

JSON-based storage in `pattern/` directory:
- `economy.json` - User balances
- `levels.json` - XP and levels
- `warnings.json` - Warning history
- `tempbans.json` - Temporary ban tracking
- `lottery.json` - Lottery state
- `quests.json` - Daily quests
- `afk.json` - AFK statuses
- `welcome.json` - Welcome config
- `autorole.json` - Auto-role config
- `reactionroles.json` - Reaction role mappings
- `ticketconfig.json` - Ticket system config
- `reminders.json` - Reminder system
- `commandsettings.json` - Help panel category toggles

## Security Improvements (Full Audit Applied)

### Moderation Commands
- Role hierarchy validation
- Self-action prevention
- Owner protection
- Bot protection
- User ID format validation (regex)
- Error logging with context
- Constant extraction (MAX_REASON_LENGTH, etc.)

### Economy Commands
- Integer overflow protection
- Transfer amount limits (1-10,000)
- Cooldown enforcement
- Bot transfer prevention
- Self-transfer prevention
- Try-catch on file operations
- Parse error handling

### Setup Commands
- Input sanitization
- Channel/role validation
- Permission checks
- File write error handling

## Requirements

- Node.js 16.9.0+
- Discord.js 14.25.1+
- Valid Discord Bot Token
- ms package for duration parsing

## License

ISC
