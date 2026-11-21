(()=>{
  'use strict';
  const TZ='Asia/Yekaterinburg';
  const KEY='avtoservis070_bookings_v1';
  const services=[
    ['⌕','Диагностика','Компьютерная и комплексная проверка автомобиля','от 800 ₽'],
    ['⚙','Ремонт и обслуживание','ТО, двигатель, подвеска, тормозная система и трансмиссия','от 1 200 ₽'],
    ['⌁','Автоэлектрика','Поиск неисправностей, ремонт электрики и установка оборудования','от 1 000 ₽'],
    ['◈','Кузовной ремонт','Восстановление геометрии, локальный ремонт и покраска','по запросу'],
    ['✧','Автомойка','Комплексная мойка, уход за салоном и химчистка','от 900 ₽'],
    ['◉','Шиномонтаж','Сезонная смена шин, балансировка и ремонт проколов','от 2 000 ₽']
  ];
  const cards=document.getElementById('serviceCards');
  const servicePhotos=['service-diagnostics.png','service-repair.png','service-electrics.png','service-bodywork.png','service-carwash.png','service-tires.png'];
  cards.innerHTML=services.map((s,i)=>`<article class="service"><div class="service-photo ${i===4?'service-photo-wash':''}" aria-hidden="true"><img src="images/${servicePhotos[i]}" alt="${s[1]} в автосервисе" loading="lazy" decoding="async"></div><div class="service-info"><div class="service-top"><span class="icon">${s[0]}</span><span class="arrow">↗</span></div><h3>${s[1]}</h3><p>${s[2]}</p><div class="service-foot"><b>${s[3]}</b><a href="#" class="mutelink" data-book data-service="${i}">Записаться →</a></div></div></article>`).join('');
  const fmt=(date,opts)=>new Intl.DateTimeFormat('ru-RU',{timeZone:TZ,...opts}).format(date);
  function dayKey(date){const p=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);return `${p.find(x=>x.type==='year').value}-${p.find(x=>x.type==='month').value}-${p.find(x=>x.type==='day').value}`}
  const dayDate=key=>new Date(key+'T12:00:00+05:00');
  function dates7(){const base=dayDate(dayKey(new Date()));return Array.from({length:7},(_,i)=>{const d=new Date(base);d.setDate(d.getDate()+i);return{key:dayKey(d),date:d}})}
  const slots=Array.from({length:23},(_,i)=>{const n=540+i*30;return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`});
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function getBookings(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
  const setBookings=value=>localStorage.setItem(KEY,JSON.stringify(value));
  const CLOSED_STATUSES=new Set(['Отклонена','Отменена']);
  function isSlotOccupied(date,time){return getBookings().some(b=>b.date===date&&b.time===time&&!CLOSED_STATUSES.has(b.status))}
  let selectedDate=dates7()[0].key,selectedTime='';
  const bookingModal=document.getElementById('bookModal');
  const adminModal=document.getElementById('adminModal');
  const bookingContent=document.getElementById('bookingContent');
  function openBooking(serviceIndex){selectedDate=dates7()[0].key;selectedTime='';renderBooking();bookingModal.classList.add('open');document.body.style.overflow='hidden';if(serviceIndex!==undefined)document.getElementById('service').value=String(serviceIndex)}
  function renderBooking(){
    const days=dates7();if(!days.some(d=>d.key===selectedDate))selectedDate=days[0].key;
    const now=fmt(new Date(),{hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
    const daySlots=slots.filter(t=>!(selectedDate===dayKey(new Date())&&t<=now));
    bookingContent.innerHTML=`<form id="bookingForm"><div class="form-grid"><div class="field"><label for="name">Имя *</label><input id="name" name="name" required maxlength="80" placeholder="Как к вам обращаться?"></div><div class="field"><label for="phone">Телефон *</label><input id="phone" name="phone" required inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__"></div><div class="field full"><label for="car">Марка и модель автомобиля *</label><input id="car" name="car" required maxlength="100" placeholder="Например, Kia Rio"></div><div class="field full"><label for="service">Услуга *</label><select id="service" name="service" required>${services.map((s,i)=>`<option value="${i}">${s[1]}</option>`).join('')}</select></div></div><div class="calendar-label">Дата визита <span>Ближайшие 7 дней · время Нижнего Тагила</span></div><div class="dates">${days.map((d,i)=>`<button type="button" class="date-btn ${selectedDate===d.key?'selected':''}" data-date="${d.key}"><b>${i===0?'Сегодня':fmt(d.date,{weekday:'short'})}</b><small>${fmt(d.date,{day:'numeric',month:'short'})}</small></button>`).join('')}</div><div class="calendar-label">Доступное время <span>каждые 30 минут · до 20:00</span></div><div class="times">${daySlots.length?daySlots.map(t=>{const occupied=isSlotOccupied(selectedDate,t);return `<button type="button" class="time-btn ${occupied?'busy':''} ${selectedTime===t&&!occupied?'selected':''}" ${occupied?'disabled aria-label="'+t+', занято"':`data-time="${t}"`}>${t}${occupied?'<small>Занято</small>':''}</button>`}).join(''):'<div style="grid-column:1/-1;color:#777;padding:8px">На эту дату свободных окон не осталось. Выберите другой день.</div>'}</div><div class="field" style="margin-top:15px"><label for="comment">Комментарий (необязательно)</label><textarea id="comment" name="comment" maxlength="500" placeholder="Опишите проблему или пожелания"></textarea></div><button class="btn form-submit" type="submit">Оставить заявку <span>↗</span></button><p class="form-note">Отправляя заявку, вы соглашаетесь на обработку указанных данных для связи по записи.</p></form>`;
    bookingContent.querySelectorAll('[data-date]').forEach(b=>b.onclick=()=>{selectedDate=b.dataset.date;selectedTime='';renderBooking()});
    bookingContent.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{selectedTime=b.dataset.time;renderBooking()});
    const phone=document.getElementById('phone');
    phone.addEventListener('input',()=>{let d=phone.value.replace(/\D/g,'');if(d.startsWith('8'))d='7'+d.slice(1);if(d.startsWith('7'))d=d.slice(1);d=d.slice(0,10);let v='+7';if(d.length)v+=' ('+d.slice(0,3);if(d.length>=3)v+=')';if(d.length>3)v+=' '+d.slice(3,6);if(d.length>6)v+='-'+d.slice(6,8);if(d.length>8)v+='-'+d.slice(8,10);phone.value=v});
    document.getElementById('bookingForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget);if(String(f.get('phone')).replace(/\D/g,'').length<11){phone.setCustomValidity('Введите полный номер телефона');phone.reportValidity();phone.setCustomValidity('');return}if(!selectedTime){showToast('Выберите время визита');return}if(isSlotOccupied(selectedDate,selectedTime)){selectedTime='';renderBooking();showToast('Это время уже занято. Выберите другое.');return}const item={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name:String(f.get('name')).trim(),phone:String(f.get('phone')).trim(),car:String(f.get('car')).trim(),service:services[Number(f.get('service'))][1],date:selectedDate,time:selectedTime,comment:String(f.get('comment')).trim(),status:'Новая',createdAt:new Date().toISOString()};setBookings([item,...getBookings()]);bookingContent.innerHTML=`<div class="success"><span class="icon">✓</span><h3>Заявка отправлена</h3><p>${esc(item.name)}, мы свяжемся с вами по номеру ${esc(item.phone)} для подтверждения.<br>Предварительно: ${esc(fmt(dayDate(item.date),{day:'numeric',month:'long'}))} в ${esc(item.time)}.</p><button type="button" class="btn" id="successClose">Понятно</button></div>`;document.getElementById('successClose').onclick=()=>closeModal('bookModal')};
  }
  function closeModal(id){document.getElementById(id).classList.remove('open');document.body.style.overflow=''}
  function showToast(message){const toast=document.getElementById('toast');toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2400)}
  document.querySelectorAll('[data-book]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();document.getElementById('navLinks').classList.remove('open');openBooking(b.dataset.service===undefined?undefined:Number(b.dataset.service))}));
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeModal(b.dataset.close));
  [bookingModal,adminModal].forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal(m.id)}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal('bookModal');closeModal('adminModal')}});
  document.getElementById('hamb').onclick=()=>document.getElementById('navLinks').classList.toggle('open');
  document.querySelectorAll('#navLinks a').forEach(a=>a.onclick=()=>document.getElementById('navLinks').classList.remove('open'));
  document.getElementById('adminOpen').onclick=()=>{renderAdmin();adminModal.classList.add('open');document.body.style.overflow='hidden'};
  function renderAdmin(){
    const all=getBookings(),status=document.getElementById('statusFilter')?.value||'',query=(document.getElementById('adminSearch')?.value||'').toLowerCase();
    const statuses=['Новая','Подтверждена','Отклонена','Выполнена','Отменена'];
    const items=all.filter(b=>(!status||b.status===status)&&(!query||[b.name,b.phone,b.car,b.service].join(' ').toLowerCase().includes(query)));
    document.getElementById('adminContent').innerHTML=`<div class="admin-toolbar"><input class="filter-select" id="adminSearch" placeholder="Поиск по имени, авто, телефону" value="${esc(query)}"><select class="filter-select" id="statusFilter"><option value="">Все статусы</option>${statuses.map(x=>`<option ${status===x?'selected':''}>${x}</option>`).join('')}</select><button class="btn dark small" id="exportCsv">Экспорт CSV</button></div><div class="admin-list">${items.length?items.map(b=>`<article class="admin-card"><div class="admin-card-head"><strong>${esc(b.name)} · ${esc(b.phone)}</strong><span class="admin-status ${b.status==='Новая'?'pending':b.status==='Подтверждена'?'accepted':'rejected'}">${esc(b.status||'Новая')}</span></div><p>${esc(b.service)} · ${esc(b.car)}</p><div class="admin-meta"><span>◷ ${esc(fmt(dayDate(b.date),{day:'numeric',month:'long'}))}, ${esc(b.time)}</span>${b.comment?`<span>Комментарий: ${esc(b.comment)}</span>`:''}</div>${b.status==='Новая'?`<div class="admin-actions"><button type="button" class="admin-action accept" data-decision="${esc(b.id)}" data-value="Подтверждена">Принять</button><button type="button" class="admin-action reject" data-decision="${esc(b.id)}" data-value="Отклонена">Отклонить</button></div>`:b.status==='Подтверждена'?`<div class="admin-actions"><span class="admin-slot-note">Время занято в сетке</span><button type="button" class="admin-action reject" data-decision="${esc(b.id)}" data-value="Отклонена">Отклонить</button></div>`:b.status==='Отклонена'||b.status==='Отменена'?`<div class="admin-actions"><button type="button" class="admin-action reopen" data-decision="${esc(b.id)}" data-value="Новая">Вернуть в новые</button></div>`:''}</article>`).join(''):'<div class="empty">Заявок пока нет. Новые записи появятся здесь.</div>'}</div>`;
    document.getElementById('adminSearch').oninput=renderAdmin;
    document.getElementById('statusFilter').onchange=renderAdmin;
    document.querySelectorAll('[data-decision]').forEach(button=>button.onclick=()=>{
      const arr=getBookings(),item=arr.find(x=>x.id===button.dataset.decision),nextStatus=button.dataset.value;
      if(!item)return;
      if(nextStatus==='Подтверждена'&&arr.some(x=>x.id!==item.id&&x.date===item.date&&x.time===item.time&&!CLOSED_STATUSES.has(x.status))){showToast('Это время уже занято другой заявкой');return}
      item.status=nextStatus;setBookings(arr);renderAdmin();
    });
    document.getElementById('exportCsv').onclick=()=>{const rows=[['Имя','Телефон','Автомобиль','Услуга','Дата','Время','Комментарий','Статус'],...items.map(b=>[b.name,b.phone,b.car,b.service,b.date,b.time,b.comment,b.status])];const csv='\uFEFF'+rows.map(row=>row.map(x=>'"'+String(x??'').replaceAll('"','""')+'"').join(';')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='zayavki-avtoservis-070.csv';a.click();URL.revokeObjectURL(a.href)};
  }  document.getElementById('feedbackForm')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget),item={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name:String(f.get('name')||'').trim()||'Клиент',phone:String(f.get('phone')||'').trim(),car:'—',service:'Обратная связь',date:dayKey(new Date()),time:'—',comment:'Просит перезвонить',status:'Новая',createdAt:new Date().toISOString()};setBookings([item,...getBookings()]);e.currentTarget.reset();showToast('Спасибо! Мы свяжемся с вами.')});
  const reveal=document.querySelectorAll('.strip-item,.section-head,.service,.why-visual,.why-grid>div:last-child,.review,.price-list,.about-callout,.contact-info,.map');
  reveal.forEach((el,i)=>{el.setAttribute('data-reveal','');if(el.classList.contains('service')||el.classList.contains('review')||el.classList.contains('strip-item'))el.style.setProperty('--reveal-delay',`${(i%6)*110}ms`)});
  if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -30px 0px'});reveal.forEach(el=>observer.observe(el))}else reveal.forEach(el=>el.classList.add('is-visible'));
  setInterval(()=>{if(bookingModal.classList.contains('open'))renderBooking()},60000);
})();
