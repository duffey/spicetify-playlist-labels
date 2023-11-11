import {getContents, getPlaylistItems, getPlaylistColor} from "./api";

const cachedPlaylistColors = {};

export async function getTrackUriToPlaylistData() {
    const contents = await getContents();
    const playlists = contents.items.filter((item) => item.type === 'playlist');
    const playlistItems = await Promise.all(playlists.map((playlist) => getPlaylistItems(playlist.uri)));
    const playlistColors = await Promise.all(playlists.map((playlist) => {
        if (cachedPlaylistColors[playlist.uri]) {
            return cachedPlaylistColors[playlist.uri];
        }
        return getPlaylistColor(playlist.uri);
    }));
    playlistColors.forEach((color, index) => {
        if (color)
            cachedPlaylistColors[playlists[index].uri] = color;
    });
    const trackUriToPlaylistData = {};
    playlistItems.forEach((playlistItems, index) => {
        playlistItems.forEach((playlistItem) => {
            const trackUri = playlistItem.link;
            if (!trackUriToPlaylistData[trackUri]) {
                trackUriToPlaylistData[trackUri] = [];
            }
            if (!trackUriToPlaylistData[trackUri].some(obj => obj.uri === playlists[index].uri)) {
                trackUriToPlaylistData[trackUri].push({
                    name: playlists[index].name,
                    uri: playlists[index].uri,
                    color: playlistColors[index],
                    canEdit: playlists[index].canAdd && playlists[index].canRemove
                });
            }
        });
    });
    return trackUriToPlaylistData;
}