import {getContents, getPlaylistItems, getPlaylistColor} from "./api";

export async function getTrackUriToPlaylistData() {
    const contents = await getContents();
    const ownPlaylists = contents.items.filter((item) => item.isOwnedBySelf);
    const ownPlaylistItems = await Promise.all(ownPlaylists.map((playlist) => getPlaylistItems(playlist.uri)));
    const ownPlaylistColors = await Promise.all(ownPlaylists.map((playlist) => getPlaylistColor(playlist.uri)));
    const trackUritoPlaylistData = {};
    ownPlaylistItems.forEach((playlistItems, index) => {
        playlistItems.forEach((playlistItem) => {
            if (!trackUritoPlaylistData[playlistItem.link]) {
                trackUritoPlaylistData[playlistItem.link] = [];
            }
            trackUritoPlaylistData[playlistItem.link].push({
                name: ownPlaylists[index].name,
                uri: ownPlaylists[index].uri,
                color: ownPlaylistColors[index]
            });
        });
    });
    return trackUritoPlaylistData;
}