import './style.css';
import { Engine, Scene, Vector3, HemisphericLight, DirectionalLight, MeshBuilder, StandardMaterial, Color3, Color4, FollowCamera, UniversalCamera, Mesh, ShadowGenerator, DynamicTexture, Quaternion } from '@babylonjs/core';

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new Engine(canvas, true, { preserveDrawingBuffer:false, stencil:true, adaptToDeviceRatio:true });
const scene = new Scene(engine);
scene.clearColor = new Color4(0.55,0.72,0.82,1);
scene.collisionsEnabled = true;
scene.gravity = new Vector3(0,-0.28,0);

const hemi = new HemisphericLight('ambient',new Vector3(0,1,0),scene); hemi.intensity=.78;
const sun = new DirectionalLight('sun',new Vector3(-.45,-1,-.35),scene); sun.position=new Vector3(35,55,25); sun.intensity=1.15;
const shadows = new ShadowGenerator(1024,sun); shadows.useBlurExponentialShadowMap=true; shadows.blurKernel=16;

function mat(name:string,color:Color3,rough=.9){const m=new StandardMaterial(name,scene);m.diffuseColor=color;m.specularColor=new Color3(.08,.08,.08);m.roughness=rough;return m}
const grass=mat('grass',new Color3(.30,.49,.27)), road=mat('road',new Color3(.27,.30,.32)), sidewalk=mat('sidewalk',new Color3(.58,.59,.55)), wall=mat('school plaster',new Color3(.78,.75,.64)), roof=mat('roof',new Color3(.34,.19,.17)), glass=mat('glass',new Color3(.20,.48,.60),.25), wood=mat('wood',new Color3(.38,.23,.13)), leaf=mat('leaves',new Color3(.17,.39,.20)), white=mat('white',new Color3(.88,.88,.82)), asphaltLine=mat('line',new Color3(.86,.78,.53)), playerMat=mat('hoodie',new Color3(.83,.48,.17)), pants=mat('pants',new Color3(.12,.20,.34)), skin=mat('skin',new Color3(.76,.53,.38)), dark=mat('hair',new Color3(.12,.09,.07));
function box(name:string,x:number,y:number,z:number,w:number,h:number,d:number,m:StandardMaterial,collide=true){const b=MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);b.position.set(x,y+h/2,z);b.material=m;b.checkCollisions=collide;b.receiveShadows=true;shadows.addShadowCaster(b);return b}
function ground(x:number,z:number,w:number,d:number,m:StandardMaterial){const g=MeshBuilder.CreateGround('ground',{width:w,height:d},scene);g.position.set(x,0,z);g.material=m;g.receiveShadows=true;return g}
ground(0,0,120,120,grass);
// street grid and sidewalks
ground(0,0,12,120,road);ground(0,0,120,12,road);
ground(-8,0,3,120,sidewalk);ground(8,0,3,120,sidewalk);ground(0,-8,120,3,sidewalk);ground(0,8,120,3,sidewalk);
for(let z=-55;z<60;z+=8)box('road dash',0,.025,z,.22,.025,3,asphaltLine,false);
for(let x=-55;x<60;x+=8)box('road dash',x,.025,0,3,.025,.22,asphaltLine,false);

