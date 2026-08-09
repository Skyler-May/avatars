/**
 * 自动生成:
 * - 0 卡通
 * 
 * - 生成时间: 2026/8/9 17:35:57
 */

const CARTOON_AVATARS = [];

export default {
  async fetch(request: { url: string | URL; }) {
    const url = new URL(request.url);
    const gender = url.pathname.split('/')[1];
    if (!['cartoon'].includes(gender)) {
      return new Response('欢迎使用头像服务，请访问 /male, /female, /animal 或 /scenery', { status: 200 });
    }
    const avatars = gender === 'cartoon' ? CARTOON_AVATARS : CARTOON_AVATARS;
    if (avatars.length === 0) return new Response('暂无头像', { status: 404 });
    const randomUrl = avatars[Math.floor(Math.random() * avatars.length)];
    const imageResponse = await fetch(randomUrl);
    const image = await imageResponse.arrayBuffer();
    return new Response(image, {
      headers: {
        'Content-Type': imageResponse.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  }
};
