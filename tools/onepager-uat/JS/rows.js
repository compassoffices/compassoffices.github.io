// ══════════════════════════════════════════════════════════
//  PRICING ROWS
// ══════════════════════════════════════════════════════════
function addRow(seats='',type='',rent='',mgmt='',init='',avail=''){S.rows.push({id:Date.now()+Math.random(),seats,type,rent,mgmt,init,avail});renderRows();}
function delRow(id){S.rows=S.rows.filter(r=>r.id!==id);renderRows();}
function upd(id,f,v){const r=S.rows.find(r=>r.id===id);if(r)r[f]=v;}
function updHtml(id,f,el){const r=S.rows.find(r=>r.id===id);if(r)r[f]=el.innerHTML;}
function richCmd(cmd,editorId){
  const el=document.getElementById(editorId);if(!el)return;el.focus();
  if(cmd==='bold'){document.execCommand('bold',false,null);}
  else if(cmd==='orange'){const sel=window.getSelection();if(sel&&sel.rangeCount)document.execCommand('foreColor',false,'#FF6600');}
  else if(cmd==='black'){const sel=window.getSelection();if(sel&&sel.rangeCount)document.execCommand('foreColor',false,'#333333');}
  else if(cmd==='small'){const sel=window.getSelection();if(sel&&sel.rangeCount&&!sel.isCollapsed){const range=sel.getRangeAt(0);const small=document.createElement('small');try{range.surroundContents(small);}catch(e){const frag=range.extractContents();small.appendChild(frag);range.insertNode(small);}}}
  else if(cmd==='clear'){document.execCommand('removeFormat',false,null);}
  const rid=el.dataset.rowId;const r=S.rows.find(r=>String(r.id)===rid);if(r)r.init=el.innerHTML;
}
function renderRows(){
  const c=document.getElementById('pr-rows');
  if(!S.rows.length){c.innerHTML=`<p class="note-txt" style="margin-bottom:10px">No rows yet.</p>`;return;}
  // Only show fields for visible columns
  const colOn=key=>PRICING_COLS.find(col=>col.key===key)?.on!==false;
  const colLabel=key=>getPricingColLabel(key);
  c.innerHTML=S.rows.map(r=>{
    const eid=`rich-${r.id}`;
    return`<div class="pr-row">
      <div class="pr-head"><span class="pr-lbl">${ui('pr_row')}</span><button class="del-btn" onclick="delRow(${r.id})"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
      <div class="frow">
        ${colOn('seats')?`<div class="field"><label class="fl">${colLabel('seats')}</label><input type="text" value="${r.seats}" onchange="upd(${r.id},'seats',this.value)" placeholder="${ui('pr_seat_ph')}"></div>`:''}
        ${colOn('type')?`<div class="field"><label class="fl">${colLabel('type')}</label><input type="text" value="${r.type}" onchange="upd(${r.id},'type',this.value)" placeholder="${ui('pr_type_ph')}"></div>`:''}
      </div>
      <div class="frow">
        ${colOn('rent')?`<div class="field"><label class="fl">${colLabel('rent')}</label><input type="text" value="${r.rent}" onchange="upd(${r.id},'rent',this.value)" placeholder="${ui('pr_rent_ph')}"></div>`:''}
        ${colOn('mgmt')?`<div class="field"><label class="fl">${colLabel('mgmt')}</label><input type="text" value="${r.mgmt}" onchange="upd(${r.id},'mgmt',this.value)" placeholder="${ui('pr_mgmt_ph')}" style="${r.mgmt&&r.mgmt.match(/\$|A\$/)?'color:var(--o);font-weight:700;':''}" oninput="this.style.color=this.value.match(/\\$|A\\$/)?' var(--o)':'';this.style.fontWeight=this.value.match(/\\$|A\\$/)?'700':'';upd(${r.id},'mgmt',this.value)"></div>`:''}
      </div>
      <div class="frow">
        ${colOn('init')?`<div class="field">
          <label class="fl">${colLabel('init')} <span style="font-weight:400;color:var(--xlt);text-transform:none">${ui('pr_init_hint')}</span></label>
          <div class="rich-wrap">
            <div class="rich-toolbar">
              <button class="rich-btn" onmousedown="event.preventDefault();richCmd('bold','${eid}')"><b>B</b></button>
              <button class="rich-btn orange" onmousedown="event.preventDefault();richCmd('orange','${eid}')"><svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#FF6600"/></svg> Orange</button>
              <button class="rich-btn" onmousedown="event.preventDefault();richCmd('black','${eid}')" style="color:#333"><svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#333"/></svg> Black</button>
              <button class="rich-btn" onmousedown="event.preventDefault();richCmd('small','${eid}')">S↓</button>
              <button class="rich-btn" onmousedown="event.preventDefault();richCmd('clear','${eid}')">✕ Clear</button>
            </div>
            <div class="rich-editor" id="${eid}" contenteditable="true" data-row-id="${r.id}" oninput="updHtml(${r.id},'init',this)" placeholder="${ui('pr_init_ph')}">${r.init||''}</div>
          </div>
        </div>`:''}
        ${colOn('avail')?`<div class="field"><label class="fl">${colLabel('avail')}</label><input type="text" value="${r.avail}" onchange="upd(${r.id},'avail',this.value)" placeholder="${ui('pr_avail_ph')}" style="${r.avail&&r.avail.match(/\$|A\$/)?'color:var(--o);font-weight:700;':''}" oninput="this.style.color=this.value.match(/\\$|A\\$/)?'var(--o)':'';this.style.fontWeight=this.value.match(/\\$|A\\$/)?'700':'';upd(${r.id},'avail',this.value)"></div>`:''}
      </div>
    </div>`;
  }).join('');
}