function building(name:string,x:number,z:number,w:number,d:number,floors:number,body:StandardMaterial,top:StandardMaterial){
  for(let f=0;f<floors;f++){box(name+' floor '+f,x, f*3.3,z,w,3.3,d,body); 
    for(let xx=-w/2+1.3;xx<w/2-0.5;xx+=2.4){const win=box(name+' window',x+xx,f*3.3+.85,z-d/2-.04,1.05,1.25,.12,glass,false);win.isPickable=true;}
  }
  box(name+' roof',x,floors*3.3,z,w+.5,.55,d+.5,top);
  const sign=MeshBuilder.CreateBox(name+' sign',{width:Math.min(w*.75,8),height:.65,depth:.16},scene);sign.position.set(x,floors*3.3*.65,z-d/2-.13);sign.material=white;
  return {x,z,w,d};
}
const school=building('Middle School',-24,-22,25,17,3,wall,roof);
const home=building('Family Home',-25,25,13,12,2,mat('home walls',new Color3(.69,.55,.42)),mat('home roof',new Color3(.25,.15,.13)));
const market=building('Market',24,-20,13,12,1,mat('market walls',new Color3(.76,.65,.43)),mat('market roof',new Color3(.18,.32,.25)));
const gym=building('Sports Hall',25,23,18,14,1,mat('gym walls',new Color3(.67,.70,.70)),mat('gym roof',new Color3(.22,.27,.34)));
// simple doorways and building front paths
for(const p of [school,home,market,gym]){ground(p.x,p.z+p.d/2+3,5,6,sidewalk)}
// park
for(let i=0;i<12;i++){const a=i*Math.PI/6;const x=25+Math.cos(a)*15,z=2+Math.sin(a)*13;const trunk=MeshBuilder.CreateCylinder('tree trunk',{height:2.2,diameter:.55},scene);trunk.position.set(x,1.1,z);trunk.material=wood;const crown=MeshBuilder.CreateBox('voxel crown',{size:3.2},scene);crown.position.set(x,3.3,z);crown.material=leaf;shadows.addShadowCaster(crown)}
// school playground and sports court
ground(-24,-4,25,12,mat('playground',new Color3(.42,.43,.40)));
ground(25,39,24,16,mat('court',new Color3(.20,.34,.43)));
for(let x=14;x<37;x+=2)box('court stripe',x,.03,39,.06,.025,15,white,false);
function makeLabel(text:string,x:number,z:number){const dt=new DynamicTexture('label',{width:512,height:128},scene,false);dt.hasAlpha=true;dt.drawText(text,18,84,'bold 52px Arial','#ffffff','transparent',true);const plane=MeshBuilder.CreatePlane('label',{width:9,height:2.25},scene);plane.position.set(x,7,z);plane.billboardMode=Mesh.BILLBOARDMODE_ALL;const m=new StandardMaterial('labelmat',scene);m.diffuseTexture=dt;m.emissiveColor=new Color3(1,1,1);m.disableLighting=true;plane.material=m}
makeLabel('ORTAOKUL',-24,-31);makeLabel('AİLE EVİ',-25,18);makeLabel('MARKET',24,-27);makeLabel('SPOR ALANI',25,30);

// player rig
const player=new Mesh('player-root',scene);player.position.set(-25,1,32);player.checkCollisions=true;player.ellipsoid=new Vector3(.48,.95,.48);player.ellipsoidOffset=new Vector3(0,.95,0);
const torso=MeshBuilder.CreateBox('hoodie',{width:.85,height:1.05,depth:.48},scene);torso.parent=player;torso.position.y=1.55;torso.material=playerMat;
const head=MeshBuilder.CreateBox('head',{size:.62},scene);head.parent=player;head.position.y=2.42;head.material=skin;
const hair=MeshBuilder.CreateBox('hair',{width:.66,height:.2,depth:.68},scene);hair.parent=player;hair.position.y=2.76;hair.material=dark;
const legL=MeshBuilder.CreateBox('left leg',{width:.29,height:.8,depth:.34},scene);legL.parent=player;legL.position.set(-.22,.55,0);legL.material=pants;
const legR=MeshBuilder.CreateBox('right leg',{width:.29,height:.8,depth:.34},scene);legR.parent=player;legR.position.set(.22,.55,0);legR.material=pants;
const bag=MeshBuilder.CreateBox('backpack',{width:.55,height:.7,depth:.24},scene);bag.parent=player;bag.position.set(0,1.55,.34);bag.material=mat('bag',new Color3(.10,.22,.43));
for(const mesh of [torso,head,hair,legL,legR,bag]){mesh.isPickable=false;shadows.addShadowCaster(mesh)}
// third person follow camera
const camera=new FollowCamera('follow',new Vector3(0,5,-9),scene);camera.lockedTarget=player;camera.radius=9;camera.heightOffset=4.1;camera.rotationOffset=180;camera.cameraAcceleration=.045;camera.maxCameraSpeed=18;camera.attachControl(canvas,true);scene.activeCamera=camera;
let firstPerson=false;
function toggleCamera(){firstPerson=!firstPerson;if(firstPerson){const c=new UniversalCamera('first person',player.position.add(new Vector3(0,2.5,0)),scene);c.parent=player;c.rotation=new Vector3(0,Math.PI,0);c.attachControl(canvas,true);scene.activeCamera=c}else{scene.activeCamera=camera}}
const keys=new Set<string>();window.addEventListener('keydown',e=>{keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==='e')interact();if(e.key.toLowerCase()==='c')toggleCamera();if(e.code==='Space')jump()});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
let joy={x:0,z:0},running=false,velocityY=0,onGround=true;
function jump(){if(onGround){velocityY=.22;onGround=false}}
function bindDirection(btn:HTMLElement,axis:'x'|'z',value:number){const down=(e:Event)=>{e.preventDefault();joy[axis]=value};const up=()=>{if(joy[axis]===value)joy[axis]=0};btn.addEventListener('pointerdown',down);['pointerup','pointercancel','pointerleave'].forEach(ev=>btn.addEventListener(ev,up))}
document.querySelectorAll<HTMLButtonElement>('[data-dir]').forEach(b=>{const d=b.dataset.dir!;if(d==='up')bindDirection(b,'z',1);if(d==='down')bindDirection(b,'z',-1);if(d==='left')bindDirection(b,'x',-1);if(d==='right')bindDirection(b,'x',1)});
document.getElementById('jump')!.addEventListener('pointerdown',jump);document.getElementById('use')!.addEventListener('pointerdown',interact);
const runBtn=document.createElement('button');runBtn.textContent='KOŞ';runBtn.className='run-extra';runBtn.style.cssText='position:fixed;right:18px;bottom:95px;padding:12px;border-radius:12px;background:#18304c;color:white;border:1px solid #ffffff55';document.getElementById('mobile-ui')!.append(runBtn);runBtn.addEventListener('pointerdown',()=>running=true);['pointerup','pointercancel','pointerleave'].forEach(ev=>runBtn.addEventListener(ev,()=>running=false));
const locations=[{...home,label:'Aile evi',kind:'home'},{...school,label:'Ortaokul',kind:'school'},{...market,label:'Market',kind:'market'},{...gym,label:'Spor alanı',kind:'park'}];
let cash=50,energy=100,hunger=85,minutes=420,day=1,quest=0;
const toastEl=document.getElementById('toast')!;
function toast(t:string){toastEl.textContent=t;toastEl.classList.add('show');setTimeout(()=>toastEl.classList.remove('show'),2400)}
function setQuest(title:string,txt:string){document.getElementById('questTitle')!.textContent=title;document.getElementById('questText')!.textContent=txt}
function interact(){let nearest=locations.map(l=>({...l,dist:Math.hypot(player.position.x-l.x,player.position.z-l.z)})).sort((a,b)=>a.dist-b.dist)[0];if(!nearest||nearest.dist>10){toast('Yakında etkileşim kurulabilecek bir yer yok.');return}
 document.getElementById('location')!.textContent='📍 '+nearest.label;
 if(nearest.kind==='school'){if(quest===0){quest=1;cash+=10;setQuest('Okula hoş geldin!','Müdürle tanıştın. Şimdi okul bahçesini keşfet.');toast('🏫 İlk görev tamamlandı · +₺10')}else toast('Dersler 08.30’da başlıyor. Okulu keşfet!')}
 if(nearest.kind==='home'){energy=Math.min(100,energy+30);toast('🏠 Evde dinlendin · +enerji')}
 if(nearest.kind==='market'){if(cash>=10){cash-=10;hunger=Math.min(100,hunger+25);toast('🥪 Atıştırmalık aldın · -₺10')}else toast('Alışveriş için paran yetersiz.')}
 if(nearest.kind==='park'){energy=Math.min(100,energy+12);toast('🌳 Parkta dinlendin · +enerji')}
 updateUI()}
