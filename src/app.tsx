import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './app.css'
import { removeTrackFromPlaylist } from "./api";
import { getTrackUriToPlaylistData, updatePlaylistData, updateLikedTracks } from "./playlist";

let oldMainElement = null;
let mainElement = null;
let mainElementObserver = null;
let tracklists = [];
let oldTracklists = [];
let trackUriToPlaylistData = {};
let playlistUpdated = false;
let showAllPlaylists = false;
let highlightTrack = null;
let highlightTrackPath = null;
let maxExistingLabelCount = 0;
let maxLabelCount = 1;
let rowHeight = '56px';
let mainView = null;
let updatePromise = Promise.resolve();

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

function calculateMaxLabelCount() {
    if (!mainView) return;

    let newMaxLabelCount = maxLabelCount;
    let space = rowHeight == '56px' ? 44 : 32;
    let maxPossibleLabelCount = 20;
    const minViewSize = 516;
    const contentRect = mainView.getBoundingClientRect();

    let min = 0;
    let max = minViewSize;
    if (min <= contentRect.width && contentRect.width <= max) {
        newMaxLabelCount = 1;
    }

    for (let i = 1; i < maxPossibleLabelCount - 1; i++) {
        min = minViewSize + 1 + space * (i - 1);
        max = minViewSize + 1 + space * i;
        if (min <= contentRect.width && contentRect.width <= max) {
            newMaxLabelCount = i + 1;
        }
    }

    min = minViewSize + 1 + space * (maxPossibleLabelCount - 2);
    if (min <= contentRect.width) {
        newMaxLabelCount = maxPossibleLabelCount;
    }


    if (newMaxLabelCount !== maxLabelCount) {
        maxLabelCount = newMaxLabelCount;
        document.documentElement.style.setProperty('--spicetify-playlist-labels-max-label-count', `${maxLabelCount}`);
        playlistUpdated = true;
        updateTracklist();
    }
}

