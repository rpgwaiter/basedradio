## BasedRadio

### Infinite VGM Playlist


This is a total rewrite of the site and infrastructure, very much a work-in-progress.

### TODO:

- [x] Cover Art
- [x] Visualization
- [ ] Styling Cleanup
- [ ] Settings
- [ ] About Page
- [ ] PWA?
- [ ] Updates Page
- [ ] Volume Control
- [ ] CI

### Infra

- A minimal Hetzner server with some music and artwork stored on it.
- [mpd](https://www.musicpd.org/) playing on an infinite shuffling loop sending to ->
- [icecast](https://icecast.org/) multicast media streaming server
- [Custom python API](api/) for showing elapsed time, info about the game the song is from, etc.
- Website hosted on Cloudflare Pages that you actually connect to