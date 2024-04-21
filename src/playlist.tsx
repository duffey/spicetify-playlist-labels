import { getContents, getLikedTracks, getLikedTracksCount, getPlaylists, getPlaylistItems } from "./api";

function getPlaylistsFromContents(contents) {
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

function getUriToSnapshotId(playlists) {
    return playlists.reduce((acc, playlist) => {
        acc[playlist.uri] = playlist.snapshot_id;
        return acc;
    }, {});
}

async function getPlaylistsExtra() {
    const contents = await getContents();

    const [playlists, ratedPlaylists] = getPlaylistsFromContents(contents);

    const playlistsWithSnapshotId = await getPlaylists();
    const uriToSnapshotId = getUriToSnapshotId(playlistsWithSnapshotId);

    let allPlaylists = [...playlists, ...ratedPlaylists];
    allPlaylists = allPlaylists.map((playlist) => ({
        ...playlist,
        snapshotId: uriToSnapshotId[playlist.uri],
        isRatedPlaylist: ratedPlaylists.some((ratedPlaylist) => ratedPlaylist.uri === playlist.uri)
    }));

    return allPlaylists;
}

async function getDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("spicetify-playlist-labels", 1);

        request.onerror = (event) => {
            reject(event);
        };
        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            db.createObjectStore("playlists", { keyPath: "uri" });
            db.createObjectStore("playlistItems", { keyPath: "uri" });
        };
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
    });
}

async function getCachedPlaylists(db: IDBDatabase): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const playlistObjectStoreRequest = db.transaction("playlists")
            .objectStore("playlists")
            .getAll();
        playlistObjectStoreRequest.onsuccess = (event) => {
            resolve(playlistObjectStoreRequest.result);
        };
        playlistObjectStoreRequest.onerror = (event) => {
            reject(event);
        };
    });
}

async function getCachedPlaylistItems(db: IDBDatabase): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const playlistItemsObjectStoreRequest = db.transaction("playlistItems")
            .objectStore("playlistItems")
            .getAll();
        playlistItemsObjectStoreRequest.onsuccess = (event) => {
            resolve(playlistItemsObjectStoreRequest.result);
        };
        playlistItemsObjectStoreRequest.onerror = (event) => {
            reject(event);
        };
    });
}

async function clearCachedPlaylists(db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
        const playlistObjectStoreRequest = db.transaction("playlists", "readwrite")
            .objectStore("playlists")
            .clear();
        playlistObjectStoreRequest.onsuccess = (event) => {
            resolve();
        };
        playlistObjectStoreRequest.onerror = (event) => {
            reject(event);
        };
    });
}

async function clearCachedPlaylistItems(db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
        const playlistItemsObjectStoreRequest = db.transaction("playlistItems", "readwrite")
            .objectStore("playlistItems")
            .clear();
        playlistItemsObjectStoreRequest.onsuccess = (event) => {
            resolve();
        };
        playlistItemsObjectStoreRequest.onerror = (event) => {
            reject(event);
        };
    });
}

async function cachePlaylists(db: IDBDatabase, playlists: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
        const playlistObjectStore = db.transaction("playlists", "readwrite")
            .objectStore("playlists");

        playlists.forEach((playlist) => {
            playlistObjectStore.put(playlist);
        });

        playlistObjectStore.transaction.oncomplete = (event) => {
            resolve();
        };
        playlistObjectStore.transaction.onerror = (event) => {
            reject(event);
        };
    });
}

async function cachePlaylistItems(db: IDBDatabase, uriToPlaylistItems): Promise<void> {
    return new Promise((resolve, reject) => {
        const playlistItemsObjectStore = db.transaction("playlistItems", "readwrite")
            .objectStore("playlistItems");

        Object.entries(uriToPlaylistItems).forEach(([uri, items]) => {
            playlistItemsObjectStore.put({ uri, items });
        });

        playlistItemsObjectStore.transaction.oncomplete = (event) => {
            resolve();
        };
        playlistItemsObjectStore.transaction.onerror = (event) => {
            reject(event);
        };
    });
}

function addPlaylists(trackUriToPlaylistData, playlists: any[], uriToPlaylistItems: any) {
    playlists.forEach((playlist) => {
        const playlistItems = uriToPlaylistItems[playlist.uri] ?? [];
        playlistItems.forEach((playlistItem) => {
            const trackUri = playlistItem.uri;
            if (!trackUriToPlaylistData[trackUri])
                trackUriToPlaylistData[trackUri] = [];
            if (!trackUriToPlaylistData[trackUri].some(obj => obj.uri === playlist.uri)) {
                trackUriToPlaylistData[trackUri].push({
                    uri: playlist.uri,
                    name: playlist.name,
                    trackUid: playlistItem.uid,
                    image: playlist.images[0]?.url || '',
                    isOwnPlaylist: playlist.isOwnedBySelf,
                    isLikedTracks: false
                });
            }
        });
    });
}

