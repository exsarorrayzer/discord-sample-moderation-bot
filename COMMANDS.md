# Command Reference

Default prefix: `!` (configurable in config.json)

## Moderation Commands

### Ban
**Usage:** `!ban <user> [reason]`  
**Aliases:** None  
**Permission:** Administrator, Ban role, or Owner  
**Description:** Permanently ban a user from the server. Can also ban by ID (force ban).

**Examples:**
```
!ban @User Spamming
!ban 123456789012345678 Raiding
```

### Unban
**Usage:** `!unban <userID>`  
**Aliases:** None  
**Permission:** Administrator, Ban role, or Owner  
**Description:** Remove a ban from a user using their ID.

**Example:**
```
!unban 123456789012345678
```

### Kick
**Usage:** `!kick <user> [reason]`  
**Aliases:** None  
**Permission:** Administrator, Kick role, or Owner  
**Description:** Remove a user from the server (they can rejoin).

**Example:**
```
!kick @User Breaking rules
```

### Mute
**Usage:** `!mute <user> <duration> [reason]`  
**Aliases:** `timeout`, `sustur`  
**Permission:** Administrator, Timeout role, or Owner  
**Description:** Timeout a user for a specified duration (10s to 28 days).

**Duration Format:**
- `s` = seconds
- `m` = minutes
- `h` = hours
- `d` = days

**Examples:**
```
!mute @User 10m Spamming
!timeout @User 1h Inappropriate behavior
!mute @User 1d Repeated violations
```

### Nick
**Usage:** `!nick <user> <new_nickname>`  
**Aliases:** `nickname`  
**Permission:** Administrator, Nick role, or Owner  
**Description:** Change a user's nickname.

**Example:**
```
!nick @User NewNickname
```

## Channel Management

### Lock
**Usage:** `!lock [channel]`  
**Aliases:** `kilit`  
**Permission:** Administrator, Lock role, or Owner  
**Description:** Lock a channel (prevent @everyone from sending messages).

**Examples:**
```
!lock
!lock #general
```

### Unlock
**Usage:** `!unlock [channel]`  
**Aliases:** `ac`  
**Permission:** Administrator, Lock role, or Owner  
**Description:** Unlock a previously locked channel.

**Examples:**
```
!unlock
!unlock #general
```

## Information Commands

### Server Info
**Usage:** `!serverinfo`  
**Aliases:** `si`, `sunucubilgi`, `sb`  
**Permission:** Everyone  
**Description:** Display detailed server statistics and information.

**Shows:**
- Server owner
- Creation date
- Member count (users/bots)
- Online status distribution
- Channel counts
- Boost level
- Emoji count
- Security settings

### User Info
**Usage:** `!userinfo [user]`  
**Aliases:** `ui`, `whois`  
**Permission:** Everyone  
**Description:** Display detailed information about a user.

**Shows:**
- Username and ID
- Account creation date
- Server join date
- Roles
- Permissions
- Status

**Examples:**
```
!userinfo
!userinfo @User
!ui 123456789012345678
```

## Utility Commands

### Embed
**Usage:** `!embed <parameters>`  
**Aliases:** `e`, `duyuru`  
**Permission:** Administrator, Embed role, Management role, or Owner  
**Description:** Create custom embedded messages.

**Parameters:**
- `title=` - Embed title
- `desc=` or `description=` - Embed description
- `color=` - Color (pink, red, blue, green, yellow, black, white, purple, or hex)
- `footer=` - Footer text
- `footer_icon=` - Footer icon URL
- `author=` - Author name
- `author_icon=` - Author icon URL
- `image=` - Large image URL
- `thumbnail=` or `thumb=` - Thumbnail URL
- `[field1=Name|Value, field2=Name|Value]` - Add fields

**Examples:**
```
!embed title=Welcome desc=Welcome to our server! color=blue
!embed title=Rules [field1=Rule 1|No spam, field2=Rule 2|Be respectful] footer=Server Rules
!embed title=Announcement desc=Important update color=#FF5733 image=https://example.com/image.png
```

**Documentation:**
```
!embed docs
```
Sends full documentation to your DMs (24h cooldown for non-admins).

### Yazdir
**Usage:** `!yazdir <text>`  
**Aliases:** `say`, `duyur`  
**Permission:** Administrator, Management role, or Owner  
**Description:** Make the bot send a message (your message is deleted).

**Example:**
```
!yazdir Hello everyone!
```

## Configuration Commands (Admin Only)

### Ayarla (Setup)
**Usage:** `!ayarla [category] [options]`  
**Aliases:** `ac`, `kapat`, `degistir`  
**Permission:** Administrator, Management role, or Owner  
**Description:** Configure bot settings, permissions, and features.

#### View All Settings
```
!ayarla
```

#### Configure Permission Roles
```
!ayarla rol <category> <@role>
```

**Categories:**
- `ban` - Ban command access
- `kick` - Kick command access
- `timeout` - Mute/timeout access
- `lock` - Channel lock access
- `rol_ver` - Role management
- `rol_al` - Role removal
- `slowmode` - Slowmode control
- `mesaj_silme` - Message deletion
- `yonetim` - Management (bypass restrictions)
- `embed` - Embed creation
- `nick` - Nickname changes

**Example:**
```
!ayarla rol ban @Moderator
!ayarla rol yonetim @Admin
```

#### Configure Log Channels
```
!ayarla log <type> <#channel>
!ac <type> <#channel>
!kapat <type>
```

**Log Types:**
- `mesaj_log` - Message deletions
- `ban_log` - Ban/unban actions
- `voice_log` - Voice activity
- `rol_log` - Role changes
- `kanal_log` - Channel modifications
- `timeout_log` - Timeout actions
- `rapor_log` - Security reports

**Examples:**
```
!ayarla log mesaj_log #message-logs
!ac ban_log #mod-logs
!kapat voice_log
```

#### Bot Command Restrictions
```
!ayarla botkomut <mode>
```

**Modes:**
- `only` - Restrict commands to designated channel only
- `change <#channel>` - Set command channel
- `off` - Disable restrictions

**Examples:**
```
!ayarla botkomut change #bot-commands
!ayarla botkomut only
!ayarla botkomut off
```

#### Photo-Only Channels
```
!ayarla fotochat <#channel> <on/off>
```

**Examples:**
```
!ayarla fotochat #media on
!ayarla fotochat #media off
```

#### Rate Limiting (Security)
```
!ayarla limit <type> <count> <minutes>
!ayarla limit <type> cooldown <seconds>
!ayarla limit <type> <on/off>
```

**Types:** `ban`, `kick`, `mute`

**Examples:**
```
!ayarla limit ban 3 5
!ayarla limit kick cooldown 10
!ayarla limit mute on
!ayarla limit ban off
```

## Permission Hierarchy

1. **Owner** (OWNER_ID in .env) - Full access to everything
2. **Administrator** - Discord Administrator permission
3. **Management Role** - Configured via `!ayarla rol yonetim`
4. **Specific Command Roles** - Configured per command type

## Notes

- Commands are case-insensitive
- User mentions can be replaced with user IDs
- Channel mentions can be replaced with channel IDs
- Rate limiting protects against command spam (configurable)
- Most moderation actions are logged automatically
