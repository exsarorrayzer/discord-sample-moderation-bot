# Setup Guide

## Prerequisites

- Node.js v16.9.0 or higher
- A Discord Bot Token
- Your Discord User ID

## Step-by-Step Setup

### 1. Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to "Bot" section and click "Add Bot"
4. Enable these Privileged Gateway Intents:
   - SERVER MEMBERS INTENT
   - MESSAGE CONTENT INTENT
   - PRESENCE INTENT
5. Copy your bot token

### 2. Get Your User ID

1. Enable Developer Mode in Discord (Settings > Advanced > Developer Mode)
2. Right-click your username and select "Copy ID"

### 3. Configure Bot

1. Rename `.env.example` to `.env`
2. Edit `.env` and add your credentials:
   ```env
   TOKEN=your_bot_token_here
   OWNER_ID=your_discord_user_id
   ```

3. Edit `config.json` to customize:
   - `prefix`: Command prefix (default: `!`)
   - `name`: Bot activity name
   - `type`: Activity type (PLAYING, WATCHING, LISTENING, COMPETING)
   - `statusMode`: Bot status (online, idle, dnd, invisible)

### 4. Install Dependencies

```bash
npm install
```

### 5. Invite Bot to Server

1. Go to Discord Developer Portal > Your App > OAuth2 > URL Generator
2. Select scopes: `bot`
3. Select permissions:
   - Manage Roles
   - Manage Channels
   - Kick Members
   - Ban Members
   - Manage Messages
   - Read Messages/View Channels
   - Send Messages
   - Manage Nicknames
   - Read Message History
   - Add Reactions
   - Use External Emojis
   - Moderate Members
4. Copy the generated URL and open it in your browser
5. Select your server and authorize

### 6. Start Bot

```bash
npm start
```

### 7. Initial Configuration

Once the bot is online, use these commands to set it up:

#### Set Permission Roles
```
!ayarla rol ban @ModeratorRole
!ayarla rol kick @ModeratorRole
!ayarla rol timeout @ModeratorRole
!ayarla rol yonetim @AdminRole
```

#### Configure Log Channels
```
!ayarla log mesaj_log #message-logs
!ayarla log ban_log #moderation-logs
!ayarla log voice_log #voice-logs
```

#### Enable Security Features
```
!ayarla limit ban 3 5
!ayarla limit kick 5 5
!ayarla limit mute 5 5
```

## Troubleshooting

### Bot doesn't respond
- Check if bot is online
- Verify bot has "Read Messages" and "Send Messages" permissions
- Ensure MESSAGE CONTENT INTENT is enabled

### Commands not working
- Verify you're using the correct prefix
- Check if bot has required permissions
- Ensure you have the necessary role permissions

### Logs not appearing
- Verify log channels are configured using `!ayarla`
- Check if bot has "Send Messages" permission in log channels

## Support

For additional help, check the README.md or open an issue on the repository.
