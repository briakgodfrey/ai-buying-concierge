// AI Buying Concierge: the question step.
// One question at a time inside a native <dialog>, which gives us the focus
// trap, Escape to close and focus return for free. Answers stay in memory, so
// closing and reopening picks up where the buyer left off.

const dialog = document.getElementById('concierge');
const opener = document.getElementById('open-concierge');

if (dialog && opener) {
  const TOTAL = 5;
  const MAX_QTY = 500;
  const LOADING_MS = 1200;

  const state = { qty: null, use: [], travel: null, budget: null, extras: [] };
  let step = 1;
  let returnStep = 1;

  const $ = (sel) => dialog.querySelector(sel);
  const steps = dialog.querySelectorAll('.cg-step');
  const progress = $('[data-region="progress"]');
  const stepLabel = $('#cg-step-label');
  const bar = $('.cg-bar');
  const answersList = $('[data-region="answers"]');
  const foot = $('[data-region="foot"]');
  const backBtn = $('[data-action="back"]');
  const nextBtn = $('[data-action="next"]');
  const qtyInput = $('#q1-input');

  // Short labels for the answer chips
  const SHORT = {
    'Email, documents and video calls': 'calls and documents',
    'Spreadsheets and data analysis': 'spreadsheets',
    'Design, photo or video editing': 'creative work',
    'Software development': 'development',
    'Front desk or point of sale': 'front desk',
    'Mostly at desks': 'mostly at desks',
    'Some travel or hybrid': 'some travel',
    'On the road every week': 'weekly travel'
  };

  // ---------- Rendering ----------

  function showStep(next) {
    step = next;
    steps.forEach((s) => { s.hidden = String(s.dataset.step) !== String(step); });

    const isQuestion = typeof step === 'number';
    progress.hidden = !isQuestion;
    foot.hidden = !isQuestion;

    if (isQuestion) {
      stepLabel.textContent = `Question ${step} of ${TOTAL}`;
      bar.setAttribute('aria-valuenow', String(step));
      bar.style.setProperty('--progress', `${(step / TOTAL) * 100}%`);
      backBtn.hidden = step === 1;
      nextBtn.textContent = step === TOTAL ? 'Show my picks' : 'Next';
    }

    dialog.classList.toggle('is-wide', step === 'results');
    renderAnswers();

    const heading = dialog.querySelector(`.cg-step[data-step="${step}"] h3`);
    if (heading) heading.focus();
  }

  function answerChips() {
    const chips = [];
    if (state.qty) chips.push({ step: 1, text: `Laptops: ${state.qty}` });
    if (state.use.length) chips.push({ step: 2, text: `Use: ${state.use.map((u) => SHORT[u] || u).join(', ')}` });
    if (state.travel) chips.push({ step: 3, text: `Travel: ${SHORT[state.travel] || state.travel}` });
    if (state.budget) chips.push({ step: 4, text: `Budget: ${state.budget === 'Not sure yet' ? 'flexible' : state.budget}` });
    if (state.extras.length) chips.push({ step: 5, text: `Must-haves: ${state.extras.length}` });
    return chips;
  }

  function renderAnswers() {
    // Show answers already given, except the one being edited right now
    const chips = answerChips().filter((c) => c.step !== step);
    answersList.replaceChildren(...chips.map((c) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip chip-neutral cg-answer';
      btn.dataset.goto = String(c.step);
      btn.textContent = c.text;
      btn.setAttribute('aria-label', `Change ${c.text}`);
      li.append(btn);
      return li;
    }));
    answersList.hidden = chips.length === 0 || step === 'loading';
  }

  function setError(n, message) {
    const el = $(`#q${n}-error`);
    if (!el) return;
    el.textContent = message;
    const field = n === 1 ? qtyInput : $(`.cg-step[data-step="${n}"] fieldset`);
    if (field) field.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  // ---------- Reading and checking answers ----------

  function checked(name) {
    return [...dialog.querySelectorAll(`input[name="${name}"]:checked`)].map((i) => i.value);
  }

  function saveAndValidate(n) {
    if (n === 1) {
      const raw = qtyInput.value.trim();
      const qty = Number(raw);
      if (!raw || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
        setError(1, `Enter a whole number from 1 to ${MAX_QTY}. For larger orders, a sales rep can help.`);
        return false;
      }
      state.qty = qty;
    }
    if (n === 2) {
      state.use = checked('use');
      if (!state.use.length) { setError(2, 'Choose at least one, so we can match performance to the work.'); return false; }
    }
    if (n === 3) {
      state.travel = checked('travel')[0] || null;
      if (!state.travel) { setError(3, 'Choose the option closest to your team.'); return false; }
    }
    if (n === 4) {
      state.budget = checked('budget')[0] || null;
      if (!state.budget) { setError(4, 'Choose a range, or "Not sure yet."'); return false; }
    }
    if (n === 5) state.extras = checked('extras');
    setError(n, '');
    return true;
  }

  function syncQuickPicks() {
    dialog.querySelectorAll('.cg-quick-btn').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.set === qtyInput.value.trim()));
    });
  }

  // ---------- Actions ----------

  function openConcierge() {
    document.body.classList.add('cg-open');
    dialog.showModal();
    showStep(step === 'loading' ? TOTAL : step);
  }

  function next() {
    if (!saveAndValidate(step)) {
      const field = step === 1 ? qtyInput : $(`.cg-step[data-step="${step}"] .option-input`);
      if (field) field.focus();
      return;
    }
    if (step < TOTAL) { showStep(step + 1); return; }

    showStep('loading');
    setTimeout(() => { if (step === 'loading') showResults(); }, LOADING_MS);
  }

  // ---------- Results ----------

  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const day = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const CHECK = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 6.2l2.2 2.2L9.5 3.6"/></svg>';
  const TRUCK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 4h8v6.5h-8zM9.5 6.5h3l2 2v2h-5"/><circle cx="4" cy="11.5" r="1.3"/><circle cx="12" cy="11.5" r="1.3"/></svg>';

  // Small helper so every catalog value goes in as text, never as HTML
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function stockLine(stock) {
    const p = el('p', 'rec-stock t-data-sm');
    p.insertAdjacentHTML('afterbegin', TRUCK);
    let text;
    if (stock.all) text = `All ${stock.ready} ship by ${day(stock.readyBy)}`;
    else {
      text = `${stock.ready} ship by ${day(stock.readyBy)}`;
      if (stock.later) text += `, ${stock.later} more by ${day(stock.laterBy)}`;
      if (stock.short) text += `. A rep can source the other ${stock.short}`;
    }
    p.append(document.createTextNode(text));
    if (!stock.all) p.classList.add('is-partial');
    return p;
  }

  function card(pick, qty, index) {
    const { item, order } = pick;
    const id = `pick-${index}`;
    const article = el('article', 'rec-card' + (pick.bestFit ? ' is-best-fit' : ''));
    article.setAttribute('aria-labelledby', id);

    const top = el('div', 'rec-top');
    top.append(el('span', 'rec-tier t-label-xs', pick.tier.toUpperCase()));
    const flags = el('div', 'rec-flags');
    if (pick.bestFit) flags.append(el('span', 'chip chip-accent', 'Best fit for your team'));
    if (pick.overBudget) flags.append(el('span', 'chip chip-warning', 'Over budget'));
    top.append(flags);

    const title = el('h4', 't-h3', item.name);
    title.id = id;

    const specs = el('ul', 'rec-specs t-data-md');
    specs.append(
      el('li', '', `${item.memory} GB memory`),
      el('li', '', `${item.storage >= 1024 ? '1 TB' : item.storage + ' GB'} storage`),
      el('li', '', `${item.screen} in, ${item.weight} lb, ${item.battery} hr battery`)
    );

    const price = el('div', 'rec-price');
    price.append(el('p', 't-data-price', `${money(item.price)} each`));
    if (item.promo) {
      const covers = order.fullUnits === 0
        ? `Promo price ${money(item.promo.price)} applies to all ${qty}`
        : `Promo price ${money(item.promo.price)} covers ${order.promoUnits} of ${qty}`;
      price.append(el('p', 'rec-promo t-data-sm', covers));
    }
    price.append(el('p', 'rec-total t-label-md', `Total for ${qty}: ${money(order.total)}`));
    if (order.promoUnits && order.fullUnits) {
      price.append(el('p', 't-data-sm text-secondary', `${order.promoUnits} × ${money(item.promo.price)} + ${order.fullUnits} × ${money(item.price)}`));
    }
    const source = el('p', 'rec-source t-data-sm');
    source.insertAdjacentHTML('afterbegin', CHECK);
    source.append(document.createTextNode('Price and stock from the catalog'));
    price.append(source);

    const why = el('div', 'rec-why');
    why.append(el('p', 'rec-why-label t-label-xs', 'WHY · AI-ASSISTED'), el('p', 't-body-sm', pick.reason));

    const actions = el('div', 'rec-actions');
    const add = el('button', 'btn btn-primary', `Add ${qty} to cart`);
    add.type = 'button';
    add.dataset.cart = item.name;
    const compare = el('button', 'btn btn-secondary', 'Compare');
    compare.type = 'button';
    compare.dataset.compare = item.id;
    compare.setAttribute('aria-pressed', 'false');
    compare.setAttribute('aria-label', `Compare ${item.name}`);
    actions.append(add, compare);

    article.append(top, title, specs, price, stockLine(pick.stock), why, el('p', 'rec-tradeoff t-body-sm', `Tradeoff: ${pick.tradeoff.charAt(0).toLowerCase()}${pick.tradeoff.slice(1)}`), actions);
    return article;
  }

  function showResults() {
    const result = recommend(state, CATALOG);
    if (result.status === 'no-match') {
      const c = result.closest;
      $('[data-region="nomatch-text"]').textContent = c
        ? `The closest option is ${c.item.name} at ${money(c.order.perUnit)} per laptop. A full "no match" screen, with ways to close the gap, is the next piece of this build.`
        : 'No laptop in this demo catalog meets every must-have. A full "no match" screen is the next piece of this build.';
      showStep('nomatch');
      return;
    }
    const picks = result.picks;
    $('#qres-title').textContent = `${picks.length} ${picks.length === 1 ? 'pick' : 'picks'} for ${state.qty} ${state.qty === 1 ? 'laptop' : 'laptops'}`;
    $('[data-region="picks"]').replaceChildren(...picks.map((p, i) => card(p, state.qty, i)));
    $('[data-region="cart"]').textContent = '';
    $('[data-region="feedback"]').textContent = '';
    dialog.querySelectorAll('[data-feedback]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    showStep('results');
  }

  opener.addEventListener('click', openConcierge);

  dialog.addEventListener('close', () => document.body.classList.remove('cg-open'));

  // Clicking the dimmed backdrop closes the dialog, like Escape does
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

  dialog.addEventListener('click', (e) => {
    const target = e.target.closest('button');
    if (!target) return;

    const action = target.dataset.action;
    if (action === 'close') dialog.close();
    if (action === 'next') next();
    if (action === 'back' && typeof step === 'number' && step > 1) showStep(step - 1);
    if (action === 'rep') { returnStep = step; showStep('rep'); }
    if (action === 'resume') showStep(returnStep);

    if (action === 'edit') showStep(1);
    if (target.dataset.goto) showStep(Number(target.dataset.goto));

    if (target.dataset.cart) {
      $('[data-region="cart"]').textContent = `Added ${state.qty} × ${target.dataset.cart} to your cart. This is a demo, so nothing is ordered.`;
    }
    if (target.dataset.compare) {
      const on = target.getAttribute('aria-pressed') !== 'true';
      target.setAttribute('aria-pressed', String(on));
    }
    if (target.dataset.feedback) {
      dialog.querySelectorAll('[data-feedback]').forEach((b) => b.setAttribute('aria-pressed', String(b === target)));
      $('[data-region="feedback"]').textContent = target.dataset.feedback === 'yes'
        ? 'Thanks. This helps us keep the picks accurate.'
        : 'Thanks for telling us. Every "No" is reviewed, and a sales rep can help find a better fit.';
    }

    if (target.dataset.qty) {
      const current = Number(qtyInput.value) || 0;
      const value = Math.min(MAX_QTY, Math.max(1, current + Number(target.dataset.qty)));
      qtyInput.value = String(value);
      setError(1, '');
      syncQuickPicks();
    }
    if (target.dataset.set) {
      qtyInput.value = target.dataset.set;
      setError(1, '');
      syncQuickPicks();
    }
  });

  qtyInput.addEventListener('input', () => { setError(1, ''); syncQuickPicks(); });
  qtyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); next(); } });

  // Clear a question's error as soon as the buyer answers it
  dialog.addEventListener('change', (e) => {
    const section = e.target.closest('.cg-step');
    if (section && typeof step === 'number') setError(Number(section.dataset.step), '');
  });

  syncQuickPicks();
}
