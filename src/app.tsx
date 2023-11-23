import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './app.css'
import { getTrackUriToPlaylistData } from "./playlist";
import { removeTrackFromPlaylist } from "./api";

let originalTracklistHeaderCss = null;
let originalTracklistTrackCss = null;
let oldMainElement = null;
let mainElement = null;
let mainElementObserver = null;
let tracklists = [];
let oldTracklists = [];
let trackUriToPlaylistData = {};
let playlistUpdated = false;
let highlightTrack = null;
let highlightTrackPath = null;
let showAllPlaylists = false;

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
            if (highlightTrack === trackUri && Spicetify.Platform.History.location.pathname === highlightTrackPath) {
                track.click();
                highlightTrack = null;
            }

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
                const RemoveIcon = Spicetify.React.memo(() =>
                    <Spicetify.ReactComponent.IconComponent semanticColor='textBase'
                        dangerouslySetInnerHTML={{ __html: iconData }}
                        width="10px"
                        height="10px"
                        viewBox='0 0 24 24'
                    />
                );

                const chipStyle = (playlistData) => {
                    if (Spicetify.Config.color_scheme !== '' || !playlistData.color) {
                        return {
                            margin: 0,
                            backgroundColor: 'var(--background-tinted-base)'
                        };
                    }
                    return {
                        margin: 0,
                        backgroundColor: playlistData.color
                    };
                };

                ReactDOM.render(
                    <div className="spicetify-playlist-labels-container">
                        {
                            trackUriToPlaylistData[trackUri]?.map((playlistData) => {
                                if (!showAllPlaylists && !playlistData.canEdit) return null;

                                const playlistId = playlistUriToPlaylistId(playlistData.uri);
                                if (Spicetify.Platform.History.location.pathname === `/playlist/${playlistId}`) return null;

                                return (
                                    <Spicetify.ReactComponent.Chip className="encore-dark-theme spicetify-playlist-labels-label" style={chipStyle(playlistData)}
                                        isUsingKeyboard={false} onClick={(e: Event) => {
                                            e.stopPropagation()
                                            const path = Spicetify.URI.fromString(playlistData.uri)?.toURLPath(true);
                                            highlightTrack = trackUri;
                                            highlightTrackPath = path;
                                            if (path) Spicetify.Platform.History.push({
                                                pathname: path,
                                                search: `?uid=${playlistData.trackUid}`
                                            });
                                        }} size={true} iconTrailing={playlistData.canEdit ? () => (
                                            <button className="spicetify-playlist-labels-remove-button"
                                                onClick={(e: Event) => {
                                                    e.stopPropagation();
                                                    removeTrackFromPlaylist(playlistData.uri, trackUri)
                                                    trackUriToPlaylistData[trackUri] = trackUriToPlaylistData[trackUri].filter((otherPlaylistData) => otherPlaylistData.name !== playlistData.name);
                                                    playlistUpdated = true;
                                                    updateTracklist();
                                                }}>
                                                <RemoveIcon trackUri={trackUri}
                                                    playlistData={playlistData}
                                                />
                                            </button>
                                        ) : () => (<snan style={{ width: '4px' }}></snan>)}>
                                        <div style={{
                                            padding: '0 2px 0 6px',
                                            maxWidth: '60px',
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                            whiteSpace: 'nowrap',
                                            }}>{playlistData.name}</div>
                                    </Spicetify.ReactComponent.Chip>

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

    await Spicetify.Platform.RootlistAPI._events._emitter.addListener('update', () => {
        getTrackUriToPlaylistData().then((data) => {
            trackUriToPlaylistData = data;
            playlistUpdated = true;
            updateTracklist();
        });
    });

    const extraControls = document.querySelector(".main-nowPlayingBar-extraControls");
    const showAllPlaylistsButtonContainer = document.createElement("span");
    const showAllPlaylistsIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M345 39.1L472.8 168.4c52.4 53 52.4 138.2 0 191.2L360.8 472.9c-9.3 9.4-24.5 9.5-33.9 .2s-9.5-24.5-.2-33.9L438.6 325.9c33.9-34.3 33.9-89.4 0-123.7L310.9 72.9c-9.3-9.4-9.2-24.6 .2-33.9s24.6-9.2 33.9 .2zM0 229.5V80C0 53.5 21.5 32 48 32H197.5c17 0 33.3 6.7 45.3 18.7l168 168c25 25 25 65.5 0 90.5L277.3 442.7c-25 25-65.5 25-90.5 0l-168-168C6.7 262.7 0 246.5 0 229.5zM144 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>';
    const ShowAllPlaylistsButton = React.memo(() => {
        const [isClicked, setIsClicked] = useState(false);
        const initialClasses = 'Button-sc-1dqy6lx-0 Button-small-small-buttonTertiary-iconOnly-isUsingKeyboard-useBrowserDefaultFocusStyle main-genericButton-button';
        const clickedClasses = initialClasses + ' main-genericButton-buttonActive main-genericButton-buttonActiveDot ZMXGDTbwxKJhbmEDZlYy'
        const classes = isClicked ? clickedClasses : initialClasses;

        const handleClick = () => {
            setIsClicked(!isClicked);
            showAllPlaylists = !showAllPlaylists;
            playlistUpdated = true;
            updateTracklist();
        };

        return (
            <Spicetify.ReactComponent.TooltipWrapper
                label="Show All Playlist Labels"
                placement="top"
            >
                <button className={classes} onClick={handleClick}>
                    <Spicetify.ReactComponent.IconComponent
                        dangerouslySetInnerHTML={{ __html: showAllPlaylistsIconSvg }}
                        iconSize={16}
                    />
                </button>
            </Spicetify.ReactComponent.TooltipWrapper>
        );
    });
    ReactDOM.render(<ShowAllPlaylistsButton />, showAllPlaylistsButtonContainer)
    extraControls?.prepend(showAllPlaylistsButtonContainer);

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
