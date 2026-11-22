// Lead form (no backend yet: builds a LINE message instead of pretending to send) + listing filters.
(() => {
  const LINE_OA = '@652ddpuz';
  const form = document.getElementById('lead-form');
  if (form) {
    const help = form.querySelector('#lead-help');
    const lineBtn = form.querySelector('[data-line-send]');
    const panes = form.querySelectorAll('[data-pane]');
    const intentLabel = { buy: '我想買房', sell: '我想賣房、出租', rent: '我想租房' };
    const sync = () => {
      const v = form.querySelector('input[name="intent"]:checked').value;
      panes.forEach((p) => { const on = p.dataset.pane === v; p.hidden = !on; p.disabled = !on; });
      lineBtn.hidden = true; help.textContent = '';
    };
    form.querySelectorAll('input[name="intent"]').forEach((r) => r.addEventListener('change', sync));
    sync();
    const buildText = () => {
      const v = form.querySelector('input[name="intent"]:checked').value;
      const lines = ['您好，我在網站上填了需求：' + intentLabel[v]];
      const seen = {};
      new FormData(form).forEach((val, key) => {
        if (key === 'intent' || key === '同意個資告知') return;
        val = String(val).trim(); if (!val) return;
        if (seen[key]) { seen[key].push(val); } else { seen[key] = [val]; }
      });
      Object.entries(seen).forEach(([k, vs]) => lines.push(k + '：' + vs.join('、')));
      return lines.join('\n');
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const need = [form.querySelector('#f-name'), form.querySelector('#f-tel'), form.querySelector('#f-consent')];
      let first = null;
      need.forEach((el) => { const ok = el.type === 'checkbox' ? el.checked : el.value.trim() !== ''; el.toggleAttribute('aria-invalid', !ok); if (!ok && !first) first = el; });
      if (first) {
        first.setAttribute('aria-describedby', 'lead-help');
        help.textContent = first.type === 'checkbox' ? '請先勾選同意個人資料蒐集告知。' : '請填寫姓名和電話，津銓才能回覆您。';
        first.focus(); lineBtn.hidden = true; return;
      }
      if (!form.dataset.endpoint) {
        lineBtn.href = 'https://line.me/R/oaMessage/' + LINE_OA + '/?' + encodeURIComponent(buildText());
        lineBtn.hidden = false;
        help.textContent = '這是示範版，網站還沒連上後台，資料沒有送出。請按「用 LINE 傳給我」，把剛剛填的內容直接傳給津銓。';
        lineBtn.focus();
      }
    });
  }
  // Listing filters
  const list = document.querySelector('[data-listings]');
  if (list) {
    const state = { cat: 'all', deal: 'all' };
    const count = document.querySelector('[data-count]');
    const apply = () => {
      let n = 0;
      list.querySelectorAll('[data-cat]').forEach((li) => {
        const ok = (state.cat === 'all' || li.dataset.cat === state.cat) && (state.deal === 'all' || li.dataset.deal === state.deal);
        li.hidden = !ok; if (ok) n++;
      });
      count.textContent = n ? '共 ' + n + ' 件範例物件' : '這個條件目前沒有範例物件，換個類型看看。';
    };
    document.querySelectorAll('[data-filter-cat],[data-filter-deal]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.filterCat !== undefined ? 'cat' : 'deal';
      state[k] = b.dataset.filterCat ?? b.dataset.filterDeal;
      document.querySelectorAll(k === 'cat' ? '[data-filter-cat]' : '[data-filter-deal]').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
      apply();
    }));
  }
})();
