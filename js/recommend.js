// Turns the buyer's answers into three picks.
// In a real product, a model would write the "why" and "tradeoff" lines and a
// retrieval step would fetch the catalog facts. In this demo, simple rules
// stand in for the model, and the facts come from CATALOG. The split is the
// point: facts are looked up, never written; only the explanations are generated.

const BUDGET_MAX = {
  'Under $800': 800,
  '$800 to $1,200': 1200,
  '$1,200 to $1,800': 1800,
  'Over $1,800': Infinity,
  'Not sure yet': Infinity
};

function needsFrom(answers) {
  const use = answers.use;
  const creative = use.includes('Design, photo or video editing');
  const heavy = use.includes('Spreadsheets and data analysis') || use.includes('Software development');
  return {
    memory: creative ? 32 : heavy ? 16 : 8,
    gpu: creative,
    pro: answers.extras.includes('Windows 11 Pro for IT management'),
    large: answers.extras.includes('Larger 15 to 16 inch screen'),
    touch: answers.extras.includes('Touch screen'),
    battery: answers.extras.includes('All-day battery') ? 12 : 0,
    travel: answers.travel,
    heavy, creative
  };
}

// What the whole order costs, honoring a promo that only covers some units
function orderPrice(item, qty) {
  if (item.promo && qty > 0) {
    const promoUnits = Math.min(qty, item.promo.maxUnits);
    const fullUnits = qty - promoUnits;
    const total = promoUnits * item.promo.price + fullUnits * item.price;
    return { total, perUnit: total / qty, promoUnits, fullUnits };
  }
  return { total: item.price * qty, perUnit: item.price, promoUnits: 0, fullUnits: qty };
}

// Adds business days, skipping weekends
function shipDate(from, businessDays) {
  const d = new Date(from);
  let added = 0;
  while (added < businessDays) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return d;
}

function stockFor(item, qty, today) {
  const s = item.stock;
  const readyBy = shipDate(today, s.readyDays);
  if (s.ready >= qty) return { all: true, ready: qty, readyBy };
  const fromNext = Math.min(qty - s.ready, s.next || 0);
  return {
    all: false,
    ready: s.ready,
    readyBy,
    later: fromNext,
    laterBy: s.next ? shipDate(today, s.nextDays) : null,
    short: qty - s.ready - fromNext
  };
}

function meetsNeeds(item, n) {
  return item.memory >= n.memory &&
    (!n.gpu || item.gpu) &&
    (!n.pro || item.pro) &&
    (!n.large || item.screen >= 15) &&
    (!n.touch || item.touch) &&
    item.battery >= n.battery;
}

// How well a laptop suits the way the team works (higher is better)
function fitScore(item, n) {
  let score = 0;
  if (n.travel === 'Some travel or hybrid') {
    if (item.weight <= 3.5) score += 2;
    if (item.battery >= 12) score += 1;
  }
  if (n.travel === 'On the road every week') {
    if (item.weight <= 3.0) score += 3; else if (item.weight <= 3.3) score += 1;
    if (item.battery >= 12) score += 1;
  }
  if (n.travel === 'Mostly at desks' && item.screen >= 15) score += 1;
  return score;
}

function capability(item) {
  return item.memory * 100 + (item.gpu ? 50 : 0) + item.battery;
}

function reasonFor(item, n, isCheapest) {
  let main;
  if (n.creative) main = 'Has the graphics and 32 GB of memory that photo and video work needs';
  else if (n.heavy) main = item.memory > n.memory ? 'Has extra memory for heavy spreadsheets and development' : 'Handles video calls and large spreadsheets without slowing down';
  else main = 'Covers email, documents and video calls';

  let extra = '';
  if (n.travel === 'On the road every week' && item.weight <= 3.1) extra = `, and stays light at ${item.weight} lb with a ${item.battery}-hour battery`;
  else if (n.travel === 'Some travel or hybrid' && item.weight <= 3.5) extra = ', and is easy to carry between home and office';
  else if (n.travel === 'Mostly at desks' && item.screen >= 15) extra = ', with a larger screen for long days at a desk';

  return main + extra + '.' + (isCheapest ? ' The lowest price that still fits your needs.' : '');
}