function addLikedTracks(trackUriToPlaylistData, likedTracks) {
    likedTracks.forEach((item) => {
        const trackUri = item.uri;
        if (!trackUriToPlaylistData[trackUri])
            trackUriToPlaylistData[trackUri] = [];
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
}

export async function updatePlaylistData(uri) {
    const db = await getDb();
    let playlists = await getPlaylistsExtra();
    const cachedPlaylistItems = await getCachedPlaylistItems(db);

    const cachedUriToPlaylistItems = [];
    cachedPlaylistItems.forEach((playlistItems) => {
        cachedUriToPlaylistItems[playlistItems.uri] = playlistItems.items;
    });

    const updatedPlaylistItems = await getPlaylistItems(uri);
    cachedUriToPlaylistItems[uri] = updatedPlaylistItems;

    const trackUriToPlaylistData = {};
    playlists = playlists.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));
    const ratedPlaylists = playlists.filter((playlist) => playlist.isRatedPlaylist);
    const nonRatedPlaylists = playlists.filter((playlist) => !playlist.isRatedPlaylist);
    const likedTracks = cachedUriToPlaylistItems['likedTracks'];

    const uriToPlaylistItems = {};
    uriToPlaylistItems[uri] = updatedPlaylistItems;
    await cachePlaylists(db, playlists);
    await cachePlaylistItems(db, uriToPlaylistItems);

    addPlaylists(trackUriToPlaylistData, ratedPlaylists, cachedUriToPlaylistItems);
    addLikedTracks(trackUriToPlaylistData, likedTracks);
    addPlaylists(trackUriToPlaylistData, nonRatedPlaylists, cachedUriToPlaylistItems);

    return trackUriToPlaylistData;
}

export async function updateLikedTracks() {
    const db = await getDb();
    const cachedPlaylists = await getCachedPlaylists(db);
    const cachedPlaylistItems = await getCachedPlaylistItems(db);

    const cachedUriToPlaylistItems = [];
    cachedPlaylistItems.forEach((playlistItems) => {
        cachedUriToPlaylistItems[playlistItems.uri] = playlistItems.items;
    });

    const trackUriToPlaylistData = {};
    const playlists = cachedPlaylists.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));
    const ratedPlaylists = playlists.filter((playlist) => playlist.isRatedPlaylist);
    const nonRatedPlaylists = playlists.filter((playlist) => !playlist.isRatedPlaylist);

    let likedTracks = await getLikedTracks();
    likedTracks = likedTracks.items;

    addPlaylists(trackUriToPlaylistData, ratedPlaylists, cachedUriToPlaylistItems);
    addLikedTracks(trackUriToPlaylistData, likedTracks);
    addPlaylists(trackUriToPlaylistData, nonRatedPlaylists, cachedUriToPlaylistItems);

    const uriToPlaylistItems = {};
    uriToPlaylistItems['likedTracks'] = likedTracks;
    await cachePlaylistItems(db, uriToPlaylistItems);

    localStorage.setItem('spicetify-playlist-labels:liked-tracks-count', `${likedTracks.length}`);

    return trackUriToPlaylistData;
}

export async function getTrackUriToPlaylistData() {
    const db = await getDb();
    const cachedPlaylists = await getCachedPlaylists(db);
    const cachedPlaylistItems = await getCachedPlaylistItems(db);

    let playlists = await getPlaylistsExtra();
    const updatedPlaylists = [];
    playlists.forEach((playlist) => {
        const cachedPlaylist = cachedPlaylists.find((cachedPlaylist) => cachedPlaylist.uri === playlist.uri);
        if (!cachedPlaylist || cachedPlaylist.snapshotId !== playlist.snapshotId) {
            updatedPlaylists.push(playlist);
        }
    });

    const cachedUriToPlaylistItems = [];
    cachedPlaylistItems.forEach((playlistItems) => {
        cachedUriToPlaylistItems[playlistItems.uri] = playlistItems.items;
    });

    const updatedPlaylistItems = await Promise.all(updatedPlaylists.map((playlist) => getPlaylistItems(playlist.uri)));
    const uriToUpdatedPlaylistItems = {}
    updatedPlaylistItems.forEach((playlistItems, index) => {
        const uri = updatedPlaylists[index].uri;
        uriToUpdatedPlaylistItems[uri] = playlistItems;
    });

    const uriToPlaylistItems = {};
    playlists.forEach((playlist) => {
        const uri = playlist.uri;
        if (uriToUpdatedPlaylistItems[uri])
            uriToPlaylistItems[uri] = uriToUpdatedPlaylistItems[uri];
        else
            uriToPlaylistItems[uri] = cachedUriToPlaylistItems[uri]
    });
    uriToPlaylistItems['likedTracks'] = cachedUriToPlaylistItems['likedTracks'];

    const cachedLikedTracksCount = JSON.parse(localStorage.getItem('spicetify-playlist-labels:liked-tracks-count') || '0');
    const likedTracksCount = await getLikedTracksCount();
    let likedTracks = uriToPlaylistItems['likedTracks'];
    if (!likedTracks || cachedLikedTracksCount != likedTracksCount) {
        likedTracks = await getLikedTracks();
        likedTracks = likedTracks.items;
        uriToPlaylistItems['likedTracks'] = likedTracks;
    }

    const trackUriToPlaylistData = {};
    playlists = playlists.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));
    const ratedPlaylists = playlists.filter((playlist) => playlist.isRatedPlaylist);
    const nonRatedPlaylists = playlists.filter((playlist) => !playlist.isRatedPlaylist);

    addPlaylists(trackUriToPlaylistData, ratedPlaylists, uriToPlaylistItems);
    addLikedTracks(trackUriToPlaylistData, likedTracks);
    addPlaylists(trackUriToPlaylistData, nonRatedPlaylists, uriToPlaylistItems);

    await clearCachedPlaylists(db);
    await clearCachedPlaylistItems(db);
    await cachePlaylists(db, playlists);
    await cachePlaylistItems(db, uriToPlaylistItems);
    localStorage.setItem('spicetify-playlist-labels:liked-tracks-count', `${likedTracksCount}`);

    return trackUriToPlaylistData;
}