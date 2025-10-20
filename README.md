## BasedRadio

### Infinite VGM Playlist

> [!IMPORTANT]  
> This code is mostly abandoned in favor of the [rust wasm version](https://github.com/rpgwaiter/basedradio-rs)


HTML+JS version of basedradio hosted at https://old.based.radio.

### TODO:

- [x] Cover Art
- [x] Visualization
- [ ] Styling Cleanup
- [ ] Settings
- [ ] About Page
- [ ] PWA?
- [ ] Updates Page
- [ ] Volume Control
- [x] CI
- [ ] Add a bunch more songs

### Infra

- A minimal Hetzner server running NixOS with some music and artwork stored on it.
- [mpd](https://www.musicpd.org/) playing on an infinite shuffling loop sending to ->
- [icecast](https://icecast.org/) multicast media streaming server
- [Custom python API](api/) for showing elapsed time, info about the game the song is from, etc.
- Website hosted on Cloudflare Pages that you actually connect to