function tradeoffFor(item, picks, n, budgetMax, perUnit) {
  const heaviest = picks.reduce((a, b) => (b.weight > a.weight ? b : a));
  const priciest = picks.reduce((a, b) => (b.price > a.price ? b : a));
  const cheapest = picks.reduce((a, b) => (b.price < a.price ? b : a));
  const shortest = picks.reduce((a, b) => (b.battery < a.battery ? b : a));
  const most = (key) => Math.max(...picks.map((p) => p[key]));

  if (perUnit > budgetMax) return `Over your budget by about $${Math.round(perUnit - budgetMax).toLocaleString('en-US')} per laptop.`;
  if (item === heaviest && item.weight > 3.3 && n.travel !== 'Mostly at desks') return `The heaviest of the three at ${item.weight} lb, so less ideal for travel.`;
  if (item === priciest && item !== cheapest && item.memory > n.memory) return 'More power than your answers call for, so you pay for headroom.';
  if (item === cheapest && item.memory === n.memory) return `Least headroom: ${item.memory} GB is enough today but may feel tight in a few years.`;
  if (item === shortest && item.battery < most('battery')) return `The shortest battery of the three, at ${item.battery} hours.`;
  if (item.storage < most('storage')) return `Less storage than the top pick: ${item.storage >= 1024 ? '1 TB' : item.storage + ' GB'}.`;
  if (item !== cheapest) return `Costs $${(item.price - cheapest.price).toLocaleString('en-US')} more per laptop than ${cheapest.name}.`;
  return 'The fewest extras of the three.';
}

function recommend(answers, catalog, today = new Date()) {
  const n = needsFrom(answers);
  const qty = answers.qty;
  const budgetMax = BUDGET_MAX[answers.budget] ?? Infinity;

  const candidates = catalog.filter((item) => meetsNeeds(item, n))
    .map((item) => ({ item, order: orderPrice(item, qty) }));

  const inBudget = candidates.filter((c) => c.order.perUnit <= budgetMax);
  if (!inBudget.length) {
    const closest = candidates.slice().sort((a, b) => a.order.perUnit - b.order.perUnit)[0] || null;
    return { status: 'no-match', needs: n, budgetMax, closest };
  }

  const byPrice = (a, b) => a.order.perUnit - b.order.perUnit;
  const bestFit = inBudget.slice().sort((a, b) => fitScore(b.item, n) - fitScore(a.item, n) || byPrice(a, b))[0];
  const good = candidates.slice().sort(byPrice)[0];
  // The top pick may go up to about a third over budget, and is flagged when it does
  const stretchCap = budgetMax === Infinity ? Infinity : budgetMax * 1.35;
  const best = candidates.filter((c) => c.order.perUnit <= stretchCap)
    .sort((a, b) => capability(b.item) - capability(a.item) || byPrice(a, b))[0];

  const chosen = [];
  for (const c of [good, bestFit, best]) if (c && !chosen.includes(c)) chosen.push(c);
  // Fill to three with the best-scoring remaining options in budget
  for (const c of inBudget.slice().sort((a, b) => fitScore(b.item, n) - fitScore(a.item, n) || byPrice(a, b))) {
    if (chosen.length >= 3) break;
    if (!chosen.includes(c)) chosen.push(c);
  }
  chosen.sort(byPrice);

  const tiers = chosen.length === 3 ? ['Good', 'Better', 'Best'] : chosen.length === 2 ? ['Good', 'Better'] : ['Best fit'];
  const items = chosen.map((c) => c.item);

  return {
    status: 'ok',
    needs: n,
    budgetMax,
    picks: chosen.map((c, i) => ({
      tier: tiers[i],
      item: c.item,
      order: c.order,
      stock: stockFor(c.item, qty, today),
      bestFit: c === bestFit,
      overBudget: c.order.perUnit > budgetMax,
      reason: reasonFor(c.item, n, c === chosen[0]),
      tradeoff: tradeoffFor(c.item, items, n, budgetMax, c.order.perUnit)
    }))
  };
}
