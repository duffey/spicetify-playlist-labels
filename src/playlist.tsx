import {getContents, getPlaylistItems, getPlaylistColor} from "./api";

const cachedPlaylistColors = {};

export async function getTrackUriToPlaylistData() {
    const contents = await getContents();
    const playlists = contents.items.filter((item) => item.type === 'playlist');
    const playlistItems = await Promise.all(playlists.map((playlist) => getPlaylistItems(playlist.uri)));
    const playlistColors = await Promise.all(playlists.map((playlist) => {
        const images = playlist.images;
        if (images.length === 0) return null;
        const imageUri = images[0].url;
        if (cachedPlaylistColors[imageUri]) {
            return cachedPlaylistColors[imageUri];
        }
        return getPlaylistColor(imageUri);
    }));
    playlistColors.forEach((color, index) => {
        if (color)
            cachedPlaylistColors[playlists[index].uri] = color;
    });
    const trackUriToPlaylistData = {};
    playlistItems.forEach((playlistItems, index) => {
        playlistItems.forEach((playlistItem) => {
            const trackUri = playlistItem.uri;
            if (!trackUriToPlaylistData[trackUri]) {
                trackUriToPlaylistData[trackUri] = [];
            }
            if (!trackUriToPlaylistData[trackUri].some(obj => obj.uri === playlists[index].uri)) {
                trackUriToPlaylistData[trackUri].push({
                    name: playlists[index].name,
                    uri: playlists[index].uri,
                    trackUid: playlistItem.uid,
                    color: playlistColors[index],
                    canEdit: playlists[index].canAdd && playlists[index].canRemove
                });
            }
        });
    });
    return trackUriToPlaylistData;
}