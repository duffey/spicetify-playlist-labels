import React from 'react';
import ReactDOM from 'react-dom';
import './app.css'
import {getTrackUriToPlaylistData} from "./playlist";
import {removeTrackFromPlaylist} from "./api";

let originalTracklistHeaderCss = null;
let originalTracklistTrackCss = null;
let oldMainElement = null;
let mainElement = null;
let mainElementObserver = null;
let tracklists = [];
let oldTracklists = [];
let trackUriToPlaylistData = {};
let playlistUpdated = false;
let Chip = null;

function playlistUriToPlaylistId(uri) {
    return uri.match(/spotify:playlist:(.*)/)[1];
}

function getTracklistTrackUri(tracklistElement) {
    let values = Object.values(tracklistElement);
    if (!values) return null;
    const searchFrom = values[0]?.pendingProps?.children[0]?.props?.children;
    return (
        searchFrom?.props?.uri ||
        searchFrom?.props?.children?.props?.uri ||
        searchFrom?.props?.children?.props?.children?.props?.uri ||
        searchFrom[0]?.props?.uri
    );
}

function updateTracklist() {
    oldTracklists = tracklists;
    tracklists = Array.from(document.querySelectorAll(".main-trackList-indexable"));
    let tracklistsChanged = tracklists.length !== oldTracklists.length;
    for (let i = 0; i < tracklists.length; i++) if (!tracklists[i].isEqualNode(oldTracklists[i])) tracklistsChanged = true;
    if (tracklistsChanged) {
        originalTracklistHeaderCss = null;
        originalTracklistTrackCss = null;
    }

    const tracklistColumnCss = [
        null,
        null,
        null,
        null,
        "[index] 16px [first] 4fr [var1] 1fr [var2] 2fr [last] minmax(120px,1fr)",
        "[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] 4fr [last] minmax(120px,1fr)",
        "[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] minmax(120px,2fr) [var3] 2fr [last] minmax(120px,1fr)",
    ];

    let newTracklistHeaderCss = null;
    const tracklistHeaders = document.querySelectorAll(".main-trackList-trackListHeaderRow");
    // No tracklist header on Artist page
    tracklistHeaders.forEach((tracklistHeader) => {
        let lastColumn = tracklistHeader.querySelector(".main-trackList-rowSectionEnd");
        let colIndexInt = parseInt(lastColumn.getAttribute("aria-colindex"));

        if (!originalTracklistHeaderCss) originalTracklistHeaderCss = getComputedStyle(tracklistHeader).gridTemplateColumns;
        if (originalTracklistHeaderCss && tracklistColumnCss[colIndexInt]) {
            tracklistHeader.style["grid-template-columns"] = tracklistColumnCss[colIndexInt];
            newTracklistHeaderCss = tracklistColumnCss[colIndexInt];
        }
    });

    for (const tracklist of tracklists) {
        const tracks = tracklist.getElementsByClassName("main-trackList-trackListRow");
        for (const track of tracks) {
            const trackUri = getTracklistTrackUri(track);

            let labelColumn = track.querySelector(".spicetify-playlist-labels");
            if (playlistUpdated) {
                if (labelColumn) {
                    labelColumn.remove();
                    labelColumn = null;
                }
            }
            if (!labelColumn) {
                // Add column for labels
                let lastColumn = track.querySelector(".main-trackList-rowSectionEnd");
                let colIndexInt = parseInt(lastColumn.getAttribute("aria-colindex"));
                lastColumn.setAttribute("aria-colindex", (colIndexInt + 1).toString());
                labelColumn = document.createElement("div");

                const iconData = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.151 17.943l-4.143-4.102-4.117 4.159-1.833-1.833 4.104-4.157-4.162-4.119 1.833-1.833 4.155 4.102 4.106-4.16 1.849 1.849-4.1 4.141 4.157 4.104-1.849 1.849z" /></svg>'
                const RemoveIcon = Spicetify.React.memo((props: { trackUri, playlistData }) =>
                    <Spicetify.ReactComponent.IconComponent semanticColor='textSubdued'
                                                            dangerouslySetInnerHTML={{__html: iconData}}
                                                            iconSize={12}
                                                            viewBox='0 0 24 24'
                                                            className="custom-svg"
                                                            onClick={(e: Event) => {
                                                                e.stopPropagation();
                                                                removeTrackFromPlaylist(props.playlistData.uri, props.trackUri)
                                                                trackUriToPlaylistData[props.trackUri] = trackUriToPlaylistData[props.trackUri].filter((playlistData) => playlistData.name !== props.playlistData.name);
                                                                playlistUpdated = true;
                                                                updateTracklist();
                                                            }}
                    />
                );
                ReactDOM.render(
                    <div style={{
                        lineHeight: '20px',
                    }}>
                        {
                            trackUriToPlaylistData[trackUri]?.map((playlistData) => {
                                const playlistId = playlistUriToPlaylistId(playlistData.uri);
                                if (Spicetify.Platform.History.location.pathname === `/playlist/${playlistId}`) return null;
                                return (
                                    <Chip className="encore-dark-theme spicetify-playlist-labels-label" style={playlistData.color ? {
                                        backgroundColor: playlistData.color,
                                    } : {}}
                                                 isUsingKeyboard={false} onClick={(e: Event) => {
                                        e.stopPropagation()
                                        const path = Spicetify.URI.fromString(playlistData.uri)?.toURLPath(true);
                                        if (path) Spicetify.Platform.History.push({
                                            pathname: path,
                                            search: `?highlight=${trackUri}`
                                        });
                                    }} size={true} iconTrailing={playlistData.canEdit ? () => (
                                        <RemoveIcon trackUri={trackUri} playlistData={playlistData}/>
                                    ) : null}>{playlistData.name}</Chip>
                                );
                            })
                        }
                    </div>
                    , labelColumn);

                labelColumn.setAttribute("aria-colindex", colIndexInt.toString());
                labelColumn.role = "gridcell";
                labelColumn.style.display = "flex";
                labelColumn.classList.add("main-trackList-rowSectionVariable");
                labelColumn.classList.add("spicetify-playlist-labels");
                track.insertBefore(labelColumn, lastColumn);

                if (!originalTracklistTrackCss) originalTracklistTrackCss = getComputedStyle(track).gridTemplateColumns;
                if (tracklistColumnCss[colIndexInt])
                    track.style["grid-template-columns"] = newTracklistHeaderCss ? newTracklistHeaderCss : tracklistColumnCss[colIndexInt];

            }
        }
        playlistUpdated = false;
    }
}

