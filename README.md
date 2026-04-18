# Discord Moderation Bot

A feature-rich Discord moderation bot with advanced logging, security features, and customizable permissions.

## Features

- **Moderation Commands**: Ban, kick, mute, timeout, and more
- **Advanced Logging**: Track messages, voice activity, bans, and role changes
- **Security System**: Rate limiting and spam protection with customizable thresholds
- **Permission Management**: Role-based command access control
- **Photo-Only Channels**: Restrict channels to image-only content
- **Server Information**: Detailed server and user statistics
- **Custom Embeds**: Create and send custom embedded messages

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your bot:
   - Edit `.env` file with your bot token and owner ID
   - Edit `config.json` to customize bot settings (prefix, status, emojis)

4. Start the bot:
   ```bash
   npm start
   ```

## Configuration

### Environment Variables (.env)
```env
TOKEN=YOUR_BOT_TOKEN_HERE
OWNER_ID=YOUR_DISCORD_USER_ID
```

### Bot Settings (config.json)
- `prefix`: Command prefix (default: `!`)
- `statusMode`: Bot status (online/idle/dnd/invisible)
- `name`: Activity name displayed
- `type`: Activity type (PLAYING/WATCHING/LISTENING/COMPETING)

## Commands

### Moderation
- `!ban <user> [reason]` - Ban a user
- `!unban <userID>` - Unban a user
- `!kick <user> [reason]` - Kick a user
- `!mute <user> <duration> [reason]` - Timeout a user
- `!nick <user> <nickname>` - Change user nickname

### Channel Management
- `!lock [channel]` - Lock a channel
- `!unlock [channel]` - Unlock a channel

### Information
- `!serverinfo` - Display server information
- `!userinfo [user]` - Display user information

### Utility
- `!embed` - Create custom embeds
- `!yazdir <text>` - Make bot say something

### Configuration (Admin Only)
- `!ayarla` - Open configuration panel
- `!ayarla rol <category> <@role>` - Set permission roles
- `!ayarla log <type> <#channel>` - Configure log channels
- `!ayarla botkomut <mode>` - Configure command restrictions
- `!ayarla fotochat <#channel> <on/off>` - Set photo-only channels
- `!ayarla limit <type> <count> <minutes>` - Configure rate limits

## Permission System

Configure role-based permissions using `!ayarla rol`:
- `ban` - Ban command access
- `kick` - Kick command access
- `timeout` - Mute/timeout access
- `lock` - Channel lock access
- `yonetim` - Management access (bypass restrictions)

## Logging System

Configure logging channels using `!ayarla log`:
- `mesaj_log` - Message deletions
- `ban_log` - Ban/unban actions
- `voice_log` - Voice channel activity
- `rol_log` - Role changes
- `kanal_log` - Channel modifications
- `timeout_log` - Timeout actions
- `rapor_log` - Security reports

## Security Features

The bot includes a rate limiting system to prevent abuse:
- Configurable limits per command type
- Automatic blocking on threshold breach
- User reporting system for false positives
- Tracking resets after time window

Configure limits using `!ayarla limit <ban/kick/mute> <count> <minutes>`

## Support

For issues or questions, please open an issue on the repository.

## License

ISC
