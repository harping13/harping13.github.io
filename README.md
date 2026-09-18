# Segment Studio 原型

这是一个不依赖构建工具的前端原型，用来演示类似 Segment Anything 的交互流程：

`上传图片 → 点击目标 → 生成遮罩 → 下载结果`

## 运行

直接双击 `index.html` 即可打开。也可以用任意静态文件服务器打开该目录。

## 当前功能

- 拖拽或选择本地图片
- 使用内置演示图片
- 正向提示点和排除提示点
- Canvas 图像显示和模拟分割遮罩
- 加载状态、统计数据、清除和重置
- 下载当前 Canvas 结果为 PNG

## 接入真实模型

现在的遮罩是浏览器端模拟效果。要接入真实 Segment Anything 或其他分割模型，可以在 `app.js` 的 Canvas 点击事件中：

1. 把图片和提示点发送到后端 API；
2. 后端用 Python、PyTorch 或 ONNX Runtime 推理；
3. 返回 mask 图片或 polygon；
4. 用 Canvas 绘制真实 mask。

## 视觉参考
页面视觉参考了用户提供的 Zhou_AI_pubulish.pptx：白色导航栏、全宽深色图片首屏、蓝色内容卡片和研究主页信息结构。
