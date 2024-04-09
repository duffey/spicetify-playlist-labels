import { getPlaylists, getLikedTracks, getLikedTracksCount, getPlaylistItems } from "./api";

export function getUriToPlaylists(playlists) {
    uriToPlaylists = {};
    playlists.forEach((playlist) => uriToPlaylists[playlist.uri] = playlist);
    return uriToPlaylists;
}

export async function getTrackUriToPlaylistData(invalidatePlaylistUri = null) {
    const cachedUriToPlaylistItems = JSON.parse(localStorage.getItem('spicetify-playlist-labels:uri-to-playlist-items') || '{}');

    // Find which playlists have been updated based on their snapshot_id
    const cachedUriToPlaylists = JSON.parse(localStorage.getItem('spicetify-playlist-labels:uri-to-playlists') || '{}');
    const playlists = await getPlaylists();
    const uriToPlaylists = getUriToPlaylists(playlists);
    const updatedPlaylistUris = [];
    Object.entries(uriToPlaylists).forEach(([uri, playlist]) => {
        if (!cachedUriToPlaylistItems[uri] || !cachedUriToPlaylists[uri] || playlist.snapshot_id != cachedUriToPlaylists[uri].snapshot_id || uri == invalidatePlaylistUri)
            updatedPlaylistUris.push(uri);
    });

    // Get only playlist items for updated playlists
    const updatedPlaylistItems = await Promise.all(updatedPlaylistUris.map((uri) => getPlaylistItems(uri)));
    const uriToUpdatedPlaylistItems = {}
    updatedPlaylistItems.forEach((playlistItems, index) => {
        const uri = updatedPlaylistUris[index];
        uriToUpdatedPlaylistItems[uri] = playlistItems;
    });

    // Merge the updated playlist items with the cached playlist items
    const uriToPlaylistItems = {};
    playlists.forEach((playlist) => {
        const uri = playlist.uri;
        if (uriToUpdatedPlaylistItems[uri])
            uriToPlaylistItems[uri] = uriToUpdatedPlaylistItems[uri];
        else
            uriToPlaylistItems[uri] = cachedUriToPlaylistItems[uri]
    });

    // Get liked tracks if the number has changed otherwise get them from local storage
    let likedTracks = JSON.parse(localStorage.getItem('spicetify-playlist-labels:liked-tracks') || '{}');
    const cachedLikedTracksCount = JSON.parse(localStorage.getItem('spicetify-playlist-labels:liked-tracks-count') || '0');
    const likedTracksCount = await getLikedTracksCount();
    if (cachedLikedTracksCount != likedTracksCount)
        likedTracks = await getLikedTracks();

    const trackUriToPlaylistData = {};

    Object.entries(uriToPlaylistItems).forEach(([uri, playlistItems]) => {
        playlistItems.forEach((playlistItem) => {
            const trackUri = playlistItem.uri;
            if (!trackUriToPlaylistData[trackUri]) {
                trackUriToPlaylistData[trackUri] = [];
            }
            if (!trackUriToPlaylistData[trackUri].some(obj => obj.uri === uri)) {
                trackUriToPlaylistData[trackUri].push({
                    uri: uri,
                    name: uriToPlaylists[uri].name,
                    trackUid: playlistItem.uid,
                    image: uriToPlaylists[uri].images[0]?.url || '',
                    isOwnPlaylist: Spicetify.Platform.initialUser.uri == uriToPlaylists[uri].owner.uri,
                    isLikedTracks: false
                });
            }
        });
    });

    likedTracks.items.forEach((item) => {
        const trackUri = item.uri;
        if (!trackUriToPlaylistData[trackUri]) {
            trackUriToPlaylistData[trackUri] = [];
        }
        if (!trackUriToPlaylistData[trackUri].some(obj => obj.isLikedTracks)) {
            trackUriToPlaylistData[trackUri].push({
                uri: null,
                name: 'Liked Songs',
                trackUid: item.uid,
                image: 'https://misc.scdn.co/liked-songs/liked-songs-300.png',
                isOwnPlaylist: true,
                isLikedTracks: true
            });
        }
    });

    localStorage.setItem('spicetify-playlist-labels:uri-to-playlists', JSON.stringify(uriToPlaylists));
    localStorage.setItem('spicetify-playlist-labels:uri-to-playlist-items', JSON.stringify(uriToPlaylistItems));
    localStorage.setItem('spicetify-playlist-labels:liked-tracks-count', JSON.stringify(likedTracksCount));
    localStorage.setItem('spicetify-playlist-labels:liked-tracks', JSON.stringify(likedTracks));

    return trackUriToPlaylistData;
}