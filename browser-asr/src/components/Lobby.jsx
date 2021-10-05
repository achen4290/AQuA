import "../styles/Lobby.css";
import React from "react";
import ReactDOM from "react-dom";
import { useState, useEffect, useReducer } from "react";
import axios from "axios";
import socketIOClient from "socket.io-client";
import PersonIcon from '@material-ui/icons/Person';
import { useRecoilState, useRecoilValue } from "recoil";
import { LOBBY_CODE, SOCKET, PLAY_SCREEN, PLAYERS, SCREEN, AUTHTOKEN, PROFILE, GAMESETTINGS } from "../store";
import Slider from '@material-ui/core/Slider';
import Select from 'react-dropdown-select';
import SwapVertIcon from '@material-ui/icons/SwapVert';
import {
    Tooltip,
} from 'react-tippy';

// player hook in lobby w/ switching functionality
function Player(props) {
    const socket = useRecoilValue(SOCKET);
    const authtoken = useRecoilValue(AUTHTOKEN);

    function switchTeams() {
        if(!props.switchable) {
            return;
        }
        socket.emit("switchteam", {
            auth: authtoken,
            user: props.name,
        });
    }

    if(props.switchable) {
        return (
            <div className={"lobby-players-player-wrapper " + (props.self ? "lobby-players-player-self" : "")}> 
                <div class="lobby-players-player-wrapper-left">
                    {props.name}
                    {props.self && 
                        <Tooltip
                            // options
                            title="This is you"
                            position="top"
                            trigger="mouseenter"
                            unmountHTMLWhenHide="true"
                        >
                            <PersonIcon style={{color: "blue", marginLeft: "0.25rem"}}/>
                        </Tooltip>
                    }
                </div>
                <div class="lobby-players-switchteam-icon-wrapper" onClick={switchTeams}>
                    <SwapVertIcon style={{color: "grey", height: "25px"}}/>
                </div>
            </div>
        )
    } else {
        return (
            <div className={"lobby-players-player-wrapper " + (props.self ? "lobby-players-player-self" : "")}>           
                <div class="lobby-players-player-wrapper-left">
                    {props.name}
                    {props.self && 
                        <Tooltip
                            // options
                            title="This is you"
                            position="top"
                            trigger="mouseenter"
                            unmountHTMLWhenHide="true"
                        >
                            <PersonIcon style={{color: "blue", marginLeft: "0.25rem"}}/>
                        </Tooltip>
                    }
                </div> 
            </div>
        )
    }
    
}


