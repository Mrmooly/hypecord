// Hypecord game detection.
// Packaged desktop builds can use the desktop bridge for silent detection.
// In a browser, the first scan asks the user to choose Steam's steamapps/common
// folder, then remembers that folder permission so future visits can auto-scan it.

const STEAM_GAMES = [
  { id: 730, name: "Counter-Strike 2", folders: ["Counter-Strike Global Offensive", "Counter-Strike 2"], preview: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg" },
  { id: 1245620, name: "Elden Ring", folders: ["ELDEN RING"], preview: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg" },
  { id: 1086940, name: "Baldur's Gate 3", folders: ["Baldurs Gate 3"], preview: "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg" },
  { id: 1174180, name: "Red Dead Redemption 2", folders: ["Red Dead Redemption 2"], preview: "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg" },
  { id: 570, name: "Dota 2", folders: ["dota 2 beta"], preview: "https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg" },
  { id: 292030, name: "The Witcher 3", folders: ["The Witcher 3"], preview: "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg" },
  { id: 271590, name: "Grand Theft Auto V", folders: ["Grand Theft Auto V"], preview: "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg" },
  { id: 1091500, name: "Cyberpunk 2077", folders: ["Cyberpunk 2077"], preview: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg" },
  { id: 440, name: "Team Fortress 2", folders: ["Team Fortress 2"], preview: "https://cdn.cloudflare.steamstatic.com/steam/apps/440/header.jpg" },
  { id: 252490, name: "Rust", folders: ["Rust"], preview: "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg" },
  { id: 1172470, name: "Apex Legends", folders: ["Apex Legends"], preview: "https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg" },
  { id: 1240440, name: "Halo Infinite", folders: ["Halo Infinite"], preview: "https://cdn.cloudflare.steamstatic.com/steam/apps/1240440/header.jpg" },
];

function normalize(value) {
  return value.toLowerCase().replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();
}

async function scanDirectory(directoryHandle) {
  const names = [];
  for await (const [name, handle] of directoryHandle.entries()) {
    if (handle.kind === "directory") names.push(name);
  }

  const normalized = new Set(names.map(normalize));
  return STEAM_GAMES
    .filter(game => game.folders.some(folder => normalized.has(normalize(folder))))
    .map(game => ({ ...game, source: "Steam · Installed" }));
}

function openHandleDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return resolve(null);
    const request = indexedDB.open("hypecord-game-library", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("handles");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getSavedSteamHandle() {
  const db = await openHandleDb();
  if (!db) return null;
  return new Promise(resolve => {
    const request = db.transaction("handles", "readonly").objectStore("handles").get("steam-common");
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => resolve(null);
  });
}

async function saveSteamHandle(handle) {
  const db = await openHandleDb();
  if (!db) return;
  return new Promise(resolve => {
    const request = db.transaction("handles", "readwrite").objectStore("handles").put(handle, "steam-common");
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
  });
}

async function scanSavedSteamFolder() {
  try {
    const handle = await getSavedSteamHandle();
    if (!handle || !handle.queryPermission) return null;
    const permission = await handle.queryPermission({ mode: "read" });
    if (permission !== "granted") return null;
    return await scanDirectory(handle);
  } catch {
    return null;
  }
}

export async function detectInstalledGames(options = {}) {
  if (window.hypecordDesktop?.detectInstalledGames) {
    return window.hypecordDesktop.detectInstalledGames();
  }

  // Auto-detect using a previously approved Steam folder.
  const savedGames = await scanSavedSteamFolder();
  if (savedGames) return savedGames;

  if (!options.requestFolder || !window.showDirectoryPicker) return [];

  try {
    const root = await window.showDirectoryPicker({ mode: "read" });
    await saveSteamHandle(root);
    return await scanDirectory(root);
  } catch {
    return [];
  }
}

export function getGameById(id) {
  return STEAM_GAMES.find(game => game.id === id);
}
