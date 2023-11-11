import {getContents, getPlaylistItems, getPlaylistColor} from "./api";

export async function getTrackUriToPlaylistData() {
    const contents = await getContents();
    const playlists = contents.items.filter((item) => item.type === 'playlist');
    const playlistItems = await Promise.all(playlists.map((playlist) => getPlaylistItems(playlist.uri)));
    const playlistColors = await Promise.all(playlists.map((playlist) => getPlaylistColor(playlist.uri)));
    const trackUritoPlaylistData = {};
    playlistItems.forEach((playlistItems, index) => {
        playlistItems.forEach((playlistItem) => {
            if (!trackUritoPlaylistData[playlistItem.link]) {
                trackUritoPlaylistData[playlistItem.link] = [];
            }
            trackUritoPlaylistData[playlistItem.link].push({
                name: playlists[index].name,
                uri: playlists[index].uri,
                color: playlistColors[index],
                canEdit: playlists[index].canAdd && playlists[index].canRemove
            });
        });
    });
    return trackUritoPlaylistData;
}