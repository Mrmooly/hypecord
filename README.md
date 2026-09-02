# Hypecord

This build includes the Discord-inspired Hypecord UI rework:
- top navigation for Friends, Hype Shop, Hype Leaderboard and Game Launcher
- Hypecord flame logo
- empty Friends / Pending states and username lookup
- profile display name, bio, status and picture upload
- Hype Shop with profile effects, borders, badges, themes and previews
- account and Voice & Video settings
- create-server UI with owner/manage-server permissions
- existing Supabase Hype persistence plus existing Spotify/game utilities

Run:
```bash
npm install
npm run dev
```

`SUPABASE_OPTIONAL_FRIENDS_MIGRATION.sql` is included for the future persistent friends backend.


## Latest Hypecord build
- Clean top navigation for Friends, Hype Shop, Hype Leaderboard, and Game Launcher.
- User menu closes when clicking outside it.
- Hype score is compactly formatted (999, 1k, 10k, 100k, 1m, etc.).
- Expanded profile effects, profile borders, badges, and themes with previews.
- Voice settings request microphone permission and refresh detected audio devices.
- Account/profile settings support display name, bio, status, email, phone, password, and voice device choices.

## Hypecord Beta update
- Profiles/cosmetics now sync through Supabase so other accounts can see equipped decorations, frames, effects, nameplates, badges and avatars.
- Server creation, membership, invites and Manage Server permissions now persist through Supabase.
- Server invite links can be opened in Hypecord and joined after authentication.
- Server Lounge is now a real multi-user browser WebRTC voice room using private Supabase Realtime signaling.
- Server voice uses WebRTC connection statistics for the displayed latency when a peer connection is active.
- Voice participants and selected decorations are shown in the server voice panel.
- Voice time awards +10 Hype per completed minute for direct calls and server voice sessions.
- Message Hype rewards are now atomic in Supabase: every fifth sent message awards +1 Hype.
- Input/output device choices are scoped to the logged-in account.
- Message notifications use `hypecord-message.mp3`; incoming calls use the looping blended ringtone.

For a small closed beta, keep server voice rooms relatively small because the current browser implementation uses peer-to-peer mesh connections. A production-scale voice system should move to an SFU/TURN-backed architecture.


## Beta launch notes
- Season 1 is fixed as the active 55-day beta season.
- Users registering from September 1, 2026 through October 31, 2026 receive the permanent Beta Tester profile entitlement.
- Direct-call signaling uses one shared Supabase Realtime call bus so offers are not lost while a per-recipient channel is being created.
- Server voice remains WebRTC mesh for beta testing.
## Windows desktop beta releases

Hypecord can be packaged as a Windows NSIS installer and updated automatically through GitHub Releases. The repository is `Mrmooly/hypecord`.

### First-time GitHub setup

Add these repository secrets under **Settings → Secrets and variables → Actions → New repository secret**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SPOTIFY_CLIENT_ID` (optional)
- `VITE_SPOTIFY_REDIRECT_URI` (optional)

The GitHub Actions workflow uses these values only while building the release. Do not commit `.env.local`.

### Publishing a new beta

1. Change the `version` in `package.json`, for example `0.1.0-beta.2`.
2. Commit and push the change to `main`.
3. Create and push a matching tag, for example `v0.1.0-beta.2`.
4. GitHub Actions builds the Windows installer and publishes the release.
5. Installed Hypecord checks for beta updates automatically. If an update is downloaded, the user can click **Restart** to install it.

Users should install the **NSIS installer**, not a portable build, for automatic updates to work.

