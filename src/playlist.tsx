import { getContents, getLikedTracks, getPlaylistItems } from "./api";

export function getAllPlaylists(contents) {
    let playlists = [];
    let ratedPlaylists = [];

    function traverse(item, isRated) {
        if (item.type === 'playlist') {
            if (isRated)
                ratedPlaylists.push(item);
            else
                playlists.push(item);
        } else if (item.type === 'folder' && item.items) {
            item.items.forEach(i => traverse(i, item.name == 'Rated'));
        }
    }

    traverse(contents, false);

    return [playlists, ratedPlaylists];
}

export async function getTrackUriToPlaylistData() {
    const contents = await getContents();
    const [playlists, ratedPlaylists] = getAllPlaylists(contents);
    const allPlaylistItems = await Promise.all([...playlists, ...ratedPlaylists].map((playlist) => getPlaylistItems(playlist.uri)));
    const playlistItems = allPlaylistItems.slice(0, playlists.length);
    const ratedPlaylistItems = allPlaylistItems.slice(playlists.length)
    const trackUriToPlaylistData = {};
    const likedTracks = await getLikedTracks();

    function addPlaylists(playlists, playlistItems) {
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
    }

    addPlaylists(playlists, playlistItems);

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

    addPlaylists(ratedPlaylists, ratedPlaylistItems);

    return trackUriToPlaylistData;
}