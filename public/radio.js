import * as preact from './lib/preact.js'
import * as htm from './lib/htm.js'
import * as hooks from './lib/hooks.js'

import { makeDraggable, formatTime } from './lib/lib.js'

const { h, render } = preact
const { useState, useRef, useEffect } = hooks

const html = htm.default.bind(h)

const streamUrl = 'https://cast.based.radio/vgm.ogg'
const icecastInfoUrl = 'https://cast.based.radio/status-json.xsl'
const infoUrl = 'https://api.based.radio'
// const songInfoUrl = `${infoUrl}/song`
// const statusInfoUrl = `${infoUrl}/status`

const img = {
  logo: 'assets/icons/windows95_logo.png',
  vol: 'assets/volume.png',
  statusbar: 'assets/statusbar.png'
}

const audio = new Audio(streamUrl)
audio.crossOrigin = 'anonymous'
audio.type = 'audio/ogg; codecs="opus"'
audio.preload = 'auto'
audio.bufferSize = 3

// Get info from the radio api
async function getStreamInfo () {
  return fetch(infoUrl)
    .then(r => r.json())
    .catch(e => ({
      song: {
        game: 'Stream Offline :(',
        track: 'Stream Offline'
      }
    }))
}

// Displays song metadata
function PlayerInfo ({ currentSong, setCurrentSong, currentStatus, setCurrentStatus }) {
  const listenersEl = document.getElementById('listeners')
  const pollingRate = 15000 // 15s, may need to adjust later

  const fullUpdate = () => Promise.all([
    getStreamInfo()
      .then(r => {
        setCurrentSong(r.song)
        setCurrentStatus({
          ...r.status,
          elapsed: Math.floor(Number(r.status.elapsed)),
          duration: Math.ceil(Number(r.status.duration))
        })
        document.title = `${r.song.title || 'Stream Offline...'} | BasedRadio`
      }),
    fetch(icecastInfoUrl) // update listeners
      .then(r => r.json())
      .then(r => { listenersEl.innerText = r.icestats.source.listeners })
  ])

  // On component load, get current song info
  useEffect(() => { fullUpdate() }, [])

  // Ticks the position of time up every second
  useInterval(() => {
    setCurrentStatus({ ...currentStatus, elapsed: currentStatus.elapsed + 1 })
    if (currentStatus.elapsed - 3 > currentStatus.duration) {
      fullUpdate()
    }
  }, 1000)

  useInterval(() => fullUpdate(), pollingRate)

  return html`
    <div class='stream-meta'>
      <div class='player-cover-art'>
        <img src="${currentSong.cover || img.logo}" alt='Cover Art' />
      </div>
      <div class='player-stats'>
        <div class='player-game'><strong>Game:</strong> ${currentSong.game}</div>
        <div class='player-track'><strong>Track:</strong> ${currentSong.title}</div>
        <div class='player-system'><strong>System:</strong> ${currentSong.system}</div>
      </div>
    </div>
  `
}

// Controls for the player volume
// TODO: implement
function PlayerVolume () {
  // const [currentVol, setCurrentVol] = useState(0) // 0-100
  return html`
    <div class='player-volume'>
      <div class='player-volume-icon'>
        <img src=${img.vol} alt='Volume Icon' />
      </div>
      <div class='player-volume-control'>
        <div id='player-volume-range' />
        <div class='player-volume-line' />
      </div>
    </div>
  `
}

function Visualizer () {
  const canvasEl = useRef()

  useEffect(() => {
    const context = new (window.AudioContext || window.webkitAudioContext)()
    const analyser = context.createAnalyser()
    const gainNode = context.createGain()
    const canvasContext = canvasEl.current.getContext('2d')
    const source = context.createMediaElementSource(audio)
    source.connect(analyser)

    analyser.connect(gainNode)
    gainNode.connect(context.destination)

    // Make a buffer to receive the audio data
    const numPoints = analyser.frequencyBinCount
    const audioDataArray = new Uint8Array(numPoints)

    function render () {
      canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height)

      // get the current audio data
      analyser.getByteFrequencyData(audioDataArray)

      const width = canvasContext.canvas.width
      const height = canvasContext.canvas.height
      const size = 8 // Size of each visualizer bar

      // draw a point every size pixels
      for (let x = 0; x < width; x += size) {
        // Size of the spectrum that will account for this bar
        const ndx = x * numPoints / width | 0
        // get the audio data and make it go from 0 to 1
        const audioValue = audioDataArray[ndx] / 255
        const color = audioValue > 0.45 ? '#FF00AAAA' : '#FF00FFAA'
        canvasContext.fillStyle = color
        const barHeight = Math.ceil(height - (audioValue * height))
        if (audioValue > 0.05) {
          canvasContext.fillRect(x, barHeight, size, height)
        }
      }
      requestAnimationFrame(render)
    }
    requestAnimationFrame(render)
  }, [])

  return html`<canvas id='canvas' class='player-visual' ref=${canvasEl} />`
}

function PlayerContent () {
  const playEl = useRef()
  const [songState, setSongState] = useState('Loading..')
  const [currentSong, setCurrentSong] = useState({})
  const [currentStatus, setCurrentStatus] = useState({})

  useEffect(() => { setSongState('Play') }, [])

  const pressPlay = () => {
    if (songState === 'Play') { // audio.paused
      setSongState('Pause')
      audio.load()
      audio.play()
    } else if (songState === 'Pause') {
      setSongState('Play')
      audio.pause()
    }
  }

  return html`
    <div class='player-content'>
      ${PlayerInfo({ // There's probably a better way to do this
        currentSong,
setCurrentSong,
        currentStatus,
setCurrentStatus
      })}
      <div class='player-meta-slot'>
        <div class='player-meta'>
          
          <div class='player-time-container text-field'>
            ${Visualizer({ currentStatus })}
            <div id='player-time' class='player-time'>~~~ ${formatTime(currentStatus.elapsed)}/${formatTime(currentStatus.duration)} ~~~</div>
          </div>
          ${PlayerVolume()}
          <div class='content-buttons'>
            <button onClick=${pressPlay} ref=${playEl}>${songState}</button>
            <button><u>S</u>ettings</button>
            <button><u>M</u>ore Info</button>
          </div>
        </div>
      </div>
    </div>
  `
}

Array.from(document.getElementsByClassName('window')).map(makeDraggable)

render(html`<${PlayerContent} />`, document.getElementById('player-container'))

// Polling utility
// found here: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
export function useInterval (callback, delay) {
  const savedCallback = useRef()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    function tick () {
      savedCallback.current()
    }
    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}