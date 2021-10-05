import "../styles/Shop.css";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useAlert } from 'react-alert';
import CoinIcon from '../assets/coin_transparent.png';
import {
    Tooltip,
} from 'react-tippy';
import 'react-tippy/dist/tippy.css';
import axios from 'axios';
import { useRecoilState, useRecoilValue } from "recoil";
import { TRANSCRIPTS, URLS } from "../store";
import AudioRecorder from './AudioRecorder.jsx';



//ASSETS
import LoopIcon from '@material-ui/icons/Loop';

// displays bounty in coins for a single task
function Taskbounty(props) {
    return (
        <div class="shop-taskbounty-wrapper">
            Bounty: 
            <img class="shop-taskbounty-coin-icon" src={CoinIcon} alt="Coins: "/>
            {props.bounty}
        </div>
    );
}


// coming soon card under the spending section
function SpendComingSoon(props) {
    return (
        <div class="shop-spend-comingsoon-wrapper">
            Coming Soon!
        </div>
    );
}

// hook for displaying transcript options
function TranscriptOption(props) {

    function handleRecord() {
        props.setTranscript(props.transcript);
        props.setAudios(Array.apply(null, Array(props.transcript['tokenizations'].length)).map(function () {}));
        props.setShopScreen("recording");
    }

    return (
        <div class="shop-selectingtranscript-transcript-wrapper">
            <div class="shop-selectingtranscript-transcript-body-wrapper">
                <div class="shop-selectingtranscript-transcript-body">
                    {props.transcript['transcript']}
                </div>
            </div>
            <div class="shop-selectingtranscript-transcript-footer">
                <div class="shop-taskbounty-wrapper">
                    Bounty: 
                    <img class="shop-selectingtranscript-coin-icon" src={CoinIcon} alt="Coins: "/>
                    {props.bounty}
                </div>

                <div onClick={handleRecord} class="shop-selectingtranscript-record-btn">
                    Record &#187;
                </div>
            </div>
        </div>
    );
}

// hook that formats recording into sentence by sentence
function Sentence(props) {
    return (
        <div class="shop-sentence-wrapper">
            <div class="shop-sentence-transcript-wrapper">
                {props.transcript}
            </div>
            <AudioRecorder setAudio={props.setAudio} index={props.index}/>
        </div>
    );
}

