import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, BookOpen, Check, ChevronDown, Clapperboard, Copy, Download,
  Eye, FileImage, Image as ImageIcon, Layers, ListOrdered, MessageSquare,
  Music, PanelLeft, Play, Plus, Save, Search, Settings2, Sparkles, Trash2,
  Upload, Users, Volume2, X, GripVertical, MonitorPlay, RotateCcw
} from 'lucide-react';

type BlockType = 'background' | 'character_enter' | 'character_exit' | 'dialogue' | 'cutscene' | 'transition' | 'ending';
type Block = {
  id: string; type: BlockType; label?: string; assetId?: string; speaker?: string; text?: string;
  characterId?: string; position?: 'left'|'center'|'right'; expression?: string; transition?: string;
  durationMs?: number; showName?: boolean; x?: number; y?: number; scale?: number;
};
type Asset = { id: string; name: string; kind: 'background'|'character'|'cg'|'audio'; url: string; builtin?: boolean; };
type Story = { title: string; description: string; visibility: 'private'|'public'; blocks: Block[] };
type Project = { id:string; title:string; description:string; updatedAt:number; story:Story; assets:Asset[] };

const starterAssets: Asset[] = [
  { id:'bg_city', name:'붉은 안개가 깔린 도시', kind:'background', url:'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1400&q=85', builtin:true },
  { id:'bg_station', name:'어두운 역 플랫폼', kind:'background', url:'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=85', builtin:true },
  { id:'bg_room', name:'낡은 실내', kind:'background', url:'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1400&q=85', builtin:true },
  { id:'cg_red', name:'붉은 빛의 컷신', kind:'cg', url:'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1600&q=90', builtin:true },
  { id:'char_yisang', name:'이상', kind:'character', url:'https://dcimg1.dcinside.com/viewimage.php?id=21b2d229f1dd35bf6db0c4a519c325298cf81e&no=24b0d769e1d32ca73cea81fa11d02831e8c8ccee733edc9dd120524d4729b2725ece096bc72a3eedbcc23f33c1b784397f8ba1b74d0b9cc29a718e9225e2d29349fcd754bde0e9bd8b7aa80762747d&orgExt', builtin:true },
  { id:'char_faust', name:'파우스트', kind:'character', url:'https://dcimg1.dcinside.com/viewimage.php?id=21b2d229f1dd35bf6db0c4a519c325298cf81e&no=24b0d769e1d32ca73cea83fa11d0283194e703ddecc64e07c2355c5f713cf0bc987b936a5c8253afa8e043871e678fd30698d6a5a515a93a81eca74e48d048db56441c406d4f9cf020fbcc83ecf7&orgExt', builtin:true },
  { id:'char_donquixote', name:'돈키호테', kind:'character', url:'/assets/characters/DonQuixote.png', builtin:true },
  { id:'char_ryoshu', name:'료슈', kind:'character', url:'https://dcimg1.dcinside.com/viewimage.php?id=21b2d229f1dd35bf6db0c4a519c325298cf81e&no=24b0d769e1d32ca73cea83fa11d0283194e703ddecc64e07c2355c5f713cf0bc987b936a5c8253afa8e043871e678fd30698d6a5a515a93a81eca74e48d048db56441e42691c9ef372fdcc83ecf7&orgExt', builtin:true },
  { id:'char_meursault', name:'뫼르소', kind:'character', url:'https://dcimg1.dcinside.com/viewimage.php?id=21b2d229f1dd35bf6db0c4a519c325298cf81e&no=24b0d769e1d32ca73cea83fa11d0283194e703ddecc64e07c2355c5f713cf0bc987b936a5c8253afa8e043871e678fd30698d6a5a515c45685e8a54d4bd04cd6fc49b9ac6192b6d5683f4054bdc922&orgExt', builtin:true },
  { id:'char_honglu', name:'홍루', kind:'character', url:'https://dcimg1.dcinside.com/viewimage.php?id=21b2d229f1dd35bf6db0c4a519c325298cf81e&no=24b0d769e1d32ca73cea83fa11d0283194e703ddecc64e07c2355c5f713cf0bc987b936a5c8253afa8e043871e678fd30698d6a5a515a93a81eca74e48d048db56441f113c4b9ff320a9cc83ecf7&orgExt', builtin:true },
  { id:'char_heathcliff', name:'히스클리프', kind:'character', url:'https://dcimg1.dcinside.com/viewimage.php?id=21b2d229f1dd35bf6db0c4a519c325298cf81e&no=24b0d769e1d32ca73cea83fa11d0283194e703ddecc64e07c2355c5f713cf0bc987b936a5c8253afa8e043871e678fd30698d6a5a515a93a81eca74e48d048db5644191338499fa522ffcc83ecf7&orgExt', builtin:true },
  { id:'char_ishmael', name:'이스마엘', kind:'character', url:'/assets/characters/Ishmael.png', builtin:true },
  { id:'char_rodion', name:'로쟈', kind:'character', url:'/assets/characters/Rodion.png', builtin:true },
  { id:'char_sinclair', name:'싱클레어', kind:'character', url:'/assets/characters/Sinclair.png', builtin:true },
  { id:'char_outis', name:'오티스', kind:'character', url:'https://dcimg1.dcinside.com/viewimage.php?id=21b2d229f1dd35bf6db0c4a519c325298cf81e&no=24b0d769e1d32ca73cea83fa11d0283194e703ddecc64e07c2355c5f713cf0bc987b936a5c8253afa8e043871e678fd30698d6a5a515c45685e8a54d4bd04cd6fc49b9f833c7e5d3683f4a54bdc922&orgExt', builtin:true },
  { id:'char_gregor', name:'그레고르', kind:'character', url:'https://dcimg1.dcinside.com/viewimage.php?id=21b2d229f1dd35bf6db0c4a519c325298cf81e&no=24b0d769e1d32ca73cea83fa11d0283194e703ddecc64e07c2355c5f713cf0bc987b936a5c8253afa8e043871e678fd30698d6a5a515c45685e8a54d4bd04cd6fc49b9ac62c2b7856c384b54bdc922&orgExt', builtin:true },
  { id:'char_dante', name:'단테', kind:'character', url:'https://dcimg1.dcinside.com/viewimage.php?id=21b2d229f1dd35bf6db0c4a519c325298cf81e&no=24b0d769e1d32ca73cea83fa11d0283194e703ddecc64e07c2355c5f713cf0bc987b936a5c8253afa8e043871e678fd30698d6a5a515c45685e8a54d4bd04cd6fc49b9f936c7bb83693e4d54bdc922&orgExt', builtin:true },
  { id:'char_vergilius', name:'베르길리우스', kind:'character', url:'https://dcimg1.dcinside.com/viewimage.php?id=21b2d229f1dd35bf6db0c4a519c325298cf81e&no=24b0d769e1d32ca73cea83fa11d0283194e703ddecc64e07c2355c5f713bf0bc41a0fb879d986b9e230f7c72ea50c2fac715a6d7d049582c6e1e4eabbf0ac8166f0657f87e594213d76870abfa21b9&orgExt', builtin:true },
  { id:'char_charon', name:'카론', kind:'character', url:'https://dcimg1.dcinside.com/viewimage.php?id=21b2d229f1dd35bf6db0c4a519c325298cf81e&no=24b0d769e1d32ca73cea83fa11d0283194e703ddecc64e07c2355c5f713bf0bc41a0fb879d986b9e230f7c72ea50c2fac715a6d7d04935406a1a4ca8bc0acc1beea9218c8570538fb2e03032c317&orgExt', builtin:true },
];

