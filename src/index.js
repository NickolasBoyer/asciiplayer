import { scale } from './util.js'
import { Bar } from './bar.js'

const defaultPixels = ['.', ',', ':', ';', '+', '*', '?', '%', 'S', '#', '@']

export const Player = (options = {}) => ({
  pixels: options.pixels || defaultPixels,
  txt: '',
  video: null,
  canvas: null,
  ctx: null,
  asciiEl: null,
  renderDriver: null,
  fps: options.fps ? (1000/fps) : 1000/30,
  bar: Bar(),
  width: options.width || 0,
  height: options.height || 0,
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
      if (!this.width) this.setWidth(this.video.videoWidth)
      if (!this.height) this.setHeight(this.video.videoHeight)
      this.setReady()
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

      this.txt = this.txt + this.pixels[Math.floor(scale(r, 0, 256, 0, this.pixels.length))]
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
    window.requestAnimationFrame(this.computeFrame.bind(this))
  },
  setWidth (w) {
    this.width = w
    this.bar.setWidth(this.width)
  },
  setHeight(h) {
    this.height = h
  },
  setSize (w, h) {
    this.setWidth(w)
    this.setHeight(h)
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

    if (rx >= barStart && rx <= (barEnd) && ry > (this.height - 5)) return this.seek(this.bar.mediaDuration * ((rx - (barStart)) / ((barEnd - barStart))))

    this.paused ? this.play() : this.pause()
  }
})