async function observerCallback() {
    oldMainElement = mainElement;
    mainElement = document.querySelector("main");
    if (mainElement && !mainElement.isEqualNode(oldMainElement)) {
        if (oldMainElement) {
            mainElementObserver.disconnect();
        }
        updateTracklist();
        mainElementObserver.observe(mainElement, {
            childList: true,
            subtree: true,
        });
    }
}

async function main() {
    while (!Spicetify?.showNotification) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Force all webpack modules to load
	const require = webpackChunkopen.push([[Symbol()], {}, re => re]);
	const cache = Object.keys(require.m).map(id => require(id));
	const modules = cache
		.filter(module => typeof module === "object")
		.map(module => {
			try {
				return Object.values(module);
			} catch {}
		})
		.flat();
    Chip = modules.find(m => m?.render?.toString().includes("invertedDark")),

    await Spicetify.Platform.RootlistAPI._events._emitter.addListener('update', () => {
        getTrackUriToPlaylistData().then((data) => {
            trackUriToPlaylistData = data;
            playlistUpdated = true;
            updateTracklist();
        });
    });

    trackUriToPlaylistData = await getTrackUriToPlaylistData();

    mainElementObserver = new MutationObserver(() => {
        updateTracklist();
    });

    const observer = new MutationObserver(async () => {
        await observerCallback();
    });
    await observerCallback();
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

export default main;