const starterBlocks: Block[] = [
  { id:'b1', type:'background', assetId:'bg_city', transition:'fade', durationMs:500 },
  { id:'b2', type:'character_enter', assetId:'char_yisang', characterId:'yisang', position:'left', expression:'기본' },
  { id:'b3', type:'dialogue', speaker:'이상', characterId:'ish', text:'...이곳의 풍경은 어딘가 익숙하면서도, 낯설군.', showName:true },
  { id:'b4', type:'dialogue', speaker:'단테', text:'주변을 살펴보자. 무언가 단서가 있을지도 몰라.', showName:true },
  { id:'b5', type:'cutscene', assetId:'cg_red', transition:'fade', durationMs:450 },
  { id:'b6', type:'dialogue', speaker:'내레이션', text:'붉은 안개 너머에서, 무언가가 천천히 움직였다.', showName:true },
  { id:'b7', type:'ending' }
];

const typeNames: Record<BlockType,string> = {
  background:'배경 변경', character_enter:'캐릭터 등장', character_exit:'캐릭터 퇴장',
  dialogue:'대사', cutscene:'컷신', transition:'화면 전환', ending:'스토리 종료'
};
const typeIcons: Record<BlockType, typeof ImageIcon> = {
  background:ImageIcon, character_enter:Users, character_exit:Users, dialogue:MessageSquare,
  cutscene:Clapperboard, transition:Layers, ending:Check
};
const uid = () => `b_${Math.random().toString(36).slice(2,9)}`;
const defaultStory = (): Story => ({
  title:'붉은 거리의 기록', description:'낯선 거리에서 시작되는 짧은 팬 스토리.',
  visibility:'private', blocks:starterBlocks.map(b=>({...b}))
});

