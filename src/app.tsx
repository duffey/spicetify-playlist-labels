import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './app.css'
import { removeTrackFromPlaylist } from "./api";
import { getTrackUriToPlaylistData } from "./playlist";

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
let maxLabelCount = 0;

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

    if (oldTracklists.length !== tracklists.length || !oldTracklists.every((value, index) => value === tracklists[index])) {
        maxLabelCount = 0;
    }

    for (const tracklist of tracklists) {
        const tracks = tracklist.getElementsByClassName("main-trackList-trackListRow");
        for (const track of tracks) {
            const trackUri = getTracklistTrackUri(track);
            if (highlightTrack === trackUri && Spicetify.Platform.History.location.pathname === highlightTrackPath) {
                track.click();
                highlightTrack = null;
            }

            if (trackUriToPlaylistData[trackUri]?.length > maxLabelCount) {
                maxLabelCount = trackUriToPlaylistData[trackUri]?.length;
                document.documentElement.style.setProperty('--spicetify-playlist-labels-label-count', `${maxLabelCount}`);
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

                ReactDOM.render(
                    <div className="spicetify-playlist-labels-labels-container">
                        {
                            trackUriToPlaylistData[trackUri]?.map((playlistData) => {
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

    showAllPlaylists = await JSON.parse(localStorage.getItem('spicetify-playlist-labels:show-all') || 'false');

    const getDataAndUpdateTracklist = () => {
        getTrackUriToPlaylistData().then((data) => {
            trackUriToPlaylistData = data;
            playlistUpdated = true;
            updateTracklist();
        });
    }

    await Spicetify.Platform.RootlistAPI.getEvents().addListener('update', () => {
        getDataAndUpdateTracklist();
    });

    await Spicetify.Platform.LibraryAPI.getEvents().addListener('update', () => {
        getDataAndUpdateTracklist();
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
}

export default main;
