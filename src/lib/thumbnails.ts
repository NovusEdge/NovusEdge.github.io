// Post slug -> thumbnail for blog list cards
export function getListThumbnail(slug: string): string | null {
  if (slug === 'chat-control-eu') return '/assets/blog/chat-control-featured.jpeg'
  return getPostThumbnail(slug)
}

// Post slug -> thumbnail image for post-page hero
export function getPostThumbnail(slug: string): string | null {
  if (slug.includes('tiling-window-managers')) return '/assets/img/LJ-TWM-01.png'
  if (slug.includes('alfred')) return '/assets/img/writeup_assets/alfred/port-8080-login.png'
  if (slug.includes('blue')) return '/assets/img/writeup_assets/blue/blue-room-top.png'
  if (slug.includes('chocolate-factory')) return '/assets/img/writeup_assets/chocolate-factory/port-80.png'
  if (slug.includes('daily-bugle')) return '/assets/img/writeup_assets/daily-bugle/login-page.png'
  if (slug.includes('game-zone')) return '/assets/img/writeup_assets/game-zone/home-page.png'
  if (slug.includes('red')) return '/assets/img/writeup_assets/red/port-80.png'
  if (slug.includes('toolsrus')) return '/assets/img/writeup_assets/toolsrus/protected_page_moved.png'
  if (slug.includes('bootsplash')) return '/assets/img/LJ-TWM-04.png'
  // essays - hero uses the red vintage banner, list uses the dithered eye
  if (slug === 'chat-control-eu') return '/assets/blog/chat-control-hero.jpeg'
  // AI / founder-log posts -> art assets
  if (slug === 'on-building-something-engrammic') return '/assets/cosmos_948956014.jpeg'
  if (slug === 'hardware-journeys-starting-from-zero') return '/assets/patent.jpeg'
  if (slug === 'i-build-cool-shit-and-also-spreadsheets') return '/assets/moth.jpeg'
  // personal / blog-update posts -> art assets
  if (slug === 'im-back-pt-1') return '/assets/cosmos_1829710684.jpeg'
  if (slug === 'im-back-pt-2') return '/assets/fallen_angel.webp'
  if (slug === 'hello-world') return '/assets/bg-3.jpg'
  if (slug === 'university') return '/assets/spore.jpg'
  if (slug === 'what-do-i-want') return '/assets/anim2.gif'
  if (slug === 'going-forward') return '/assets/anim1.gif'
  return null
}
