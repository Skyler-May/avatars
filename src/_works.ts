// ============ 请修改这里 ============
const GITHUB_USER = 'Skyler-May';
const REPO = 'avatars';               // 仓库名
const BRANCH = 'main';                // 分支名，通常是 main 或 master
// ==================================

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const gender = url.pathname.split('/')[1]; // 例如 /male 或 /female

    // 只支持 male 和 female
    if (!['male', 'female'].includes(gender)) {
      return new Response('请使用 /male 或 /female', { status: 400 });
    }

    // 构造 GitHub API 请求，用于列出该文件夹下的所有文件
    const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${REPO}/contents/assets/images/${gender}?ref=${BRANCH}`;
    
    try {
      const response = await fetch(apiUrl, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });

      if (!response.ok) {
        return new Response('无法读取头像列表，请检查仓库路径或权限', { status: 500 });
      }

      const files = await response.json() as any[];
      
      // 过滤出图片文件（支持常见图片格式）
      const imageFiles = files.filter(file => 
        file.type === 'file' && /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
      );

      if (imageFiles.length === 0) {
        return new Response('该性别暂无头像', { status: 404 });
      }

      // 随机选择一张
      const randomFile = imageFiles[Math.floor(Math.random() * imageFiles.length)];
      const imageUrl = randomFile.download_url; // GitHub 提供的直接下载链接

      // 代理图片，并设置缓存
      const imageResponse = await fetch(imageUrl);
      const image = await imageResponse.arrayBuffer();
      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

      return new Response(image, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400', // 缓存 24 小时
        },
      });
    } catch (error) {
      return new Response('服务器内部错误', { status: 500 });
    }
  }
};