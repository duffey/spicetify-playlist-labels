export async function getPlaylistItems(uri) {
    const result = await Spicetify.Platform.PlaylistAPI.getContents(uri)
    return result.items;
}

export async function removeTrackFromPlaylist(playlistUri, trackUri) {
    await Spicetify.Platform.PlaylistAPI.remove(playlistUri, [{ uri: trackUri, uid: "" }]);
}

export async function getLikedTracks() {
    return await Spicetify.Platform.LibraryAPI.getTracks({ limit: Number.MAX_SAFE_INTEGER });
}

export async function getLikedTracksCount() {
    return (await Spicetify.Platform.LibraryAPI.getTracks()).totalLength;
}

export async function getPlaylists() {
    let items = []
    let playlists = null;
    url = "https://api.spotify.com/v1/me/playlists"
    while (url) {
        playlists = await Spicetify.CosmosAsync.get(url);
        items = items.concat(playlists.items);
        url = playlists.next;
    }
    return items;
}