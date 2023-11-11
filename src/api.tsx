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
    const items = data.data.playlistV2.images.items;
    if (items.length === 0) return null;
    return items[0].extractedColors?.colorDark.hex;
}

export async function removeTrackFromPlaylist(playlistUri, trackUri) {
    await Spicetify.Platform.PlaylistAPI.remove(playlistUri, [{ uri: trackUri, uid: "" }]);
}
