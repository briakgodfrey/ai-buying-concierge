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
    setTimeout(() => { if (step === 'loading') showStep('done'); }, LOADING_MS);
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

    if (target.dataset.goto) showStep(Number(target.dataset.goto));

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
