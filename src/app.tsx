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

                const iconData = '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>';
                const RemoveIcon = Spicetify.React.memo(() =>
                    <Spicetify.ReactComponent.IconComponent semanticColor='textBase'
                        dangerouslySetInnerHTML={{ __html: iconData }}
                        width="14px"
                        height="14px"
                        viewBox='0 0 14 14'
                    />
                );

                ReactDOM.render(
                    <div className="spicetify-playlist-labels-labels-container">
                        {
                            trackUriToPlaylistData[trackUri]?.map((playlistData) => {
                                if (!showAllPlaylists && !playlistData.canEdit) return null;

                                const playlistId = playlistUriToPlaylistId(playlistData.uri);
                                if (Spicetify.Platform.History.location.pathname === `/playlist/${playlistId}`) return null;

                                return (
                                    <Spicetify.ReactComponent.TooltipWrapper
                                        label={playlistData.name}
                                        placement="top"
                                    >
                                        <div className="spicetify-playlist-labels-label-container">
                                            <img width="40px" style={{
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }} src={playlistData.image} onClick={(e: Event) => {
                                                    e.stopPropagation()
                                                    const path = Spicetify.URI.fromString(playlistData.uri)?.toURLPath(true);
                                                    highlightTrack = trackUri;
                                                    highlightTrackPath = path;
                                                    if (path) Spicetify.Platform.History.push({
                                                        pathname: path,
                                                        search: `?uid=${playlistData.trackUid}`
                                                    });
                                            }}/>
                                            { playlistData.canEdit ?
                                                <Spicetify.ReactComponent.TooltipWrapper
                                                    label={`Remove from ${playlistData.name}`}
                                                    placement="top"
                                                >
                                                    <button onClick={(e: Event) => {
                                                        e.stopPropagation();
                                                        removeTrackFromPlaylist(playlistData.uri, trackUri)
                                                        trackUriToPlaylistData[trackUri] = trackUriToPlaylistData[trackUri].filter((otherPlaylistData) => otherPlaylistData.name !== playlistData.name);
                                                        playlistUpdated = true;
                                                        updateTracklist();
                                                    }}>
                                                        <RemoveIcon/>
                                                    </button>
                                                </Spicetify.ReactComponent.TooltipWrapper>
                                            : null}
                                        </div>
                                    </Spicetify.ReactComponent.TooltipWrapper>
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
                label={ isClicked ? "Show Editable Playlist Labels" : "Show All Playlist Labels" }
                placement="top"
            >
                <button className={classes} onClick={handleClick}>
                    <Spicetify.ReactComponent.IconComponent
                        dangerouslySetInnerHTML={{ __html: Spicetify.SVGIcons["spotify"] }}
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
