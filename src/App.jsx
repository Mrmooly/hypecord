import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";
import { spotifyAuth, SpotifyAPI } from "./spotifyClient";
import { detectInstalledGames } from "./gameDetector";
import hypecordLogo from "./assets/hypecord-logo.png";

const STATUS_OPTIONS = [
  { id: "online", label: "Online", dot: "🟢" },
  { id: "away", label: "Away", dot: "🟡" },
  { id: "dnd", label: "Do Not Disturb", dot: "🔴" },
  { id: "invisible", label: "Invisible", dot: "⚫" },
];

const SHOP_ITEMS = [
  { id: "blaze-core", name: "Blaze Core", category: "effects", price: 250, icon: "🔥", tone: "fire", description: "A living ring of Hype fire that breathes around your profile.", featured: true },
  { id: "solar-flare", name: "Solar Flare", category: "effects", price: 400, icon: "☀️", tone: "solar", description: "Bright solar sparks burst outward in warm waves.", featured: true },
  { id: "ember-drift", name: "Ember Drift", category: "effects", price: 325, icon: "✨", tone: "ember", description: "Floating embers trail gently behind your avatar." },
  { id: "inferno-pulse", name: "Inferno Pulse", category: "effects", price: 475, icon: "🔥", tone: "inferno", description: "A powerful flame pulse that expands with your Hype." },
  { id: "lava-wave", name: "Lava Wave", category: "effects", price: 500, icon: "🌋", tone: "lava", description: "Molten ribbons flow around your profile." },
  { id: "aurora-flame", name: "Aurora Flame", category: "effects", price: 450, icon: "🌌", tone: "aurora", description: "Cool aurora energy dances around a Hype flame." },
  { id: "electric-hype", name: "Electric Hype", category: "effects", price: 425, icon: "⚡", tone: "electric", description: "Electric arcs snap around your avatar." },
  { id: "neon-rush", name: "Neon Rush", category: "effects", price: 325, icon: "💫", tone: "neon", description: "Two neon trails orbit your profile at speed." },
  { id: "void-arc", name: "Void Arc", category: "effects", price: 375, icon: "◉", tone: "void", description: "A dark energy arc with a purple edge." },
  { id: "galactic-flame", name: "Galactic Flame", category: "effects", price: 600, icon: "🌠", tone: "galaxy", description: "Star particles and violet flame form a cosmic halo." },
  { id: "toxic-glow", name: "Toxic Glow", category: "effects", price: 350, icon: "☣️", tone: "toxic", description: "Acid-green energy leaks around your profile." },
  { id: "pixel-fire", name: "Pixel Fire", category: "effects", price: 300, icon: "▦", tone: "pixel", description: "Retro pixel sparks make your profile feel alive." },
  { id: "sakura-breeze", name: "Sakura Breeze", category: "effects", price: 300, icon: "🌸", tone: "sakura", description: "Soft petals drift around your avatar." },
  { id: "spirit-chains", name: "Spirit Chains", category: "effects", price: 550, icon: "⛓️", tone: "spirit", description: "Spectral blue chains orbit your profile." },
  { id: "shadow-mist", name: "Shadow Mist", category: "effects", price: 275, icon: "🌑", tone: "shadow", description: "Dark smoke curls slowly around your avatar." },
  { id: "crimson-eclipse", name: "Crimson Eclipse", category: "effects", price: 575, icon: "🌘", tone: "crimson", description: "A red eclipse burns behind your profile." },
  { id: "hype-surge", name: "Hype Surge", category: "effects", price: 425, icon: "⚡", tone: "surge", description: "Golden electricity builds and releases in bursts." },
  { id: "iceburn", name: "Iceburn", category: "effects", price: 425, icon: "❄️", tone: "ice", description: "Blue fire meets frosted energy." },
  { id: "celestial-halo", name: "Celestial Halo", category: "effects", price: 500, icon: "✨", tone: "celestial", description: "A golden orbit with tiny star particles." },
  { id: "flamecrest", name: "Flamecrest", category: "frames", price: 350, icon: "🔥", tone: "crest", description: "A sharp flame border that hugs your avatar." },
  { id: "hype-ring", name: "Hype Ring", category: "frames", price: 275, icon: "⭕", tone: "ring", description: "A clean animated ring for a minimalist profile." },
  { id: "royal-frame", name: "Royal Ember", category: "frames", price: 500, icon: "👑", tone: "royal", description: "A premium gold-and-flame border." },
  { id: "hype-legend", name: "Hype Legend", category: "badges", price: 600, icon: "🏆", tone: "legend", description: "A premium badge for serious Hype collectors." },
  { id: "founder-badge", name: "Founder's Spark", category: "badges", price: 900, icon: "💎", tone: "founder", description: "A rare-looking badge for early Hypecord supporters." },
  { id: "midnight-pulse", name: "Midnight Pulse", category: "themes", price: 225, icon: "💜", tone: "midnight", description: "A calm purple pulse for your profile." },
  { id: "ember-night", name: "Ember Night", category: "themes", price: 350, icon: "🌙", tone: "night", description: "Charcoal, ember and violet profile lighting." },
  { id: "frosted-hype", name: "Frosted Hype", category: "themes", price: 400, icon: "🧊", tone: "frost", description: "A cold blue-white profile atmosphere." },
  { id: "synthwave", name: "Synthwave", category: "themes", price: 450, icon: "🌈", tone: "synth", description: "Retro neon gradients with a Hypecord twist." },
  { id: "flame-aura", name: "Flame Aura", category: "effects", price: 700, icon: "🔥", tone: "flameAura", description: "A layered Hype flame that flickers behind your avatar.", featured: true },
  { id: "stormheart", name: "Stormheart", category: "effects", price: 650, icon: "🌩️", tone: "stormheart", description: "Purple lightning crackles through a dark energy halo." },
  { id: "hologlow", name: "Hologlow", category: "effects", price: 550, icon: "💠", tone: "hologlow", description: "A holographic ring shifts through luminous spectral tones." },
  { id: "comet-trail", name: "Comet Trail", category: "effects", price: 725, icon: "☄️", tone: "comet", description: "A comet-like streak circles your profile with sparks." },
  { id: "royal-flame", name: "Royal Flame", category: "effects", price: 800, icon: "👑", tone: "royalFlame", description: "A regal gold flame crown rises behind your avatar." },
  { id: "blood-moon", name: "Blood Moon", category: "effects", price: 775, icon: "🌕", tone: "bloodMoon", description: "A crimson moon pulses softly behind your profile." },
  { id: "deep-sea", name: "Deep Sea", category: "effects", price: 525, icon: "🌊", tone: "deepSea", description: "Bioluminescent waves drift around your avatar." },
  { id: "ghost-light", name: "Ghost Light", category: "effects", price: 600, icon: "👻", tone: "ghost", description: "Soft spectral wisps float around your profile." },
  { id: "neon-circuit", name: "Neon Circuit", category: "effects", price: 675, icon: "🧬", tone: "circuit", description: "Animated neon circuits trace a futuristic halo." },
  { id: "firework-hype", name: "Firework Hype", category: "effects", price: 900, icon: "🎆", tone: "firework", description: "Tiny bursts of light pop around your profile." },
  { id: "crown-ring", name: "Crown Ring", category: "frames", price: 650, icon: "👑", tone: "crownRing", description: "A premium segmented crown wraps around your avatar." },
  { id: "electric-border", name: "Electric Border", category: "frames", price: 575, icon: "⚡", tone: "electricBorder", description: "A sharp animated electric border hugs your profile picture." },
  { id: "molten-border", name: "Molten Edge", category: "frames", price: 625, icon: "🌋", tone: "moltenBorder", description: "Molten orange energy flows around your avatar." },
  { id: "ice-border", name: "Glacier Edge", category: "frames", price: 600, icon: "❄️", tone: "iceBorder", description: "A crystalline blue border surrounds your profile." },
  { id: "violet-border", name: "Violet Prism", category: "frames", price: 525, icon: "🔮", tone: "violetBorder", description: "A faceted purple prism border catches the light." },
  { id: "pixel-border", name: "Pixel Crown", category: "frames", price: 450, icon: "▦", tone: "pixelBorder", description: "A retro pixel border gives your avatar arcade energy." },
  { id: "sakura-border", name: "Sakura Edge", category: "frames", price: 500, icon: "🌸", tone: "sakuraBorder", description: "Petals trace a soft pink border around your profile." },
  { id: "shadow-border", name: "Shadow Fang", category: "frames", price: 700, icon: "🖤", tone: "shadowBorder", description: "Dark angular accents frame your avatar." },
  { id: "sunset-border", name: "Sunset Prism", category: "frames", price: 550, icon: "🌅", tone: "sunsetBorder", description: "Warm sunset gradients travel around the border." },
  { id: "collector-flame", name: "Collector Flame", category: "badges", price: 1200, icon: "🔥", tone: "collector", description: "A rare collector badge for users who live for Hype." },
  { id: "top-hype", name: "Top Hype", category: "badges", price: 1500, icon: "⚡", tone: "topHype", description: "A prestige badge designed for the Hype leaderboard." },
  { id: "early-spark", name: "Early Spark", category: "badges", price: 800, icon: "✨", tone: "earlySpark", description: "A limited-style badge celebrating early Hypecord members." },
  { id: "arcade-badge", name: "Arcade Ace", category: "badges", price: 700, icon: "🕹️", tone: "arcade", description: "A playful badge for gamers and collectors." },
  { id: "night-city", name: "Night City", category: "themes", price: 650, icon: "🌃", tone: "nightCity", description: "Midnight purple streets and neon profile lighting." },
  { id: "volcanic", name: "Volcanic", category: "themes", price: 700, icon: "🌋", tone: "volcanic", description: "Charcoal rock, lava glow and ember accents." },
  { id: "oceanic", name: "Oceanic", category: "themes", price: 600, icon: "🌊", tone: "oceanic", description: "Deep blue gradients with calm moving highlights." },
  { id: "dreamcore", name: "Dreamcore", category: "themes", price: 725, icon: "☁️", tone: "dreamcore", description: "Soft surreal lighting with a dreamy violet finish." },
];

const SHOP_CATEGORIES = [
  ["featured", "Featured"],
  ["decorations", "Avatar Decorations"],
  ["effects", "Profile Effects"],
  ["frames", "Profile Frames"],
  ["nameplates", "Nameplates"],
  ["banners", "Profile Banners"],
  ["dmCovers", "DM Covers"],
  ["badges", "Badges"],
  ["themes", "Themes"],
];

const EXTRA_SHOP_ITEMS = [
  { id: "always-watching", name: "Always Watching", category: "decorations", price: 650, icon: "◉", tone: "watching", description: "A floating eye-like halo that follows your avatar." },
  { id: "trapped-souls", name: "Trapped Souls", category: "decorations", price: 750, icon: "◈", tone: "souls", description: "Spectral wisps circle the edge of your profile." },
  { id: "dark-roses", name: "Dark Roses", category: "decorations", price: 700, icon: "✿", tone: "darkRoses", description: "Midnight roses bloom around your avatar." },
  { id: "wraithling", name: "Wraithling", category: "decorations", price: 800, icon: "☽", tone: "wraithling", description: "A tiny spectral companion floats beside your profile." },
  { id: "meow-meow-cat", name: "Meow Meow Cat", category: "decorations", price: 550, icon: "⌁", tone: "meow", description: "A playful cat accent with soft neon highlights." },
  { id: "nevermore", name: "Nevermore", category: "decorations", price: 775, icon: "✦", tone: "nevermore", description: "Dark feather accents with a violet glow." },
  { id: "cat-ears", name: "Cat Ears", category: "decorations", price: 500, icon: "⌃", tone: "catEars", description: "Clean animated ears above your avatar." },
  { id: "bonsai-eternity", name: "Bonsai Eternity", category: "decorations", price: 825, icon: "❋", tone: "bonsai", description: "A miniature glowing bonsai silhouette wraps your avatar." },
  { id: "totality", name: "Totality", category: "decorations", price: 900, icon: "◐", tone: "totality", description: "A dark eclipse disk with a luminous edge." },
  { id: "fantasy-galaxy", name: "Fantasy Galaxy", category: "decorations", price: 925, icon: "✦", tone: "fantasyGalaxy", description: "A miniature galaxy orbiting your avatar." },
  { id: "fallen-angel", name: "Fallen Angel", category: "decorations", price: 1000, icon: "◇", tone: "fallenAngel", description: "Elegant wing accents with a cold celestial glow." },
  { id: "hellhound", name: "Hellhound", category: "decorations", price: 1050, icon: "◈", tone: "hellhound", description: "A molten guardian silhouette around your avatar." },
  { id: "phoenix-crown", name: "Phoenix Crown", category: "decorations", price: 950, icon: "✦", tone: "phoenix", description: "A sharp phoenix crest that frames your avatar with ember light.", featured: true },
  { id: "neon-horns", name: "Neon Horns", category: "decorations", price: 800, icon: "⌁", tone: "neonHorns", description: "Animated violet horns with a subtle electric pulse." },
  { id: "starlit-bloom", name: "Starlit Bloom", category: "decorations", price: 875, icon: "✿", tone: "starlit", description: "A luminous flower crown with drifting star particles." },
  { id: "infernal-wings", name: "Infernal Wings", category: "decorations", price: 1100, icon: "◈", tone: "infernalWings", description: "Dark wings edged in molten orange light." },
  { id: "ember-crown", name: "Ember Crown", category: "frames", price: 725, icon: "♛", tone: "emberCrown", description: "A layered ember frame with a premium collector finish." },
  { id: "prism-edge", name: "Prism Edge", category: "frames", price: 825, icon: "◇", tone: "prismEdge", description: "A clean spectral frame that shifts through neon hues." },
  { id: "obsidian-frame", name: "Obsidian Halo", category: "frames", price: 900, icon: "●", tone: "obsidian", description: "A dark polished frame with a violet rim light." },
  { id: "hype-royal", name: "Hype Royal", category: "nameplates", price: 1000, icon: "♛", tone: "hypeRoyal", description: "A premium nameplate that puts your display name front and center." },
  { id: "arcade-grid", name: "Arcade Grid", category: "nameplates", price: 700, icon: "▦", tone: "arcadeGrid", description: "Retro scanlines and neon accents behind your name." },
  { id: "midnight-glass", name: "Midnight Glass", category: "nameplates", price: 650, icon: "◇", tone: "midnightGlass", description: "A sleek glass plate with a subtle purple glow." },
  { id: "spider-night", name: "Night Web", category: "dmCovers", price: 900, icon: "✣", tone: "spiderNight", description: "A deep crimson web pattern for your DM identity." },
  { id: "ember-city", name: "Ember City", category: "dmCovers", price: 850, icon: "▰", tone: "emberCity", description: "Neon skyline lighting with Hype orange highlights." },
  { id: "violet-rain", name: "Violet Rain", category: "dmCovers", price: 775, icon: "⋮", tone: "violetRain", description: "Soft violet rain over a dark glass backdrop." },
  { id: "dragon-sky", name: "Dragon Sky", category: "banners", price: 1050, icon: "◈", tone: "dragonSky", description: "A dramatic celestial dragon-inspired profile banner." },
  { id: "hype-sunset", name: "Hype Sunset", category: "banners", price: 700, icon: "◒", tone: "hypeSunset", description: "Warm orange and violet gradients behind your profile." },
  { id: "aurora-city", name: "Aurora City", category: "banners", price: 900, icon: "✦", tone: "auroraCity", description: "A futuristic city skyline under an aurora glow." },
  { id: "founders-frame", name: "Founder's Crest", category: "badges", price: 1800, icon: "◆", tone: "foundersCrest", description: "A prestige badge for Hypecord's earliest collectors." },
  { id: "firekeeper", name: "Firekeeper", category: "badges", price: 1250, icon: "🔥", tone: "firekeeper", description: "A flame badge reserved for users who keep the Hype alive." },
  { id: "neon-night", name: "Neon Night", category: "themes", price: 850, icon: "◐", tone: "neonNight", description: "A dark neon atmosphere with violet and ember accents." },
  { id: "paper-stars", name: "Paper Stars", category: "themes", price: 725, icon: "✦", tone: "paperStars", description: "A soft midnight theme with drifting star specks." },
];

