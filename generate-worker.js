const fs = require('fs');
const path = require('path');

const GITHUB_USER = 'Skyler-May';
const REPO = 'avatars';
const BRANCH = 'main';

// 本地图片根目录（相对于此脚本）
const baseDir = path.join(__dirname, 'assets/images');

// 读取指定性别文件夹下的所有图片文件，返回 raw URL 列表
function getImageUrls(gender) {
  const dir = path.join(baseDir, gender);
  if (!fs.existsSync(dir)) {
    console.warn(`警告: 文件夹 ${dir} 不存在`);
    return [];
  }
  const files = fs.readdirSync(dir);
  const imageFiles = files.filter(name => /\.(jpg|jpeg|png|gif|webp)$/i.test(name));
  return imageFiles.map(name => 
    `'https://raw.githubusercontent.com/${GITHUB_USER}/${REPO}/${BRANCH}/assets/images/${gender}/${name}'`
  );
}

// 生成最终的 Worker 代码
function generateWorkerCode(maleUrls, femaleUrls) {
  return `// ================================================================
// 自动生成 - ${maleUrls.length} 男 + ${femaleUrls.length} 女
// 生成时间: ${new Date().toLocaleString()}
// ================================================================

const MALE_AVATARS = [
  ${maleUrls.join(',\n  ')}
];

const FEMALE_AVATARS = [
  ${femaleUrls.join(',\n  ')}
];

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const gender = url.pathname.split('/')[1];
    if (!['male', 'female'].includes(gender)) {
      return new Response('请使用 /male 或 /female', { status: 400 });
    }
    const avatars = gender === 'male' ? MALE_AVATARS : FEMALE_AVATARS;
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
`;
}

// 主流程
console.log('正在读取本地男性头像...');
const maleUrls = getImageUrls('male');
console.log(`找到 ${maleUrls.length} 张男性头像`);

console.log('正在读取本地女性头像...');
const femaleUrls = getImageUrls('female');
console.log(`找到 ${femaleUrls.length} 张女性头像`);

const code = generateWorkerCode(maleUrls, femaleUrls);
fs.writeFileSync('_worker.ts', code);
console.log('\n✅ 已生成 _worker.ts 文件，请提交到 GitHub 仓库！');