function App() {
  const [story, setStory] = useState<Story>(defaultStory);
  const [page, setPage] = useState<'home'|'editor'>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string|null>(null);
  const [assets, setAssets] = useState<Asset[]>(starterAssets);
  const [selectedId, setSelectedId] = useState('b3');
  const [leftTab, setLeftTab] = useState<'blocks'|'assets'>('blocks');
  const [assetFilter, setAssetFilter] = useState<'all'|'background'|'character'|'cg'>('all');
  const [assetSearch, setAssetSearch] = useState('');
  const [mode, setMode] = useState<'edit'|'play'>('edit');
  const [playIndex, setPlayIndex] = useState(0);
  const [status, setStatus] = useState('모든 변경사항 저장됨');
  const [showImport, setShowImport] = useState(false);
  const [toast, setToast] = useState('');
  const [dragId, setDragId] = useState<string|null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const selected = story.blocks.find(b=>b.id===selectedId) ?? story.blocks[0];
  const selectedAsset = assets.find(a=>a.id===selected?.assetId);
  const visibleAssets = useMemo(()=>assets.filter(a=>
    (assetFilter==='all'||a.kind===assetFilter) && a.name.toLowerCase().includes(assetSearch.toLowerCase())
  ),[assets,assetFilter,assetSearch]);

  useEffect(()=>{
    try {
      const savedProjects = localStorage.getItem('backstage_projects_v1');
      if (savedProjects) {
        const parsed = JSON.parse(savedProjects) as Project[];
        if (Array.isArray(parsed)) { setProjects(parsed); return; }
      }
      const legacy = localStorage.getItem('backstage_story_v2');
      if (legacy) {
        const parsed = JSON.parse(legacy) as {story:Story; assets:Asset[]};
        if (parsed.story?.blocks?.length) {
          const migrated:Project = {id:`project_${Date.now()}`, title:parsed.story.title||'가져온 작품', description:parsed.story.description||'', updatedAt:Date.now(), story:parsed.story, assets:parsed.assets||starterAssets};
          setProjects([migrated]); localStorage.setItem('backstage_projects_v1',JSON.stringify([migrated]));
        }
      }
    } catch {}
  },[]);

  useEffect(()=>{
    const onKey = (e:KeyboardEvent)=>{
      if(mode==='play' && ['Space','Enter','ArrowRight'].includes(e.code)) {
        const tag=(e.target as HTMLElement)?.tagName;
        if(tag==='INPUT'||tag==='TEXTAREA') return;
        e.preventDefault(); advance();
      }
      if(mode==='play' && e.code==='Escape') setMode('edit');
    };
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  },[mode,playIndex,story.blocks]);

  function notify(message:string) { setToast(message); window.setTimeout(()=>setToast(''),2200); }
  function updateStory(patch:Partial<Story>) { setStory(s=>({...s,...patch})); setStatus('저장되지 않은 변경사항'); }
  function updateBlock(id:string, patch:Partial<Block>) {
    setStory(s=>({...s,blocks:s.blocks.map(b=>b.id===id?{...b,...patch}:b)}));
    setStatus('저장되지 않은 변경사항');
  }
  function addBlock(type:BlockType) {
    const b:Block = {id:uid(),type};
    if(type==='dialogue') Object.assign(b,{speaker:'화자',text:'새로운 대사를 입력하세요.',showName:true});
    if(type==='background'||type==='cutscene') Object.assign(b,{assetId:assets.find(a=>a.kind===(type==='background'?'background':'cg'))?.id,transition:'fade',durationMs:400});
    if(type==='character_enter') { const firstChar=assets.find(a=>a.kind==='character'); Object.assign(b,{assetId:firstChar?.id,characterId:firstChar?.id||'character_new',position:'right',expression:'기본'}); }
    if(type==='character_exit') Object.assign(b,{characterId:''});
    if(type==='transition') Object.assign(b,{transition:'fade',durationMs:500});
    const index = selected ? story.blocks.findIndex(x=>x.id===selected.id)+1 : story.blocks.length;
    const blocks=[...story.blocks]; blocks.splice(index,0,b);
    updateStory({blocks}); setSelectedId(b.id); setLeftTab('blocks');
  }
  function removeBlock(id:string) {
    if(story.blocks.length<=1) { notify('최소 한 개의 블록은 남겨야 해요.'); return; }
    const next=story.blocks.filter(b=>b.id!==id); updateStory({blocks:next});
    if(selectedId===id) setSelectedId(next[Math.max(0,next.length-1)].id);
  }
  function moveBlock(id:string, direction:-1|1) {
    const from=story.blocks.findIndex(b=>b.id===id), to=from+direction;
    if(to<0||to>=story.blocks.length) return;
    const blocks=[...story.blocks]; [blocks[from],blocks[to]]=[blocks[to],blocks[from]];
    updateStory({blocks});
  }
  function persistProjects(next:Project[]) {
    setProjects(next);
    try { localStorage.setItem('backstage_projects_v1',JSON.stringify(next)); } catch { notify('작품 목록 저장에 실패했어요. 업로드 이미지 용량을 확인해 주세요.'); }
  }
  function saveLocal() {
    const project:Project = {id:activeProjectId||`project_${Date.now()}`, title:story.title||'제목 없는 작품', description:story.description||'', updatedAt:Date.now(), story, assets};
    const next = activeProjectId ? projects.map(p=>p.id===activeProjectId?project:p) : [project,...projects];
    setActiveProjectId(project.id); persistProjects(next);
    try { localStorage.setItem('backstage_story_v2',JSON.stringify({story,assets})); setStatus('브라우저에 저장됨'); notify('작품을 내 작업실에 저장했어요.'); }
    catch { notify('저장에 실패했어요. 업로드한 이미지가 너무 큰지 확인해 주세요.'); }
  }
  function createProject() {
    const titleInput=window.prompt('새 작품 제목을 입력하세요.','새로운 팬 스토리');
    if(titleInput===null) return;
    const title=titleInput.trim();
    if(!title) { notify('작품 제목을 입력해 주세요.'); return; }
    const descriptionInput=window.prompt('작품 소개를 입력하세요.','');
    if(descriptionInput===null) return;
    const nextStory={...defaultStory(),title,description:descriptionInput.trim(),blocks:starterBlocks.map(b=>({...b}))};
    const project:Project={id:`project_${Date.now()}`,title,description:nextStory.description,updatedAt:Date.now(),story:nextStory,assets:starterAssets};
    setStory(nextStory); setAssets(starterAssets); setActiveProjectId(project.id); setSelectedId(nextStory.blocks[2]?.id||nextStory.blocks[0].id); setLeftTab('blocks'); setMode('edit'); setPage('editor'); setStatus('저장되지 않은 변경사항'); persistProjects([project,...projects]);
  }
  function editProjectInfo(project:Project) {
    const titleInput=window.prompt('작품 제목 수정',project.title);
    if(titleInput===null) return;
    const title=titleInput.trim(); if(!title) { notify('작품 제목은 비워둘 수 없어요.'); return; }
    const descriptionInput=window.prompt('작품 소개 수정',project.description||'');
    if(descriptionInput===null) return;
    const updated={...project,title,description:descriptionInput.trim(),story:{...project.story,title,description:descriptionInput.trim()},updatedAt:Date.now()};
    persistProjects(projects.map(p=>p.id===project.id?updated:p));
    if(activeProjectId===project.id) { setStory(updated.story); setStatus('저장되지 않은 변경사항'); }
    notify('작품 정보를 수정했어요.');
  }
  function openProject(project:Project) {
    setStory(project.story); setAssets(project.assets||starterAssets); setActiveProjectId(project.id); setSelectedId(project.story.blocks[0]?.id||''); setLeftTab('blocks'); setMode('edit'); setPage('editor'); setStatus('저장된 작품');
  }
  function deleteProject(project:Project) {
    if(!window.confirm(`'${project.title}' 작품을 내 작업실에서 삭제할까요?`)) return;
    const next=projects.filter(p=>p.id!==project.id); persistProjects(next);
    if(activeProjectId===project.id) setActiveProjectId(null);
    notify('작품을 삭제했어요.');
  }
  function returnHome() {
    const project:Project={id:activeProjectId||`project_${Date.now()}`,title:story.title||'제목 없는 작품',description:story.description||'',updatedAt:Date.now(),story,assets};
    const next=activeProjectId?projects.map(p=>p.id===activeProjectId?project:p):[project,...projects];
    persistProjects(next); setActiveProjectId(project.id); setPage('home'); setMode('edit');
  }
  function exportStory() {
    const blob=new Blob([JSON.stringify({schemaVersion:1,story,assets:assets.filter(a=>!a.builtin)},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${story.title.replace(/[\\/:*?"<>|]/g,'_')||'story'}.json`; document.body.appendChild(a); a.click(); a.remove(); window.setTimeout(()=>URL.revokeObjectURL(url),1000);
    notify('스토리 JSON을 내보냈어요.');
  }
  function importStory(file?:File) {
    if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>{
      try {
        const data=JSON.parse(String(reader.result));
        const nextStory=data.story ?? data;
        if(!Array.isArray(nextStory.blocks)||!nextStory.blocks.length) throw new Error('invalid');
        setStory({...defaultStory(),...nextStory});
        if(Array.isArray(data.assets)) setAssets([...starterAssets,...data.assets.filter((a:Asset)=>!starterAssets.some(s=>s.id===a.id))]);
        setSelectedId(nextStory.blocks[0].id); setMode('edit'); setShowImport(false); notify('스토리를 불러왔어요.');
      } catch { notify('올바른 스토리 JSON 파일이 아니에요.'); }
    };
    reader.readAsText(file);
  }
  async function uploadFiles(fileList:FileList|null) {
    if(!fileList) return;
    const additions:Asset[]=[];
    for(const file of Array.from(fileList)) {
      if(!file.type.startsWith('image/')) { notify('이미지 파일만 업로드할 수 있어요.'); continue; }
      if(file.size>15*1024*1024) { notify('파일당 최대 15MB까지 업로드할 수 있어요.'); continue; }
      let kind:Asset['kind']='background';
      const picked=window.prompt(`'${file.name}'의 에셋 종류를 선택하세요.\n1 = 배경\n2 = 캐릭터\n3 = 컷신`, '1');
      if(picked===null) continue;
      if(picked==='2') kind='character'; else if(picked==='3') kind='cg'; else if(picked!=='1') { notify('종류를 1, 2, 3 중에서 선택해 주세요.'); continue; }
      try {
        const dataUrl=await new Promise<string>((resolve,reject)=>{
          const reader=new FileReader(); reader.onerror=()=>reject(new Error('read failed'));
          reader.onload=()=>{
            const img=new Image(); img.onerror=()=>reject(new Error('image failed'));
            img.onload=()=>{
              const max=1800, ratio=Math.min(1,max/Math.max(img.width,img.height));
              const canvas=document.createElement('canvas'); canvas.width=Math.round(img.width*ratio); canvas.height=Math.round(img.height*ratio);
              const ctx=canvas.getContext('2d'); if(!ctx) { reject(new Error('canvas failed')); return; }
              ctx.drawImage(img,0,0,canvas.width,canvas.height);
              const transparent=file.type==='image/png' || file.type==='image/webp';
              resolve(transparent?canvas.toDataURL('image/png'):canvas.toDataURL('image/jpeg',0.84));
            };
            img.src=String(reader.result);
          }; reader.readAsDataURL(file);
        });
        additions.push({id:`upload_${uid()}`,name:file.name.replace(/\.[^.]+$/,''),kind,url:dataUrl,builtin:false});
      } catch { notify(`${file.name} 파일을 읽지 못했어요.`); }
    }
    if(additions.length) { setAssets(a=>[...a,...additions]); setLeftTab('assets'); setAssetFilter('all'); setStatus('저장되지 않은 변경사항'); notify(`${additions.length}개 에셋을 추가했어요. 원본 파일과 별도로 이미지 사본이 들어갑니다. 작품 저장도 눌러 주세요.`); }
    if(uploadRef.current) uploadRef.current.value='';
  }
  function deleteAsset(asset:Asset) {
    if(asset.builtin) { notify('기본 에셋은 삭제할 수 없어요.'); return; }
    if(!window.confirm(`'${asset.name}' 에셋을 삭제할까요? 이 에셋을 사용하는 블록에서는 이미지가 사라집니다.`)) return;
    setAssets(list=>list.filter(a=>a.id!==asset.id));
    setStory(s=>({...s,blocks:s.blocks.map(b=>b.assetId===asset.id?{...b,assetId:undefined}:b)}));
    if(asset.url.startsWith('blob:')) URL.revokeObjectURL(asset.url);
    setStatus('저장되지 않은 변경사항'); notify('에셋을 삭제했어요.');
  }
  function chooseAsset(asset:Asset) {
    if(!selected) return;
    if(selected.type==='background'||selected.type==='cutscene') updateBlock(selected.id,{assetId:asset.id});
    else if(selected.type==='character_enter' && asset.kind==='character') updateBlock(selected.id,{assetId:asset.id,characterId:asset.id});
    else notify('현재 블록에서는 에셋을 선택할 수 없어요.');
  }
  function startPlay() { setPlayIndex(0); setMode('play'); }
  function advance() {
    if(playIndex<story.blocks.length-1) setPlayIndex(i=>Math.min(story.blocks.length-1,i+1));
    else setMode('edit');
  }
  function duplicateBlock(b:Block) {
    const copy={...b,id:uid()};
    const idx=story.blocks.findIndex(x=>x.id===b.id);
    const blocks=[...story.blocks]; blocks.splice(idx+1,0,copy); updateStory({blocks}); setSelectedId(copy.id);
  }
  function handleDrop(targetId:string) {
    if(!dragId||dragId===targetId) return;
    const blocks=[...story.blocks], from=blocks.findIndex(b=>b.id===dragId), to=blocks.findIndex(b=>b.id===targetId);
    const [moved]=blocks.splice(from,1); blocks.splice(to,0,moved); updateStory({blocks}); setDragId(null);
  }
  const currentPlay=story.blocks[playIndex];
  const currentAsset=assets.find(a=>a.id===currentPlay?.assetId);
  const bgBlock=[...story.blocks.slice(0,playIndex+1)].reverse().find(b=>b.type==='background');
  const bgAsset=assets.find(a=>a.id===bgBlock?.assetId);
  const selectedIndex = Math.max(0, story.blocks.findIndex(b => b.id === selectedId));
  const activePreviewCharacters = useMemo(() => {
    const active: Block[] = [];
    story.blocks.slice(0, selectedIndex + 1).forEach(b => {
      if (b.type === 'character_enter' && b.assetId) {
        const key = b.characterId || b.assetId;
        const existing = active.findIndex(x => (x.characterId || x.assetId) === key);
        if (existing >= 0) active.splice(existing, 1);
        active.push(b);
      } else if (b.type === 'character_exit') {
        if (b.characterId) { const idx = active.findIndex(x => (x.characterId || x.assetId) === b.characterId); if (idx >= 0) active.splice(idx, 1); }
        else active.splice(0, active.length);
      }
    });
    return active;
  }, [story.blocks, selectedIndex]);
  const activePlayCharacters = useMemo(() => {
    const active: Block[] = [];
    story.blocks.slice(0, playIndex + 1).forEach(b => {
      if (b.type === 'character_enter' && b.assetId) {
        const key = b.characterId || b.assetId;
        const existing = active.findIndex(x => (x.characterId || x.assetId) === key);
        if (existing >= 0) active.splice(existing, 1);
        active.push(b);
      } else if (b.type === 'character_exit') {
        if (b.characterId) { const idx = active.findIndex(x => (x.characterId || x.assetId) === b.characterId); if (idx >= 0) active.splice(idx, 1); }
        else active.splice(0, active.length);
      }
    });
    return active;
  }, [story.blocks, playIndex]);
  const isCutscene=currentPlay?.type==='cutscene';
  const isDialogue=currentPlay?.type==='dialogue';

  if(page==='home') return (
    <div className="home-shell">
      <header className="home-topbar">
        <div className="brand"><div className="brand-mark"><BookOpen size={19}/></div><div><div className="brand-name">BACKSTAGE</div><div className="brand-sub">FAN STORY STUDIO</div></div></div>
        <div className="home-top-note">나만의 이야기를 만들고, 장면으로 완성하세요.</div>
        <button className="primary-btn" onClick={createProject}><Plus size={16}/> 새 작품 만들기</button>
      </header>
      <main className="home-main">
        <section className="home-hero"><div className="hero-kicker"><Sparkles size={14}/> YOUR STORY, YOUR STAGE</div><h1>내 작업실</h1><p>이야기를 만들고, 캐릭터를 배치하고, 나만의 장면을 연출해 보세요.</p><button className="primary-btn hero-cta" onClick={createProject}><Plus size={16}/> 첫 작품 시작하기</button><div className="hero-decoration"><span>Ｂ</span><i/><i/><i/></div></section>
        <section className="project-section"><div className="section-title-row"><div><h2>내 작품</h2><p>이 브라우저에 저장된 작품이에요.</p></div><span className="project-count">{projects.length}개 작품</span></div>
          {projects.length===0 ? <div className="empty-projects"><div className="empty-project-icon"><BookOpen size={25}/></div><h3>아직 만든 작품이 없어요</h3><p>새 작품을 만들면 이곳에서 이어서 편집할 수 있어요.</p><button className="outline-btn" onClick={createProject}><Plus size={14}/> 작품 만들기</button></div> : <div className="project-grid">{projects.slice().sort((a,b)=>b.updatedAt-a.updatedAt).map(project=><article className="project-card" key={project.id}><button className="project-open" onClick={()=>openProject(project)}><div className="project-cover"><div className="cover-mark"><BookOpen size={24}/></div><span>BACKSTAGE ORIGINAL</span></div><div className="project-card-body"><div className="project-card-title">{project.title||'제목 없는 작품'}</div><p>{project.description||'작품 설명이 없습니다.'}</p><div className="project-meta"><span>{project.story?.blocks?.length||0}개 블록</span><span>{new Date(project.updatedAt).toLocaleDateString('ko-KR')}</span></div></div></button><button className="project-edit-info" title="제목 및 소개 수정" onClick={()=>editProjectInfo(project)}><Settings2 size={14}/></button><button className="project-delete" title="작품 삭제" onClick={()=>deleteProject(project)}><Trash2 size={15}/></button></article>)}</div>}
        </section>
        <section className="home-tips"><div><Layers size={18}/><strong>타임라인 편집</strong><span>블록을 쌓아 장면의 흐름을 만들어요.</span></div><div><Users size={18}/><strong>캐릭터 연출</strong><span>여러 캐릭터의 위치와 크기를 조절해요.</span></div><div><Eye size={18}/><strong>장면 미리보기</strong><span>완성한 이야기를 직접 재생해 봐요.</span></div></section>
      </main><footer className="home-footer"><span>BACKSTAGE STUDIO</span><span>PROTOTYPE · 작품은 현재 브라우저에 저장됩니다.</span></footer>
      {toast&&<div className="toast"><Check size={15}/>{toast}</div>}
    </div>
  );

  if(mode==='play') return (
    <div className="player-shell">
      <div className="player-top"><button className="icon-btn" onClick={()=>setMode('edit')}><ArrowLeft size={18}/></button><span>{story.title}</span><span className="player-counter">{playIndex+1} / {story.blocks.length}</span><button className="icon-btn" onClick={()=>notify('사운드 기능은 다음 버전에 추가할 예정이에요.')}><Volume2 size={17}/></button><button className="icon-btn" onClick={()=>setMode('edit')}><Settings2 size={17}/></button></div>
      <div key={playIndex} className={`play-stage ${currentPlay?.type==='transition'?`play-transition effect-${currentPlay.transition||'fade'}`:currentPlay?.transition&&['background','cutscene'].includes(currentPlay.type)?`play-transition effect-${currentPlay.transition}`:''}`} onClick={advance} style={{backgroundImage:`linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.45)),url("${(isCutscene?currentAsset?.url:bgAsset?.url)||''}")`}}>
        {isCutscene&&currentAsset&&<img className="cutscene-img" src={currentAsset.url} alt={currentAsset.name}/>}
        {!isCutscene&&activePlayCharacters.map((charBlock, index)=>{const charAsset=assets.find(a=>a.id===charBlock.assetId); return charAsset ? <img key={`${charBlock.id}-${index}`} className="player-character freely-positioned" style={{left:`${charBlock.x ?? (charBlock.position==='right'?78:charBlock.position==='center'?50:22)}%`,top:`${charBlock.y ?? 100}%`,height:`${charBlock.scale ?? 85}%`,transform:'translate(-50%,-100%)'}} src={charAsset.url} alt={charAsset.name}/> : null;})}
        {currentPlay?.type==='transition'&&<div key={`${currentPlay.id}-${playIndex}`} className={`transition-screen effect-${currentPlay.transition||'fade'}`} style={{animationDuration:`${Math.max(100,currentPlay.durationMs||500)}ms`}} />}
        {isDialogue&&<div className="dialogue-box"><div className="speaker-name">{currentPlay.showName!==false?currentPlay.speaker:''}</div><div className="dialogue-text">{currentPlay.text}</div><div className="dialogue-hint">클릭 또는 Space / Enter</div></div>}
        {currentPlay?.type==='ending'&&<div className="ending-card"><Sparkles size={28}/><h2>이야기가 끝났습니다</h2><p>{story.title}</p><button className="primary-btn" onClick={e=>{e.stopPropagation();setPlayIndex(0)}}><RotateCcw size={15}/> 다시 보기</button><button className="secondary-btn" onClick={e=>{e.stopPropagation();setMode('edit')}}>편집기로 돌아가기</button></div>}
      </div>
      <div className="player-bottom"><span>BACKSTAGE · FAN STORY PLAYER</span><button className="primary-btn" onClick={advance}><Play size={15}/> {playIndex===story.blocks.length-1?'종료':'다음'}</button></div>
    </div>
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><BookOpen size={19}/></div><div><div className="brand-name">BACKSTAGE</div><div className="brand-sub">FAN STORY STUDIO</div></div></div>
        <div className="topbar-center"><button className="breadcrumb home-link" onClick={returnHome}>내 작업실</button><span className="crumb-slash">/</span><span className="current-title">{story.title}</span></div>
        <div className="top-actions">
          <span className={`save-status ${status.includes('저장되지')?'unsaved':''}`}><span className="status-dot"/>{status}</span>
          <button className="subtle-btn" onClick={()=>setShowImport(true)}><Download size={15}/> 불러오기</button>
          <button className="subtle-btn" onClick={exportStory}><Download size={15}/> 내보내기</button>
          <button className="primary-btn" onClick={saveLocal}><Save size={15}/> 저장</button>
          <button className="primary-btn preview-btn" onClick={startPlay}><Play size={15}/> 미리보기</button>
        </div>
      </header>

      <main className="studio">
        <aside className="left-panel">
          <div className="panel-tabs"><button className={leftTab==='blocks'?'active':''} onClick={()=>setLeftTab('blocks')}><Layers size={15}/> 블록</button><button className={leftTab==='assets'?'active':''} onClick={()=>setLeftTab('assets')}><ImageIcon size={15}/> 에셋</button></div>
          {leftTab==='blocks'?<div className="block-library">
            <div className="panel-heading">스토리 블록 <span>추가할 블록 선택</span></div>
            {(['dialogue','background','character_enter','character_exit','cutscene','transition','ending'] as BlockType[]).map(type=>{
              const Icon=typeIcons[type]; return <button key={type} className="library-item" onClick={()=>addBlock(type)}><span className={`library-icon icon-${type}`}><Icon size={16}/></span><span className="library-label">{typeNames[type]}<small>{({dialogue:'화자와 대사 입력',background:'장면 배경 이미지',character_enter:'캐릭터를 화면에 표시',character_exit:'화면에서 캐릭터 제거',cutscene:'전체 화면 일러스트',transition:'페이드 및 암전 효과',ending:'스토리 종료 지점'} as Record<BlockType,string>)[type]}</small></span><Plus size={15} className="add-icon"/></button>
            })}
            <div className="panel-tip"><Sparkles size={15}/><span>블록을 선택하면 오른쪽에서 세부 설정을 편집할 수 있어요.</span></div>
          </div>:<div className="asset-library">
            <div className="panel-heading">에셋 보관함 <span>{assets.length}개</span></div>
            <div className="asset-search"><Search size={14}/><input value={assetSearch} onChange={e=>setAssetSearch(e.target.value)} placeholder="에셋 검색"/></div>
            <div className="asset-filters">{(['all','background','character','cg'] as const).map(f=><button key={f} className={assetFilter===f?'active':''} onClick={()=>setAssetFilter(f)}>{({all:'전체',background:'배경',character:'캐릭터',cg:'컷신'} as Record<string,string>)[f]}</button>)}</div>
            <div className="asset-grid">{visibleAssets.map(asset=><div key={asset.id} className={`asset-card-wrap ${selected?.assetId===asset.id?'chosen':''}`}><button className={`asset-card ${selected?.assetId===asset.id?'chosen':''}`} onClick={()=>chooseAsset(asset)}><img src={asset.url} alt=""/><span>{asset.name}</span>{asset.builtin&&<small>기본</small>}</button>{!asset.builtin&&<button className="asset-delete" title="에셋 삭제" onClick={()=>deleteAsset(asset)}><Trash2 size={12}/></button>}</div>)}</div>
            <button className="upload-btn" onClick={()=>uploadRef.current?.click()}><Upload size={15}/> 이미지 업로드</button>
            <input ref={uploadRef} type="file" accept="image/*" multiple hidden onChange={e=>uploadFiles(e.target.files)}/>
            <p className="muted-note">이미지 최대 8MB · PNG, JPG, WebP 권장</p>
          </div>}
        </aside>

        <section className="workspace">
          <div className="workspace-toolbar"><div className="view-label"><MonitorPlay size={16}/><span>장면 미리보기</span><span className="live-pill"><span/> LIVE</span></div><div className="workspace-tools"><button onClick={startPlay}><Play size={14}/> 재생</button><button onClick={()=>notify('캔버스 확대/축소는 다음 버전에 추가할 예정이에요.')}><Settings2 size={14}/> 화면 설정</button></div></div>
          <div className="preview-wrap">
            <div className="preview-stage" style={{backgroundImage:`linear-gradient(180deg,rgba(8,8,10,.05),rgba(8,8,10,.45)),url("${(selected?.type==='cutscene'?selectedAsset?.url:bgAsset?.url)||selectedAsset?.url||''}")`}}>
              {selected?.type==='cutscene'&&selectedAsset&&<img className="preview-cutscene" src={selectedAsset.url} alt="컷신"/>}
              {activePreviewCharacters.map((charBlock, index)=>{const charAsset=assets.find(a=>a.id===charBlock.assetId); return charAsset ? <img key={`${charBlock.id}-${index}`} className="preview-character freely-positioned" style={{left:`${charBlock.x ?? (charBlock.position==='right'?78:charBlock.position==='center'?50:22)}%`,top:`${charBlock.y ?? 100}%`,height:`${charBlock.scale ?? 85}%`,transform:'translate(-50%,-100%)'}} src={charAsset.url} alt={charAsset.name}/> : null;})}
              {selected?.type==='dialogue'&&<div className="preview-dialogue"><div className="preview-speaker">{selected.speaker||'화자'}</div><div>{selected.text||'대사를 입력하세요.'}</div><span>▼</span></div>}
              {selected?.type==='transition'&&<div className={`transition-screen effect-${selected.transition||'fade'}`} />}
              {selected?.type==='ending'&&<div className="preview-ending"><Sparkles size={20}/> STORY END</div>}
              
              <div className="preview-watermark">BACKSTAGE / PREVIEW</div>
            </div>
          </div>
          <div className="timeline">
            <div className="timeline-header"><div><ListOrdered size={16}/><strong>스토리 타임라인</strong><span>{story.blocks.length} blocks</span></div><button onClick={()=>addBlock('dialogue')}><Plus size={14}/> 대사 추가</button></div>
            <div className="timeline-list">{story.blocks.map((b,i)=>{
              const Icon=typeIcons[b.type]; return <div key={b.id} draggable onDragStart={()=>setDragId(b.id)} onDragOver={e=>e.preventDefault()} onDrop={()=>handleDrop(b.id)} onDragEnd={()=>setDragId(null)} className={`timeline-item ${selectedId===b.id?'selected':''} ${dragId===b.id?'dragging':''}`} onClick={()=>setSelectedId(b.id)}>
                <GripVertical size={14} className="grip"/><span className="timeline-number">{String(i+1).padStart(2,'0')}</span><span className={`timeline-icon icon-${b.type}`}><Icon size={14}/></span><div className="timeline-copy"><strong>{typeNames[b.type]}</strong><small>{b.type==='dialogue'?(b.speaker||'화자')+' · '+(b.text||'').slice(0,24):b.type==='background'||b.type==='cutscene'?assets.find(a=>a.id===b.assetId)?.name||'에셋 미지정':b.type==='character_enter'?(b.characterId||'캐릭터')+' · '+(b.position||'left'):'연출 설정'}</small></div><div className="timeline-controls"><button title="위로" onClick={e=>{e.stopPropagation();moveBlock(b.id,-1)}} disabled={i===0}><ChevronDown size={13} className="up-chevron"/></button><button title="아래로" onClick={e=>{e.stopPropagation();moveBlock(b.id,1)}} disabled={i===story.blocks.length-1}><ChevronDown size={13}/></button></div>
              </div>
            })}</div>
          </div>
        </section>

        <aside className="right-panel">
          <div className="right-header"><div><Settings2 size={16}/><strong>블록 속성</strong></div><span className="type-chip">{selected?typeNames[selected.type]:'선택 없음'}</span></div>
          {selected?<div className="properties">
            <div className="property-section"><label>블록 이름</label><div className="block-title-row"><span className={`library-icon icon-${selected.type}`}>{(()=>{const Icon=typeIcons[selected.type];return <Icon size={16}/>})()}</span><strong>{typeNames[selected.type]}</strong><div className="spacer"/><button className="mini-icon" title="복제" onClick={()=>duplicateBlock(selected)}><Copy size={14}/></button><button className="mini-icon danger" title="삭제" onClick={()=>removeBlock(selected.id)}><Trash2 size={14}/></button></div></div>
            {selected.type==='dialogue'&&<>
              <div className="property-section"><label>화자 이름</label><input className="field" value={selected.speaker||''} onChange={e=>updateBlock(selected.id,{speaker:e.target.value})} placeholder="화자 이름"/></div>
              <div className="property-section"><label>대사 내용</label><textarea className="field textarea" rows={5} value={selected.text||''} onChange={e=>updateBlock(selected.id,{text:e.target.value})} placeholder="대사를 입력하세요."/><div className="field-foot">{(selected.text||'').length}자</div></div>
              <label className="toggle-row"><span><strong>이름표 표시</strong><small>대사창 위에 화자 이름을 표시합니다.</small></span><input type="checkbox" checked={selected.showName!==false} onChange={e=>updateBlock(selected.id,{showName:e.target.checked})}/></label>
            </>}
            {(selected.type==='background'||selected.type==='cutscene'||selected.type==='character_enter')&&<>
              <div className="property-section"><label>연결된 에셋</label>{selectedAsset?<div className="selected-asset"><img src={selectedAsset.url} alt=""/><div><strong>{selectedAsset.name}</strong><small>{selectedAsset.builtin?'기본 에셋':'업로드 에셋'}</small></div></div>:<div className="empty-asset">왼쪽 에셋 탭에서 이미지를 선택하세요.</div>}<button className="outline-btn full" onClick={()=>setLeftTab('assets')}><FileImage size={14}/> 에셋 선택하기</button></div>
              {selected.type==='character_enter'&&<>
                <div className="property-section"><label>캐릭터 ID</label><input className="field" value={selected.characterId||''} onChange={e=>updateBlock(selected.id,{characterId:e.target.value})}/></div>
                <div className="property-section"><label>화면 위치</label><div className="segmented">{(['left','center','right'] as const).map(p=><button key={p} className={selected.position===p?'active':''} onClick={()=>updateBlock(selected.id,{position:p})}>{({left:'왼쪽',center:'중앙',right:'오른쪽'} as Record<string,string>)[p]}</button>)}</div></div>
                <div className="property-section"><label>표정 / 포즈 메모</label><input className="field" value={selected.expression||''} onChange={e=>updateBlock(selected.id,{expression:e.target.value})}/></div>
                <div className="property-section"><label>캐릭터 가로 위치 ({selected.x ?? (selected.position==='right'?78:selected.position==='center'?50:22)}%)</label><input className="range-field" type="range" min={0} max={100} value={selected.x ?? (selected.position==='right'?78:selected.position==='center'?50:22)} onChange={e=>updateBlock(selected.id,{x:Number(e.target.value)})}/></div>
                <div className="property-section"><label>캐릭터 세로 위치 ({selected.y ?? 100}%)</label><input className="range-field" type="range" min={10} max={100} value={selected.y ?? 100} onChange={e=>updateBlock(selected.id,{y:Number(e.target.value)})}/></div>
                <div className="property-section"><label>캐릭터 크기 ({selected.scale ?? 85}%)</label><input className="range-field" type="range" min={20} max={140} value={selected.scale ?? 85} onChange={e=>updateBlock(selected.id,{scale:Number(e.target.value)})}/></div>
              </>}
              <div className="property-section"><label>전환 효과</label><select className="field" value={selected.transition||'fade'} onChange={e=>updateBlock(selected.id,{transition:e.target.value})}><option value="none">없음</option><option value="fade">페이드</option><option value="blackout">암전</option></select></div>
              <div className="property-section"><label>전환 시간 (ms)</label><input className="field" type="number" min={0} max={5000} step={100} value={selected.durationMs??400} onChange={e=>updateBlock(selected.id,{durationMs:Math.max(0,Math.min(5000,Number(e.target.value)))})}/></div>
            </>}
            {selected.type==='transition'&&<>
              <div className="property-section"><label>효과 종류</label><select className="field" value={selected.transition||'fade'} onChange={e=>updateBlock(selected.id,{transition:e.target.value})}><option value="fade">페이드</option><option value="blackout">암전</option><option value="flash">플래시 (미리보기 대체 표시)</option></select></div>
              <div className="property-section"><label>지속 시간 (ms)</label><input className="field" type="number" min={0} max={5000} value={selected.durationMs??500} onChange={e=>updateBlock(selected.id,{durationMs:Number(e.target.value)})}/></div>
            </>}
            {selected.type==='ending'&&<div className="info-callout"><Check size={16}/> 이 블록에 도달하면 스토리가 종료됩니다.</div>}
            {selected.type==='character_exit'&&<div className="property-section"><label>대상 캐릭터 ID</label><input className="field" value={selected.characterId||''} onChange={e=>updateBlock(selected.id,{characterId:e.target.value})}/></div>}
            <div className="property-section advanced"><label>블록 ID</label><code>{selected.id}</code></div>
          </div>:<div className="empty-state">타임라인에서 블록을 선택하세요.</div>}
          <div className="right-footer"><span><Check size={13}/> 자동 임시 반영</span><button onClick={saveLocal}><Save size={14}/> 저장</button></div>
        </aside>
      </main>

      <footer className="statusbar"><span><span className="status-dot"/>{status}</span><span>16:9 캔버스</span><span>{story.blocks.length}개 블록</span><span className="status-spacer"/><span>BACKSTAGE STUDIO · PROTOTYPE</span></footer>
      {toast&&<div className="toast"><Check size={15}/>{toast}</div>}
      {showImport&&<div className="modal-backdrop" onClick={()=>setShowImport(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><h3>스토리 불러오기</h3><button className="mini-icon" onClick={()=>setShowImport(false)}><X size={17}/></button></div><p>이전에 내보낸 BACKSTAGE JSON 파일을 선택하세요. 현재 편집 내용은 파일을 불러오면 교체됩니다.</p><button className="primary-btn full" onClick={()=>importRef.current?.click()}><Upload size={15}/> JSON 파일 선택</button><input ref={importRef} type="file" accept=".json,application/json" hidden onChange={e=>importStory(e.target.files?.[0])}/></div></div>}
    </div>
  );
}

export default App;