// lobby hook
function Lobby() {
    const profile = useRecoilValue(PROFILE);
    const username = profile['username'];
    const [lobbyCode, setLobbyCode] = useRecoilState(LOBBY_CODE);
    const socket = useRecoilValue(SOCKET);
    const [playScreen, setPlayScreen] = useRecoilState(PLAY_SCREEN);
    const [screen, setScreen] = useRecoilState(SCREEN);
    const authtoken = useRecoilValue(AUTHTOKEN);
    const [lobbyScreen, setLobbyScreen] = useState("inlobby");
    
    // Game settings
    const [gameSettings, setGameSettings] = useReducer(
        (state, newState) => ({...state, ...newState}),
        useRecoilValue(GAMESETTINGS)
    );


    useEffect(() => {
        const lobbyStateListener = (data) => {
            setGameSettings({
                'players': data['players'],
                'teams': data['teams'],
                'max_players': data['max_players'],
                'rounds': data['rounds'],
                'questions_num': data['questions_num'],
                'gap_time': data['gap_time'],
                'post_buzz_time': data['post_buzz_time'],
            });
            setLobbyCode(data['code']);
        };

        const gameStartedListener = (data) => {
            setScreen(6);
            setLobbyScreen("inlobby");
        };

        const closeLobbyListener = (data) => {
            setPlayScreen(0);
        }

        const startGameFailedListener = (data) => {
            setPlayScreen(0);
        }

        const lobbyLoadingListener = (data) => {
            setLobbyScreen("loading");
        }

        socket.on("lobbystate", lobbyStateListener);
        socket.on("gamestarted", gameStartedListener);
        socket.on("closelobby", closeLobbyListener);
        socket.on("startgamefailed", startGameFailedListener);
        socket.on("lobbyloading", lobbyLoadingListener);


        return function cleanSockets() {
            socket.off("lobbystate", lobbyStateListener);
            socket.off("gamestarted", gameStartedListener);
            socket.off("closelobby", closeLobbyListener);
            socket.off("startgamefailed", startGameFailedListener);
            socket.off("lobbyloading", lobbyLoadingListener);
        }
    });
    

    function leave() {
        socket.emit("leavelobby", {
            auth: authtoken
        });
        setPlayScreen(0);
    }

    function start() {
        socket.emit("startgame", {
            auth: authtoken
        });
        socket.emit("lobbyloading", {
            auth: authtoken
        })
    }

    //emits update to settings and the socket will emit settings back
    function updateSettings(updatedSettings) {
        socket.emit("updatesettings", {
            auth: authtoken,
            settings: updatedSettings,
        });
    }

    if(lobbyScreen === "inlobby") {
        return (
            <div class="lobby-wrapper">
                <div class="lobby-gamesettings-wrapper">
                    <div class="lobby-title">
                        Game Settings
                    </div>
                    <div class="lobby-gamesettings-list-wrapper">
                        <div class="lobby-gamesettings-setting-wrapper">
                            <div>Max players</div>
                            <div>{gameSettings['max_players']}</div>
                        </div>
                        <div class="lobby-gamesettings-setting-wrapper">
                            <div>Teams</div>
                            <div class="lobby-gamesettings-hor-flex">
                                <div onClick={() => {
                                    updateSettings({'teams': 0});
                                }} className={"lobby-gamesettings-selector-item " + (gameSettings['teams'] === 0 ? "lobby-gamesettings-selector-selected" : "")}>
                                    None (FFA)
                                </div>
                                <div onClick={() => {
                                    updateSettings({'teams': 2});
                                }} className={"lobby-gamesettings-selector-item " + (gameSettings['teams'] === 2 ? "lobby-gamesettings-selector-selected" : "")}>
                                    2
                                </div>
                            </div>
                        </div>
                        <div class="lobby-gamesettings-setting-wrapper">
                            <div>Rounds</div>
                            <div>{gameSettings['rounds']}</div>
    
                            {/* <div class="lobby-gamesettings-hor-flex">
                                <div class="lobby-gamesettings-slider-wrapper">
                                    <Slider
                                        defaultValue={gameSettings['rounds']}
                                        valueLabelDisplay="auto"
                                        step={2}
                                        marks
                                        min={1}
                                        max={7}
                                        value={gameSettings['rounds']}
                                        onChange={(event, value) => {
                                            updateSettings({'rounds': value});
                                        }}
                                        classes={"lobby-gamesettings-slider-wrapper"}
                                    />
                                </div>
                            </div> */}
                        </div>
                        <div class="lobby-gamesettings-setting-wrapper">
                            <div>Questions per round</div>
                            <div class="lobby-gamesettings-hor-flex">
                                <div class="lobby-gamesettings-slider-wrapper">
                                    <Slider
                                        defaultValue={gameSettings['questions_num']}
                                        valueLabelDisplay="auto"
                                        step={1}
                                        min={1}
                                        max={7}
                                        value={gameSettings['questions_num']}
                                        onChange={(event, value) => {
                                            updateSettings({'questions_num': value});
                                        }}
                                        classes={"lobby-gamesettings-slider-wrapper"}
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="lobby-gamesettings-setting-wrapper">
                            <div>Time between questions (s)</div>
                            <div class="lobby-gamesettings-hor-flex">
                                <div class="lobby-gamesettings-slider-wrapper">
                                    <Slider
                                        defaultValue={gameSettings['gap_time']}
                                        valueLabelDisplay="auto"
                                        step={1}
                                        min={0}
                                        max={30}
                                        value={gameSettings['gap_time']}
                                        onChange={(event, value) => {
                                            updateSettings({'gap_time': value});
                                        }}
                                        classes={"lobby-gamesettings-slider-wrapper"}
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="lobby-gamesettings-setting-wrapper">
                            <div>Buzz time after questions (s)</div>
                            <div class="lobby-gamesettings-hor-flex">
                                <div class="lobby-gamesettings-slider-wrapper">
                                    <Slider
                                        defaultValue={gameSettings['post_buzz_time']}
                                        valueLabelDisplay="auto"
                                        step={1}
                                        min={0}
                                        max={10}
                                        value={gameSettings['post_buzz_time']}
                                        onChange={(event, value) => {
                                            updateSettings({'post_buzz_time': value});
                                        }}
                                        classes={"lobby-gamesettings-slider-wrapper"}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="lobby-gamesettings-buttons-wrapper">
                        <div class="lobby-gamesettings-button" onClick={start}>
                            START
                        </div>
                        <div class="lobby-gamesettings-button" onClick={leave}>
                            QUIT
                        </div>
                    </div>
                </div>
                <div class="lobby-players-wrapper">
                    <div class="lobby-title">
                        <div>
                            Players {typeof gameSettings['players'][0] === 'string' ? gameSettings['players'].length : gameSettings['players'][0].length + gameSettings['players'][1].length}/{gameSettings['max_players']}
                        </div>
                        <div>
                            Lobby: {lobbyCode}
                        </div>
                    </div>
                    {typeof gameSettings['players'][0] === 'string' &&
                        <div class="lobby-players-list-wrapper">
                            {gameSettings['players'].map((uname) =>
                                <Player name={uname} self={uname===username} key={uname} switchable={false}/>
                            )}
                        </div>
                    }
                    {typeof gameSettings['players'][0] === 'object' &&
                        <div class="lobby-players-list-wrapper">
                            <div class="lobby-players-list-team-wrapper">
                                <div class="lobby-players-list-team-title">
                                    Team 1
                                </div>
                                {gameSettings['players'][0].map((uname) =>
                                    <Player name={uname} self={uname===username} key={uname} switchable={true}/>
                                )}
                            </div>
                            <div class="lobby-players-list-team-wrapper">
                                <div class="lobby-players-list-team-title">
                                    Team 2
                                </div>
                                {gameSettings['players'][1].map((uname) =>
                                    <Player name={uname} self={uname===username} key={uname} switchable={true}/>
                                )}
                            </div>
                        </div>
                    }
                    
                </div>
            </div>
        );
    } else {
        return (
            <div class="lobby-loading-wrapper">
                Loading game, please wait...
            </div>
        );
    }
    
}

export default Lobby;