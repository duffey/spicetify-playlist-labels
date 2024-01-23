import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './app.css'
import { getTrackUriToPlaylistData } from "./playlist";

let originalTracklistHeaderCss = null;
let originalTracklistTrackCss = null;
let oldMainElement = null;
let mainElement = null;
let mainElementObserver = null;
let tracklists = [];
let oldTracklists = [];
let trackUriToPlaylistData = {};
let contents = null;
let playlistUpdated = false;

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
            tracklistHeader.style.setProperty("grid-template-columns", tracklistColumnCss[colIndexInt], "important");
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

                ReactDOM.render(
                    <div className="spicetify-playlist-labels-labels-container">
                        {
                            trackUriToPlaylistData[trackUri]?.map((playlistData) => {
                                if (!showAllPlaylists && !playlistData.isOwnPlaylist) return null;

                                const playlistId = playlistUriToPlaylistId(playlistData.uri);
                                if (Spicetify.Platform.History.location.pathname === `/playlist/${playlistId}`) return null;

                                return (
                                    <Spicetify.ReactComponent.TooltipWrapper
                                        label={playlistData.name}
                                        placement="top"
                                    >
                                        <div className="spicetify-playlist-labels-label-container">
                                            <img src={playlistData.image} />
                                        </div>
                                    </Spicetify.ReactComponent.TooltipWrapper>
                                );
                            })
                        }
                    </div>
                    , labelColumn);

                labelColumn.setAttribute("aria-colindex", colIndexInt.toString());
                labelColumn.role = "gridcell";
                labelColumn.style.display = "grid";
                labelColumn.classList.add("main-trackList-rowSectionVariable");
                labelColumn.classList.add("spicetify-playlist-labels");
                track.insertBefore(labelColumn, lastColumn);

                if (!originalTracklistTrackCss)
                    originalTracklistTrackCss = getComputedStyle(track).gridTemplateColumns;
                if (tracklistColumnCss[colIndexInt])
                    track.style.setProperty("grid-template-columns", newTracklistHeaderCss ? newTracklistHeaderCss : tracklistColumnCss[colIndexInt], "important");
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

    showAllPlaylists = await JSON.parse(localStorage.getItem('spicetify-playlist-labels:show-all') || 'false');

    await Spicetify.Platform.RootlistAPI._events._emitter.addListener('update', () => {
        getTrackUriToPlaylistData().then((data) => {
            [trackUriToPlaylistData, contents] = data;
            playlistUpdated = true;
            updateTracklist();
        });
    });

    const handleButtonClick = (buttonElement: Spicetify.Playbar.Button) => {
        buttonElement.active = showAllPlaylists = !buttonElement.active;
        localStorage.setItem('spicetify-playlist-labels:show-all', JSON.stringify(showAllPlaylists));
        playlistUpdated = true;
        updateTracklist();
    };

    // create the playbar toggle button
    const iconHTML = `<svg data-encore-id="icon" role="img" viewBox="0 0 16 16" class="Svg-img-icon-small">${Spicetify.SVGIcons["spotify"]}</svg>`;
    const showAllPlaylistsButton = new Spicetify.Playbar.Button("Show All Saved Playlists", iconHTML, handleButtonClick, false, showAllPlaylists);

    [trackUriToPlaylistData, contents] = await getTrackUriToPlaylistData();

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
