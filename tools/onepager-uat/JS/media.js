// ══════════════════════════════════════════════════════════
//  MEDIA UPLOADS
// ══════════════════════════════════════════════════════════
function phSlotClick(i){document.getElementById('ph-inp-'+i)?.click();}
function onPhotoSlot(i,e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{S.photos[i]=ev.target.result;renderPhotoSlots();gen();};
  reader.readAsDataURL(file);e.target.value='';
}
function rmPhotoSlot(i){S.photos[i]=null;renderPhotoSlots();gen();}
function renderPhotoSlots(){
  for(let i=0;i<6;i++){
    const img=document.getElementById('ph-img-'+i);
    const empty=document.getElementById('ph-slot-empty-'+i);
    const rm=document.getElementById('ph-rm-'+i);
    const slot=document.getElementById('ph-slot-'+i);
    if(!img)continue;
    const src=S.photos[i];
    if(src){img.src=src;img.style.display='block';if(empty)empty.style.display='none';if(rm)rm.style.display='flex';if(slot)slot.classList.add('has-photo');}
    else{img.src='';img.style.display='none';if(empty)empty.style.display='';if(rm)rm.style.display='none';if(slot)slot.classList.remove('has-photo');}
  }
}
function mcToggleUrl(key){
  const row=document.getElementById('mc-'+key+'-url-row');
  const btn=document.querySelector(`[onclick*="mcToggleUrl('${key}')"]`);
  if(!row)return;
  const isOpen=row.classList.toggle('open');
  if(btn)btn.classList.toggle('on',isOpen);
  if(isOpen){const inp=document.getElementById('mc-'+key+'-url-input');if(inp)setTimeout(()=>inp.focus(),50);}
}
function mcApplyUrl(key){
  const inp=document.getElementById('mc-'+key+'-url-input');if(!inp)return;
  const url=inp.value.trim();if(!url)return;
  if(key==='logo'){S.partnerLogo=url;renderLogoCard();gen();}
  else if(key==='fp'){
    // Legacy single-URL apply — goes to plan 0
    if(FP_PLANS.length===0) FP_PLANS.push({url,label:'master'});
    else FP_PLANS[0]={url,label:'master'};
    S.floorplan=url;
    // Auto-extract base URL
    FP_BASE_URL=url.replace(/[^/]+\.jpg$/i,'');
    const bInp=document.getElementById('fp-base-url');if(bInp)bInp.value=FP_BASE_URL;
    renderFpList();gen();
  }
  else if(key.startsWith('ph')){const i=parseInt(key.replace('ph',''));S.photos[i]=url;renderPhotoSlots();gen();}
  const row=document.getElementById('mc-'+key+'-url-row');if(row)row.classList.remove('open');inp.value='';
}
function renderLogoCard(){
  const img=document.getElementById('mc-logo-img');const empty=document.getElementById('mc-logo-empty');const rm=document.getElementById('mc-logo-rm');const prev=document.getElementById('mc-logo-preview');
  if(!img)return;
  if(S.partnerLogo){img.src=S.partnerLogo;img.style.display='block';if(empty)empty.style.display='none';if(rm)rm.style.display='flex';if(prev)prev.style.cursor='default';if(prev)prev.onclick=null;}
  else{img.src='';img.style.display='none';if(empty)empty.style.display='';if(rm)rm.style.display='none';if(prev)prev.style.cursor='pointer';if(prev)prev.onclick=()=>document.getElementById('pl-up').click();}
}
function renderFloorplanCard(){
  // Legacy compat: sync S.floorplan from FP_PLANS[0]
  S.floorplan = FP_PLANS.length > 0 ? FP_PLANS[0].url : null;
  renderFpList();
}
function rmFloorplan(){FP_PLANS=[];S.floorplan=null;renderFpList();gen();}
function onFloorplan(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{S.floorplan=ev.target.result;FP_PLANS=[{url:ev.target.result,label:'Master'}];renderFpList();gen();};r.readAsDataURL(f);}

// ── MULTI-FLOORPLAN SYSTEM ────────────────────────────────
// Setter functions — needed because let variables can't be assigned from inline onclick attributes
function setFpP1(i){FP_PAGE1_IDX=i;renderFpList();gen();}
function setFpP2(i){FP_PAGE2_IDX=i;renderFpList();gen();}
function setFpBaseUrl(v){FP_BASE_URL=v;renderFpList();}

// ── Pricing tab → Floor Plan Room # shortcut ──────────────────────────────
// Mirrors the Media tab but provides a quick-add from the Pricing context
function prAddFpPlan(roomVal){
  // Live-update: if base URL is set and room typed, update the last plan or add new
  // Just refresh chips for visual feedback
  renderPrFpChips();
}

