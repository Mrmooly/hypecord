// Spotify API Configuration
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "YOUR_SPOTIFY_CLIENT_ID";
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || window.location.origin + "/";
const SCOPES = [
  "streaming",
  "user-read-private",
  "user-read-email",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-library-read",
  "user-top-read",
  "playlist-read-private"
];

export const spotifyAuth = {
  getAuthUrl() {
    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: "token",
      redirect_uri: REDIRECT_URI,
      scope: SCOPES.join(" "),
      show_dialog: true
    });
    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  },

  getTokenFromUrl() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get("access_token");
  },

  saveToken(token) {
    if (token) {
      localStorage.setItem("spotify_token", token);
    }
  },

  getToken() {
    return localStorage.getItem("spotify_token");
  },

  clearToken() {
    localStorage.removeItem("spotify_token");
  }
};

export class SpotifyAPI {
  constructor(token) {
    this.token = token;
    this.baseUrl = "https://api.spotify.com/v1";
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...options.headers
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        spotifyAuth.clearToken();
      }
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return response.json();
  }

  getCurrentUser() {
    return this.request("/me");
  }

  getTopTracks(limit = 20) {
    return this.request(`/me/top/tracks?limit=${limit}`);
  }

  getTopArtists(limit = 20) {
    return this.request(`/me/top/artists?limit=${limit}`);
  }

  searchTracks(query, limit = 20) {
    return this.request(`/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`);
  }

  getPlaybackState() {
    return this.request("/me/player");
  }

  startPlayback(contextUri, offsetUri) {
    return this.request("/me/player/play", {
      method: "PUT",
      body: JSON.stringify({
        context_uri: contextUri,
        offset: { uri: offsetUri }
      })
    });
  }

  pausePlayback() {
    return this.request("/me/player/pause", {
      method: "PUT"
    });
  }

  nextTrack() {
    return this.request("/me/player/next", {
      method: "POST"
    });
  }

  previousTrack() {
    return this.request("/me/player/previous", {
      method: "POST"
    });
  }

  setVolume(volumePercent) {
    return this.request(`/me/player/volume?volume_percent=${volumePercent}`, {
      method: "PUT"
    });
  }
}
