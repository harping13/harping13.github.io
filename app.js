const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('fileInput');
const dropzone = document.getElementById('dropzone');
const emptyState = document.getElementById('emptyState');
const loading = document.getElementById('loading');
const canvasStatus = document.getElementById('canvasStatus');
const pointCount = document.getElementById('pointCount');
const pointsEl = document.getElementById('points');
const coverageEl = document.getElementById('coverage');
const confidenceEl = document.getElementById('confidence');
const resultMessage = document.getElementById('resultMessage');
const downloadBtn = document.getElementById('downloadBtn');
let image = null;
let imageName = 'segment-result';
let points = [];
let mode = 'positive';

function fitImage(img){
  const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
  return {w: img.width * ratio, h: img.height * ratio, x: (canvas.width - img.width * ratio) / 2, y: (canvas.height - img.height * ratio) / 2};
}
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#e6e5df'; ctx.fillRect(0,0,canvas.width,canvas.height);
  if(!image) return;
  const box = fitImage(image); ctx.drawImage(image,box.x,box.y,box.w,box.h);
  points.forEach((p,i)=>{
    const radius = Math.max(70, Math.min(box.w,box.h)*.14) * (p.sign === 'negative' ? .7 : 1);
    const grad = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,radius);
    grad.addColorStop(0,p.sign === 'negative' ? 'rgba(255,98,90,.44)' : 'rgba(200,242,102,.48)');
    grad.addColorStop(.72,p.sign === 'negative' ? 'rgba(255,98,90,.18)' : 'rgba(200,242,102,.16)');
    grad.addColorStop(1,'rgba(200,242,102,0)');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(p.x,p.y,radius,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = p.sign === 'negative' ? '#ff625a' : '#c8f266'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x,p.y,9,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle = p.sign === 'negative' ? '#ff625a' : '#c8f266'; ctx.font = '12px DM Mono'; ctx.fillText((i+1).toString(),p.x+14,p.y-12);
  });
}
function loadImage(src,name='uploaded-image'){
  const img = new Image(); img.onload=()=>{image=img; imageName=name.replace(/\.[^.]+$/,''); points=[]; emptyState.style.display='none'; downloadBtn.disabled=false; canvasStatus.textContent='图像已载入 · 点击目标'; resultMessage.textContent='点击图像中的目标，生成一个模拟分割遮罩。'; updateStats(); draw();}; img.src=src;
}
function readFile(file){ if(!file || !file.type.startsWith('image/')) return; const reader=new FileReader(); reader.onload=e=>loadImage(e.target.result,file.name); reader.readAsDataURL(file); }
fileInput.addEventListener('change',e=>readFile(e.target.files[0]));
['dragenter','dragover'].forEach(type=>dropzone.addEventListener(type,e=>{e.preventDefault();dropzone.classList.add('drag')}));
['dragleave','drop'].forEach(type=>dropzone.addEventListener(type,e=>{e.preventDefault();dropzone.classList.remove('drag')}));
dropzone.addEventListener('drop',e=>readFile(e.dataTransfer.files[0]));
document.getElementById('sampleBtn').addEventListener('click',()=>{
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#9bc3cb"/><stop offset="1" stop-color="#263b53"/></linearGradient></defs><rect width="1200" height="760" fill="url(#g)"/><circle cx="850" cy="340" r="175" fill="#dd8e5f"/><circle cx="850" cy="340" r="126" fill="#e7ae75"/><path d="M0 610 C260 520 370 665 610 580 C820 505 1000 600 1200 540V760H0Z" fill="#1e3940"/><path d="M0 560 C210 480 350 600 550 510 C750 420 980 530 1200 465" fill="none" stroke="#90b37e" stroke-width="20" opacity=".8"/><circle cx="900" cy="295" r="18" fill="#232326"/><path d="M790 420 Q850 465 915 420" fill="none" stroke="#27323e" stroke-width="14" stroke-linecap="round"/></svg>`;
  loadImage('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg),'sample-portrait.svg');
});
canvas.addEventListener('click',e=>{if(!image)return; const r=canvas.getBoundingClientRect(); const sx=canvas.width/r.width, sy=canvas.height/r.height; points.push({x:(e.clientX-r.left)*sx,y:(e.clientY-r.top)*sy,sign:mode}); updateStats(); draw(); loading.classList.add('show'); canvasStatus.textContent='分析中…'; setTimeout(()=>{loading.classList.remove('show');canvasStatus.textContent='分割完成 · 可继续添加';resultMessage.textContent='模拟结果已生成。点击更多区域可继续细化选择。'},650)});
function updateStats(){const n=points.length; pointCount.textContent=n+' 个提示点'; if(pointsEl) pointsEl.textContent=n; if(coverageEl) coverageEl.textContent=n?Math.min(86,18+n*14)+'%':'—'; if(confidenceEl) confidenceEl.textContent=n?Math.min(99,78+n*5)+'%':'—';}
document.getElementById('clearBtn').addEventListener('click',()=>{points=[];updateStats();draw();canvasStatus.textContent=image?'图像已载入 · 点击目标':'等待图像';resultMessage.textContent=image?'点击图像中的目标，生成一个模拟分割遮罩。':'上传图片并点击目标后，结果统计会显示在这里。'});
document.getElementById('resetBtn').addEventListener('click',()=>{image=null;points=[];fileInput.value='';emptyState.style.display='flex';downloadBtn.disabled=true;updateStats();draw();canvasStatus.textContent='等待图像';resultMessage.textContent='上传图片并点击目标后，结果统计会显示在这里。'});
document.getElementById('positiveTool').addEventListener('click',()=>{mode='positive';document.getElementById('positiveTool').classList.add('active');document.getElementById('negativeTool').classList.remove('active')});
document.getElementById('negativeTool').addEventListener('click',()=>{mode='negative';document.getElementById('negativeTool').classList.add('active');document.getElementById('positiveTool').classList.remove('active')});
downloadBtn.addEventListener('click',()=>{const a=document.createElement('a');a.download=imageName+'-segmented.png';a.href=canvas.toDataURL('image/png');a.click()});
draw(); updateStats();
