const pixelRenderer = document.getElementById('pixel-renderer')
const video = document.getElementById("video");

// const pixArray = [' ', '.', ',', '\'', ':',';', 'l','c','x','d','k','O','@']
const pixArray = ['.', ',', ':', ';', '+', '*', '?', '%', 'S', '#', '@'].reverse()

const bar = {
  visible: false,
  hideTimer: null,
  txt: '',
  width: 0,
  middleBarLength: 0,
  middleBarBar: '',
  middleBarSpace: '',
  progressBar: '',
  playState: false,
  playLabel: '   &#9658; PLAY   ',
  mediaDuration: 0,
  mediaProgress: 0,
  displaytTime: '',
  render () {
    this.txt = `
+------------+${this.middleBarBar  }+---------------+
|            |${this.middleBarSpace}|               |
|${this.playLabel}|${this.progressBar}|${this.displaytTime}|
|            |${this.middleBarSpace}|               |
+------------+${this.middleBarBar  }+---------------+
`
  },
  setWidth (w) {
    this.width = w
    this.middleBarLength = w - 14 - 15 - 2
    this.middleBarBar = '-'.repeat(this.middleBarLength)
    this.middleBarSpace = ' '.repeat(this.middleBarLength)
    this.setProgress(0);
  },
  setDuration (d) {
    this.mediaDuration = d
    this.mediaProgress = 0
    this.displaytTime = String(this.mediaProgress).padStart(7, ' ') + '/' + String(d).padEnd(7, ' ')
    this.progressBar = ' ' + '&blk34;' + '&blk14;'.repeat(this.middleBarLength - 2 - 1) + ' '
  },
  setProgress (p) {
    this.mediaProgress = p
    this.displaytTime = String(p).padStart(7, ' ') + '/' + String(this.mediaDuration).padEnd(7, ' ')
    const barBlocks = Math.floor((this.middleBarLength - 2) * (p/this.mediaDuration))
    this.progressBar = ' ' + '&blk34;'.repeat(barBlocks) + '&blk14;'.repeat(this.middleBarLength - 2 - barBlocks) + ' '
  },
  setPlayState (s) {
    this.playState = s
    this.playLabel = s ? ' | | PAUSE  ' : '   &#9658; PLAY   '
  },
  hide () { this.visible = false },
  show () { this.visible = true  },
  hideTimeout (t) {
    if (this.hideTimer) window.clearTimeout(this.hideTimer)
    this.hideTimer = window.setTimeout(this.hide.bind(this), t)
  }
}