function prAddFpPlanBtn(){
  const inp=document.getElementById('pr-fp-room');
  if(!inp) return;
  const room=inp.value.trim();
  if(!room) return;
  // Build URL from base
  const base=FP_BASE_URL;
  if(!base){
    alert('Set the Base URL in the Media → Floor Plan section first.');
    return;
  }
  const url=base+room+'.jpg';
  const label=room.toLowerCase()==='master'?'Master':room;
  // Check if room already exists
  const exists=FP_PLANS.some(p=>p.label===label||p.url===url);
  if(!exists){
    FP_PLANS.push({url,label});
    if(FP_PLANS.length===1) S.floorplan=url;
    applyFpSmartDefaults();
    renderFpList();
    gen();
  }
  inp.value='';
  renderPrFpChips();
}

function renderPrFpChips(){
  const chips=document.getElementById('pr-fp-chips');
  if(!chips) return;
  chips.innerHTML=FP_PLANS.map((fp,i)=>`
    <div style="display:flex;align-items:center;gap:3px;padding:2px 8px 2px 6px;border-radius:20px;background:var(--olt);border:1px solid var(--o);font-size:11px;color:var(--o);font-weight:600;">
      ${fp.url&&!fp.url.startsWith('data:')?`<img src="${fp.url}" style="width:16px;height:12px;object-fit:contain;border-radius:2px;background:#fff;">`:''}
      <span>${i===0?'Master':fp.label||'Plan '+(i+1)}</span>
      <button onclick="delFpPlan(${i});renderPrFpChips();" style="border:none;background:transparent;color:var(--o);cursor:pointer;padding:0;line-height:1;font-size:12px;margin-left:1px;">×</button>
    </div>
  `).join('');
  // Update the room input placeholder to show next expected room
  const inp=document.getElementById('pr-fp-room');
  if(inp) inp.placeholder=FP_PLANS.length===0?'master (first = master plan)':`e.g. ${FP_PLANS.length+2400} (add more rooms)`;
}

function setFpPage2Same(same){
  FP_PAGE2_SAME=same;
  document.getElementById('fp-p2-same')?.classList.toggle('on',same);
  document.getElementById('fp-p2-diff')?.classList.toggle('on',!same);
  renderFpList();gen();
}

function addFpPlan(){
  FP_PLANS.push({url:'',label:FP_PLANS.length===0?'master':''});
  applyFpSmartDefaults();
  renderFpList();
}

function delFpPlan(i){
  FP_PLANS.splice(i,1);
  if(FP_PAGE1_IDX>=FP_PLANS.length) FP_PAGE1_IDX=-1;
  if(FP_PAGE2_IDX>=FP_PLANS.length) FP_PAGE2_IDX=0;
  S.floorplan=FP_PLANS.length>0?FP_PLANS[0].url:null;
  applyFpSmartDefaults();
  renderFpList();gen();
}

// Smart defaults: when 2+ plans → page2 different, p1=collage(-1), p2=master(0)
// When 1 plan → both same
function applyFpSmartDefaults(){
  if(FP_PLANS.length>=2){
    if(FP_PAGE2_SAME){
      // Auto-switch to page2 different with smart assignment
      FP_PAGE2_SAME=false;
      FP_PAGE1_IDX=-2; // rooms-only collage on page 1 (excludes master)
      FP_PAGE2_IDX=0;  // master on page 2
      document.getElementById('fp-p2-same')?.classList.remove('on');
      document.getElementById('fp-p2-diff')?.classList.add('on');
    }
  } else {
    // Back to both same when only 1 plan
    if(!FP_PAGE2_SAME){
      FP_PAGE2_SAME=true;
      FP_PAGE1_IDX=-1;
      FP_PAGE2_IDX=-1;
      document.getElementById('fp-p2-same')?.classList.add('on');
      document.getElementById('fp-p2-diff')?.classList.remove('on');
    }
  }
}

