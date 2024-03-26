import { getContents, getLikedTracks, getPlaylistItems } from "./api";

export function getAllPlaylists(contents) {
    let playlists = [];

    function traverse(item) {
        if (item.type === 'playlist') {
            playlists.push(item);
        } else if (item.type === 'folder' && item.items) {
            item.items.forEach(i => traverse(i));
        }
    }

    traverse(contents);

    return playlists;
}

export async function getTrackUriToPlaylistData() {
    const contents = await getContents();
    const playlists = getAllPlaylists(contents);
    const playlistItems = await Promise.all(playlists.map((playlist) => getPlaylistItems(playlist.uri)));
    const trackUriToPlaylistData = {};
    const likedTracks = await getLikedTracks();

    playlistItems.forEach((playlistItems, index) => {
        playlistItems.forEach((playlistItem) => {
            const trackUri = playlistItem.uri;
            if (!trackUriToPlaylistData[trackUri]) {
                trackUriToPlaylistData[trackUri] = [];
            }
            if (!trackUriToPlaylistData[trackUri].some(obj => obj.uri === playlists[index].uri)) {
                trackUriToPlaylistData[trackUri].push({
                    uri: playlists[index].uri,
                    name: playlists[index].name,
                    trackUid: playlistItem.uid,
                    image: playlists[index].images[0]?.url || '',
                    isOwnPlaylist: playlists[index].isOwnedBySelf,
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

    return trackUriToPlaylistData;
}