const player = {
  txt: '',
  video: null,
  canvas: null,
  ctx: null,
  asciiEl: null,
  renderDriver: null,
  fps: 1000/30,
  bar: bar,
  width: 0,
  height: 0,
  paused: true,
  ready: false,
  init (el) {
    if (!el) return console.error('Init failed, provide ascii element')
    this.video = document.createElement('video')
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext("2d");
    this.asciiEl = el

    this.setPlayerHandlers()
    this.setUIHandlers()
  },
  setReady() {
    this.ready = true
    this.computeFrame()
    this.displayMessage('Click to play')
  },
  setPlayerHandlers () {
    this.video.addEventListener("loadedmetadata", (m) => {
      this.width = this.video.videoWidth
      this.height = this.video.videoHeight
      this.setReady()
      this.bar.setWidth(this.width)
      this.bar.setDuration(Math.floor(this.video.duration))
    }, false);

    this.video.addEventListener("play", () => {
      this.paused = false
      this.bar.setPlayState(true)
      this.renderDriver = window.setInterval(this.render.bind(this), this.fps)
    }, false);

    this.video.addEventListener("pause", () => {
      this.paused = true
      this.bar.setPlayState(false)
      this.computeFrame() // manually push frame since video is paused
      window.clearInterval(this.renderDriver)
    }, false);

    this.video.addEventListener("timeupdate", () => {
      this.bar.setProgress(Math.floor(this.video.currentTime))
    }, false);
  },
  setUIHandlers () {
    this.asciiEl.addEventListener('mousemove', (m) => { 
      this.bar.visible ? this.bar.hideTimeout(2000) : this.bar.show()
    })

    this.asciiEl.addEventListener('click', (ev) => {
      const rect = ev.srcElement.getBoundingClientRect();
      const x = ev.pageX - rect.left;
      const y = ev.pageY - rect.top; 
      this.handleClick(x, y, rect.width, rect.height)
    })
  },
  setSourceMedia (src) {
    if (!this.video) return console.warn('Initialize player first')
    this.video.src = src
    this.video.preload = 'metadata'
  },
  computeFrame () {
    this.ctx.drawImage(this.video, 0, 0, this.width, this.height);
    const frame = this.ctx.getImageData(0, 0, this.width, this.height);
    const l = frame.data.length / 4;
    this.txt = ''

    for (let i = 0; i < l; i++) {
      let r = frame.data[i * 4 + 0];
      // let g = frame.data[i * 4 + 1];
      // let b = frame.data[i * 4 + 2];

      this.txt = this.txt + pixArray[Math.floor(scale(r, 0, 256, 0, pixArray.length))]
      this.txt = this.txt + ((i % this.width) === (this.width - 1) ? '\n' : '')

    }

    if (this.bar.visible) {
      this.bar.render()
      this.txt = this.txt.substr(0, this.txt.length - (5 * this.width + 5 + 1)) + this.bar.txt
    }

    this.asciiEl.innerHTML = this.txt
    return ;
  },
  displayMessage (m) {
    const charWidth = this.width + 1 // newline
    const centerLine = Math.floor(this.height / 2)
    const startMessage = Math.floor((charWidth / 2) - (m.length / 2) - 2)
    const endMessage = Math.floor((charWidth / 2) + (m.length / 2) + 2)
    const message = m.toUpperCase()
    this.txt = 
      this.txt.substring(0,                                             charWidth * (centerLine - 2)) + // section above the mesage

      this.txt.substring(charWidth * (centerLine - 2),                 charWidth * (centerLine - 2) + startMessage) + // left of top border
      ' '.repeat(m.length + 4) + // upper border
      this.txt.substring(charWidth * (centerLine - 2) + endMessage,    charWidth * (centerLine - 1)) + // right of top border

      this.txt.substring(charWidth * (centerLine - 1),                 charWidth * (centerLine - 1) + startMessage) + // left of message
      '  ' + message + '  ' + // message
      this.txt.substring(charWidth * (centerLine - 1) + endMessage,    charWidth * (centerLine )) + // right of message

      this.txt.substring(charWidth * (centerLine),                     charWidth * (centerLine) + startMessage) + // left of top border
      ' '.repeat(m.length + 4) + // bottomm border
      this.txt.substring(charWidth * (centerLine) + endMessage,        charWidth * (centerLine + 1)) + // right of top border

      this.txt.substring(charWidth * (centerLine + 1))

    this.asciiEl.innerHTML = this.txt
  },
  render() {
    if (this.video.paused || this.video.ended) return;
    window.requestAnimationFrame(player.computeFrame.bind(this))
  },
  play () { 
    if (!this.ready) return alert('Not ready yet.')
    this.video.play()
  },
  pause () { this.video.pause() },
  seek (t) {
    this.bar.setProgress(t)
    this.video.currentTime = t
  },
  handleClick(x, y, w, h) {
    const pixelWidth  = (w / this.width)
    const pixelHeight = (h / this.height)
    const rx = x / pixelWidth
    const ry = y / pixelHeight

    const barStart = 15
    const barEnd = this.width - 18

    if (rx >= barStart && rx <= (barEnd) && ry > 158) return this.seek(this.bar.mediaDuration * ((rx - (barStart)) / ((barEnd - barStart))))

    this.paused ? this.play() : this.pause()
  }
}

document.addEventListener("DOMContentLoaded", () => {
  player.init(pixelRenderer)
  player.setSourceMedia('/media/40401.webm')
});


const scale = (num, in_min, in_max, out_min, out_max) => {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