function updateTracklist() {
    oldTracklists = tracklists;
    tracklists = Array.from(document.querySelectorAll(".main-trackList-indexable"));

    if (oldTracklists.length !== tracklists.length || !oldTracklists.every((value, index) => value === tracklists[index])) {
        maxExistingLabelCount = 0;
    }

    for (const tracklist of tracklists) {
        const tracks = tracklist.getElementsByClassName("main-trackList-trackListRow");
        for (const track of tracks) {
            const trackStyle = getComputedStyle(track);
            const trackRowHeight = trackStyle.getPropertyValue('--row-height');
            if (trackRowHeight != rowHeight) {
                rowHeight = trackRowHeight;
                document.documentElement.style.setProperty('--spicetify-playlist-labels-size', `calc(${rowHeight} * 0.5)`);
                calculateMaxLabelCount();
                playlistUpdated = true;
            }

            const trackUri = getTracklistTrackUri(track);
            if (highlightTrack === trackUri && Spicetify.Platform.History.location.pathname === highlightTrackPath) {
                track.click();
                highlightTrack = null;
            }

            let filteredPlaylistData = (trackUriToPlaylistData[trackUri] ?? []).filter((playlistData) => {
                if (!showAllPlaylists && !playlistData.isOwnPlaylist) return false;

                if (!playlistData.isLikedTracks) {
                    const playlistId = playlistUriToPlaylistId(playlistData.uri);
                    if (Spicetify.Platform.History.location.pathname === `/playlist/${playlistId}`) return false;
                } else if (Spicetify.Platform.History.location.pathname === '/collection/tracks') {
                    return false;
                }

                return true;
            });

            if (filteredPlaylistData.length > maxExistingLabelCount) {
                maxExistingLabelCount = filteredPlaylistData.length;
                document.documentElement.style.setProperty('--spicetify-playlist-labels-label-count', `${maxExistingLabelCount}`);
            }

            let labelContainer = track.querySelector(".spicetify-playlist-labels");

            if (playlistUpdated) {
                if (labelContainer) {
                    labelContainer.remove();
                    labelContainer = null;
                }
            }

            if (!labelContainer) {
                // Add column for labels
                let lastColumn = track.querySelector(".main-trackList-rowSectionEnd");
                labelContainer = document.createElement("div");
                labelContainer.classList.add("spicetify-playlist-labels");

                let containerClassName = 'spicetify-playlist-labels-labels-container';

                if (filteredPlaylistData.length > maxLabelCount) {
                    containerClassName += ' spicetify-playlist-labels-overflow';
                }

                filteredPlaylistData = filteredPlaylistData.slice(0, maxLabelCount)

                ReactDOM.render(
                    <div className={containerClassName}>
                        {
                            filteredPlaylistData.map((playlistData) => {
                                if (!showAllPlaylists && !playlistData.isOwnPlaylist) return null;

                                if (!playlistData.isLikedTracks) {
                                    const playlistId = playlistUriToPlaylistId(playlistData.uri);
                                    if (Spicetify.Platform.History.location.pathname === `/playlist/${playlistId}`) return null;
                                } else if (Spicetify.Platform.History.location.pathname === '/collection/tracks') {
                                    return null;
                                }

                                return (
                                    <Spicetify.ReactComponent.TooltipWrapper
                                        label={playlistData.name}
                                        placement="top"
                                    >
                                        <div>
                                            <Spicetify.ReactComponent.RightClickMenu placement="bottom-end" menu={ playlistData.isLikedTracks ? null :
                                                <Spicetify.ReactComponent.Menu>
                                                    <Spicetify.ReactComponent.MenuItem leadingIcon={
                                                        <Spicetify.ReactComponent.IconComponent
                                                            dangerouslySetInnerHTML={{ __html: '<path d="M5.25 3v-.917C5.25.933 6.183 0 7.333 0h1.334c1.15 0 2.083.933 2.083 2.083V3h4.75v1.5h-.972l-1.257 9.544A2.25 2.25 0 0 1 11.041 16H4.96a2.25 2.25 0 0 1-2.23-1.956L1.472 4.5H.5V3h4.75zm1.5-.917V3h2.5v-.917a.583.583 0 0 0-.583-.583H7.333a.583.583 0 0 0-.583.583zM2.986 4.5l1.23 9.348a.75.75 0 0 0 .744.652h6.08a.75.75 0 0 0 .744-.652L13.015 4.5H2.985z"></path>' }}
                                                            iconSize={16}
                                                            style={{ color: "var(--text-subdued)" }}
                                                        />
                                                    } onClick={
                                                        (e: Event) => {
                                                            e.stopPropagation();
                                                            removeTrackFromPlaylist(playlistData.uri, trackUri);
                                                            trackUriToPlaylistData[trackUri] = trackUriToPlaylistData[trackUri].filter((otherPlaylistData) => otherPlaylistData.uri !== playlistData.uri);
                                                            playlistUpdated = true;
                                                            updateTracklist();
                                                        }
                                                    }>Remove from {playlistData.name}</Spicetify.ReactComponent.MenuItem>
                                                </Spicetify.ReactComponent.Menu>
                                            }>
                                                <div className="spicetify-playlist-labels-label-container" style={{
                                                    cursor: 'pointer',
                                                }} onClick={(e: Event) => {
                                                    e.stopPropagation();
                                                    const path = playlistData.isLikedTracks ? '/collection/tracks' : Spicetify.URI.fromString(playlistData.uri)?.toURLPath(true);
                                                    highlightTrack = trackUri;
                                                    highlightTrackPath = path;
                                                    if (path) Spicetify.Platform.History.push({
                                                        pathname: path,
                                                        search: `?uid=${playlistData.trackUid}`
                                                    });
                                                }}>
                                                    <img src={playlistData.image} />
                                                </div>
                                            </Spicetify.ReactComponent.RightClickMenu>
                                        </div>
                                    </Spicetify.ReactComponent.TooltipWrapper>
                                );
                            })
                        }
                    </div>
                    , labelContainer);

                lastColumn.insertBefore(labelContainer, lastColumn.firstChild);
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

    mainView = document.querySelector('.Root__main-view');

    showAllPlaylists = await JSON.parse(localStorage.getItem('spicetify-playlist-labels:show-all') || 'false');

    const getDataAndUpdateTracklist = (promise) => {
        promise.then((data) => {
            trackUriToPlaylistData = data;
            playlistUpdated = true;
            updateTracklist();
        });
    }

    await Spicetify.Platform.LibraryAPI.getEvents().addListener('update', (event) => {
        updatePromise = updatePromise.then(() => { return updateLikedTracks() });
        getDataAndUpdateTracklist(updatePromise);
    });

    await Spicetify.Platform.PlaylistAPI.getEvents().addListener('operation_complete', (event) => {
        updatePromise = updatePromise.then(() => { return updatePlaylistData(event.data.uri) });
        getDataAndUpdateTracklist(updatePromise);
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

    const resizeObserver = new ResizeObserver(entries => {
        calculateMaxLabelCount();
    });

    resizeObserver.observe(mainView);
}

export default main;
