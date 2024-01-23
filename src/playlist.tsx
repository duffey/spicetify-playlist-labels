import { getContents, getPlaylistItems } from "./api";

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
                    isOwnPlaylist: playlists[index].isOwnedBySelf
                });
            }
        });
    });
    return [trackUriToPlaylistData, contents];
}