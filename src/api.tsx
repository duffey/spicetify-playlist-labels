export async function getContents() {
    return await Spicetify.Platform.RootlistAPI.getContents();
}

export async function getPlaylistItems(uri) {
    const result = await Spicetify.Platform.PlaylistAPI.getContents(uri)
    return result.items;
}