// hook for the shop
function Shop() {
    const [shopScreen, setShopScreen] = useState("home");
    const [difficulty, setDifficulty] = useState("easy");
    const [transcripts, setTranscripts] = useRecoilState(TRANSCRIPTS);
    const alert = useAlert()
    const [transcript, setTranscript] = useState({"transcript": ""});
    const [audios, setAudios] = useState([]);
    const urls = useRecoilValue(URLS);

    function setAudio(index, audio) {
        let audiosCopy = [...audios];
        audiosCopy[index] = audio;
        setAudios(audiosCopy);
        console.log(audios);
    }

    function activateShopScreen(diff) {
        setDifficulty(diff);
        setShopScreen("selectingtranscript");
    }

    function rerollTranscripts() {
        setShopScreen("loading");
        let transcriptsArray = [];
        let requestsArray = [];
        for(let i = 0; i < 4; i++) {
            requestsArray.push(axios.get(urls['dataflow'] + '/question/unrec')
                .then(function (response) {
                    transcriptsArray.push(response['data']['results'][0]);
                }));
        }
        axios.all(requestsArray)
            .then(() => {
                setTranscripts(transcriptsArray);
                setShopScreen("selectingtranscript");
            })
            .catch(function (error) {
                alert.error("Rerolling failed");
                setShopScreen("selectingtranscript")
            });
    }

    function submitAudios() {
        let b = true;
        audios.forEach(element => {
            if(element == null && b) {
                alert.error("Recordings Incomplete");
                b = false;
            }
        });

        if(b) submitAudios2();
    }

    async function submitAudios2() {
        setShopScreen("submitting");
        const formdata = new FormData();
        const qb_ids = Array.apply(null, Array(audios.length)).map(function () { return transcript.id; });
        const recTypes = Array.apply(null, Array(audios.length)).map(function () { return "normal"; });
        const sentenceIds = Array.apply(null, Array(audios.length)).map(function (x, i) { return i; });
        const diarMetadatas = Array.apply(null, Array(audios.length)).map(function () { return ""; });
        audios.forEach((element) => {
            formdata.append("audio", element);
        });
        qb_ids.forEach((element) => {
            formdata.append("qb_id", element);
        });
        recTypes.forEach((element) => {
            formdata.append("recType", element);
        });
        if(transcript.hasOwnProperty('sentenceId')) {
            sentenceIds.forEach((element) => {
                formdata.append("sentenceId", element);
            }); 
        }
        diarMetadatas.forEach((element) => {
            formdata.append("diarMetadata", element);
        });
        const config = {
            headers: { 'content-type': 'multipart/form-data' }
        }
        const response = await axios.post(urls['dataflow'] + "/audio", formdata, config)
            .then(response => {
                setShopScreen("home");
                alert.success("Submitted recording");
            })
            .catch(error => {
                setShopScreen("home");
                alert.error("Submission failed");
            });
        
      };

    if(shopScreen === "home") {
        return (
            <div class="shop-content-wrapper">
                <div class="shop-title">Spend</div>
                <div class="shop-title-divider"></div>
                <div class="shop-spend-wrapper">
                    <SpendComingSoon/>
                    <SpendComingSoon/>
                    <SpendComingSoon/>
                    <SpendComingSoon/>
                </div>
                <div class="shop-title">Earn</div>
                <div class="shop-title-divider"></div>
                <div class="shop-earn-wrapper">
                    
                    <div onClick={() => {activateShopScreen("easy")}} class="shop-earn-selector-wrapper shop-earn-selector-hvr-grow shop-earn-selector-easy">
                        <div>
                            <div class="shop-earn-selector-task-title">
                                RECORD
                            </div>
                            <div class="shop-earn-selector-task-description">
                                Record an easy difficulty transcript
                            </div>
                        </div>
                        
                        <Taskbounty bounty="10-30"/>
                    </div>
                    <div onClick={() => activateShopScreen("medium")} class="shop-earn-selector-wrapper shop-earn-selector-hvr-grow shop-earn-selector-medium">
                        <div>
                            <div class="shop-earn-selector-task-title">
                                RECORD
                            </div>
                            <div class="shop-earn-selector-task-description">
                                Record a medium difficulty transcript
                            </div>
                        </div>
                        
                        <Taskbounty bounty="30-50"/>
                    </div>
                    <div onClick={() => activateShopScreen("hard")} class="shop-earn-selector-wrapper shop-earn-selector-hvr-grow shop-earn-selector-hard">
                        <div>
                            <div class="shop-earn-selector-task-title">
                                RECORD
                            </div>
                            <div class="shop-earn-selector-task-description">
                                Record a hard difficulty transcript
                            </div>
                        </div>
                        
                        <Taskbounty bounty="50-100"/>
                    </div>
                </div>
            </div>
        );
    } else if(shopScreen === "selectingtranscript") {
        return (
            <div class="shop-content-wrapper">
                <div class="shop-selectingtranscript-title">
                    Select {difficulty==="easy" ? "an" : "a"} {difficulty} difficulty transcript to record
                </div>
                <div class="shop-selectingtranscript-layer-wrapper">
                    <TranscriptOption bounty={50} setShopScreen={setShopScreen} setTranscript={setTranscript} transcript={transcripts[0]} setAudios={setAudios}/>
                    <TranscriptOption bounty={50} setShopScreen={setShopScreen} setTranscript={setTranscript} transcript={transcripts[1]} setAudios={setAudios}/>
                </div>
                <div class="shop-selectingtranscript-layer-wrapper">
                    <TranscriptOption bounty={50} setShopScreen={setShopScreen} setTranscript={setTranscript} transcript={transcripts[2]} setAudios={setAudios}/>
                    <TranscriptOption bounty={50} setShopScreen={setShopScreen} setTranscript={setTranscript} transcript={transcripts[3]} setAudios={setAudios}/>
                </div>
                <div class="shop-selectingtranscript-footer-wrapper">
                    <div class="shop-selectingtranscript-placeholder"></div>
                    <div onClick={() => {setShopScreen("home")}} class="shop-selectingtranscript-cancel-btn">
                        Back
                    </div>
                    <div onClick={rerollTranscripts} class="shop-selectingtranscript-reroll-btn shop-selectingtranscript-reroll-btn-hvr-rotate">
                        <LoopIcon style={{color: "white", height: "2.5rem"}}/>
                    </div>
                </div>
                
            </div>
        );
    } else if(shopScreen === "loading") {
        return (
            <div class="shop-content-wrapper">
                <div class="shop-selectingtranscript-loading-wrapper">
                    Loading, please wait...
                </div>
            </div>
        );
    }else if(shopScreen === "submitting") {
        return (
            <div class="shop-content-wrapper">
                <div class="shop-selectingtranscript-loading-wrapper">
                    Submitting, please wait...
                </div>
            </div>
        );
    } else if(shopScreen === "recording") {
        let sentences = [];
        transcript['tokenizations'].forEach(element => {
            sentences.push(transcript['transcript'].substring(element[0], element[1]));
        });
    
        return (
            <div class="shop-content-wrapper">
                <div class="shop-sentences-wrapper">
                    {sentences.map((sentence, index) =>
                        <Sentence transcript={sentence} key={sentence} setAudio={setAudio} index={index}/>
                    )}
                    <div class="shop-sentences-btn-wrapper">
                        <div onClick={submitAudios} class="shop-sentences-submit">
                            Submit
                        </div>
                        <div onClick={() => {setShopScreen("selectingtranscript")}} class="shop-sentences-cancel">
                            Back
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div>

            </div>
        );
    }
    
}

export default Shop;