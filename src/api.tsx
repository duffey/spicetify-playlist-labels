export async function getContents() {
    return await Spicetify.Platform.RootlistAPI.getContents();
}

export async function getPlaylistItems(uri) {
    const result = await Spicetify.CosmosAsync.get(`sp://core-playlist/v1/playlist/${uri}`);
    return result.items;
}

export async function getPlaylistColor(uri) {
    const { fetchExtractedColorForPlaylistEntity } = Spicetify.GraphQL.Definitions;
    const data = await Spicetify.GraphQL.Request(
        fetchExtractedColorForPlaylistEntity,
        { uri: uri },
    );
    return data.data.playlistV2.images.items[0].extractedColors.colorDark.hex;
}

export async function removeTrackFromPlaylist(playlistUri, trackUri) {
    const playlistUriToPlaylistId = (uri) => {
        return uri.match(/spotify:playlist:(.*)/)[1];
    }

    const playlistId = playlistUriToPlaylistId(playlistUri);
    await Spicetify.CosmosAsync.del(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        tracks: [
            {
                uri: trackUri,
            },
        ],
    });
}
