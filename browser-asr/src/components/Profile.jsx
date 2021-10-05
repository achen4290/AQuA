import "../styles/Profile.css";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import StatsCardsAccordion from "./StatsCardsAccordion";
import { useAlert } from 'react-alert';
import { useRecoilState, useRecoilValue } from "recoil";
import { PROFILE } from "../store";

// ASSETS
import BookIcon from '@material-ui/icons/Book';
import MusicVideoIcon from '@material-ui/icons/MusicVideo';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import InsertChartIcon from '@material-ui/icons/InsertChart';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


// pfp, username
function ProfileCard(props) {
    const profile = useRecoilValue(PROFILE);
    console.log(profile);
    return (
        <div class="profile-profilecard-wrapper" onClick={() => props.setProfileScreen('changeuserinfo')}>
            <div class="profile-profilecard-pfp">

            </div>
            <div class="profile-profilecard-text">
                {profile['username']} <br/>
                <div>
                    
                </div>
                {profile['rating']}
            </div>
        </div>
    );
}

// rating chart
function RatingCard(props) {
    return (
        <div class="profile-ratingcard-wrapper">
            <div class="profile-comingsoon">
                COMING SOON
            </div>
        </div>
    );
}

// 1 stats card
function StatsCard(props) {
    return (
        <div class="profile-statscard-wrapper">
            {props.label}
            <ExpandMoreIcon style={{color: "black", height: "25px"}}/>
        </div>
    );
}

// all the stats cards
function StatsCards(props) {
    return (
        <div class="profile-statscards-wrapper">
            <div class="profile-statscards-title-wrapper">
                <InsertChartIcon style={{color: "#6287F7", height: "25px", width: "auto"}}/>
                <div class="profile-statscards-title">Stats</div>
            </div>
            <div class="profile-statscards-content-wrapper">
                <StatsCardsAccordion/>
            </div>
        </div>
    );
}

// button for looking at history
function HistoryCard(props) {
    const alert = useAlert();

    function comingSoon() {
        alert.show("This feature is coming soon!");
    }

    return (
        <div onClick={comingSoon} class="profile-historycard-wrapper" style={{color : props.color, backgroundColor : props.bgcolor}}>
            {props.icon}
            {props.label}
        </div>
    );
}

// match history + recording history + inbox buttons
function HistoryCards(props) {
    
    return (
        <div class="profile-historycards-wrapper">
            <HistoryCard label="Match Log" color="orange" bgcolor="#FEFDE1" icon={<BookIcon style={{color: "orange", height: "3rem", width: "auto"}}/>}/>
            <HistoryCard label="Recordings" color="green" bgcolor="#D2FBD9" icon={<MusicVideoIcon style={{color: "green", height: "3rem", width: "auto"}}/>} />
            <HistoryCard label="Inbox" color="purple" bgcolor="#F6E1FD" icon={<MailOutlineIcon style={{color: "purple", height: "3rem", width: "auto"}}/>}/>
        </div>
    );
}

// hook for entire profile page
function Profile(props) {
    const [profileScreen, setProfileScreen] = useState('home')

    if (profileScreen === 'changeuserinfo') {
        return (
            <div class="profile-content-wrapper">
                {/* Pfp, change pfp, username, edit username */}
                <div>
                    
                </div>
            </div>
        )
    } else {
        return (
            <div class="profile-content-wrapper">
                <div class="profile-column">
                    <ProfileCard setProfileScreen={setProfileScreen}/>
                    <RatingCard/>
                </div>
                <div class="profile-column">
                    <StatsCards/>
                    <HistoryCards/>
                </div>
            </div>
        );
    }
}

export default Profile;