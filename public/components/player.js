/*
TODO:
  - Keybindings to the UI for a11y
  - Setup the real stream
  - Remove all the useless css
  - Fix styling bugs
  - Implement download button or just remove it (probably remove it)
*/

import { h, render } from 'https://esm.sh/preact'
import htm from 'https://esm.sh/htm'
import { useState, useRef } from 'https://esm.sh/preact/hooks'

const html = htm.bind(h)

const stream_url = 'https://cast.based.radio/vgm.ogg'

const img = {
  logo: 'assets/icons/windows95_logo.png',
  vol: 'assets/volume.png',
  statusbar: 'assets/statusbar.png'
}

function ButtonMinimize () {
  return html`
    <div class='buttons'>
      <button class='button-minimize' id='button-minimize' />
    </div>
  `
}

function ButtonHome () {
  return html`
    <div class='action'>
      <a id='home-btn' role='button' tabindex='0' href='/'>
        <u>H</u>ome
      </a>
    </div>
  `
}

function ButtonAbout () {
  return html`
    <div class='action'>
      <a id='about-show' role='button' tabindex='1'>
        <u>A</u>bout
      </a>
    </div>
  `
}

function ButtonDownloadSong () {
  return html`
    <div class='action'>
      <a id='song-dl-link' role='button' tabindex='2' download>
        <u>D</u>ownload Song
      </a>
    </div>
  `
}

function ButtonUpdates () {
  return html`
    <div class='action' style="float:right">
      <a role='button' id='updates-show' tabindex='3'>
        <u>U</u>pdates
      </a>
    </div>
  `
}

function MenuBar () {
  return html`
    <div class='menu-bar' id='actions'>
      ${ButtonHome()}
      ${ButtonAbout()}
      ${ButtonUpdates()}
    </div>
  `
}

function CoverArt () {
  return html`
    <div class='cover'>
      <img src=${img.logo} alt='Cover Art' />
    </div>
  `
}

function PlayerHeader () {
  return html`
    <div class='header header-draggable'>
      <div class='icon' />BasedRadio
      ${ButtonMinimize()}
    </div>
  `
}

// TODO: Add listener functionality
function PlayerFooter () {
  return html`
    <player-footer>
      <div class='cell'>Listeners: <span id='listeners'>0</span></div>
      <div> | Keep it Based</div>
      <div class='footer-end' />
    </player-footer>
  `
}

// Displays info on what you're listening to
function PlayerInfo () {
  return html`
    <div class='col-md-6 col-xs-12'>
      <div class='text-field pa-0 ma-0 player-time-container'>
        <canvas id='canvas' class='player-visual' />
        <div id='player-time' class='player-time'>- Welcome Back -</div>
      </div>
    </div>
  `
}

// Controls for the player volume
// TODO: implement
function PlayerVolume () {
  const [currentVol, setCurrentVol] = useState(0) // 0-100
  return html`
    <div class='col-md-6 hidden-sm hidden-xs'>
      <div class='player-volume'>
        <div class='player-volume-icon'>
          <img src=${img.vol} alt='Volume Icon' />
        </div>
        <div class='player-volume-control'>
          <div id='player-volume-range' />
          <div class='player-volume-line' />
        </div>
      </div>
    </div>
  `
}

function PlayerContent () {
  const audioEl = useRef()
  const playEl = useRef()
  const context = new (window.AudioContext || window.webkitAudioContext)()

  const [songState, setSongState] = useState('paused')

  const constructAudio = () => {
    context.resume().then(() => {
      audioEl.current.type = 'audio/ogg; codecs="opus"'
      audioEl.current.src = stream_url
      audioEl.current.load()
      audioEl.current.volume = 1
      // TODO: Add logic to handle mp3 for legacy
    })
  }

  const canPlay = () => {
    setSongState('playing')
    audioEl.current.play()
    playEl.current.innerText = 'Pause'
  }

  const pressPlay = () => {
    switch (songState) {
      case 'playing':
        setSongState('paused')
        audioEl.current.pause()
        playEl.current.innerText = 'Play'
        // set page title to song
        break
      case 'paused':
        setSongState('loading')
        playEl.current.innerText = 'loading..'
        constructAudio()
        break
      default:
        console.error('Unhandled player state')
    }
  }

  return html`
    <div class='player-content'>
      <audio onCanPlay=${canPlay} ref=${audioEl} crossOrigin='anonymous' preload='auto' />
      <div class='cover-slot'>
        ${CoverArt()}
      </div>
      <div class='player-meta-slot'>
        <div class='player-meta'>
          <div class='player-game'>Game: </div>
          <div class='player-track'>Track: </div>
          <div class='player-system'>System: </div>
          ${PlayerInfo()}
          ${PlayerVolume()}
          <div class='content-buttons'>
            <button onClick=${pressPlay} ref=${playEl}>Play</button>
            <button>Settings</button>
            <button>More Info</button>
          </div>
        </div>
      </div>
    </div>
  `
}

function WinForm () {
  return html`
    <window-player class="win98">
        <player-form class='window'>
          <div class='inner'>
            ${PlayerHeader()}
            ${MenuBar()}
            ${PlayerContent()}
          </div>
          ${PlayerFooter()}
        </div>
    </window-player>
  `
}

function VGMPlayer () {
  return html`
    <vgm-player>
      ${WinForm()}
    </vgm-player>
  `
}

render(html`<${VGMPlayer} />`, document.body)