function updateFpUrl(i){
  const roomInp=document.getElementById('fp-room-'+i);
  const urlInp=document.getElementById('fp-url-'+i);
  if(!roomInp||!urlInp) return;
  const room=roomInp.value.trim();
  if(room){
    // Base URL ends with the separator e.g. "…/floorplan_lg1-24-"
    // Fall back to deriving from plan 0's URL if base not set
    let base=FP_BASE_URL;
    if(!base&&FP_PLANS[0]?.url){
      const m=FP_PLANS[0].url.match(/^(.+[-_])[^-_]+\.jpg$/i);
      base=m?m[1]:'';
    }
    if(base){
      FP_PLANS[i].url=base+room+'.jpg';
      FP_PLANS[i].label=room;
      urlInp.value=FP_PLANS[i].url;
    }
  } else {
    FP_PLANS[i].url=urlInp.value.trim();
    const fname=FP_PLANS[i].url.split('/').pop().replace(/\.jpg$/i,'');
    FP_PLANS[i].label=fname||FP_PLANS[i].label;
  }
  if(i===0) S.floorplan=FP_PLANS[0].url||null;
  // If this plan just got a URL and we now have 2+ populated plans, apply smart defaults
  const populated=FP_PLANS.filter(p=>p.url).length;
  if(populated>=2) applyFpSmartDefaults();
  // Don't call renderFpList here — it destroys focus on Tab
  // Only update the thumbnail preview inline
  const thumb=document.querySelector(`#fp-list .fp-thumb-${i}`);
  if(thumb&&FP_PLANS[i].url) thumb.src=FP_PLANS[i].url;
  gen();
}

function updateFpUrlDirect(i){
  const urlInp=document.getElementById('fp-url-'+i);
  const roomInp=document.getElementById('fp-room-'+i);
  if(!urlInp) return;
  const url=urlInp.value.trim();
  FP_PLANS[i].url=url;
  if(!url){if(i===0)S.floorplan=null;gen();return;}
  // Detect base: split at the last - or _ before the filename
  // Matches: …/floorplan_lg1-24-master.jpg → base=…/floorplan_lg1-24-  room=master
  //          …/LG1-1234.jpg                → base=…/LG1-               room=1234
  //          …/floorplan-2412.jpg          → base=…/floorplan-          room=2412
  const baseMatch=url.match(/^(.+[-_])([^-_/]+)\.jpg$/i);
  if(baseMatch){
    const base=baseMatch[1];
    const room=baseMatch[2];
    FP_PLANS[i].label=room.toLowerCase()==='master'?'Master':room;
    if(roomInp) roomInp.value=room;
    if(!FP_BASE_URL||i===0){
      FP_BASE_URL=base;
      const bInp=document.getElementById('fp-base-url');
      if(bInp) bInp.value=FP_BASE_URL;
    }
  } else {
    FP_PLANS[i].label=url.split('/').pop().replace(/\.jpg$/i,'')||('Plan '+(i+1));
    if(roomInp) roomInp.value='';
  }
  if(i===0) S.floorplan=FP_PLANS[0].url||null;
  // Don't call renderFpList — only update thumbnail inline to preserve focus
  const thumb=document.querySelector(`#fp-list .fp-thumb-${i}`);
  if(thumb&&url) thumb.src=url;
  gen();
}

function onFpUpload(i,e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    if(!FP_PLANS[i]) return;
    FP_PLANS[i].url=ev.target.result;
    FP_PLANS[i].label=file.name.replace(/\.[^.]+$/,'')||('Plan '+(i+1));
    if(i===0) S.floorplan=ev.target.result;
    // Clear room input since this is an uploaded file, not a URL
    const roomInp=document.getElementById('fp-room-'+i);
    const urlInp=document.getElementById('fp-url-'+i);
    if(roomInp) roomInp.value='';
    if(urlInp) urlInp.value='';
    renderFpList();gen();
  };
  reader.readAsDataURL(file);
  e.target.value=''; // allow re-uploading same file
}

