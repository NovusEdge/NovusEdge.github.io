// Post slug -> thumbnail image. Shared by the blog list and the post-page hero.
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
  // personal / blog-update posts -> art assets
  if (slug === 'hello-world') return '/assets/bg-3.jpg'
  if (slug === 'university') return '/assets/spore.jpg'
  if (slug === 'what-do-i-want') return '/assets/anim2.gif'
  if (slug === 'going-forward') return '/assets/anim1.gif'
  return null
}
