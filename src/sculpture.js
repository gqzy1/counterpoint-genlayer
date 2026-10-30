import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

export function createSculpture(host){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{renderer=null;}
  const canvas=renderer?.domElement||document.createElement('canvas');
  if(renderer){renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.6;}
  host.append(canvas);canvas.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,80);
  camera.position.set(7,4.4,9.8);camera.lookAt(0,1.1,0);
  const pmrem=renderer?new THREE.PMREMGenerator(renderer):null,env=pmrem?.fromScene(new RoomEnvironment(),.04);
  if(env)scene.environment=env.texture;
  const metal=new THREE.MeshStandardMaterial({color:0xd6dbdc,metalness:1,roughness:.24,side:THREE.DoubleSide});
  const red=new THREE.MeshStandardMaterial({color:0xd94429,metalness:.12,roughness:.32,side:THREE.DoubleSide});
  const dark=new THREE.MeshStandardMaterial({color:0x343532,metalness:.88,roughness:.32});
  const cream=new THREE.MeshStandardMaterial({color:0xeae4d5,roughness:.65});
  const art=new THREE.Group();scene.add(art);
  const add=(geo,mat,x,y,z,parent=art)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  // A folded continuous ribbon, built as a real three-dimensional surface.
  const ribbon=(r,w,twist,phase)=>{
    const positions=[],normals=[],uvs=[],indices=[],N=240,M=8;
    for(let i=0;i<=N;i++){
      const t=i/N*Math.PI*2;
      const center=new THREE.Vector3(Math.cos(t)*r,Math.sin(t)*r*.91,Math.sin(t*2+phase)*.36);
      const tangent=new THREE.Vector3(-Math.sin(t)*r,Math.cos(t)*r*.91,Math.cos(t*2+phase)*.72).normalize();
      const radial=new THREE.Vector3(Math.cos(t),Math.sin(t),0);
      const side=radial.applyAxisAngle(tangent,t*twist+phase);
      for(let j=0;j<=M;j++){
        const s=(j/M-.5)*w,point=center.clone().addScaledVector(side,s);
        point.z+=Math.sin(j/M*Math.PI)*.055;
        positions.push(point.x,point.y,point.z);uvs.push(i/N,j/M);
        if(i<N&&j<M){const a=i*(M+1)+j,b=a+M+1;indices.push(a,b,a+1,b,b+1,a+1);}
      }
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
  };
  const base=add(new THREE.CylinderGeometry(1.15,1.18,.32,96),cream,0,-1.57,0);
  const baseRing=add(new THREE.TorusGeometry(1.16,.008,8,128),dark,0,-1.40,0);baseRing.rotation.x=Math.PI/2;
  const stem=add(new THREE.CylinderGeometry(.023,.023,2.65,16),dark,0,-.1,0);
  const top=new THREE.Group();top.position.y=1.35;art.add(top);
  const main=add(ribbon(1.36,.75,1.5,.3),metal,0,.27,0,top);main.rotation.set(-.2,.48,.18);
  const inner=add(ribbon(.81,.37,-1,.8),red,.12,.27,0,top);inner.rotation.set(.65,-.55,-.35);
  const hoop=add(new THREE.TorusGeometry(1.95,.017,10,180),dark,0,.12,-.04,top);hoop.rotation.set(.2,.5,.16);
  const orb=add(new THREE.SphereGeometry(.23,40,28),cream,-1.72,-.49,.25,top);
  const counter=add(new THREE.CylinderGeometry(.42,.42,.07,64),red,1.6,.84,-.08,top);counter.rotation.set(1.2,.45,.4);
  const small=add(new THREE.SphereGeometry(.10,24,16),metal,1.4,-1.14,.33,top);
  const rod=(a,b)=>{const d=new THREE.Vector3().subVectors(b,a),m=add(new THREE.CylinderGeometry(.012,.012,d.length(),8),dark,0,0,0,top);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());};
  rod(new THREE.Vector3(-1.72,-.49,.25),new THREE.Vector3(1.6,.84,-.08));
  rod(new THREE.Vector3(0,-1.3,0),new THREE.Vector3(1.4,-1.14,.33));
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.12}));plane.rotation.x=-Math.PI/2;plane.position.y=-1.75;plane.receiveShadow=true;scene.add(plane);
  scene.add(new THREE.AmbientLight(0xffffff,2));
  const sun=new THREE.DirectionalLight(0xfff5e5,6);sun.position.set(-4,9,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-5;sun.shadow.camera.right=5;sun.shadow.camera.top=6;sun.shadow.camera.bottom=-5;sun.shadow.normalBias=.025;scene.add(sun);
  const cool=new THREE.DirectionalLight(0xcdd7ff,3);cool.position.set(6,3,-4);scene.add(cool);
  let px=0,py=0,tension=0,targetTension=0,running=true,raf,visible=true;
  host.addEventListener('pointermove',e=>{const b=host.getBoundingClientRect();px=(e.clientX-b.left)/b.width-.5;py=(e.clientY-b.top)/b.height-.5;});
  host.addEventListener('pointerleave',()=>{px=0;py=0;});
  let cw=1,ch=1,frames=0;const ctx=renderer?null:canvas.getContext('2d');
  const size=()=>{const {width,height}=host.getBoundingClientRect();if(!width||!height)return;cw=width;ch=height;if(renderer)renderer.setSize(width,height);else{canvas.width=Math.round(width*1.4);canvas.height=Math.round(height*1.4);}camera.aspect=width/height;camera.updateProjectionMatrix();if(renderer)renderer.render(scene,camera);else paintSoftware();};
  const resize=new ResizeObserver(size);resize.observe(host);size();
  const observe=new IntersectionObserver(entries=>visible=entries[0].isIntersecting);observe.observe(host);
  const clock=new THREE.Clock();
  const frame=()=>{if(!running)return;raf=requestAnimationFrame(frame);if(!visible||document.hidden)return;const t=clock.getElapsedTime();tension+=(targetTension-tension)*.035;
    art.rotation.y+=(px*.22+.18-art.rotation.y)*.025;
    top.rotation.z+=(tension*.24+py*.06-top.rotation.z)*.035;
    if(!reduced){main.rotation.y=.48+Math.sin(t*.18)*.15;inner.rotation.z=-.35+Math.sin(t*.25)*.1;top.position.y=1.35+Math.sin(t*.35)*.035;}
    if(renderer)renderer.render(scene,camera);else if(frames++%4===0)paintSoftware();
  };frame();host.classList.add('sculpture-ready');
  function paintSoftware(){
    if(!ctx)return;ctx.setTransform(1.4,0,0,1.4,0,0);ctx.clearRect(0,0,cw,ch);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    const triangles=[],light=new THREE.Vector3(-.5,.8,.6).normalize(),view=new THREE.Vector3();
    const shadowPoint=new THREE.Vector3(0,-1.74,0).project(camera);const sx=(shadowPoint.x+1)*cw/2,sy=(1-shadowPoint.y)*ch/2;
    ctx.save();ctx.translate(sx,sy);ctx.scale(1,.24);const gradient=ctx.createRadialGradient(0,0,0,0,0,cw*.27);gradient.addColorStop(0,'rgba(46,46,39,.18)');gradient.addColorStop(.4,'rgba(46,46,39,.09)');gradient.addColorStop(1,'rgba(46,46,39,0)');ctx.fillStyle=gradient;ctx.fillRect(-cw*.4,-cw*.4,cw*.8,cw*.8);ctx.restore();
    art.traverse(obj=>{if(!obj.isMesh)return;const pos=obj.geometry.attributes.position,index=obj.geometry.index,mat=obj.material;
      for(let i=0;i<(index?index.count:pos.count);i+=3){
        const a=new THREE.Vector3().fromBufferAttribute(pos,index?index.getX(i):i).applyMatrix4(obj.matrixWorld);
        const b=new THREE.Vector3().fromBufferAttribute(pos,index?index.getX(i+1):i+1).applyMatrix4(obj.matrixWorld);
        const c=new THREE.Vector3().fromBufferAttribute(pos,index?index.getX(i+2):i+2).applyMatrix4(obj.matrixWorld);
        const n=new THREE.Vector3().subVectors(b,a).cross(new THREE.Vector3().subVectors(c,a)).normalize();
        view.subVectors(camera.position,a).normalize();if(n.dot(view)<0){if(mat.side!==THREE.DoubleSide)continue;n.negate();}
        const pa=a.clone().project(camera),pb=b.clone().project(camera),pc=c.clone().project(camera);
        let color;if(mat===metal){const reflect=view.clone().negate().reflect(n);const band=Math.pow(Math.max(0,Math.sin(reflect.y*4+reflect.x*3+1.2)),2);const shine=Math.pow(Math.max(0,n.dot(light)),10);const shade=.35+.42*band+.4*shine+.12*Math.max(0,n.dot(light));color=`rgb(${Math.min(255,Math.round(216*shade))},${Math.min(255,Math.round(225*shade))},${Math.min(255,Math.round(231*shade))})`;}
        else {const shade=.58+.42*Math.max(0,n.dot(light));const base=mat===red?[211,66,39]:mat===dark?[66,69,63]:[222,218,201];color=`rgb(${base.map(v=>Math.round(v*shade)).join(',')})`;}
        triangles.push({p:[pa,pb,pc],z:(pa.z+pb.z+pc.z)/3,color});
      }
    });
    triangles.sort((a,b)=>b.z-a.z);for(const tri of triangles){ctx.beginPath();tri.p.forEach((p,i)=>{const x=(p.x+1)*cw/2,y=(1-p.y)*ch/2;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);});ctx.closePath();ctx.fillStyle=tri.color;ctx.strokeStyle=tri.color;ctx.lineWidth=.45;ctx.fill();ctx.stroke();}
  }
  return{setTension:v=>targetTension=v,dispose:()=>{running=false;cancelAnimationFrame(raf);resize.disconnect();observe.disconnect();renderer?.dispose();env?.dispose();pmrem?.dispose();}};
}