const ALL_SHOP_ITEMS = [...SHOP_ITEMS, ...EXTRA_SHOP_ITEMS];

const storageKey = (userId, name) => `hypecord:${userId}:${name}`;

function getInitialProfile(user) {
  const saved = JSON.parse(localStorage.getItem(storageKey(user.id, "profile")) || "null");
  return {
    displayName: saved?.displayName || user.user_metadata?.display_name || user.user_metadata?.username || "Hypecord User",
    bio: saved?.bio || user.user_metadata?.bio || "",
    status: saved?.status || "online",
    avatar: saved?.avatar || user.user_metadata?.avatar_url || null,
    banner: saved?.banner || null,
    dmCover: saved?.dmCover || null,
    nameplate: saved?.nameplate || null,
    frame: saved?.frame || null,
    effect: saved?.effect || null,
    decoration: saved?.decoration || null,
    badge: saved?.badge || null,
    betaTester: saved?.betaTester || isBetaTester(user),
  };
}

function getBadge(hype) {
  if (hype >= 100) return "Hype Legend";
  if (hype >= 50) return "Hyped";
  if (hype >= 10) return "Rising";
  return "Newcomer";
}

function formatHype(value) {
  const n = Math.max(0, Number(value) || 0);
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0).replace(/\\.0$/, "")}k`;
  if (n < 1_000_000_000) return `${(n / 1_000_000).toFixed(n < 10_000_000 ? 1 : 0).replace(/\\.0$/, "")}m`;
  return `${(n / 1_000_000_000).toFixed(1).replace(/\\.0$/, "")}b`;
}

const SEASON_LENGTH_MS = 55 * 24 * 60 * 60 * 1000;
const BETA_START = Date.parse("2026-09-01T00:00:00-06:00");
const BETA_END = BETA_START + 60 * 24 * 60 * 60 * 1000;

function getCurrentSeason() {
  return { number: 1, start: BETA_START, end: BETA_START + SEASON_LENGTH_MS, daysLeft: 55 };
}

function isBetaTester(user) {
  if (!user?.created_at) return false;
  const created = Date.parse(user.created_at);
  return created >= BETA_START && created <= BETA_END;
}

function HypeFlame({ small = false }) {
  return <span className={`hype-flame${small ? " small" : ""}`} aria-label="Hype">🔥</span>;
}

function App() {
  const [mode, setMode] = useState("login");
  const [activePage, setActivePage] = useState("friends");
  const [friendsTab, setFriendsTab] = useState("online");
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authNotice, setAuthNotice] = useState("");

  const [hype, setHype] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [selectedDm, setSelectedDm] = useState(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageText, setEditingMessageText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [viewProfile, setViewProfile] = useState(null);
  const [premiumMessage, setPremiumMessage] = useState("");

  const [profile, setProfile] = useState({ displayName: "Hypecord User", bio: "", status: "online", avatar: null });
  const [profileDraft, setProfileDraft] = useState(profile);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userPanelRef = useRef(null);
  const shopTabsRef = useRef(null);
  const settingsNavRef = useRef(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("account");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPhone, setAccountPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [inputDevices, setInputDevices] = useState([]);
  const [outputDevices, setOutputDevices] = useState([]);
  const [selectedInput, setSelectedInput] = useState("default");
  const [selectedOutput, setSelectedOutput] = useState("default");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [appVersion, setAppVersion] = useState("0.1.0-beta.1");
  const [updateStatus, setUpdateStatus] = useState({ status: "unknown" });

  const [friendList, setFriendList] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [friendLookupResults, setFriendLookupResults] = useState([]);
  const [friendModalOpen, setFriendModalOpen] = useState(false);
  const [friendLookupLoading, setFriendLookupLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [joinedVoiceChannel, setJoinedVoiceChannel] = useState(null);
  const [voiceLatency, setVoiceLatency] = useState(null);
  const [voiceParticipants, setVoiceParticipants] = useState([]);

  const [shopCategory, setShopCategory] = useState("featured");
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [previewItem, setPreviewItem] = useState(null);

  const [servers, setServers] = useState([]);
  const [activeServerId, setActiveServerId] = useState("home");
  const [createServerOpen, setCreateServerOpen] = useState(false);
  const [serverSettingsOpen, setServerSettingsOpen] = useState(false);
  const [serverDraftName, setServerDraftName] = useState("");
  const [serverMemberName, setServerMemberName] = useState("");
  const [serverManagePermission, setServerManagePermission] = useState(false);

  const [gameState, setGameState] = useState({ games: [], loading: false, canScan: false });
  const [micMuted, setMicMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [serverContextMenu, setServerContextMenu] = useState(null);

  useEffect(() => {
    const updater = window.hypecordUpdater;
    if (!updater) return;
    updater.getVersion?.().then(version => { if (version) setAppVersion(version); }).catch(() => {});
    const unsubscribe = updater.onStatus?.(payload => {
      if (payload) setUpdateStatus(payload);
    });
    return () => unsubscribe?.();
  }, []);

  const [serverInviteOpen, setServerInviteOpen] = useState(null);
  const [serverInviteTarget, setServerInviteTarget] = useState("");
  const [pendingInvitePreview, setPendingInvitePreview] = useState(null);
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [spotifyUser, setSpotifyUser] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [activeUtility, setActiveUtility] = useState("games");

  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callMinimized, setCallMinimized] = useState(false);
  const [callMuted, setCallMuted] = useState(false);
  const [localSpeaking, setLocalSpeaking] = useState(false);
  const [remoteSpeaking, setRemoteSpeaking] = useState(false);
  const callChannelRef = useRef(null);
  const callChannelReadyRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const localAudioContextRef = useRef(null);
  const remoteAudioContextRef = useRef(null);
  const ringtoneRef = useRef(null);
  const messageSoundRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);
  const incomingCallTimeoutRef = useRef(null);
  const activeCallRef = useRef(null);
  const messageListRef = useRef(null);
  const presenceChannelRef = useRef(null);
  const voicePresenceChannelRef = useRef(null);
  const voiceLocalStreamRef = useRef(null);
  const voicePeerConnectionsRef = useRef(new Map());
  const voiceRemoteAudioRefs = useRef(new Map());
  const voicePendingCandidatesRef = useRef(new Map());
  const voiceStatsTimersRef = useRef(new Map());
  const voiceHypeSessionRef = useRef(null);

  // Keep the ringtone ready after the user has interacted with Hypecord.
  // This makes browser autoplay restrictions much less likely to suppress an incoming ring.
  useEffect(() => {
    const sound = new Audio("/sounds/hypecord-ringtone-blended.mp3");
    sound.preload = "auto";
    sound.loop = true;
    sound.volume = 0.42;
    ringtoneRef.current = sound;
    const unlock = () => {
      // Browsers may block an Audio.play() that happens without a prior user gesture.
      // A silent start/stop during the first click unlocks this already-preloaded element
      // so a later incoming call can ring normally.
      sound.play().then(() => {
        sound.pause();
        sound.currentTime = 0;
      }).catch(() => {});
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      sound.pause();
      sound.src = "";
      if (ringtoneRef.current === sound) ringtoneRef.current = null;
    };
  }, []);

  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    }
    getSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    const user = session.user;
    const savedProfile = getInitialProfile(user);
    setProfile(savedProfile);
    setProfileDraft(savedProfile);
    setAccountEmail(user.email || "");
    setAccountPhone(user.phone || "");
    setPurchasedItems(JSON.parse(localStorage.getItem(storageKey(user.id, "purchases")) || "[]"));
    setSelectedInput(localStorage.getItem(storageKey(user.id, "inputDevice")) || "default");
    setSelectedOutput(localStorage.getItem(storageKey(user.id, "outputDevice")) || "default");
    setSelectedDm(null);
    setViewProfile(null);

    (async () => {
      const { data: remoteProfile } = await supabase.from("hypecord_profiles").select("user_id, display_name, bio, status, avatar, banner, dm_cover, nameplate, frame, effect, decoration, badge, beta_tester").eq("user_id", user.id).maybeSingle();
      if (remoteProfile) {
        const synced = { ...savedProfile, displayName: remoteProfile.display_name || savedProfile.displayName, bio: remoteProfile.bio || "", status: remoteProfile.status || "online", avatar: remoteProfile.avatar || null, banner: remoteProfile.banner || null, dmCover: remoteProfile.dm_cover || null, nameplate: remoteProfile.nameplate || null, frame: remoteProfile.frame || null, effect: remoteProfile.effect || null, decoration: remoteProfile.decoration || null, badge: remoteProfile.badge || null, betaTester: !!remoteProfile.beta_tester || isBetaTester(user) };
        setProfile(synced);
        setProfileDraft(synced);
        localStorage.setItem(storageKey(user.id, "profile"), JSON.stringify(synced));
      } else {
        await supabase.from("hypecord_profiles").upsert({ user_id: user.id, display_name: savedProfile.displayName, bio: savedProfile.bio, status: savedProfile.status, avatar: savedProfile.avatar, banner: savedProfile.banner, dm_cover: savedProfile.dmCover, nameplate: savedProfile.nameplate, frame: savedProfile.frame, effect: savedProfile.effect, decoration: savedProfile.decoration, badge: savedProfile.badge, beta_tester: isBetaTester(user) }, { onConflict: "user_id" });
      }
    })();

    (async () => {
      const localServers = JSON.parse(localStorage.getItem(storageKey(user.id, "servers")) || "[]");
      for (const localServer of localServers) {
        const { error: serverError } = await supabase.from("hypecord_servers").upsert({ id: localServer.id, name: localServer.name, avatar: localServer.avatar || null, owner_id: localServer.ownerId || user.id }, { onConflict: "id" });
        if (!serverError) await supabase.from("hypecord_server_members").upsert({ server_id: localServer.id, user_id: user.id, can_manage: true }, { onConflict: "server_id,user_id" });
      }
      const { data: serverRows } = await supabase.from("hypecord_servers").select("id, name, avatar, owner_id, created_at").order("created_at", { ascending: true });
      const rows = serverRows || [];
      if (rows.length) {
        const ids = rows.map(row => row.id);
        const { data: memberRows } = await supabase.from("hypecord_server_members").select("server_id, user_id, can_manage, joined_at").in("server_id", ids);
        const members = memberRows || [];
        const memberIds = [...new Set(members.map(m => m.user_id))];
        const { data: memberUsers } = memberIds.length ? await supabase.from("user_stats").select("user_id, username").in("user_id", memberIds) : { data: [] };
        const names = new Map((memberUsers || []).map(u => [u.user_id, u.username]));
        const mapped = rows.map(row => ({ id: row.id, name: row.name, avatar: row.avatar, ownerId: row.owner_id, createdAt: row.created_at, members: members.filter(m => m.server_id === row.id).map(m => ({ user_id: m.user_id, username: names.get(m.user_id) || "Hypecord User", canManage: m.can_manage })) }));
        setServers(mapped);
        localStorage.setItem(storageKey(user.id, "servers"), JSON.stringify(mapped));
      } else {
        setServers([]);
      }

      const inviteCode = new URLSearchParams(window.location.search).get("invite");
      if (inviteCode) {
        const { data: joined, error: joinError } = await supabase.rpc("hypecord_join_server", { invite_code: inviteCode });
        window.history.replaceState({}, document.title, window.location.pathname);
        if (!joinError && joined?.[0]) {
          const { data: refreshed } = await supabase.from("hypecord_servers").select("id, name, avatar, owner_id, created_at").eq("id", joined[0].server_id).maybeSingle();
          if (refreshed) {
            const { data: members } = await supabase.from("hypecord_server_members").select("server_id, user_id, can_manage").eq("server_id", refreshed.id);
            const ids = (members || []).map(m => m.user_id);
            const { data: memberUsers } = ids.length ? await supabase.from("user_stats").select("user_id, username").in("user_id", ids) : { data: [] };
            const names = new Map((memberUsers || []).map(u => [u.user_id, u.username]));
            const server = { id: refreshed.id, name: refreshed.name, avatar: refreshed.avatar, ownerId: refreshed.owner_id, createdAt: refreshed.created_at, members: (members || []).map(m => ({ ...m, username: names.get(m.user_id) || "Hypecord User" })) };
            setServers(prev => prev.some(s => s.id === server.id) ? prev.map(s => s.id === server.id ? server : s) : [...prev, server]);
            setActiveServerId(server.id);
            setActivePage("server");
          }
        } else if (joinError) {
          console.warn("Server invite could not be joined:", joinError.message);
        }
      }
    })();
  }, [session]);

  useEffect(() => {
    if (!session?.user) return;
    let channel;
    let cancelled = false;
    (async () => {
      try {
        channel = supabase.channel("hypecord-presence", { config: { presence: { key: session.user.id } } });
        presenceChannelRef.current = channel;
        const refresh = () => {
          const state = channel.presenceState();
          setOnlineUsers(new Set(Object.keys(state || {})));
        };
        channel.on("presence", { event: "sync" }, refresh);
        channel.on("presence", { event: "join" }, refresh);
        channel.on("presence", { event: "leave" }, refresh);
        await channel.subscribe(async status => {
          if (cancelled || status !== "SUBSCRIBED") return;
          await channel.track({ user_id: session.user.id, username: session.user.user_metadata?.username || "Hypecord User", status: profile.status || "online" });
          refresh();
        });
      } catch (error) {
        console.warn("Presence unavailable", error);
      }
    })();
    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
      presenceChannelRef.current = null;
      setOnlineUsers(new Set());
    };
  }, [session, profile.status]);

  useEffect(() => {
    if (!session?.user) return;
    loadSocialGraph();
    loadDirectMessages();

    const socialChannel = supabase.channel(`hypecord-social:${session.user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "friend_requests" }, () => loadSocialGraph())
      .on("postgres_changes", { event: "*", schema: "public", table: "direct_messages" }, payload => {
        const row = payload.new || payload.old;
        if (!row || (row.sender_id !== session.user.id && row.recipient_id !== session.user.id)) return;
        loadDirectMessages();
        if (payload.eventType === "INSERT" && row.sender_id !== session.user.id) {
          const sound = messageSoundRef.current || new Audio("/sounds/hypecord-message.mp3");
          messageSoundRef.current = sound;
          sound.currentTime = 0;
          sound.volume = 0.55;
          sound.play().catch(() => {});
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(socialChannel);
    };
  }, [session]);

  useEffect(() => {
    if (!selectedDm) return;
    const list = messageListRef.current;
    if (!list) return;
    requestAnimationFrame(() => {
      list.scrollTop = list.scrollHeight;
    });
  }, [selectedDm?.user_id, recentMessages.length, chatLoading]);

  useEffect(() => {
    if (!session?.user) return;
    async function loadStats() {
      const { data, error } = await supabase.from("user_stats")
        .upsert({ user_id: session.user.id, username: session.user.user_metadata?.username || "" }, { onConflict: "user_id" })
        .select("hype, message_count")
        .single();
      if (!error && data) {
        setHype(data.hype);
        setMessageCount(data.message_count);
      }
    }
    loadStats();
  }, [session]);

  useEffect(() => {
    if (!session?.user || activePage !== "leaderboard") return;
    async function loadLeaderboard() {
      const { data, error } = await supabase.from("user_stats")
        .select("user_id, username, hype, message_count")
        .order("hype", { ascending: false }).limit(50);
      if (!error) setLeaderboard(data || []);
    }
    loadLeaderboard();
  }, [session, activePage, hype]);

  useEffect(() => {
    const token = spotifyAuth.getTokenFromUrl() || spotifyAuth.getToken();
    if (!token) return;
    setSpotifyToken(token);
    spotifyAuth.saveToken(token);
    window.location.hash = "";
    const api = new SpotifyAPI(token);
    api.getCurrentUser().then(setSpotifyUser).catch(() => {});
    api.getTopTracks(10).then(data => setTopTracks(data.items || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (activePage !== "game-launcher") return;
    setGameState(s => ({ ...s, loading: true }));
    Promise.resolve(detectInstalledGames()).then(games => setGameState({ games, loading: false, canScan: true })).catch(() => setGameState({ games: [], loading: false, canScan: true }));
  }, [activePage]);

  useEffect(() => {
    if (!settingsOpen || settingsTab !== "voice") return;
    let active = true;

    async function refreshAudioDevices() {
      if (!navigator.mediaDevices?.enumerateDevices) {
        setSettingsMessage("Your browser does not expose audio device detection.");
        return;
      }

      try {
        // Ask for microphone permission first so browsers can reveal real device labels.
        if (navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!active) return;
        setInputDevices(devices.filter(d => d.kind === "audioinput"));
        setOutputDevices(devices.filter(d => d.kind === "audiooutput"));
        setSettingsMessage("Audio devices detected. Choose your microphone and output.");
      } catch (error) {
        if (active) setSettingsMessage("Microphone permission is needed to detect device names.");
      }
    }

    refreshAudioDevices();
    const onDeviceChange = () => refreshAudioDevices();
    navigator.mediaDevices.addEventListener?.("devicechange", onDeviceChange);

    return () => {
      active = false;
      navigator.mediaDevices.removeEventListener?.("devicechange", onDeviceChange);
    };
  }, [settingsOpen, settingsTab]);

  useEffect(() => {
    if (!serverContextMenu) return;
    const close = () => setServerContextMenu(null);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [serverContextMenu]);

  useEffect(() => {
    if (!userMenuOpen) return;

    function handleOutsideClick(event) {
      if (!userPanelRef.current?.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [userMenuOpen]);

  function persistProfile(next) {
    if (!session?.user) return;
    setProfile(next);
    localStorage.setItem(storageKey(session.user.id, "profile"), JSON.stringify(next));
    supabase.from("hypecord_profiles").upsert({
      user_id: session.user.id,
      display_name: next.displayName || "Hypecord User",
      bio: next.bio || "",
      status: next.status || "online",
      avatar: next.avatar || null,
      banner: next.banner || null,
      dm_cover: next.dmCover || null,
      nameplate: next.nameplate || null,
      frame: next.frame || null,
      effect: next.effect || null,
      decoration: next.decoration || null,
      badge: next.badge || null,
      beta_tester: !!next.betaTester,
    }, { onConflict: "user_id" }).then(({ error }) => { if (error) console.warn("Profile sync failed", error); });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, display_name: username, bio: "", beta_tester: true, beta_registered_at: new Date().toISOString() } },
    });
    if (error) {
      alert(error.message);
      return;
    }
    setAuthNotice("Account created. Check your email to verify your Hypecord account.");
    setMode("login");
  }

  async function handleLogout() {
    setUserMenuOpen(false);
    await supabase.auth.signOut();
  }

  function saveFriends(next) {
    setFriendList(next);
    if (session?.user) localStorage.setItem(storageKey(session.user.id, "friends"), JSON.stringify(next));
  }

  function savePending(next) {
    setPendingRequests(next);
    if (session?.user) localStorage.setItem(storageKey(session.user.id, "pending"), JSON.stringify(next));
  }

  async function loadSocialGraph() {
    if (!session?.user) return;
    const me = session.user.id;
    const [{ data: sent }, { data: received }] = await Promise.all([
      supabase.from("friend_requests").select("id, requester_id, recipient_id, status, created_at").eq("requester_id", me),
      supabase.from("friend_requests").select("id, requester_id, recipient_id, status, created_at").eq("recipient_id", me),
    ]);
    const requests = [...(sent || []), ...(received || [])];
    const acceptedIds = [...new Set(requests.filter(r => r.status === "accepted").map(r => r.requester_id === me ? r.recipient_id : r.requester_id))];
    const pendingIncoming = requests.filter(r => r.status === "pending" && r.recipient_id === me);
    const pendingOutgoing = requests.filter(r => r.status === "pending" && r.requester_id === me);
    const pendingIds = [...new Set([...pendingIncoming, ...pendingOutgoing].map(r => r.requester_id === me ? r.recipient_id : r.requester_id))];
    if (acceptedIds.length || pendingIds.length) {
      const ids = [...new Set([...acceptedIds, ...pendingIds])];
      const [{ data: users }, { data: profiles }] = await Promise.all([
        supabase.from("user_stats").select("user_id, username, hype, message_count, created_at").in("user_id", ids),
        supabase.from("hypecord_profiles").select("user_id, display_name, bio, status, avatar, banner, dm_cover, nameplate, frame, effect, decoration, badge, beta_tester").in("user_id", ids),
      ]);
      const map = new Map((users || []).map(u => [u.user_id, u]));
      const profileMap = new Map((profiles || []).map(p => [p.user_id, { displayName: p.display_name, bio: p.bio, status: p.status, avatar: p.avatar, banner: p.banner, dmCover: p.dm_cover, nameplate: p.nameplate, frame: p.frame, effect: p.effect, decoration: p.decoration, badge: p.badge, betaTester: !!p.beta_tester }]));
      saveFriends(acceptedIds.map(id => map.has(id) ? { ...map.get(id), profile: profileMap.get(id) || {}, avatar: profileMap.get(id)?.avatar || null } : null).filter(Boolean));
      savePending(pendingIds.map(id => { const req = requests.find(r => r.status === "pending" && ((r.requester_id === me && r.recipient_id === id) || (r.recipient_id === me && r.requester_id === id))); return map.has(id) ? { ...map.get(id), profile: profileMap.get(id) || {}, avatar: profileMap.get(id)?.avatar || null, user_id: id, request_id: req?.id, incoming: req?.recipient_id === me } : null; }).filter(x => x?.username));
    } else {
      saveFriends([]);
      savePending([]);
    }
  }

  async function loadDirectMessages() {
    if (!session?.user) return;
    setChatLoading(true);
    const { data, error } = await supabase.from("direct_messages").select("id, sender_id, recipient_id, body, created_at, updated_at").or(`sender_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`).order("created_at", { ascending: true }).limit(500);
    if (!error) {
      const rows = data || [];
      const peerIds = [...new Set(rows.map(m => m.sender_id === session.user.id ? m.recipient_id : m.sender_id))];
      let userMap = new Map();
      if (peerIds.length) {
        const { data: users } = await supabase.from("user_stats").select("user_id, username").in("user_id", peerIds);
        userMap = new Map((users || []).map(u => [u.user_id, u]));
      }
      setRecentMessages(rows.map(m => {
        const peerId = m.sender_id === session.user.id ? m.recipient_id : m.sender_id;
        return { ...m, user_id: peerId, text: m.body, peer_username: userMap.get(peerId)?.username || "Hypecord User" };
      }));
    } else {
      console.error("Error loading direct messages:", error);
    }
    setChatLoading(false);
  }

  async function lookupFriends(value = friendSearch) {
    const query = value.trim();
    if (!query || !session?.user) {
      setFriendLookupResults([]);
      return;
    }
    setFriendLookupLoading(true);
    const { data, error } = await supabase.from("user_stats")
      .select("user_id, username, hype")
      .ilike("username", `%${query}%`)
      .neq("user_id", session.user.id)
      .limit(12);
    setFriendLookupLoading(false);
    if (!error) setFriendLookupResults(data || []);
  }

  async function sendFriendRequest(user) {
    if (!session?.user || !user?.user_id) return;
    const { error } = await supabase.from("friend_requests").insert({ requester_id: session.user.id, recipient_id: user.user_id, status: "pending" });
    if (error && !String(error.message || "").toLowerCase().includes("duplicate")) {
      alert(error.message);
      return;
    }
    await loadSocialGraph();
    setFriendModalOpen(false);
    setFriendsTab("pending");
  }

  async function respondToFriendRequest(request, status) {
    if (!request?.id) return;
    const { error } = await supabase.from("friend_requests").update({ status, updated_at: new Date().toISOString() }).eq("id", request.id);
    if (error) { alert(error.message); return; }
    await loadSocialGraph();
  }

  async function saveProfile() {
    const next = { ...profileDraft };
    persistProfile(next);
    const { error } = await supabase.auth.updateUser({
      data: { display_name: next.displayName, bio: next.bio, avatar_url: next.avatar || null },
    });
    if (error) console.error(error);
    setEditProfileOpen(false);
  }

  async function saveAccountSettings() {
    setSettingsMessage("");
    if (!session?.user) return;
    if (accountEmail && accountEmail !== session.user.email) {
      const { error } = await supabase.auth.updateUser({ email: accountEmail });
      if (error) { setSettingsMessage(error.message); return; }
    }
    if (accountPhone !== (session.user.phone || "")) {
      const { error } = await supabase.auth.updateUser({ phone: accountPhone || undefined });
      if (error) { setSettingsMessage(error.message); return; }
    }
    if (newPassword) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) { setSettingsMessage(error.message); return; }
      setNewPassword("");
    }
    setSettingsMessage("Account settings saved.");
  }

  function saveAudioSettings() {
    if (!session?.user?.id) return;
    localStorage.setItem(storageKey(session.user.id, "inputDevice"), selectedInput);
    localStorage.setItem(storageKey(session.user.id, "outputDevice"), selectedOutput);
    setSettingsMessage("Voice & audio settings saved for this account.");
  }

  function savePurchases(next) {
    setPurchasedItems(next);
    localStorage.setItem(storageKey(session.user.id, "purchases"), JSON.stringify(next));
  }

  async function buyItem(item) {
    if (purchasedItems.includes(item.id)) {
      equipItem(item);
      return;
    }
    if (hype < item.price) {
      alert("You need more Hype for this item.");
      return;
    }
    const newHype = hype - item.price;
    const { error } = await supabase.from("user_stats").update({ hype: newHype }).eq("user_id", session.user.id);
    if (error) {
      alert("There was a problem completing your purchase.");
      return;
    }
    setHype(newHype);
    savePurchases([...purchasedItems, item.id]);
    equipItem(item);
  }

  function equipItem(item) {
    const next = { ...profile };
    if (item.category === "decorations") next.decoration = item.id;
    if (item.category === "effects") next.effect = item.id;
    if (item.category === "frames") next.frame = item.id;
    if (item.category === "nameplates") next.nameplate = item.id;
    if (item.category === "banners") next.banner = item.id;
    if (item.category === "dmCovers") next.dmCover = item.id;
    if (item.category === "badges") next.badge = item.id;
    persistProfile(next);
    setPreviewItem(item);
  }

  async function refreshServers(preferredServerId = null) {
    if (!session?.user) return;
    const { data: serverRows, error } = await supabase.from("hypecord_servers").select("id, name, avatar, owner_id, created_at").order("created_at", { ascending: true });
    if (error) { console.warn("Could not load servers", error); return; }
    const rows = serverRows || [];
    const ids = rows.map(row => row.id);
    const { data: memberRows } = ids.length ? await supabase.from("hypecord_server_members").select("server_id, user_id, can_manage, joined_at").in("server_id", ids) : { data: [] };
    const members = memberRows || [];
    const memberIds = [...new Set(members.map(m => m.user_id))];
    const { data: memberUsers } = memberIds.length ? await supabase.from("user_stats").select("user_id, username").in("user_id", memberIds) : { data: [] };
    const names = new Map((memberUsers || []).map(u => [u.user_id, u.username]));
    const mapped = rows.map(row => ({ id: row.id, name: row.name, avatar: row.avatar, ownerId: row.owner_id, createdAt: row.created_at, members: members.filter(m => m.server_id === row.id).map(m => ({ user_id: m.user_id, username: names.get(m.user_id) || "Hypecord User", canManage: m.can_manage })) }));
    setServers(mapped);
    localStorage.setItem(storageKey(session.user.id, "servers"), JSON.stringify(mapped));
    if (preferredServerId && mapped.some(s => s.id === preferredServerId)) { setActiveServerId(preferredServerId); setActivePage("server"); }
  }

  async function createServer() {
    const name = serverDraftName.trim();
    if (!name || !session?.user) return;
    const id = `server-${crypto.randomUUID?.() || Date.now()}`;
    const { error: serverError } = await supabase.from("hypecord_servers").insert({ id, name, avatar: null, owner_id: session.user.id });
    if (serverError) { alert(serverError.message); return; }
    const { error: memberError } = await supabase.from("hypecord_server_members").insert({ server_id: id, user_id: session.user.id, can_manage: true });
    if (memberError) { await supabase.from("hypecord_servers").delete().eq("id", id); alert(memberError.message); return; }
    setServerDraftName("");
    setCreateServerOpen(false);
    await refreshServers(id);
  }

  function updateServer(mutator) {
    const current = servers.find(s => s.id === activeServerId);
    if (!current) return;
    const nextServer = mutator(current);
    setServers(prev => {
      const next = prev.map(s => s.id === activeServerId ? nextServer : s);
      localStorage.setItem(storageKey(session.user.id, "servers"), JSON.stringify(next));
      return next;
    });
    supabase.from("hypecord_servers").update({ name: nextServer.name, avatar: nextServer.avatar || null }).eq("id", activeServerId).then(({ error }) => { if (error) console.warn("Server update failed", error); });
    if (nextServer.members) {
      Promise.all(nextServer.members.map(member => supabase.from("hypecord_server_members").upsert({ server_id: activeServerId, user_id: member.user_id, can_manage: !!member.canManage }, { onConflict: "server_id,user_id" }))).catch(() => {});
    }
  }

  function serverInviteLink(server, code = "") {
    return `${window.location.origin}/?invite=${encodeURIComponent(code)}`;
  }

  async function deleteServer(server) {
    if (!server || server.ownerId !== session.user.id) return;
    if (!window.confirm(`Delete ${server.name}? This cannot be undone.`)) return;
    const { error } = await supabase.from("hypecord_servers").delete().eq("id", server.id);
    if (error) { alert(error.message); return; }
    if (joinedVoiceChannel?.serverId === server.id) await leaveServerVoiceChannel();
    setActiveServerId("home");
    setActivePage("friends");
    setServerContextMenu(null);
    await refreshServers();
  }

  async function openServerInvite(server) {
    if (!server) return;
    const code = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const { error } = await supabase.from("hypecord_server_invites").insert({ server_id: server.id, code, created_by: session.user.id });
    if (error) { alert(error.message); return; }
    setServerInviteOpen({ ...server, inviteCode: code, inviteLink: serverInviteLink(server, code) });
    setServerInviteTarget("");
    setServerContextMenu(null);
  }

  async function sendServerInvite(server) {
    if (!server?.inviteCode) return;
    const target = serverInviteTarget.trim();
    if (!target) { await navigator.clipboard?.writeText(server.inviteLink); setPendingInvitePreview(server); setServerInviteOpen(null); return; }
    const { data: users, error: userError } = await supabase.from("user_stats").select("user_id, username").ilike("username", target).neq("user_id", session.user.id).limit(2);
    const recipient = (users || []).find(u => u.username?.toLowerCase() === target.toLowerCase()) || users?.[0];
    if (userError || !recipient) { alert("That Hypecord username could not be found."); return; }
    const body = `[Hypecord Server Invite] ${server.name}\n${server.inviteLink}`;
    const { error } = await supabase.from("direct_messages").insert({ sender_id: session.user.id, recipient_id: recipient.user_id, body });
    if (error) { alert(error.message); return; }
    setServerInviteOpen(null);
    setSelectedDm({ user_id: recipient.user_id, username: recipient.username });
    setActiveServerId("home");
    setActivePage("messages");
  }

  function canManageServer(server) {
    if (!server || !session?.user) return false;
    if (server.ownerId === session.user.id) return true;
    return server.members?.some(m => m.user_id === session.user.id && m.canManage);
  }

  function currentVoiceProfile() {
    return {
      displayName: profile.displayName,
      avatar: profile.avatar || null,
      decoration: profile.decoration || null,
      frame: profile.frame || null,
      effect: profile.effect || null,
      nameplate: profile.nameplate || null,
      badge: profile.badge || null,
    };
  }

  async function sendVoiceSignal(event, payload) {
    const channel = voicePresenceChannelRef.current;
    if (!channel) return;
    try { await channel.send({ type: "broadcast", event, payload: { ...payload, fromUserId: session.user.id } }); }
    catch (error) { console.warn("Voice signal failed", error); }
  }

  function stopVoiceStats(peerId) {
    const timer = voiceStatsTimersRef.current.get(peerId);
    if (timer) clearInterval(timer);
    voiceStatsTimersRef.current.delete(peerId);
  }

  function closeVoicePeer(peerId) {
    stopVoiceStats(peerId);
    const pc = voicePeerConnectionsRef.current.get(peerId);
    pc?.close?.();
    voicePeerConnectionsRef.current.delete(peerId);
    voicePendingCandidatesRef.current.delete(peerId);
    const audio = voiceRemoteAudioRefs.current.get(peerId);
    if (audio) { audio.srcObject = null; audio.remove(); }
    voiceRemoteAudioRefs.current.delete(peerId);
  }

  async function createVoicePeer(peerId, initiator = false) {
    if (voicePeerConnectionsRef.current.has(peerId)) return voicePeerConnectionsRef.current.get(peerId);
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    voicePeerConnectionsRef.current.set(peerId, pc);
    voiceLocalStreamRef.current?.getTracks().forEach(track => pc.addTrack(track, voiceLocalStreamRef.current));
    pc.onicecandidate = event => { if (event.candidate) sendVoiceSignal("voice-candidate", { toUserId: peerId, candidate: event.candidate }); };
    pc.ontrack = event => {
      const stream = event.streams?.[0];
      if (!stream) return;
      let audio = voiceRemoteAudioRefs.current.get(peerId);
      if (!audio) {
        audio = document.createElement("audio");
        audio.autoplay = true;
        audio.playsInline = true;
        audio.dataset.voicePeer = peerId;
        audio.style.display = "none";
        document.body.appendChild(audio);
        voiceRemoteAudioRefs.current.set(peerId, audio);
      }
      audio.srcObject = stream;
      audio.muted = deafened;
      audio.volume = deafened ? 0 : 1;
      audio.play().catch(() => {});
    };
    pc.onconnectionstatechange = () => {
      if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
        if (pc.connectionState === "failed") pc.restartIce?.();
        if (pc.connectionState === "closed") closeVoicePeer(peerId);
      }
    };
    voiceStatsTimersRef.current.set(peerId, setInterval(async () => {
      if (pc.connectionState !== "connected") return;
      try {
        const stats = await pc.getStats();
        let rtt = null;
        stats.forEach(report => {
          if (report.type === "candidate-pair" && report.state === "succeeded" && typeof report.currentRoundTripTime === "number") rtt = report.currentRoundTripTime * 1000;
        });
        if (rtt != null) setVoiceLatency(Math.round(rtt));
      } catch {}
    }, 1500));
    if (initiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendVoiceSignal("voice-offer", { toUserId: peerId, offer: pc.localDescription, profile: currentVoiceProfile() });
    }
    return pc;
  }

  async function joinServerVoiceChannel(server, channelName = "Lounge") {
    if (!server?.id || !session?.user) return;
    if (activeCall) { alert("End your direct call before joining a server voice channel."); return; }
    if (joinedVoiceChannel?.serverId === server.id && joinedVoiceChannel?.channelName === channelName) return;
    await leaveServerVoiceChannel();
    try {
      await supabase.realtime.setAuth(session.access_token);
      voiceLocalStreamRef.current = await getCallMediaStream();
      voiceLocalStreamRef.current.getAudioTracks().forEach(track => { track.enabled = !micMuted; });
      const topic = `hypecord-voice:${server.id}:${channelName}`;
      const channel = supabase.channel(topic, { config: { private: true, presence: { key: session.user.id }, broadcast: { ack: true } } });
      voicePresenceChannelRef.current = channel;
      const refreshParticipants = () => {
        const state = channel.presenceState() || {};
        const flattened = Object.values(state).flat().map(entry => ({ user_id: entry.user_id, username: entry.username, profile: entry.profile || {}, joined_at: entry.joined_at })).filter(p => p.user_id);
        setVoiceParticipants(flattened);
        flattened.filter(p => p.user_id !== session.user.id).forEach(peer => { if (session.user.id < peer.user_id) createVoicePeer(peer.user_id, true).catch(console.warn); });
      };
      channel.on("presence", { event: "sync" }, refreshParticipants);
      channel.on("presence", { event: "join" }, refreshParticipants);
      channel.on("presence", { event: "leave" }, payload => {
        const peerId = payload?.key || payload?.leftPresences?.[0]?.user_id;
        if (peerId) closeVoicePeer(peerId);
        refreshParticipants();
      });
      channel.on("broadcast", { event: "voice-offer" }, async ({ payload }) => {
        if (!payload || payload.toUserId !== session.user.id) return;
        const pc = await createVoicePeer(payload.fromUserId, false);
        await pc.setRemoteDescription(payload.offer);
        const pending = voicePendingCandidatesRef.current.get(payload.fromUserId) || [];
        for (const candidate of pending) await pc.addIceCandidate(candidate).catch(() => {});
        voicePendingCandidatesRef.current.delete(payload.fromUserId);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sendVoiceSignal("voice-answer", { toUserId: payload.fromUserId, answer: pc.localDescription, profile: currentVoiceProfile() });
      });
      channel.on("broadcast", { event: "voice-answer" }, async ({ payload }) => {
        if (!payload || payload.toUserId !== session.user.id) return;
        const pc = voicePeerConnectionsRef.current.get(payload.fromUserId);
        if (!pc) return;
        await pc.setRemoteDescription(payload.answer);
        const pending = voicePendingCandidatesRef.current.get(payload.fromUserId) || [];
        for (const candidate of pending) await pc.addIceCandidate(candidate).catch(() => {});
        voicePendingCandidatesRef.current.delete(payload.fromUserId);
      });
      channel.on("broadcast", { event: "voice-candidate" }, async ({ payload }) => {
        if (!payload || payload.toUserId !== session.user.id || !payload.candidate) return;
        const pc = voicePeerConnectionsRef.current.get(payload.fromUserId);
        if (!pc || !pc.remoteDescription) {
          const list = voicePendingCandidatesRef.current.get(payload.fromUserId) || [];
          list.push(payload.candidate);
          voicePendingCandidatesRef.current.set(payload.fromUserId, list);
          return;
        }
        await pc.addIceCandidate(payload.candidate).catch(() => {});
      });
      await channel.subscribe(async status => {
        if (status !== "SUBSCRIBED") return;
        await channel.track({ user_id: session.user.id, username: profile.displayName || "Hypecord User", profile: currentVoiceProfile(), joined_at: Date.now() });
        refreshParticipants();
      });
      setJoinedVoiceChannel({ serverId: server.id, channelName });
      setVoiceLatency(null);
      setActiveServerId(server.id);
      setActivePage("server");
    } catch (error) {
      console.error("Could not join server voice", error);
      await leaveServerVoiceChannel();
      alert("Hypecord could not join the voice channel. Check your microphone permission.");
    }
  }

  async function leaveServerVoiceChannel() {
    if (voicePresenceChannelRef.current) {
      try { await voicePresenceChannelRef.current.untrack(); } catch {}
      await supabase.removeChannel(voicePresenceChannelRef.current);
      voicePresenceChannelRef.current = null;
    }
    for (const peerId of [...voicePeerConnectionsRef.current.keys()]) closeVoicePeer(peerId);
    for (const audio of voiceRemoteAudioRefs.current.values()) { audio.srcObject = null; audio.remove(); }
    voiceRemoteAudioRefs.current.clear();
    voiceLocalStreamRef.current?.getTracks?.().forEach(track => track.stop());
    voiceLocalStreamRef.current = null;
    voicePendingCandidatesRef.current.clear();
    setVoiceParticipants([]);
    setJoinedVoiceChannel(null);
    setVoiceLatency(null);
  }

  useEffect(() => {
    voiceLocalStreamRef.current?.getAudioTracks().forEach(track => { track.enabled = !micMuted; });
  }, [micMuted]);

  useEffect(() => {
    if (!voicePresenceChannelRef.current || !joinedVoiceChannel) return;
    Promise.resolve(voicePresenceChannelRef.current.track({ user_id: session.user.id, username: profile.displayName || "Hypecord User", profile: currentVoiceProfile(), joined_at: Date.now() })).catch(() => {});
  }, [profile.displayName, profile.avatar, profile.decoration, profile.frame, profile.effect, profile.nameplate, profile.badge, joinedVoiceChannel?.serverId, joinedVoiceChannel?.channelName]);

  useEffect(() => {
    for (const audio of voiceRemoteAudioRefs.current.values()) { audio.muted = deafened; audio.volume = deafened ? 0 : 1; }
  }, [deafened]);

  useEffect(() => {
    const inVoice = activeCall?.status === "connected" || !!joinedVoiceChannel;
    if (!inVoice) { voiceHypeSessionRef.current = null; return; }
    if (!voiceHypeSessionRef.current) voiceHypeSessionRef.current = { startedAt: Date.now(), awardedMinutes: 0 };
    const awardCompletedMinutes = async () => {
      const sessionState = voiceHypeSessionRef.current;
      if (!sessionState) return;
      const completedMinutes = Math.floor((Date.now() - sessionState.startedAt) / 60000);
      const newMinutes = completedMinutes - sessionState.awardedMinutes;
      if (newMinutes <= 0) return;
      sessionState.awardedMinutes = completedMinutes;
      const { data, error } = await supabase.rpc("hypecord_add_hype", { delta: newMinutes * 10 });
      if (!error && typeof data === "number") setHype(data);
    };
    const timer = setInterval(awardCompletedMinutes, 5000);
    return () => clearInterval(timer);
  }, [activeCall?.status, joinedVoiceChannel?.serverId, joinedVoiceChannel?.channelName]);

  async function sendCallSignal(targetUserId, payload) {
    if (!targetUserId || !session?.access_token) return false;
    try {
      await supabase.realtime.setAuth(session.access_token);
      const channel = callChannelRef.current;
      const ready = callChannelReadyRef.current;
      if (!channel || !ready) return false;
      const status = await ready;
      if (status !== "SUBSCRIBED") return false;
      const result = await channel.send({
        type: "broadcast",
        event: "call",
        payload: {
          ...payload,
          toUserId: targetUserId,
          fromUserId: session.user.id,
          fromUsername: profile.displayName,
          fromAvatar: profile.avatar || null,
          fromProfile: { ...currentVoiceProfile(), betaTester: isBetaTester(session.user) },
        },
      });
      return result == null || result === "ok" || result === "OK";
    } catch (error) {
      console.error("Call signal failed:", error);
      return false;
    }
  }

  useEffect(() => { activeCallRef.current = activeCall; }, [activeCall]);

  function stopCallAudioAnalysis() {
    localAudioContextRef.current?.close?.().catch?.(() => {});
    remoteAudioContextRef.current?.close?.().catch?.(() => {});
    localAudioContextRef.current = null;
    remoteAudioContextRef.current = null;
    setLocalSpeaking(false);
    setRemoteSpeaking(false);
  }

  function cleanupCall(sendHangup = false) {
    const call = activeCall;
    if (sendHangup && call?.peerId) sendCallSignal(call.peerId, { type: "hangup" });
    peerConnectionRef.current?.close?.();
    peerConnectionRef.current = null;
    localStreamRef.current?.getTracks?.().forEach(track => track.stop());
    localStreamRef.current = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    stopCallAudioAnalysis();
    setActiveCall(null);
    setCallMinimized(false);
    setCallMuted(false);
    setIncomingCall(null);
    if (incomingCallTimeoutRef.current) clearTimeout(incomingCallTimeoutRef.current);
    incomingCallTimeoutRef.current = null;
    if (ringtoneRef.current) { ringtoneRef.current.pause(); ringtoneRef.current.currentTime = 0; }
  }

  function startAudioLevelMonitor(stream, setter, contextRef) {
    if (!stream || typeof AudioContext === "undefined") return;
    try {
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      const tick = () => {
        if (contextRef.current !== ctx) return;
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const value of data) { const centered = (value - 128) / 128; sum += centered * centered; }
        setter(Math.sqrt(sum / data.length) > 0.035);
        requestAnimationFrame(tick);
      };
      contextRef.current = ctx;
      tick();
    } catch (error) {
      console.warn("Audio level monitor unavailable", error);
    }
  }

  async function getCallMediaStream() {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("Microphone access is unavailable.");
    const audio = {
      ...(selectedInput && selectedInput !== "default" ? { deviceId: { exact: selectedInput } } : {}),
      channelCount: { ideal: 1 },
      echoCancellation: { ideal: true },
      noiseSuppression: { ideal: true },
      autoGainControl: { ideal: true },
    };
    try {
      return await navigator.mediaDevices.getUserMedia({ audio, video: false });
    } catch (error) {
      // A saved device id can become stale when Windows/browser device ids change.
      // Retry the default microphone so one account does not get stuck on an old device.
      if (selectedInput && selectedInput !== "default") {
        console.warn("Saved microphone unavailable; falling back to the default microphone.", error);
        return navigator.mediaDevices.getUserMedia({ audio: { channelCount: { ideal: 1 }, echoCancellation: { ideal: true }, noiseSuppression: { ideal: true }, autoGainControl: { ideal: true } }, video: false });
      }
      throw error;
    }
  }

  async function applySelectedOutputDevice() {
    const audio = remoteAudioRef.current;
    if (!audio || !selectedOutput || selectedOutput === "default" || typeof audio.setSinkId !== "function") return;
    try {
      await audio.setSinkId(selectedOutput);
    } catch (error) {
      console.warn("Could not switch call output device", error);
    }
  }

  useEffect(() => {
    if (!activeCall) return;
    const timer = setTimeout(() => { applySelectedOutputDevice(); }, 0);
    return () => clearTimeout(timer);
  }, [activeCall, selectedOutput]);

  async function createPeerConnection(peerId) {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    peerConnectionRef.current = pc;
    pc.onicecandidate = event => {
      if (event.candidate) sendCallSignal(peerId, { type: "candidate", candidate: event.candidate });
    };
    pc.ontrack = event => {
      const stream = event.streams?.[0];
      if (!stream) return;
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.play().catch(() => {});
      }
      startAudioLevelMonitor(stream, setRemoteSpeaking, remoteAudioContextRef);
    };
    return pc;
  }

  async function startCall(friend) {
    if (!friend?.user_id || activeCall || incomingCall) return;
    if (!navigator.mediaDevices?.getUserMedia) { alert("Your browser does not support microphone calls."); return; }
    try {
      const stream = await getCallMediaStream();
      localStreamRef.current = stream;
      stream.getAudioTracks().forEach(track => { track.enabled = !callMuted; });
      startAudioLevelMonitor(stream, setLocalSpeaking, localAudioContextRef);
      const pc = await createPeerConnection(friend.user_id);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      setCallMinimized(false);
      setActiveCall({
        peerId: friend.user_id,
        peerUsername: friend.username || "Hypecord User",
        peerAvatar: friend.avatar || null,
        peerProfile: friend.profile || {},
        direction: "outgoing",
        status: "calling",
      });
      const delivered = await sendCallSignal(friend.user_id, { type: "offer", offer: pc.localDescription });
      if (!delivered) {
        cleanupCall(false);
        alert("Hypecord could not reach the other account. Make sure both accounts are online and try again.");
      }
    } catch (error) {
      console.error(error);
      cleanupCall(false);
      alert("Hypecord could not start the call. Check your microphone permission.");
    }
  }

  async function acceptIncomingCall() {
    const call = incomingCall;
    if (!call) return;
    if (incomingCallTimeoutRef.current) clearTimeout(incomingCallTimeoutRef.current);
    if (ringtoneRef.current) { ringtoneRef.current.pause(); ringtoneRef.current.currentTime = 0; }
    try {
      const stream = await getCallMediaStream();
      localStreamRef.current = stream;
      stream.getAudioTracks().forEach(track => { track.enabled = !callMuted; });
      startAudioLevelMonitor(stream, setLocalSpeaking, localAudioContextRef);
      const pc = await createPeerConnection(call.fromUserId);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      await pc.setRemoteDescription(call.offer);
      for (const candidate of pendingIceCandidatesRef.current) await pc.addIceCandidate(candidate).catch(() => {});
      pendingIceCandidatesRef.current = [];
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      setIncomingCall(null);
      setCallMinimized(false);
      setActiveCall({
        peerId: call.fromUserId,
        peerUsername: call.fromUsername,
        peerAvatar: call.fromAvatar || call.fromProfile?.avatar || null,
        peerProfile: call.fromProfile || {},
        direction: "incoming",
        status: "connected",
      });
      await sendCallSignal(call.fromUserId, { type: "answer", answer: pc.localDescription });
    } catch (error) {
      console.error(error);
      await sendCallSignal(call.fromUserId, { type: "decline" });
      cleanupCall(false);
    }
  }

  async function declineIncomingCall() {
    const call = incomingCall;
    if (call?.fromUserId) await sendCallSignal(call.fromUserId, { type: "decline" });
    cleanupCall(false);
  }

  useEffect(() => {
    if (!session?.user || !session.access_token) return;
    let channel;
    let cancelled = false;
    (async () => {
      try {
        await supabase.realtime.setAuth(session.access_token);
        if (cancelled) return;
        channel = supabase.channel("hypecord-call-signaling", { config: { broadcast: { ack: true } } });
        callChannelRef.current = channel;
        callChannelReadyRef.current = new Promise(resolve => {
          channel.subscribe(status => {
            if (["SUBSCRIBED", "CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) resolve(status);
          });
        });
        const status = await callChannelReadyRef.current;
        if (status !== "SUBSCRIBED" || cancelled) return;
        channel.on("broadcast", { event: "call" }, async ({ payload }) => {
          if (!payload || payload.fromUserId === session.user.id || payload.toUserId !== session.user.id) return;
          if (payload.type === "offer") {
            if (activeCallRef.current) { await sendCallSignal(payload.fromUserId, { type: "decline" }); return; }
            setIncomingCall({ fromUserId: payload.fromUserId, fromUsername: payload.fromUsername || "Hypecord User", fromAvatar: payload.fromAvatar || null, fromProfile: payload.fromProfile || {}, offer: payload.offer });
            const sound = ringtoneRef.current || new Audio("/sounds/hypecord-ringtone-blended.mp3");
            ringtoneRef.current = sound;
            sound.loop = true;
            sound.volume = 0.42;
            sound.currentTime = 0;
            sound.play().catch(error => console.warn("Ringtone playback blocked until page interaction", error));
            if (incomingCallTimeoutRef.current) clearTimeout(incomingCallTimeoutRef.current);
            incomingCallTimeoutRef.current = setTimeout(async () => {
              await sendCallSignal(payload.fromUserId, { type: "decline" });
              setIncomingCall(null);
              if (ringtoneRef.current) { ringtoneRef.current.pause(); ringtoneRef.current.currentTime = 0; }
            }, 15000);
          } else if (payload.type === "answer") {
            const pc = peerConnectionRef.current;
            if (!pc) return;
            await pc.setRemoteDescription(payload.answer);
            for (const candidate of pendingIceCandidatesRef.current) await pc.addIceCandidate(candidate).catch(() => {});
            pendingIceCandidatesRef.current = [];
            setActiveCall(call => call ? { ...call, status: "connected", peerAvatar: payload.fromProfile?.avatar || payload.fromAvatar || call.peerAvatar || null, peerProfile: payload.fromProfile || call.peerProfile || {}, peerUsername: payload.fromUsername || call.peerUsername } : call);
          } else if (payload.type === "candidate") {
            const candidate = payload.candidate;
            const pc = peerConnectionRef.current;
            if (!candidate) return;
            if (!pc) { pendingIceCandidatesRef.current.push(candidate); return; }
            if (pc.remoteDescription) await pc.addIceCandidate(candidate).catch(() => {});
            else pendingIceCandidatesRef.current.push(candidate);
          } else if (payload.type === "decline" || payload.type === "hangup") {
            cleanupCall(false);
          }
        });
      } catch (error) { console.error("Unable to connect to Hypecord call signaling", error); }
    })();
    return () => {
      cancelled = true;
      callChannelReadyRef.current = null;
      callChannelRef.current = null;
      if (channel) supabase.removeChannel(channel);
    };
  }, [session]);

  useEffect(() => () => {
    leaveServerVoiceChannel().catch(() => {});
  }, []);

  if (loading) return <div className="loading-screen"><img src={hypecordLogo} alt="" />Loading Hypecord...</div>;

  if (!session) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <img src={hypecordLogo} alt="Hypecord" className="auth-logo-image" />
          <h1>Welcome to Hypecord</h1>
          <p className="auth-subtitle">{mode === "login" ? "We're so excited to see you again!" : "Create your account and join the hype."}</p>
          {authNotice && <div className="auth-notice">{authNotice}</div>}
          <form onSubmit={handleSubmit}>
            {mode === "signup" && <div className="form-group"><label>USERNAME</label><input value={username} onChange={e => setUsername(e.target.value)} placeholder="Choose a username" required /></div>}
            <div className="form-group"><label>EMAIL</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required /></div>
            <div className="form-group"><label>PASSWORD</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required /></div>
            <button className="auth-button" type="submit">{mode === "login" ? "Log In" : "Create Account"}</button>
          </form>
          <div className="auth-switch">
            <span>{mode === "login" ? "Need an account?" : "Already have an account?"}</span>
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Register" : "Log In"}</button>
          </div>
        </div>
      </div>
    );
  }

  const loggedInUsername = session.user.user_metadata?.username || "Hypecord User";
  const currentServer = servers.find(s => s.id === activeServerId);
  const currentStatus = STATUS_OPTIONS.find(s => s.id === profile.status) || STATUS_OPTIONS[0];

  const visibleFriends = friendsTab === "pending" ? pendingRequests : friendsTab === "online" ? friendList.filter(f => onlineUsers.has(f.user_id)) : friendList;
  const filteredFriends = visibleFriends.filter(f => !friendSearch || (f.username || "").toLowerCase().includes(friendSearch.toLowerCase()));

  const shopVisible = shopCategory === "featured"
    ? ALL_SHOP_ITEMS.filter(i => i.featured).slice(0, 12)
    : ALL_SHOP_ITEMS.filter(i => i.category === shopCategory);

  const rank = leaderboard.findIndex(u => u.user_id === session.user.id) + 1;
  const season = getCurrentSeason();
  const seasonRank = rank || 0;
  const equippedEffect = ALL_SHOP_ITEMS.find(item => item.id === profile.effect);
  const equippedDecoration = ALL_SHOP_ITEMS.find(item => item.id === profile.decoration);
  const directChats = [...new Map(recentMessages.map(m => [m.user_id, m])).values()]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(last => {
      const friend = friendList.find(f => f.user_id === last.user_id);
      return { ...(friend || {}), user_id: last.user_id, username: friend?.username || last.peer_username || "Hypecord User", lastMessage: last.text, lastAt: last.created_at, created_at: friend?.created_at || last.created_at };
    });
  const messagePeople = [...friendList.filter(f => !directChats.some(d => d.user_id === f.user_id)).map(f => ({ ...f, lastMessage: "Start a conversation" })), ...directChats];

  return (
    <div className="hypecord-app">
      <aside className="server-sidebar">
        <button className={`server-logo-button ${activeServerId === "home" ? "active" : ""}`} onClick={() => { setActiveServerId("home"); setActivePage("friends"); }}>
          <img src={hypecordLogo} alt="Hypecord" className="server-logo-image" />
        </button>
        <div className="sidebar-divider" />
        {servers.map(server => (
          <button key={server.id} className={`server-icon ${activeServerId === server.id ? "active" : ""}`} title={server.name} onContextMenu={e => { e.preventDefault(); if (canManageServer(server) || server.ownerId === session.user.id) setServerContextMenu({ server, x: e.clientX, y: e.clientY }); }} onClick={() => { setServerContextMenu(null); setActiveServerId(server.id); setActivePage("server"); }}>
            {server.name.charAt(0).toUpperCase()}
          </button>
        ))}
        <button className="server-icon add-server" title="Create a Server" onClick={() => setCreateServerOpen(true)}>+</button>
        <button className={`server-icon ${activePage === "game-launcher" ? "active" : ""}`} onClick={() => setActivePage("game-launcher")} title="Game Launcher">🎮</button>
        <button className={`server-icon ${activePage === "music" ? "active" : ""}`} onClick={() => setActivePage("music")} title="Music">🎵</button>
      </aside>

      <aside className="channel-sidebar">
        <div className="sidebar-header">
          <div>
            <div className="sidebar-brand">Hypecord</div>
            <small>{currentServer ? currentServer.name : "Home"}</small>
          </div>
          {currentServer && canManageServer(currentServer) && (
            <button className="icon-button" title="Server Settings" onClick={() => setServerSettingsOpen(true)}>⚙</button>
          )}
        </div>

        {activeServerId === "home" && (activePage === "friends" || activePage === "messages") && (
          <>
            <div className="sidebar-search">Find or start a conversation</div>
            <div className="sidebar-section">
              <button className={`side-link ${activePage === "friends" ? "active" : ""}`} onClick={() => setActivePage("friends")}>👥 <span>Friends</span></button>
            </div>
            <div className="sidebar-section-title">DIRECT MESSAGES <span>＋</span></div>
            <div className="direct-message-sidebar-list">{messagePeople.length ? messagePeople.map(friend => <button key={friend.user_id} className={`direct-message-sidebar-row ${selectedDm?.user_id === friend.user_id ? "active" : ""}`} onClick={() => { setSelectedDm(friend); setActivePage("messages"); setActiveServerId("home"); }}><span className="friend-avatar">{friend.username?.charAt(0).toUpperCase() || "U"}</span><span><strong>{friend.username}</strong><small>{friend.lastMessage || "Start a conversation"}</small></span></button>) : <div className="empty-dms">No direct messages yet.</div>}</div>
          </>
        )}

        {activeServerId !== "home" && activePage === "server" && (
          <div className="server-channel-list">
            <div className="sidebar-section-title">TEXT CHANNELS</div>
            <button className="side-link active"># <span>general</span></button>
            <button className="side-link"># <span>chat</span></button>
            <div className="sidebar-section-title">VOICE CHANNELS</div>
            <button className={`side-link voice-channel-link ${joinedVoiceChannel?.serverId === currentServer.id && joinedVoiceChannel?.channelName === "Lounge" ? "active" : ""}`} onClick={() => joinedVoiceChannel?.serverId === currentServer.id ? leaveServerVoiceChannel() : joinServerVoiceChannel(currentServer, "Lounge")} title={`Voice latency: ${voiceLatency ? `${voiceLatency} ms` : "checking…"}`}>🔊 <span>Lounge</span>{joinedVoiceChannel?.serverId === currentServer.id && <small className="voice-latency-chip">{voiceLatency ? `${voiceLatency}ms` : "…"}</small>}</button>
            <div className="server-permission-note">
              {canManageServer(currentServer) ? "You can manage this server." : "Server settings are owner-controlled."}
            </div>
            {joinedVoiceChannel?.serverId === currentServer.id && <div className="server-voice-connected"><div><span className="voice-connected-dot" /> Voice Connected</div><small>{joinedVoiceChannel.channelName} · {voiceLatency ? `${voiceLatency} ms` : "checking latency…"}</small><div className="server-voice-participants">{voiceParticipants.map(member => <div key={member.user_id} className="server-voice-participant"><span className="server-voice-mini-avatar">{member.profile?.avatar ? <img src={member.profile.avatar} alt="" /> : <img src={hypecordLogo} alt="" />}</span><span>{member.username}</span>{member.profile?.decoration && <b>{ALL_SHOP_ITEMS.find(i => i.id === member.profile.decoration)?.icon}</b>}</div>)}</div><button onClick={leaveServerVoiceChannel}>Disconnect</button></div>}
          </div>
        )}

        {activePage === "game-launcher" && activeServerId === "home" && (
          <div className="sidebar-feature-page"><div className="sidebar-feature-title">GAME LAUNCHER</div><div className="side-link active">▣ <span>Installed Games</span></div></div>
        )}

        {activePage === "music" && activeServerId === "home" && (
          <div className="sidebar-feature-page"><div className="sidebar-feature-title">MUSIC</div><div className="side-link active">♫ <span>Spotify</span></div></div>
        )}

        <div className="user-panel" ref={userPanelRef} onClick={() => setUserMenuOpen(v => !v)}>
          <div className={`user-avatar-small profile-frame-${profile.frame || "none"} ${equippedEffect ? `tone-${equippedEffect.tone}` : ""}`}>
            <span className={`profile-effect-ring ${equippedEffect ? `tone-${equippedEffect.tone}` : ""}`} />
            {equippedDecoration && <span className={`profile-decoration profile-decoration-mini tone-${equippedDecoration.tone}`}>{equippedDecoration.icon}</span>}
            {profile.avatar ? <img src={profile.avatar} alt="" /> : <img src={hypecordLogo} alt="Hypecord default avatar" />}
          </div>
          <div className="user-info">
            <strong className={`nameplate-mini profile-nameplate-${profile.nameplate || "none"}`}>{profile.displayName}</strong>
            <span className={`status-${profile.status}`}>{currentStatus.dot} {currentStatus.label} · <HypeFlame small /> {formatHype(hype)}</span>
          </div>
          <div className="voice-mini-controls" onClick={e => e.stopPropagation()}>
            <button className={`voice-mini-button ${micMuted ? "muted" : ""}`} title={micMuted ? "Unmute" : "Mute"} onClick={() => setMicMuted(v => !v)} aria-label="Mute microphone">{micMuted ? "╳" : "⌁"}</button>
            <button className={`voice-mini-button ${deafened ? "muted" : ""}`} title={deafened ? "Undeafen" : "Deafen"} onClick={() => setDeafened(v => !v)} aria-label="Deafen">{deafened ? "◉╱" : "◉"}</button>
          </div>
          <button className="icon-button" title="Settings" onClick={e => { e.stopPropagation(); setSettingsOpen(true); setUserMenuOpen(false); }}>⚙</button>
          {userMenuOpen && (
            <div className="user-menu" onClick={e => e.stopPropagation()}>
              <div className="user-menu-head">
                <div className="menu-avatar">{profile.avatar ? <img src={profile.avatar} alt="" /> : <img src={hypecordLogo} alt="" />}</div>
                <div><strong>{profile.displayName}</strong><span>@{loggedInUsername}</span></div>
              </div>
              <div className="user-menu-status">
                {STATUS_OPTIONS.map(status => (
                  <button key={status.id} onClick={() => { persistProfile({ ...profile, status: status.id }); setUserMenuOpen(false); }}>
                    {status.dot} {status.label}
                  </button>
                ))}
              </div>
              <button onClick={() => { setProfileDraft(profile); setEditProfileOpen(true); setUserMenuOpen(false); }}>✏️ Edit Profile</button>
              <button onClick={() => { setSettingsOpen(true); setSettingsTab("account"); setUserMenuOpen(false); }}>⚙ Settings</button>
              <button className="danger-link" onClick={handleLogout}>🚪 Log Out</button>
            </div>
          )}
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <nav className="top-navigation">
            <button className={`top-nav-button ${activePage === "friends" ? "active" : ""}`} onClick={() => { setActiveServerId("home"); setActivePage("friends"); }}><span className="nav-glyph">◉</span><span>Friends</span></button>
            <button className={`top-nav-button ${activePage === "shop" ? "active" : ""}`} onClick={() => { setActiveServerId("home"); setActivePage("shop"); }}><span className="nav-glyph">◇</span><span>Hype Shop</span></button>
            <button className={`top-nav-button ${activePage === "leaderboard" ? "active" : ""}`} onClick={() => { setActiveServerId("home"); setActivePage("leaderboard"); }}><span className="nav-glyph">♛</span><span>Hype Leaderboard</span></button>
            <button className={`top-nav-button ${activePage === "game-launcher" ? "active" : ""}`} onClick={() => { setActiveServerId("home"); setActivePage("game-launcher"); }}><span className="nav-glyph">▣</span><span>Game Launcher</span></button>
          </nav>
          <div className="header-tools"><span><HypeFlame small /> {hype.toLocaleString()}</span><button>⌕</button><button>?</button></div>
        </header>

        <section className="page-content">
          {activePage === "friends" && (
            <div className="friends-page">
              <div className="friends-header">
                <div className="friends-title"><h1>Friends</h1><div className="friends-tabs">
                  {["online", "all", "pending", "blocked"].map(tab => (
                    <button key={tab} className={friendsTab === tab ? "friends-tab active" : "friends-tab"} onClick={() => setFriendsTab(tab)}>{tab[0].toUpperCase() + tab.slice(1)}{tab === "pending" && pendingRequests.length ? ` ${pendingRequests.length}` : ""}</button>
                  ))}
                </div></div>
                <button className="add-friend-button" onClick={() => setFriendModalOpen(true)}>Add Friend</button>
              </div>
              <div className="friends-search"><span>⌕</span><input value={friendSearch} onChange={e => setFriendSearch(e.target.value)} placeholder="Search friends" /></div>
              {friendsTab === "blocked" ? (
                <div className="empty-state"><div className="empty-state-icon">🚫</div><h2>No blocked users</h2><p>People you block will appear here.</p></div>
              ) : filteredFriends.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon"><img src={hypecordLogo} alt="" /></div>
                  <h2>{friendsTab === "pending" ? "No pending requests" : friendsTab === "all" ? "You have no friends added yet" : "Currently no friends"}</h2>
                  <p>{friendsTab === "pending" ? "Friend requests you send or receive will appear here." : "Add someone to Hypecord and they'll appear here."}</p>
                  {friendsTab !== "pending" && friendsTab !== "blocked" && <button className="add-friend-button large" onClick={() => setFriendModalOpen(true)}>Add Your First Friend</button>}
                </div>
              ) : (
                <div className="friend-list">{filteredFriends.map(friend => (
                  <div className="friend-row" key={friend.user_id} onClick={() => setViewProfile({ ...friend, ...(friend.profile || {}), displayName: friend.profile?.displayName || friend.displayName || friend.username, status: friend.profile?.status || "online", bio: friend.profile?.bio || friend.bio || "", avatar: friend.profile?.avatar || friend.avatar || null, hype: friend.hype || 0 })}>
                    <div className="friend-avatar">{friend.username?.charAt(0).toUpperCase() || "U"}</div>
                    <div><strong>{friend.username || "Hypecord User"}</strong><span>{friendsTab === "pending" ? (friend.incoming ? "Incoming request" : "Request sent") : (onlineUsers.has(friend.user_id) ? "Online" : "Offline")}</span></div>
                    {friendsTab === "pending" && friend.incoming ? <div className="pending-actions"><button className="friend-action accept" onClick={e => { e.stopPropagation(); respondToFriendRequest(friend, "accepted"); }}>✓</button><button className="friend-action decline" onClick={e => { e.stopPropagation(); respondToFriendRequest(friend, "declined"); }}>×</button></div> : <button className="friend-action" onClick={e => { e.stopPropagation(); setSelectedDm(friend); setActivePage("messages"); }}>💬</button>}
                  </div>
                ))}</div>
              )}
            </div>
          )}

          {activePage === "messages" && (
            <div className="messages-page">
              <div className="section-heading messages-heading"><div><h1>Messages</h1><p>Your friends and direct conversations, all in one place.</p></div><button className="add-friend-button" onClick={() => setFriendModalOpen(true)}>Add Friend</button></div>
              <div className="messages-layout">
                <aside className="message-friends-panel">
                  <div className="messages-panel-title">FRIENDS</div>
                  {friendList.map(friend => <button key={friend.user_id} className={`message-friend-row ${selectedDm?.user_id === friend.user_id ? "active" : ""}`} onClick={() => { setSelectedDm(friend); setActivePage("messages"); }}><span className="friend-avatar">{friend.username?.charAt(0).toUpperCase() || "U"}</span><span><strong>{friend.username || "Hypecord User"}</strong><small>Friend</small></span></button>)}
                  <div className="messages-panel-title direct-title">DIRECT MESSAGES</div>
                  {directChats.map(chat => <button key={`dm-${chat.user_id}`} className={`message-friend-row ${selectedDm?.user_id === chat.user_id ? "active" : ""}`} onClick={() => setSelectedDm(chat)}><span className="friend-avatar">{chat.username?.charAt(0).toUpperCase() || "U"}</span><span><strong>{chat.username || "Hypecord User"}</strong><small>{chat.lastMessage || "Direct message"}</small></span></button>)}
                  {!friendList.length && !directChats.length && <div className="conversation-empty-copy side-empty-copy">No friends or direct messages yet.</div>}
                </aside>
                <section className="message-conversation">
                  {!selectedDm ? <div className="message-conversation-empty"><div className="empty-state-icon">💬</div><h2>Select a friend</h2><p>Choose someone from the left to start a conversation.</p></div> : <>
                    <div className="conversation-header">
                      <div className="conversation-peer"><span className="friend-avatar">{selectedDm.username?.charAt(0).toUpperCase() || "U"}</span><div><strong>{selectedDm.username || "Hypecord User"}</strong><span>Direct message</span></div></div>
                      <div className="conversation-actions"><button className="call-button" title={`Call ${selectedDm.username || "friend"}`} onClick={() => startCall(selectedDm)}>☎</button></div>
                    </div>
                    <div className="recent-message-list" ref={messageListRef}>
                      {chatLoading ? <div className="conversation-empty-copy">Loading conversation…</div> : recentMessages.filter(m => m.user_id === selectedDm.user_id).length === 0 ? <div className="conversation-empty-copy">No messages with {selectedDm.username || "this friend"} yet.</div> : recentMessages.filter(m => m.user_id === selectedDm.user_id).slice(-100).map(m => {
                        const mine = m.sender_id === session.user.id;
                        const isEditing = editingMessageId === m.id;
                        return <div className={`chat-message-row ${mine ? "outgoing" : "incoming"}`} key={m.id} onDoubleClick={() => { if (mine) { setEditingMessageId(m.id); setEditingMessageText(m.text); } }}>
                          <div className={`chat-message-avatar ${mine && localSpeaking ? "speaking" : !mine && remoteSpeaking ? "speaking" : ""}`}>{mine ? (profile.displayName?.charAt(0).toUpperCase() || "M") : (selectedDm.username?.charAt(0).toUpperCase() || "U")}</div>
                          <div className="chat-message-content">
                            <div className="chat-message-meta"><strong>{mine ? profile.displayName : selectedDm.username}</strong><span>{new Date(m.created_at).toLocaleString()}</span></div>
                            {isEditing ? <form className="chat-edit-form" onSubmit={async e => { e.preventDefault(); const text = editingMessageText.trim(); if (!text) return; const { error } = await supabase.from("direct_messages").update({ body: text, updated_at: new Date().toISOString() }).eq("id", m.id).eq("sender_id", session.user.id); if (error) { alert(error.message); return; } setEditingMessageId(null); setEditingMessageText(""); await loadDirectMessages(); }}><input autoFocus value={editingMessageText} onChange={e => setEditingMessageText(e.target.value)} /><button type="submit">Save</button><button type="button" onClick={() => setEditingMessageId(null)}>Cancel</button></form> : <div className="chat-message-text">{m.text}{m.updated_at && m.updated_at !== m.created_at ? <span className="edited-label"> (edited)</span> : null}</div>}
                          </div>
                          {mine && !isEditing && <button className="message-edit-hover" title="Edit message" onClick={() => { setEditingMessageId(m.id); setEditingMessageText(m.text); }}>✎</button>}
                        </div>;
                      })}
                    </div>
                    <form className="message-form" onSubmit={async e => {
                      e.preventDefault();
                      const text = messageDraft.trim();
                      if (!text || !selectedDm?.user_id) return;
                      const { data: inserted, error } = await supabase.from("direct_messages").insert({ sender_id: session.user.id, recipient_id: selectedDm.user_id, body: text }).select("id, sender_id, recipient_id, body, created_at, updated_at").single();
                      if (error) { alert(error.message); return; }
                      const localMessage = { ...inserted, user_id: selectedDm.user_id, text: inserted.body, peer_username: selectedDm.username };
                      setRecentMessages(prev => [...prev, localMessage].slice(-500));
                      const { data: reward, error: hypeError } = await supabase.rpc("hypecord_record_message");
                      if (!hypeError && reward?.[0]) { setMessageCount(reward[0].message_count); setHype(reward[0].hype); }
                      setMessageDraft("");
                    }}><input name="message" autoComplete="off" value={messageDraft} onChange={e => setMessageDraft(e.target.value)} placeholder={`Message ${selectedDm.username || "friend"}`} /><button type="submit">Send</button></form>
                  </>}
                </section>
              </div>
            </div>
          )}
          {activePage === "leaderboard" && (
            <div className="leaderboard-page"><div className="section-heading"><div><div className="season-kicker">SEASON {season.number} · 55 DAY SEASON</div><h1>Hype Leaderboard</h1><p>Climb the ranks by earning Hype. Season {season.number} ends in {season.daysLeft} day{season.daysLeft === 1 ? "" : "s"}.</p></div><div className="rank-pill">Season rank: {seasonRank > 0 ? `#${seasonRank}` : "—"}</div></div>
              <div className="season-banner"><div><strong>Season {season.number}</strong><span>Every season lasts 55 days. Your final rank becomes a seasonal profile badge.</span></div><span>{season.daysLeft} days left</span></div>
              <div className="leaderboard-list">{leaderboard.length === 0 ? <div className="empty-state"><h2>No Hype users yet</h2></div> : leaderboard.map((user, index) => (
                <div className={`leader-row ${user.user_id === session.user.id ? "me" : ""}`} key={user.user_id}>
                  <div className="rank-number">{index < 3 ? ["🥇", "🥈", "🥉"][index] : `#${index + 1}`}</div>
                  <div className="leader-avatar">{user.username?.charAt(0).toUpperCase() || "U"}</div>
                  <div className="leader-name"><strong>{user.username || "Hypecord User"}</strong><span>{user.message_count || 0} messages</span></div>
                  <strong className="leader-hype"><HypeFlame small /> {user.hype}</strong>
                </div>
              ))}</div>
            </div>
          )}
          {activePage === "shop" && (
            <div className="shop-page">
              <div className="shop-hero"><div><div className="shop-eyebrow">HYPECORD STORE</div><h1>Hype Shop</h1><p>Customize your profile and show off what you've earned.</p></div><div className="shop-balance"><HypeFlame small /> <strong>{hype.toLocaleString()}</strong> Hype</div></div>
              <div className="arrow-scroll-row"><button className="scroll-arrow left" onClick={() => shopTabsRef.current?.scrollBy({ left: -260, behavior: "smooth" })} aria-label="Scroll categories left">‹</button><div className="shop-tabs" ref={shopTabsRef}>{SHOP_CATEGORIES.map(([id, label]) => <button key={id} className={shopCategory === id ? "shop-tab active" : "shop-tab"} onClick={() => setShopCategory(id)}>{label}</button>)}</div><button className="scroll-arrow right" onClick={() => shopTabsRef.current?.scrollBy({ left: 260, behavior: "smooth" })} aria-label="Scroll categories right">›</button></div>
              <div className="shop-section-heading"><div><h2>{SHOP_CATEGORIES.find(x => x[0] === shopCategory)?.[1]}</h2><span>Click any item to preview it before unlocking.</span></div></div>
              <div className="shop-grid">{shopVisible.map(item => {
                const owned = purchasedItems.includes(item.id);
                return <article key={item.id} className={`shop-card tone-${item.tone}`} onClick={() => setPreviewItem(item)}>
                  <div className={`shop-card-preview tone-${item.tone} shop-preview-${item.category}`}><div className="shop-preview-avatar"><span className="preview-border-ring" />{profile.avatar ? <img src={profile.avatar} alt="" /> : <img src={hypecordLogo} alt="" />}</div><div className="effect-visual" /><div className="effect-particles" />{item.category === "nameplates" ? <div className={`shop-nameplate-demo profile-nameplate-${item.id}`}>{profile.displayName || "YOUR NAME"}</div> : item.category === "badges" ? <div className="shop-badge-demo"><span>{item.icon}</span>{item.name}</div> : <span className="shop-card-icon">{item.icon}</span>}<button className="preview-button" onClick={e => { e.stopPropagation(); setPreviewItem(item); }}>Preview</button></div>
                  <div className="shop-card-body"><div className="shop-card-type">{item.category === "effects" ? "PROFILE EFFECT" : item.category === "frames" ? "PROFILE FRAME" : item.category === "dmCovers" ? "DM COVER" : item.category === "nameplates" ? "NAMEPLATE" : item.category === "banners" ? "PROFILE BANNER" : item.category === "decorations" ? "AVATAR DECORATION" : item.category.toUpperCase()}</div><h3>{item.name}</h3><p>{item.description}</p><div className="shop-card-footer"><span className="shop-price"><HypeFlame small /> {item.price.toLocaleString()}</span><button className={`shop-buy ${owned ? "owned" : ""}`} onClick={e => { e.stopPropagation(); buyItem(item); }}>{owned ? "Owned" : hype >= item.price ? "Unlock" : "Need More"}</button></div></div>
                </article>;
              })}</div>
            </div>
          )}

          {activePage === "game-launcher" && (
            <div className="utility-page"><div className="section-heading"><div><h1>Game Launcher</h1><p>Only games actually found on your computer appear here.</p></div><button className="add-friend-button" onClick={async () => { setGameState(s => ({ ...s, loading: true })); const games = await detectInstalledGames({ requestFolder: true }); setGameState({ games, loading: false, canScan: true }); }}>Scan Game Library</button></div>
              {gameState.loading ? <div className="empty-state"><h2>Scanning your game library...</h2><p>Hypecord will never invent a game in this list.</p></div> : gameState.games.length ? <div className="game-grid">{gameState.games.map(game => <div className="game-card" key={game.id || game.name}><div className="game-art"><img src={game.preview} alt="" /></div><div><strong>{game.name}</strong><span>{game.source || "Installed"}</span></div><button onClick={() => alert(`Launching ${game.name} will be connected to the desktop launcher bridge next.`)}>Launch</button></div>)}</div> : <div className="empty-state"><div className="empty-state-icon">▣</div><h2>No installed games detected</h2><p>For the browser version, choose your Steam library folder with Scan Game Library. A packaged Hypecord desktop build can scan installed apps automatically.</p></div>}
            </div>
          )}

          {activePage === "music" && (
            <div className="utility-page"><div className="section-heading"><div><h1>Music</h1><p>Connect Spotify to bring your music into Hypecord.</p></div></div>
              {!spotifyToken ? <button className="add-friend-button large" onClick={() => window.location.href = spotifyAuth.getAuthUrl()}>Connect Spotify</button> : <div className="tracks-list">{topTracks.map((track, index) => <div className="track-item" key={track.id}>{track.album?.images?.[0] && <img src={track.album.images[0].url} alt="" />}<div><strong>{track.name}</strong><span>{track.artists.map(a => a.name).join(", ")}</span></div><b>#{index + 1}</b></div>)}</div>}
            </div>
          )}

          {activePage === "server" && currentServer && (
            <div className="server-page"><div className="section-heading"><div><h1>{currentServer.name}</h1><p>Welcome to your Hypecord server.</p></div>{canManageServer(currentServer) && <button className="add-friend-button" onClick={() => setServerSettingsOpen(true)}>Server Settings</button>}</div><div className="server-welcome"><h2># general</h2><p>This is the beginning of this server.</p><span>Owner: {currentServer.ownerId === session.user.id ? "You" : currentServer.ownerId}</span></div></div>
          )}
        </section>
      </main>

      <aside className="right-sidebar">
        {activePage === "messages" && selectedDm ? (
          <div className="dm-profile-sidebar">
            <div className="dm-profile-cover" />
            <div className="dm-profile-avatar-wrap"><div className="dm-profile-avatar"><img src={selectedDm.avatar || hypecordLogo} alt="" /></div><span className="dm-online-dot" /></div>
            <div className="dm-profile-body">
              <h2>{selectedDm.displayName || selectedDm.username || "Hypecord User"}</h2>
              <span className="dm-profile-username">@{selectedDm.username || "user"}</span>
              <div className="dm-profile-status">● Online · Hypecord</div>
              <div className="dm-profile-divider" />
              <p className="dm-profile-section-title">ABOUT ME</p>
              <p className="dm-profile-bio">{selectedDm.bio || "No bio yet."}</p>
              <p className="dm-profile-section-title">HYPE</p>
              <div className="dm-profile-hype"><HypeFlame small /> <strong>{formatHype(selectedDm.hype || 0)}</strong> Hype</div>
              <p className="dm-profile-section-title">BADGE</p>
              <div className="dm-profile-badge">{getBadge(selectedDm.hype || 0)}</div>{selectedDm.profile?.betaTester && <div className="dm-profile-badge beta-profile-badge">🧪 Beta Tester</div>}
              <p className="dm-profile-section-title">MEMBER SINCE</p>
              <div className="dm-profile-member">{selectedDm.created_at ? new Date(selectedDm.created_at).toLocaleDateString() : "Hypecord"}</div>
            </div>
            <button className="dm-profile-full-button" onClick={() => setViewProfile({ ...selectedDm, ...(selectedDm.profile || {}), displayName: selectedDm.profile?.displayName || selectedDm.displayName || selectedDm.username, username: selectedDm.username, hype: selectedDm.hype || 0 })}>View Full Profile</button>
          </div>
        ) : activePage === "friends" ? (
          <><h3>Active Now</h3>{friendList.filter(f => onlineUsers.has(f.user_id)).length ? <div className="active-now-list">{friendList.filter(f => onlineUsers.has(f.user_id)).map(friend => <button key={friend.user_id} className="active-now-friend" onClick={() => { setSelectedDm(friend); setActivePage("messages"); setActiveServerId("home"); }}><span className="active-now-avatar"><span>{friend.username?.charAt(0).toUpperCase() || "U"}</span><i /></span><span><strong>{friend.username || "Hypecord User"}</strong><small>Online now</small></span></button>)}</div> : <div className="active-now-empty"><div><HypeFlame /></div><strong>It's quiet for now</strong><p>When your friends are active, you'll see what they're doing here.</p></div>}</>
        ) : (
          <><h3>Your Profile</h3><div className="profile-card-large"><div className={`profile-cover profile-banner-${profile.banner || "default"}`}>{profile.banner?.startsWith("data:") && <img src={profile.banner} alt="Profile banner" />}</div><div className={`profile-card-avatar profile-frame-${profile.frame || "none"} ${equippedEffect ? `tone-${equippedEffect.tone}` : ""}`}><span className={`profile-effect-ring ${equippedEffect ? `tone-${equippedEffect.tone}` : ""}`} />{equippedDecoration && <span className={`profile-decoration tone-${equippedDecoration.tone}`}>{equippedDecoration.icon}</span>}{profile.avatar ? <img src={profile.avatar} alt="" /> : <img src={hypecordLogo} alt="" />}</div><div className={`profile-nameplate profile-nameplate-${profile.nameplate || "none"}`}>{profile.displayName}</div><span>@{loggedInUsername}</span><p>{profile.bio || "No bio yet."}</p><div className="profile-card-stats"><b>{getBadge(hype)} · <HypeFlame small /> {hype}</b>{profile.betaTester && <span className="equipped-badge-chip">🧪 Beta Tester</span>}{profile.badge && <span className="equipped-badge-chip">{ALL_SHOP_ITEMS.find(i => i.id === profile.badge)?.icon || "◆"} {ALL_SHOP_ITEMS.find(i => i.id === profile.badge)?.name || "Badge"}</span>}</div><button onClick={() => setViewProfile({ ...profile, username: loggedInUsername, hype })}>View Profile</button><button onClick={() => { setProfileDraft(profile); setEditProfileOpen(true); }}>Edit Profile</button></div></>
        )}
      </aside>

      {serverContextMenu && (
        <div className="server-context-menu" style={{ left: serverContextMenu.x, top: serverContextMenu.y }} onPointerDown={e => e.stopPropagation()}>
          <button onClick={() => openServerInvite(serverContextMenu.server)}>Invite People</button>
          <button onClick={() => { setActiveServerId(serverContextMenu.server.id); setActivePage("server"); setServerContextMenu(null); setServerSettingsOpen(true); }}>Server Settings</button>
          <div />
          <button className="danger-link" onClick={() => deleteServer(serverContextMenu.server)}>Delete Server</button>
        </div>
      )}

      {serverInviteOpen && (
        <div className="modal-backdrop" onClick={() => setServerInviteOpen(null)}>
          <div className="modal-card invite-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setServerInviteOpen(null)}>×</button>
            <div className="invite-server-preview"><div className="invite-server-avatar"><img src={serverInviteOpen.avatar || hypecordLogo} alt="" /></div><div><span>SERVER INVITE</span><h2>{serverInviteOpen.name}</h2><p>Join this Hypecord community.</p></div></div>
            <label>SEND TO HYPECORD USER<input value={serverInviteTarget} onChange={e => setServerInviteTarget(e.target.value)} placeholder="Username (optional)" /></label>
            <div className="invite-link-box"><span>{serverInviteOpen.inviteLink}</span><button onClick={() => navigator.clipboard?.writeText(serverInviteOpen.inviteLink)}>Copy</button></div>
            <div className="modal-actions"><button className="secondary-button" onClick={() => setServerInviteOpen(null)}>Cancel</button><button className="add-friend-button" onClick={() => sendServerInvite(serverInviteOpen)}>Send in Hypecord</button></div>
          </div>
        </div>
      )}

      {friendModalOpen && (
        <div className="modal-backdrop" onClick={() => setFriendModalOpen(false)}>
          <div className="modal-card friend-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setFriendModalOpen(false)}>×</button>
            <h2>Add Friend</h2><p>Search for someone by their Hypecord username.</p>
            <div className="lookup-input"><input autoFocus value={friendSearch} onChange={e => { setFriendSearch(e.target.value); lookupFriends(e.target.value); }} placeholder="Enter a username" /><button onClick={() => lookupFriends()} >Search</button></div>
            <div className="lookup-results">{friendLookupLoading ? <p>Searching...</p> : friendLookupResults.length ? friendLookupResults.map(user => <div className="lookup-row" key={user.user_id}><div className="friend-avatar">{user.username?.charAt(0).toUpperCase() || "U"}</div><div><strong>{user.username}</strong><span><HypeFlame small /> {user.hype || 0} Hype</span></div><button onClick={() => sendFriendRequest(user)}>Send Request</button></div>) : <div className="lookup-empty">Search for a username to find Hypecord users.</div>}</div>
          </div>
        </div>
      )}

      {incomingCall && (
        <div className="modal-backdrop incoming-call-backdrop">
          <div className="modal-card call-modal incoming-call-modal">
            <div className="call-modal-top"><span>INCOMING VOICE CALL</span><b>RINGING</b></div>
            <div className={`call-avatar-large ${remoteSpeaking ? "speaking" : ""}`}><img src={incomingCall.fromAvatar || hypecordLogo} alt="" /></div>
            <h2>{incomingCall.fromUsername}</h2><p>is calling you…</p>
            <div className="call-actions"><button className="call-decline" onClick={declineIncomingCall}>Decline</button><button className="call-accept" onClick={acceptIncomingCall}>Accept</button></div>
          </div>
        </div>
      )}

      {activeCall && (
        <div className={`call-overlay ${callMinimized ? "minimized" : ""}`}>
          <div className="call-stage">
            <div className="call-stage-header">
              <div className="call-stage-peer">
                <div className={`call-stage-avatar ${remoteSpeaking ? "speaking" : ""}`}><img src={activeCall.peerAvatar || hypecordLogo} alt="" /></div>
                <div><strong>{activeCall.peerUsername}</strong><span>{activeCall.status === "connected" ? "Voice connected" : "Calling…"}</span></div>
              </div>
              <div className="call-stage-actions">
                <button title={callMinimized ? "Open call" : "Minimize call"} onClick={() => setCallMinimized(v => !v)}>{callMinimized ? "□" : "—"}</button>
                <button title="Return to DM" onClick={() => { setSelectedDm({ user_id: activeCall.peerId, username: activeCall.peerUsername, avatar: activeCall.peerAvatar || null }); setActivePage("messages"); setActiveServerId("home"); setCallMinimized(true); }}>↗</button>
              </div>
            </div>
            <div className="call-stage-body">
              <div className={`call-stage-tile ${localSpeaking ? "speaking" : ""}`}>
                <div className={`call-stage-tile-avatar profile-frame-${profile.frame || "none"} ${profile.effect ? `tone-${ALL_SHOP_ITEMS.find(i => i.id === profile.effect)?.tone || ""}` : ""}`}>
                  {profile.effect && <span className={`profile-effect-ring tone-${ALL_SHOP_ITEMS.find(i => i.id === profile.effect)?.tone || ""}`} />}
                  {profile.decoration && <span className={`profile-decoration call-stage-decoration tone-${ALL_SHOP_ITEMS.find(i => i.id === profile.decoration)?.tone || ""}`}>{ALL_SHOP_ITEMS.find(i => i.id === profile.decoration)?.icon}</span>}
                  <img src={profile.avatar || hypecordLogo} alt="" />
                </div>
                <strong>{profile.displayName}</strong>
                {profile.nameplate && <span className={`call-stage-nameplate profile-nameplate-${profile.nameplate}`}>{ALL_SHOP_ITEMS.find(i => i.id === profile.nameplate)?.name}</span>}
                <span>{localSpeaking ? "Speaking" : "You"}</span>
              </div>
              <div className={`call-stage-tile ${remoteSpeaking ? "speaking" : ""}`}>
                <div className={`call-stage-tile-avatar profile-frame-${activeCall.peerProfile?.frame || "none"} ${activeCall.peerProfile?.effect ? `tone-${ALL_SHOP_ITEMS.find(i => i.id === activeCall.peerProfile.effect)?.tone || ""}` : ""}`}>
                  {activeCall.peerProfile?.effect && <span className={`profile-effect-ring tone-${ALL_SHOP_ITEMS.find(i => i.id === activeCall.peerProfile.effect)?.tone || ""}`} />}
                  {activeCall.peerProfile?.decoration && <span className={`profile-decoration call-stage-decoration tone-${ALL_SHOP_ITEMS.find(i => i.id === activeCall.peerProfile.decoration)?.tone || ""}`}>{ALL_SHOP_ITEMS.find(i => i.id === activeCall.peerProfile.decoration)?.icon}</span>}
                  <img src={activeCall.peerAvatar || activeCall.peerProfile?.avatar || hypecordLogo} alt="" />
                </div>
                <strong>{activeCall.peerUsername}</strong>
                {activeCall.peerProfile?.nameplate && <span className={`call-stage-nameplate profile-nameplate-${activeCall.peerProfile.nameplate}`}>{ALL_SHOP_ITEMS.find(i => i.id === activeCall.peerProfile.nameplate)?.name}</span>}
                <span>{remoteSpeaking ? "Speaking" : activeCall.status === "connected" ? "Connected" : "Calling…"}</span>
              </div>
            </div>
            <audio ref={remoteAudioRef} autoPlay />
            <div className="call-stage-controls">
              <button className={callMuted ? "call-control muted" : "call-control"} onClick={() => { const next = !callMuted; setCallMuted(next); localStreamRef.current?.getAudioTracks().forEach(track => { track.enabled = !next; }); }}>{callMuted ? "🎙 Unmute" : "🎙 Mute"}</button>
              <button className="call-end" onClick={() => cleanupCall(true)}>☎ End Call</button>
            </div>
          </div>
        </div>
      )}

      {viewProfile && (
        <div className="modal-backdrop" onClick={() => setViewProfile(null)}>
          <div className="modal-card public-profile-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewProfile(null)}>×</button>
            <div className={`public-profile-banner profile-banner-${viewProfile.banner || "default"}`}>{viewProfile.banner?.startsWith("data:") && <img src={viewProfile.banner} alt="" />}</div>
            <div className="public-profile-body">
              <div className={`public-profile-avatar profile-frame-${viewProfile.frame || "none"} ${viewProfile.effect ? `tone-${ALL_SHOP_ITEMS.find(i => i.id === viewProfile.effect)?.tone || ""}` : ""}`}>
                {viewProfile.effect && <span className={`profile-effect-ring tone-${ALL_SHOP_ITEMS.find(i => i.id === viewProfile.effect)?.tone || ""}`} />}
                {viewProfile.decoration && <span className={`profile-decoration public-profile-decoration tone-${ALL_SHOP_ITEMS.find(i => i.id === viewProfile.decoration)?.tone || ""}`}>{ALL_SHOP_ITEMS.find(i => i.id === viewProfile.decoration)?.icon}</span>}
                {viewProfile.avatar ? <img src={viewProfile.avatar} alt="" /> : <img src={hypecordLogo} alt="Hypecord" />}
              </div>
              <div className="public-profile-name-row"><h2>{viewProfile.displayName || viewProfile.username || "Hypecord User"}</h2><span>@{viewProfile.username || loggedInUsername}</span></div>
              <div className="public-profile-status">{viewProfile.status === "online" ? "🟢" : "⚫"} · osu! <span className="profile-badges">{viewProfile.hype >= 100 ? "🏆 Hype Legend" : viewProfile.hype >= 50 ? "🔥 Hyped" : viewProfile.hype >= 10 ? "✨ Rising" : "🌱 Newcomer"}{seasonRank > 0 && viewProfile.username === loggedInUsername ? ` · 🏅 Season ${season.number} #${seasonRank}` : ""}{viewProfile.betaTester ? " · 🧪 Beta Tester" : ""}</span></div>
              <div className="public-profile-bio">{viewProfile.bio || "No bio yet."}</div>
              <div className="public-profile-stats"><div><span>HYPE</span><strong><HypeFlame /> {formatHype(viewProfile.hype || 0)}</strong></div><div><span>SEASON</span><strong>{viewProfile.username === loggedInUsername && seasonRank > 0 ? `#${seasonRank}` : "—"}</strong></div><div><span>BADGE</span><strong>{getBadge(viewProfile.hype || 0)}</strong></div>{viewProfile.betaTester && <div><span>BETA</span><strong>🧪 Tester</strong></div>}</div>
              {viewProfile.username === loggedInUsername && <div className="season-profile-card"><strong>Season {season.number}</strong><span>Your current seasonal rank is #{seasonRank || "—"}. Final seasonal placement becomes a profile badge.</span></div>}
            </div>
          </div>
        </div>
      )}

      {previewItem && (
        <div className="modal-backdrop" onClick={() => setPreviewItem(null)}>
          <div className="modal-card preview-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPreviewItem(null)}>×</button>
            <div className={`large-effect-preview tone-${previewItem.tone} preview-${previewItem.category}`}><div className="preview-glow" /><div className="preview-avatar"><span className="preview-border-ring" />{profile.avatar ? <img src={profile.avatar} alt="" /> : <img src={hypecordLogo} alt="" />}</div><div className="effect-visual" /><div className="effect-particles" /></div>
            <div className="preview-info"><div className="shop-card-type">{previewItem.category === "effects" ? "PROFILE EFFECT" : previewItem.category === "frames" ? "PROFILE BORDER" : previewItem.category.toUpperCase()}</div><h2>{previewItem.name}</h2><p>{previewItem.description}</p><div className="preview-price"><HypeFlame small /> {previewItem.price.toLocaleString()} Hype</div><button className="add-friend-button" onClick={() => buyItem(previewItem)}>{purchasedItems.includes(previewItem.id) ? "Equip" : `Unlock · ${previewItem.price.toLocaleString()} Hype`}</button></div>
          </div>
        </div>
      )}

      {editProfileOpen && (
        <div className="modal-backdrop" onClick={() => setEditProfileOpen(false)}>
          <div className="modal-card profile-modal profile-editor-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditProfileOpen(false)}>×</button>
            <div className="profile-editor-fixed">
              <h2>Edit Profile</h2><p>Build your profile and see every change instantly.</p>
              <div className={`profile-editor-preview profile-banner-${profileDraft.banner || "default"}`}>
                {profileDraft.banner?.startsWith("data:") && <img className="profile-editor-banner-image" src={profileDraft.banner} alt="" />}
                <div className={`profile-editor-avatar profile-frame-${profileDraft.frame || "none"} ${profileDraft.effect ? `tone-${ALL_SHOP_ITEMS.find(i => i.id === profileDraft.effect)?.tone || ""}` : ""}`}>
                  {profileDraft.effect && <span className={`profile-effect-ring tone-${ALL_SHOP_ITEMS.find(i => i.id === profileDraft.effect)?.tone || ""}`} />}
                  {profileDraft.decoration && <span className={`profile-decoration editor-decoration tone-${ALL_SHOP_ITEMS.find(i => i.id === profileDraft.decoration)?.tone || ""}`}>{ALL_SHOP_ITEMS.find(i => i.id === profileDraft.decoration)?.icon}</span>}
                  <img src={profileDraft.avatar || hypecordLogo} alt="Profile preview" />
                </div>
                <div className="profile-editor-identity">
                  <div className={`profile-nameplate profile-nameplate-${profileDraft.nameplate || "none"}`}>{profileDraft.displayName || "Hypecord User"}</div>
                  <span>@{loggedInUsername}</span>
                  <small>{getBadge(hype)} · <HypeFlame small /> {hype}{profileDraft.betaTester ? " · 🧪 Beta Tester" : ""}{profileDraft.badge ? ` · ${ALL_SHOP_ITEMS.find(i => i.id === profileDraft.badge)?.name || ""}` : ""}</small>
                </div>
              </div>
            </div>
            <div className="profile-editor-scroll">
              <div className="profile-editor-upload-row">
                <label className="upload-button">Upload Picture<input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setProfileDraft(p => ({ ...p, avatar: reader.result })); reader.readAsDataURL(file); }} /></label>
                <label className="upload-button">Upload Banner<input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setProfileDraft(p => ({ ...p, banner: reader.result })); reader.readAsDataURL(file); }} /></label>
                <button type="button" className="secondary-button" onClick={() => setProfileDraft(p => ({ ...p, banner: null }))}>Reset Banner</button>
              </div>
              <label>DISPLAY NAME<input value={profileDraft.displayName} onChange={e => setProfileDraft(p => ({ ...p, displayName: e.target.value }))} /></label>
              <small>Your username remains <b>@{loggedInUsername}</b> for friend searches.</small>
              <label>BIO<textarea value={profileDraft.bio} onChange={e => setProfileDraft(p => ({ ...p, bio: e.target.value }))} placeholder="Tell people a little about yourself..." maxLength={190} /></label>
              <label>STATUS<select value={profileDraft.status} onChange={e => setProfileDraft(p => ({ ...p, status: e.target.value }))}>{STATUS_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.dot} {s.label}</option>)}</select></label>

              {[
                ["decorations", "AVATAR DECORATIONS", "decoration"],
                ["frames", "AVATAR FRAMES", "frame"],
                ["effects", "PROFILE EFFECTS", "effect"],
                ["nameplates", "NAMEPLATES", "nameplate"],
                ["badges", "BADGES", "badge"],
              ].map(([category, title, field]) => {
                const items = ALL_SHOP_ITEMS.filter(i => i.category === category);
                return <section className="profile-editor-section" key={category}><div className="profile-editor-section-title"><strong>{title}</strong><span>{category === "badges" ? "Profile identity badges" : "Choose an equipped look"}</span></div><div className="profile-editor-cosmetics">
                  <button className={`editor-cosmetic-card ${field && !profileDraft[field] ? "selected" : ""}`} onClick={() => field && setProfileDraft(p => ({ ...p, [field]: null }))}><div className="editor-cosmetic-visual none-visual">None</div><span>None</span></button>
                  {items.map(item => { const owned = purchasedItems.includes(item.id); const selected = field && profileDraft[field] === item.id; return <button key={item.id} disabled={!owned} title={owned ? `Equip ${item.name}` : "Unlock this in Hype Shop first"} className={`editor-cosmetic-card ${selected ? "selected" : ""} ${!owned ? "locked" : ""}`} onClick={() => field && owned && setProfileDraft(p => ({ ...p, [field]: item.id }))}>
                    <div className={`editor-cosmetic-visual tone-${item.tone} cosmetic-${category}`}><span className="cosmetic-icon">{item.icon}</span>{category === "nameplates" && <span className={`cosmetic-nameplate profile-nameplate-${item.id}`}>{profileDraft.displayName || "YOUR NAME"}</span>}{category === "badges" && <span className="cosmetic-badge-label">{item.name}</span>}</div><span>{item.name}</span>{!owned && <small>Locked</small>}
                  </button>; })}
                </div></section>;
              })}

              <div className="modal-actions profile-editor-actions"><button className="secondary-button" onClick={() => setEditProfileOpen(false)}>Cancel</button><button className="add-friend-button" onClick={saveProfile}>Save Profile</button></div>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="settings-overlay">
          <div className="settings-window">
            <aside className="settings-nav"><h2>Settings</h2><button className="settings-scroll-arrow" onClick={() => settingsNavRef.current?.scrollBy({ top: -240, behavior: "smooth" })} aria-label="Scroll settings up">⌃</button><div className="settings-nav-scroll" ref={settingsNavRef}>{[["account","My Account"],["profile","Profile"],["voice","Voice & Video"],["notifications","Notifications"],["privacy","Privacy & Safety"],["appearance","Appearance"],["accessibility","Accessibility"],["keybinds","Keybinds"],["language","Language & Time"],["connections","Connections"],["premium","Hypecord Premium"],["updates","Updates"]].map(([id,label]) => <button key={id} className={settingsTab === id ? "active" : ""} onClick={() => { setSettingsTab(id); setSettingsMessage(""); }}>{label}</button>)}</div><button className="settings-scroll-arrow" onClick={() => settingsNavRef.current?.scrollBy({ top: 240, behavior: "smooth" })} aria-label="Scroll settings down">⌄</button><button className="danger-link" onClick={handleLogout}>Log Out</button></aside>
            <main className="settings-main"><button className="settings-close" onClick={() => setSettingsOpen(false)}>×</button>
              {settingsTab === "account" && <><h1>My Account</h1><p className="settings-subtitle">Manage your Hypecord account details.</p><div className="settings-section"><label>EMAIL<input type="email" value={accountEmail} onChange={e => setAccountEmail(e.target.value)} /></label><label>PHONE NUMBER<input type="tel" value={accountPhone} onChange={e => setAccountPhone(e.target.value)} placeholder="Add a phone number" /></label><label>NEW PASSWORD<input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Leave blank to keep your password" /></label><button className="add-friend-button" onClick={saveAccountSettings}>Save Account Changes</button></div></>}
              {settingsTab === "profile" && <><h1>Profile</h1><p className="settings-subtitle">Customize your public identity.</p><div className="settings-section"><button className="add-friend-button" onClick={() => { setSettingsOpen(false); setProfileDraft(profile); setEditProfileOpen(true); }}>Edit Profile</button><div className="settings-profile-preview"><div className="profile-upload-avatar">{profile.avatar ? <img src={profile.avatar} alt="" /> : <img src={hypecordLogo} alt="" />}</div><div><h3>{profile.displayName}</h3><p>@{loggedInUsername}</p><span>{profile.bio || "No bio yet."}</span></div></div></div></>}
              {settingsTab === "voice" && <><h1>Voice & Video</h1><p className="settings-subtitle">Choose the devices Hypecord should use during calls.</p><div className="settings-section"><label>INPUT DEVICE<select value={selectedInput} onChange={e => setSelectedInput(e.target.value)}><option value="default">Default microphone</option>{inputDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || "Microphone"}</option>)}</select></label><label>OUTPUT DEVICE<select value={selectedOutput} onChange={e => setSelectedOutput(e.target.value)}><option value="default">Default output</option>{outputDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || "Speaker / Headset"}</option>)}</select></label><p className="device-note">Browser permissions may be required before device names appear. These choices are saved for future Hypecord calls.</p><button className="add-friend-button" onClick={saveAudioSettings}>Save Voice Settings</button></div></>}
              {settingsTab === "notifications" && <><h1>Notifications</h1><p className="settings-subtitle">Control how Hypecord alerts you.</p><div className="settings-section settings-options"><label><input type="checkbox" defaultChecked /> Desktop notifications</label><label><input type="checkbox" defaultChecked /> Friend requests</label><label><input type="checkbox" defaultChecked /> Direct messages</label><label><input type="checkbox" /> Sounds when mentioned</label></div></>}
              {settingsTab === "privacy" && <><h1>Privacy & Safety</h1><p className="settings-subtitle">Manage who can contact you and how your profile is discovered.</p><div className="settings-section settings-options"><label><input type="checkbox" defaultChecked /> Allow friend requests</label><label><input type="checkbox" defaultChecked /> Allow messages from friends</label><label><input type="checkbox" defaultChecked /> Show my online status</label><label><input type="checkbox" /> Allow profile discovery by username</label></div></>}
              {settingsTab === "appearance" && <><h1>Appearance</h1><p className="settings-subtitle">Make Hypecord feel like yours.</p><div className="settings-section settings-options"><label>THEME<select defaultValue="dark"><option value="dark">Dark</option><option value="midnight">Midnight</option><option value="oled">OLED Black</option></select></label><label>MESSAGE DENSITY<select defaultValue="comfortable"><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select></label><label><input type="checkbox" defaultChecked /> Show profile cosmetics</label><label><input type="checkbox" defaultChecked /> Animate Hype flame</label></div></>}
              {settingsTab === "accessibility" && <><h1>Accessibility</h1><p className="settings-subtitle">Adjust motion and readability.</p><div className="settings-section settings-options"><label><input type="checkbox" /> Reduce motion</label><label><input type="checkbox" defaultChecked /> Use larger text</label><label><input type="checkbox" /> High contrast</label></div></>}
              {settingsTab === "keybinds" && <><h1>Keybinds</h1><p className="settings-subtitle">Shortcuts for common Hypecord actions.</p><div className="settings-shortcuts"><div><span>Mute microphone</span><kbd>Ctrl + Shift + M</kbd></div><div><span>Deafen</span><kbd>Ctrl + Shift + D</kbd></div><div><span>Open settings</span><kbd>Ctrl + ,</kbd></div></div></>}
              {settingsTab === "language" && <><h1>Language & Time</h1><p className="settings-subtitle">Choose how dates and text are displayed.</p><div className="settings-section"><label>LANGUAGE<select defaultValue="en"><option value="en">English (US)</option><option value="es">Español</option><option value="fr">Français</option></select></label><label>TIME FORMAT<select defaultValue="12"><option value="12">12-hour</option><option value="24">24-hour</option></select></label></div></>}
              {settingsTab === "connections" && <><h1>Connections</h1><p className="settings-subtitle">Connect services to Hypecord.</p><div className="settings-connection-card"><div><strong>Spotify</strong><span>{spotifyUser ? `Connected as ${spotifyUser.display_name || spotifyUser.id}` : "Not connected"}</span></div><button className="add-friend-button" onClick={() => window.location.href = spotifyAuth.getAuthUrl()}>{spotifyUser ? "Reconnect" : "Connect"}</button></div></>}
              {settingsTab === "premium" && <><h1>Hypecord Premium</h1><p className="settings-subtitle">Upgrade your calls without changing how everyone else uses Hypecord.</p><div className="premium-card"><div className="premium-price"><span>$2</span><small>/ month</small></div><h2>1080p · 60 FPS streaming</h2><p>Premium unlocks 1080p at 60 FPS screen sharing. Standard Hypecord streaming stays at 720p at 30 FPS.</p><ul><li>1080p screen sharing</li><li>60 FPS streaming</li></ul><button className="add-friend-button large" onClick={() => { const url = import.meta.env.VITE_HYPECORD_PREMIUM_CHECKOUT_URL; if (url) window.location.href = url; else setPremiumMessage("Checkout is ready to connect. Add VITE_HYPECORD_PREMIUM_CHECKOUT_URL to your environment to enable the payment link."); }}>Continue to Checkout · $2/mo</button>{premiumMessage && <div className="settings-message">{premiumMessage}</div>}</div></>}
              {settingsTab === "updates" && <><h1>Updates</h1><p className="settings-subtitle">Keep Hypecord up to date automatically.</p><div className="settings-section update-settings-card"><div className="update-version-row"><div><strong>Hypecord</strong><span>Installed version: {appVersion}</span></div><span className="update-status-pill">{updateStatus.status === "up-to-date" ? "Up to date" : updateStatus.status === "checking" ? "Checking…" : updateStatus.status === "downloading" ? `Downloading ${updateStatus.percent || 0}%` : updateStatus.status === "available" ? `Update ${updateStatus.version || "available"}` : updateStatus.status === "downloaded" ? `Update ${updateStatus.version || "ready"} ready` : "Automatic updates enabled"}</span></div>{updateStatus.status === "downloaded" ? <button className="add-friend-button" onClick={() => window.hypecordUpdater?.installUpdate()}>Restart & Install Update</button> : <button className="secondary-button" onClick={() => window.hypecordUpdater?.checkForUpdates()} disabled={updateStatus.status === "checking" || updateStatus.status === "downloading"}>Check for Updates</button>}<p className="device-note">Beta builds are checked automatically in the background. When an update finishes downloading, Hypecord can restart and install it for you.</p></div></>}
              {settingsMessage && <div className="settings-message">{settingsMessage}</div>}
            </main>
          </div>
        </div>
      )}

      {updateStatus.status === "downloaded" && (
        <div className="update-toast"><div><strong>Hypecord update ready</strong><span>Version {updateStatus.version || "new"} has finished downloading.</span></div><button className="add-friend-button" onClick={() => window.hypecordUpdater?.installUpdate()}>Restart</button></div>
      )}

      {createServerOpen && (
        <div className="modal-backdrop" onClick={() => setCreateServerOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setCreateServerOpen(false)}>×</button><h2>Create a Server</h2><p>Start your own Hypecord community.</p><label>SERVER NAME<input autoFocus value={serverDraftName} onChange={e => setServerDraftName(e.target.value)} placeholder="My Hypecord Server" /></label><p className="server-create-note">Server pictures can be added from Server Settings after creation.</p><div className="modal-actions"><button className="secondary-button" onClick={() => setCreateServerOpen(false)}>Cancel</button><button className="add-friend-button" onClick={createServer}>Create Server</button></div></div>
        </div>
      )}

      {serverSettingsOpen && currentServer && (
        <div className="modal-backdrop" onClick={() => setServerSettingsOpen(false)}>
          <div className="modal-card server-settings-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setServerSettingsOpen(false)}>×</button><h2>{currentServer.name} Settings</h2><p>Only the owner or members granted Manage Server can change these settings.</p>
            {canManageServer(currentServer) ? <><label>SERVER NAME<input value={currentServer.name} onChange={e => updateServer(s => ({ ...s, name: e.target.value }))} /></label><div className="server-avatar-settings"><div className="server-avatar-preview">{currentServer.avatar ? <img src={currentServer.avatar} alt="" /> : <img src={hypecordLogo} alt="" />}</div><label className="upload-button">Change Server Picture<input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => updateServer(s => ({ ...s, avatar: reader.result })); reader.readAsDataURL(file); }} /></label></div><div className="server-members"><h3>Member permissions</h3><div className="permission-add"><input value={serverMemberName} onChange={e => setServerMemberName(e.target.value)} placeholder="Username to grant access" /><button onClick={async () => { const { data } = await supabase.from("user_stats").select("user_id,username").ilike("username", serverMemberName).limit(1); const user = data?.[0]; if (!user) { alert("User not found."); return; } const { error } = await supabase.from("hypecord_server_members").upsert({ server_id: currentServer.id, user_id: user.user_id, can_manage: serverManagePermission }, { onConflict: "server_id,user_id" }); if (error) { alert(error.message); return; } setServerMemberName(""); await refreshServers(currentServer.id); }}>Add Member</button></div><label className="permission-check"><input type="checkbox" checked={serverManagePermission} onChange={e => setServerManagePermission(e.target.checked)} /> Give this member Manage Server permission</label>{(currentServer.members || []).map(member => <div className="member-permission-row" key={member.user_id}><span>{member.username}{member.user_id === currentServer.ownerId ? " (Owner)" : ""}</span><b>{member.user_id === currentServer.ownerId || member.canManage ? "Can Manage" : "Member"}</b></div>)}</div><div className="modal-actions"><button className="add-friend-button" onClick={() => setServerSettingsOpen(false)}>Done</button></div></> : <p>You do not have permission to change this server.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
