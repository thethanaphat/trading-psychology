(() => {
  'use strict';
  const { config, questions, stages } = globalThis.SelfCheckData;
  const { evaluate, productUrl } = globalThis.SelfCheckScoring;
  const main = document.querySelector('#main');
  const announcement = document.querySelector('#announcement');
  let answers = {}, index = 0, busy = false, screen = 'intro';
  let sent = new Set();
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const escape = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function track(name, once = true) {
    if (once && sent.has(name)) return;
    sent.add(name);
    const detail = { name, tool: 'TradingPsychologySelfCheck', version: config.version };
    // Local hook only by default. No answers, scores, patterns or identifiers.
    try {
      window.dispatchEvent(new CustomEvent('selfcheck:analytics', { detail }));
      if (config.analyticsEnabled && typeof window.selfCheckAnalytics === 'function') window.selfCheckAnalytics(detail);
    } catch { /* Analytics must never interrupt the journey. */ }
  }
  function mount(html, focus = true) {
    main.innerHTML = html;
    if (focus) {
      main.querySelector('h1[tabindex="-1"], h2[tabindex="-1"]')?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }
  const symbols = {
    door: '<path d="M21 48V18q15-15 30 0v30M15 48h42M27 48V23q9-8 18 0v25"/><path d="M35 39h2M36 4v5M10 20l5 3M57 20l5-3"/>',
    chart: '<path d="M12 47h48M16 42V16M22 37l10-10 9 4 16-18M48 13h9v9"/><path d="M25 49v6M48 49v6"/>',
    bridge: '<path d="M7 44q29-40 58 0M7 48h58M15 35v13M25 27v21M36 23v25M47 27v21M57 35v13M10 56q8-5 16 0t16 0 16 0"/>',
    rest: '<path d="M19 43h35M23 43v10M50 43v10M25 29h26v14H25ZM55 10v17M48 14h14M9 52h7"/><path d="M30 19q-5-5 0-10M41 20q-5-5 0-10"/>',
    sun: '<circle cx="43" cy="23" r="10"/><path d="M43 5v4M43 37v4M25 23h4M57 23h4M30 10l3 3M53 33l3 3M56 10l-3 3M12 50l15-18 17 22M36 44l9-9 17 19M8 55h56"/>',
    book: '<path d="M36 19q-11-8-25-3v34q13-5 25 3 12-8 25-3V16q-14-5-25 3v34M18 24l10 2M18 32l10 2M44 26l10-2M44 34l10-2"/>'
  };
  function icon(symbol, cls = '') {
    return `<svg class="scene-icon ${cls}" viewBox="0 0 72 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${symbols[symbol]}</svg>`;
  }
  function chest(open = false) {
    return `<div class="treasure ${open ? 'is-open' : ''}" aria-hidden="true"><div class="treasure-halo"></div><div class="treasure-paper"><span>MY JOURNEY</span><i></i><i></i><i></i></div><div class="treasure-lid"></div><div class="treasure-base"><b></b></div><span class="spark spark-one">✧</span><span class="spark spark-two">✧</span></div>`;
  }
  const stagePalette = [
    ['#437d65','#dcefe2'], ['#377e9a','#dceff7'], ['#9c6b32','#f8e9c9'],
    ['#ad6455','#f7dfd5'], ['#887025','#f7edbb'], ['#78619c','#eee3f8']
  ];
  const stageTheme = stage => `--stage-ink:${stagePalette[stage][0]};--stage-soft:${stagePalette[stage][1]}`;
  function mapArt(active = -1) {
    const points = [[105,420],[285,350],[105,280],[285,210],[105,140],[285,70]];
    const path = 'M105 420C105 375 285 395 285 350S105 325 105 280S285 255 285 210S105 185 105 140S285 115 285 70';
    return `<div class="journey-map" aria-hidden="true">
      <svg viewBox="0 0 400 495" fill="none" class="journey-map-svg">
        <path d="M0 26Q91-15 154 44T400 5V495H0Z" fill="#f9f8f0"/>
        <path d="M0 318Q65 263 117 326T259 406 400 361V495H0Z" fill="#e1eee2" opacity=".75"/>
        <path d="M230 16Q185 60 235 100T400 173V0H262Z" fill="#ece3f5" opacity=".8"/>
        <path d="M0 134Q88 104 145 176T400 228V279Q250 251 133 204T0 201Z" fill="#f7e7c9" opacity=".65"/>
        <path d="M400 291Q311 265 275 302T151 376" stroke="#b9d9e2" stroke-width="3" stroke-linecap="round"/>
        <path d="M400 302Q312 276 277 313T158 387" stroke="#d3e6e9" stroke-width="2" stroke-linecap="round"/>
        <circle cx="59" cy="59" r="20" fill="#edce77" opacity=".7"/>
        <path d="M58 28v-5M58 89v5M27 59h-5M88 59h5" stroke="#b9994e" stroke-width="2" stroke-linecap="round"/>
        <path d="${path}" stroke="#d9d6c6" stroke-width="19"/>
        <path d="${path}" stroke="#fffef9" stroke-width="16"/>
        <path d="${path}" stroke="#b8a784" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round"/>
        ${points.map(([x,y],i)=>{
          const [ink,soft]=stagePalette[i], current=active===i, passed=active>i;
          return `<g transform="translate(${x} ${y})" class="journey-pin ${current?'is-current':''}">
            ${current?`<circle r="37" fill="${soft}"/><circle r="32" stroke="${ink}" stroke-width="1" opacity=".4"/>`:''}
            <circle cy="3" r="27" fill="#263e3210"/>
            <circle r="27" fill="${current?ink:soft}" stroke="${ink}" stroke-width="${current?2:1}"/>
            <svg x="-21" y="-20" width="42" height="38" viewBox="0 0 72 64" fill="none" stroke="${current?'#fffdf7':ink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${symbols[stages[i].symbol]}</svg>
            <circle cx="23" cy="-22" r="10" fill="${passed?ink:'#fffdf7'}" stroke="${ink}"/>
            <text x="23" y="-18" text-anchor="middle" fill="${passed?'#fffdf7':ink}" font-size="11" font-weight="600">${passed?'✓':i+1}</text>
            <rect x="-58" y="35" width="116" height="25" rx="12.5" fill="${current?ink:'#fffdf7'}"/>
            <text x="0" y="52" text-anchor="middle" fill="${current?'#fffdf7':ink}" font-size="14" font-weight="600">${escape(stages[i].name)}</text>
          </g>`;
        }).join('')}
      </svg>
      ${active>=0?`<div class="map-location" style="${stageTheme(active)}"><span></span>คุณอยู่ช่วงที่ ${active+1} · ${escape(stages[active].name)}</div>`:'<div class="map-location overview">6 ช่วงของการเทรด · หนึ่งเส้นทางของคุณ</div>'}
    </div>`;
  }
  function route(stage) {
    return `<ol class="route" aria-label="เส้นทาง 6 ช่วง">${stages.map((s,i)=>`<li style="${stageTheme(i)}" class="${i === stage ? 'current' : i < stage ? 'passed' : ''}" ${i === stage ? 'aria-current="step"' : ''}><span>${i < stage ? '✓' : String(i+1).padStart(2,'0')}</span><small>${escape(s.name)}</small></li>`).join('')}</ol>`;
  }
  function intro() {
    screen = 'intro';
    mount(`<section class="intro page-width"><div class="intro-copy"><p class="eyebrow"><span></span> แบบทดสอบฟรี โดย อ.ใหม่ ธนภัทร</p><h1 tabindex="-1">แบบทดสอบ<br><em>จิตวิทยาการเทรด</em></h1><h2>คุณมัก “แหกกฎ” ตอนไหนมากที่สุด?</h2><p class="lead">มาลองสำรวจตัวเองผ่าน 12 สถานการณ์ ตั้งแต่ก่อนเข้าไม้จนปิดกราฟ แล้วดูว่าอารมณ์มีผลกับการตัดสินใจของคุณยังไง</p><div class="intro-facts"><span>12 สถานการณ์</span><span>ประมาณ 2–3 นาที</span><span>ไม่ต้องสมัคร</span></div><button class="primary" data-action="start">เริ่มทดสอบตัวเอง <span aria-hidden="true">↗</span></button><p class="soft-note">ไม่มีคำตอบถูกหรือผิด · ตอบตามที่ทำจริงได้เลย</p></div><div class="intro-visual"><div class="map-heading"><span>เส้นทางเทรดของคุณ</span><span>01 — 06</span></div>${mapArt()}<div class="map-caption"><span class="tiny-star">✧</span><p>รู้ทันตัวเองเร็วขึ้น<br><strong>ก่อนเผลอทำต่างจากแผน</strong></p></div></div><div class="before-start"><div><span class="mini-label">ก่อนออกเดินทาง</span><h3>นึกถึงสิ่งที่คุณทำจริง<br>ในช่วง 30 วันที่ผ่านมา</h3></div><div><p>เลือกข้อที่ตรงกับสิ่งที่คุณทำมากที่สุด ถ้ายังไม่เคยเจอหรือจำไม่ได้ก็ข้ามได้ แต่ละเรื่องไม่จำเป็นต้องเกิดในวันเดียวกัน</p><p>ถ้าคุณเข้าและจัดการไม้เอง ตอบได้ทุกข้อ ถ้าใช้ระบบอัตโนมัติ ให้ตอบเฉพาะเรื่องที่คุณเป็นคนตัดสินใจ</p></div></div><p class="privacy">เครื่องมือนี้ไม่ใช่การวินิจฉัยด้านสุขภาพจิตหรือคำแนะนำการลงทุน</p></section>`,false);
  }
  function question() {
    screen = 'question';
    const q = questions[index], stage = stages[q.stage], answered = Object.hasOwn(answers,q.id);
    mount(`<section class="journey page-width" style="${stageTheme(q.stage)}"><aside class="journey-aside"><p class="eyebrow">เส้นทางเทรดของคุณ</p><h2>ค่อย ๆ เดิน<br>ค่อย ๆ สังเกต</h2>${mapArt(q.stage)}<p>ไม่ต้องเลือกคำตอบที่ดูดีที่สุด<br>เลือกสิ่งที่คุณทำจริงก็พอ</p></aside><div class="question-area">${route(q.stage)}<div class="question-card"><div class="question-meta"><span>ช่วงที่ ${q.stage+1} · ${escape(stage.name)}</span><span>${String(index+1).padStart(2,'0')} <span class="muted">/ 12</span></span></div><div class="progress" role="progressbar" aria-label="สถานการณ์ที่กำลังสำรวจ" aria-valuemin="0" aria-valuemax="12" aria-valuenow="${index+1}"><span style="width:${(index+1)/12*100}%"></span></div><div class="scene-heading">${icon(stage.symbol)}<p>${escape(stage.caption)}</p></div><p class="mini-label">${escape(q.title)}</p><h1 tabindex="-1">${escape(q.text)}</h1><p class="answer-hint">นึกถึงสิ่งที่คุณทำจริงใน 30 วันที่ผ่านมา</p><div class="choices" role="group" aria-label="เลือกคำตอบที่ใกล้คุณที่สุด">${q.choices.map(c=>`<button class="choice ${answers[q.id]===c.id?'selected':''}" data-answer="${c.id}" aria-pressed="${answers[q.id]===c.id}"><span class="choice-dot" aria-hidden="true">${answers[q.id]===c.id?'✓':''}</span><span>${escape(c.text)}</span></button>`).join('')}</div><button class="text-button skip-answer ${answered && answers[q.id]===null?'selected':''}" data-action="skip">${answered && answers[q.id]===null?'✓ ':''}ยังไม่เคยเจอ / ยังตอบไม่ได้</button><div class="question-navigation"><button class="text-button" data-action="back">← ${index?'ย้อนกลับ':'หน้าเริ่มต้น'}</button>${answered?'<button class="next-button" data-action="next">ไปต่อ →</button>':'<span>เลือกแล้วไปต่อได้เลย</span>'}</div></div><p class="journey-note">ค่อย ๆ ตอบตามจริง · ย้อนกลับมาแก้ได้</p></div></section>`);
    announcement.textContent = `${stage.name} สถานการณ์ที่ ${index+1} จาก 12`;
  }
  function gate() {
    screen = 'gate';
    track('SelfCheckComplete');
    mount(`<section class="reveal-page page-width"><p class="eyebrow">มาดูกันว่าคำตอบบอกอะไร</p><h1 tabindex="-1">คุณเดินครบเส้นทางแล้ว</h1><p class="lead">ผ่านครบทั้ง 6 ช่วงแล้ว<br>ลองเปิดดูว่ามีเรื่องไหนน่าสังเกตบ้าง</p>${chest()}<button class="primary" data-action="reveal">เปิดดูเส้นทางของฉัน <span aria-hidden="true">✧</span></button><p class="soft-note">คำตอบครั้งนี้ไม่ได้บอกว่าคุณจะเป็นแบบนี้ตลอดไป</p><button class="text-button" data-action="back">← ย้อนดูคำตอบ</button></section>`);
  }
  function result() {
    screen = 'result';
    const r = evaluate(answers);
    const strengths = r.strengths.map(d=>({name:d.name,copy:d.strongCopy}));
    if (r.specificStrength && strengths.length<2) strengths.push(r.specificStrength);
    const cards = (items, fallback) => items.length
      ? items.map(d=>`<div class="insight-item"><h3>${escape(d.name)}</h3><p>${escape(d.copy)}</p></div>`).join('')
      : `<p>${escape(fallback)}</p>`;
    const assessmentRows = kind => r.scores.filter(d=>d.kind===kind).map(d=>`
      <article class="assessment-row" data-dimension="${d.id}">
        <h4>${escape(d.name)}</h4>
        <span class="assessment-badge ${d.assessment.tone}">${escape(d.assessment.label)}</span>
        <p>${escape(d.assessment.description)}</p>
      </article>`).join('');
    const numericRows = kind => r.scores.filter(d=>d.kind===kind).map(d=>`
      <div class="numeric-row"><dt>${escape(d.name)}</dt><dd>${d.value===null?'ยังตอบได้ไม่พอ':Math.round(d.value)+' / 100'}</dd></div>`).join('');
    mount(`
      <section class="results page-width" data-result-status="${r.status}">
        <div class="result-heading">
          <p class="eyebrow">ลองมองตัวเองจากคำตอบครั้งนี้</p>
          <h1 tabindex="-1">ผล Self-Check ของคุณ</h1>
          <p>สรุปจากสิ่งที่คุณตอบในครั้งนี้<br>ไม่ได้แปลว่าคุณจะเป็นแบบนี้เสมอไป</p>
          <span class="result-count">ตอบ ${r.answered} จาก 12 ข้อ · ข้าม ${12-r.answered} ข้อ</span>
        </div>
        <div class="result-route" aria-label="สิ่งที่พบในแต่ละช่วง">
          ${r.stageResults.map((s,i)=>`<div class="result-stop ${s.state}" style="${stageTheme(i)}">
            <span class="stop-number">0${i+1}</span>${icon(s.symbol)}<strong>${escape(s.name)}</strong>
            <p>${escape(s.label)}</p><small>${s.count}/${s.total} ข้อ${s.count && s.count<s.total?' · ยังตอบไม่ครบ':''}</small>
          </div>`).join('')}
        </div>
        <p class="map-disclaimer">ดูแยกทีละช่วงได้เลย แต่ละเรื่องไม่จำเป็นต้องเกิดในวันเดียวกัน</p>
        <section class="main-insight" data-primary-dimension="${r.watch[0]?.id || ''}">
          <p class="eyebrow">สิ่งที่ได้จากคำตอบของคุณ</p><h2>${escape(r.title)}</h2><p>${escape(r.body)}</p>
          ${r.focus && !['balanced','insufficient','partial'].includes(r.status)?`
            <div class="evidence"><span>คุณตอบไว้ในข้อ “${escape(r.focus.q.title)}” ว่า</span><p>“${escape(r.focus.choice.text)}”</p></div>`:''}
        </section>
        <div class="insight-grid">
          <section class="insight-card strength-card"><p class="mini-label">สิ่งที่ทำได้ดี เก็บไว้ทำต่อ</p>
            ${cards(strengths,config.resultCopy.noStrength)}</section>
          <section class="insight-card"><p class="mini-label">สิ่งที่อยากให้ระวัง</p>
            ${cards(r.watch,r.status==='balanced'?'จากที่ตอบมา ยังไม่มีเรื่องที่ต้องระวังเป็นพิเศษ ลองเทียบกับบันทึกการเทรดจริงต่อได้'
              :r.status==='specific'?'ลองกลับไปดูข้อที่ทำต่างจากแผน ว่าอะไรเกิดขึ้นก่อนหน้านั้น'
              :'ตอนนี้ยังบอกเรื่องที่ควรระวังเพิ่มเติมได้ไม่ชัด')}</section>
        </div>
        <section class="observation"><span aria-hidden="true">✧</span><div>
          <p class="mini-label">ครั้งหน้า ลองถามตัวเองแบบนี้</p><h2>“${escape(r.observe)}”</h2>
          <p>จดสั้น ๆ ก็พอ: เกิดอะไรขึ้น → รู้สึกหรือคิดยังไง → ทำอะไรต่อ</p>
        </div></section>
        <section class="scores">
          <div class="section-heading"><p class="eyebrow">ค่อย ๆ ดูทีละเรื่อง</p>
            <h2>เรื่องไหนควรระวัง เรื่องไหนทำได้ดี</h2>
            <p>อ่านคำสรุปของแต่ละเรื่องได้เลย ทั้งหมดอิงจากคำตอบครั้งนี้<br>ถ้ายังตอบไม่พอ เราจะเว้นไว้ ไม่เดาแทนคุณ</p>
          </div>
          <div class="scores-grid assessment-grid">
            <section><h3>ช่วงที่อาจเผลอหลุดแผน</h3><p class="score-direction">ดูว่าช่วงไหนควรระวัง และช่วงไหนยังทำตามแผนได้</p>
              ${assessmentRows('signal')}</section>
            <section class="skill-scores"><h3>สิ่งที่ช่วยให้ทำตามแผนได้</h3><p class="score-direction">สิ่งที่ทำได้ดีให้ทำต่อ ส่วนที่ยังขาดค่อย ๆ เติม</p>
              ${assessmentRows('strength')}
              <p class="score-explanation">รู้สึกอยากเปลี่ยนแผนได้ แต่ไม่จำเป็นต้องทำตามความรู้สึกนั้นทุกครั้ง การรู้ทันแล้วหยุดไว้ได้ก็นับเป็นสิ่งที่ทำได้ดี</p>
            </section>
          </div>
          <details class="score-details">
            <summary>ดูคะแนนที่ใช้สรุปผล</summary>
            <p>ตัวเลขนี้ใช้ช่วยสรุปคำตอบ ไม่ใช่คะแนนสอบหรือเปอร์เซ็นต์ที่จะเกิดเหตุจริง เกณฑ์นี้ทำขึ้นสำหรับเครื่องมือนี้ ไม่ใช่แบบทดสอบทางจิตวิทยาที่ผ่านการรับรอง</p>
            <div class="numeric-grid">
              <section><h3>การเผลอหลุดแผนจากคำตอบ</h3><p><strong>ตัวเลขมาก = มีเรื่องให้ระวังมากขึ้น</strong><br>ไม่ได้หมายความว่าทำได้ดีขึ้น</p><dl>${numericRows('signal')}</dl></section>
              <section><h3>การทำตามแผนและทบทวน</h3><p><strong>ตัวเลขมาก = คำตอบบอกว่าทำด้านนี้ได้มากขึ้น</strong><br>ยังต้องดูด้วยว่ามีข้อไหนที่หลุดแผน</p><dl>${numericRows('strength')}</dl></section>
            </div>
          </details>
        </section>
        <section class="product-card">
          <div class="product-art"><img class="real-cover" src="assets/ebook-cover.png" width="1055" height="1491" loading="lazy" alt="ปกหนังสือ จิตวิทยาการเทรด ฉบับลงมือทำ"><span class="product-art-note">เข้าใจ · วางแผน · ลงมือทำ</span></div>
          <div><p class="eyebrow">ลองต่อด้วยการเทรดจริง</p>
            <h2>${r.status==='insufficient'?'เริ่มจากจด<br>สิ่งที่เกิดขึ้นสักหนึ่งไม้':'เริ่มเห็นแล้ว<br>ลองจดไว้ดูตอนเทรดจริง'}</h2>
            <p>วันนี้เราตอบจากความทรงจำ ครั้งหน้าลองจดไว้ว่าเกิดอะไรขึ้น รู้สึกยังไง และทำอะไรต่อ จะได้กลับมาดูว่าเป็นแบบเดิมอีกไหม</p>
            <p>ชุด <strong>จิตวิทยาการเทรด ฉบับลงมือทำ</strong> ช่วยให้ทำต่อได้ง่ายขึ้น มี eBook ให้อ่านทำความเข้าใจ Workbook ช่วยวางแผน และ PTM Journal — Trading Psychology Edition สำหรับจดและทบทวนการเทรด</p>
            <a class="primary" id="product-link" data-action="product" href="${escape(productUrl(location.href))}" referrerpolicy="no-referrer">ดูรายละเอียดชุดจิตวิทยาการเทรด <span aria-hidden="true">↗</span></a>
          </div>
        </section>
        <div class="result-actions"><button class="text-button" data-action="review">← กลับไปดูคำตอบ</button><button class="text-button" data-action="restart">ลองทำใหม่ ↻</button></div>
        <p class="privacy">เครื่องมือนี้ไม่ใช่การวินิจฉัยด้านสุขภาพจิตหรือคำแนะนำการลงทุน</p>
      </section>`);
    track('SelfCheckResultView');
  }
  function advance() {
    if (index < questions.length-1) { index++; question(); } else gate();
  }
  async function answer(value, button) {
    if (busy || screen !== 'question') return;
    busy = true;
    answers[questions[index].id] = value;
    button.classList.add('selected');
    button.setAttribute('aria-pressed','true');
    main.querySelectorAll('button').forEach(b=>b.disabled=true);
    await new Promise(resolve=>setTimeout(resolve,reduced()?0:260));
    advance();
    busy = false;
  }
  main.addEventListener('click', async event => {
    const target = event.target.closest('button, a[data-action]');
    if (!target || busy) return;
    if (target.dataset.answer) return answer(target.dataset.answer,target);
    switch (target.dataset.action) {
      case 'start': track('SelfCheckStart'); question(); break;
      case 'skip': answer(null,target); break;
      case 'next': if (Object.hasOwn(answers,questions[index].id)) advance(); break;
      case 'back': if (screen==='gate') { index=11; question(); } else if (index>0) { index--; question(); } else intro(); break;
      case 'reveal':
        busy=true;
        target.disabled=true;
        main.querySelector('.treasure').classList.add('is-open');
        await new Promise(resolve=>setTimeout(resolve,reduced()?0:650));
        result(); busy=false; break;
      case 'review': index=0; question(); break;
      case 'restart':
        if (window.confirm('เริ่มใหม่เลยไหม? คำตอบและผลครั้งนี้จะหายไป')) { answers={}; index=0; sent=new Set(); intro(); }
        break;
      case 'product': track('SelfCheckProductClick',false); break;
    }
  });
  // Keep UTM and current answers when returning to the intro via the brand.
  document.querySelector('.brand').addEventListener('click',event=>{ event.preventDefault(); if (!busy) intro(); });
  intro();
})();