function renderFpList(){
  const list=document.getElementById('fp-list');if(!list)return;
  const bInp=document.getElementById('fp-base-url');
  if(bInp&&FP_BASE_URL) bInp.value=FP_BASE_URL;
  renderPrFpChips(); // keep pricing tab chips in sync

  // ── Plan cards ────────────────────────────────────────────
  list.innerHTML=FP_PLANS.map((fp,i)=>`
    <div style="border:1.5px solid var(--bd);border-radius:8px;padding:8px 10px;background:var(--wh);">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        ${fp.url?`<img src="${fp.url}" class="fp-thumb-${i}" style="width:36px;height:28px;object-fit:contain;border-radius:4px;border:1px solid var(--bd);background:#f5f5f5;flex-shrink:0;">`
          :`<div class="fp-thumb-${i}" style="width:36px;height:28px;border-radius:4px;border:1px solid var(--bd);background:#f0f0f0;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>`}
        <span style="font-size:11px;font-weight:700;color:var(--o);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${i===0?'Master':fp.label||'Plan '+(i+1)}</span>
        <button onclick="delFpPlan(${i})" style="width:20px;height:20px;border:none;background:transparent;color:var(--xlt);cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:4px;flex-shrink:0;" onmouseover="this.style.color='#dc2626'" onmouseout="this.style.color='var(--xlt)'">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div style="display:flex;gap:5px;margin-bottom:5px;align-items:center;">
        <span style="font-size:10px;color:var(--xlt);white-space:nowrap;font-weight:600;">Room #</span>
        <input id="fp-room-${i}" type="text" value="${fp.label==='Master'?'master':(fp.label||'')}"
          placeholder="${i===0?'master':'e.g. 2412'}"
          style="width:90px;flex-shrink:0;border:1px solid var(--bd);border-radius:5px;padding:3px 7px;font-size:12px;font-family:inherit;outline:none;"
          oninput="updateFpUrl(${i})"
          oninput="updateFpUrl(${i})"
          onfocus="this.style.borderColor='var(--o)'" onblur="renderFpList();">
        <input type="file" id="fp-up-${i}" accept="image/*" style="display:none" onchange="onFpUpload(${i},event)">
        <label for="fp-up-${i}" class="mc-upload-btn" style="font-size:10px;padding:3px 7px;cursor:pointer;flex-shrink:0;">↑ Upload</label>
      </div>
      <input id="fp-url-${i}" type="url" value="${fp.url&&!fp.url.startsWith('data:')?fp.url:''}"
        placeholder="https://…/floorplan.jpg"
        style="width:100%;box-sizing:border-box;border:1px solid var(--bd);border-radius:5px;padding:3px 8px;font-size:11px;font-family:inherit;outline:none;"
        oninput="updateFpUrlDirect(${i})"
        onchange="updateFpUrlDirect(${i})"
        onfocus="this.style.borderColor='var(--o)'" onblur="this.style.borderColor='var(--bd)'">
  `).join('');

  // ── Page assignment selector (only in page-2-different mode) ─────────────
  const sel=document.getElementById('fp-page-sel');
  if(sel){
    if(!FP_PAGE2_SAME&&FP_PLANS.length>1){
      const collageIcon=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;width:100%;height:100%;background:#e8e8e8;border-radius:2px;overflow:hidden;">${FP_PLANS.slice(0,4).map(p=>`<div style="background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;">${p.url?`<img src="${p.url}" style="width:100%;height:100%;object-fit:contain;">`:''}</div>`).join('')}</div>`;
      const roomsIcon=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;width:100%;height:100%;background:#e8e8e8;border-radius:2px;overflow:hidden;">${FP_PLANS.slice(1,5).map(p=>`<div style="background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;">${p.url?`<img src="${p.url}" style="width:100%;height:100%;object-fit:contain;">`:''}</div>`).join('')}</div>`;
      const makeThumb=(label,planIdx,current,fn)=>{
        const active=current===planIdx;
        const isRooms=planIdx===-2;
        const isAll=planIdx===-1;
        const fp=(!isAll&&!isRooms)?FP_PLANS[planIdx]:null;
        const thumb=isRooms?roomsIcon:isAll?collageIcon
          :(fp?.url?`<img src="${fp.url}" style="width:100%;height:100%;object-fit:contain;display:block;">`
          :`<div style="width:100%;height:100%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>`);
        return`<div onclick="${fn}(${planIdx})" style="cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;flex-shrink:0;">
          <div style="width:52px;height:38px;border-radius:5px;border:2px solid ${active?'var(--o)':'var(--bd)'};overflow:hidden;background:#fff;position:relative;transition:border-color .15s;">
            ${thumb}
            ${active?`<div style="position:absolute;bottom:2px;right:2px;width:12px;height:12px;border-radius:50%;background:var(--o);display:flex;align-items:center;justify-content:center;"><svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg></div>`:''}
          </div>
          <span style="font-size:9.5px;font-weight:${active?'700':'500'};color:${active?'var(--o)':'var(--xlt)'};max-width:52px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;">${label}</span>
        </div>`;
      };
      const thumbRow=(label,current,fn)=>`
        <div style="margin-bottom:8px;">
          <div style="font-size:9.5px;font-weight:700;color:var(--xlt);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px;">${label}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${makeThumb('Rooms',-2,current,fn)}
            ${makeThumb('All',-1,current,fn)}
            ${FP_PLANS.map((fp,pi)=>makeThumb(pi===0?'Master':(fp.label||'Plan '+(pi+1)),pi,current,fn)).join('')}
          </div>
        </div>`;
      sel.style.display='';
      sel.innerHTML=thumbRow('Page 1 shows',FP_PAGE1_IDX,'setFpP1')+thumbRow('Page 2 shows',FP_PAGE2_IDX,'setFpP2');
    } else {
      sel.style.display='none';
    }
  }
}
function rmPartnerLogo(){S.partnerLogo=null;renderLogoCard();gen();}
function onPartnerLogo(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{S.partnerLogo=ev.target.result;renderLogoCard();gen();};r.readAsDataURL(f);}
function showStatus(m,t){document.getElementById('fetch-status').innerHTML=`<div class="smsg ${t}">${m}</div>`;}

