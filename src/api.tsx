export async function getContents() {
    return await Spicetify.Platform.RootlistAPI.getContents();
}

export async function getPlaylistItems(uri) {
    const result = await Spicetify.Platform.PlaylistAPI.getContents(uri)
    return result.items;
}

export async function getPlaylistColor(imageUri) {
    const { fetchExtractedColors } = Spicetify.GraphQL.Definitions;
    const data = await Spicetify.GraphQL.Request(
        fetchExtractedColors,
        { uris: [imageUri] },
    );
    return data.data?.extractedColors?.[0];
}

export async function removeTrackFromPlaylist(playlistUri, trackUri) {
    await Spicetify.Platform.PlaylistAPI.remove(playlistUri, [{ uri: trackUri, uid: "" }]);
}