function updateUI(){document.getElementById('cash')!.textContent='₺'+cash;document.getElementById('energyText')!.textContent=Math.round(energy)+'%';document.getElementById('hungerText')!.textContent=Math.round(hunger)+'%';(document.getElementById('energyBar') as HTMLElement).style.width=energy+'%';(document.getElementById('hungerBar') as HTMLElement).style.width=hunger+'%';document.getElementById('clock')!.textContent=String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0')}
setInterval(()=>{minutes++;if(minutes>=1440){minutes=360;day++;document.getElementById('weekday')!.textContent=['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'][(day-1)%7]}if(minutes%15===0){hunger=Math.max(0,hunger-.3);energy=Math.max(0,energy-.15)}updateUI()},1000);
scene.onBeforeRenderObservable.add(()=>{const dt=engine.getDeltaTime()/16.67;let x=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+joy.x;let z=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0)+joy.z;const len=Math.hypot(x,z);if(len>0){x/=len;z/=len;const fast=keys.has('shift')||running;const speed=(fast?0.19:0.105)*dt;const angle=Math.atan2(x,z);player.rotation.y=angle;player.moveWithCollisions(new Vector3(x*speed,velocityY*dt,z*speed));legL.rotation.x=Math.sin(performance.now()/90)*.45;legR.rotation.x=-legL.rotation.x;if(fast)energy=Math.max(0,energy-.025*dt)}else{legL.rotation.x*=.8;legR.rotation.x*=.8}
 if(!onGround){velocityY-=.012*dt;player.moveWithCollisions(new Vector3(0,velocityY*dt,0));if(player.position.y<=1){player.position.y=1;velocityY=0;onGround=true}}
 if(player.position.y<=1.02){player.position.y=1;onGround=true}
});
updateUI();engine.runRenderLoop(()=>scene.render());window.addEventListener('resize',()=>engine.resize());
