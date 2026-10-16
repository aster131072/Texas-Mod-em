function getActiveRulesDSL() {
  return rules
    .filter(r => r.enabled)
    .sort((a, b) => b.priority - a.priority);
}
/* ===== 卡牌输入 ===== */

const RANKS = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"];
const SUITS = ["♠","♥","♦","♣"];

function createCardSelect(onChange) {
  const sel = document.createElement("select");
  RANKS.forEach(r =>
    SUITS.forEach(s => {
      const o = document.createElement("option");
      o.value = r + s;
      o.textContent = r + s;
      sel.appendChild(o);
    })
  );
  sel.onchange = onChange;
  return sel;
}

function renderBoard() {
  const b = document.getElementById("board");
  b.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    b.appendChild(createCardSelect(updateResults));
  }
}

/* ===== 玩家 ===== */
let nextPlayerId = 1;
const players = [];

function addPlayer() {
  players.push({ id:nextPlayerId++, name: "", cards: ["",""] });
  renderPlayers();
}

function renderPlayers() {
  const box = document.getElementById("players");
  box.innerHTML = "";

  players.forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "card-row";
		row.appendChild(createNameInput(p));
    row.appendChild(createCardSelect(updateResults));
    row.appendChild(createCardSelect(updateResults));

    box.appendChild(row);
  });

  updateResults();
}
function createNameInput(player) {
  const input = document.createElement("input");
  input.className = "player-name";
  input.placeholder = "咏雷电子"+player.id+"号";
  input.value = player.name;
  player.name = input.placeholder;
	
  input.addEventListener("input", () => {
    player.name = input.value.trim();
    renderResults();
  });

  return input;
}

/* ===== 计算 ===== */

function parseCard(c) {
  const rankMap = {
    "2": 2, "3": 3, "4": 4, "5": 5, "6": 6,
    "7": 7, "8": 8, "9": 9,
    "T": 10, "J": 11, "Q": 12, "K": 13, "A": 14
  };
  return {
    rank: rankMap[c[0]],
    suit: c[1]
  };
}
function countByRank(cards) {
  const m = {};
  cards.forEach(c => {
    m[c.rank] = (m[c.rank] || 0) + 1;
  });
  return m;
}

function countBySuit(cards) {
  const m = {};
  cards.forEach(c => {
    m[c.suit] = (m[c.suit] || 0) + 1;
  });
  return m;
}
function matchCondition(cards, cond) {
  if (cond.type === "count") return matchCount(cards, cond);
  if (cond.type === "pairCount") return matchPairCount(cards, cond);
  if (cond.type === "flush") return matchFlush(cards);
  if (cond.type === "straight") return matchStraight(cards);
  if (cond.type === "not") return !matchCondition(cards, cond.inner);
  return false;
}
function compareCount(c, mode, v) {
  if (mode === "exact") return c === v;
  if (mode === "min") return c >= v;
  if (mode === "max") return c <= v;
  return false;
}
function matchPairCount(cards, cond){
	const counts = countByRank(cards);
  const pairNum = Object.values(counts)
    .filter(c => c >= 2)
    .length;

  if (cond.mode === "exact") return pairNum === cond.value;
  if (cond.mode === "min")   return pairNum >= cond.value;
  if (cond.mode === "max")   return pairNum <= cond.value;

  // 默认 exact
  return pairNum === cond.value;
}
function matchCount(cards, cond) {
  const counts = countByRank(cards);

  if (cond.rank === "*") {
    return Object.values(counts).some(c =>
      compareCount(c, cond.countMode, cond.value)
    );
  }

  return compareCount(counts[cond.rank] || 0,
                      cond.countMode,
                      cond.value);
}
function matchFlush(cards) {
  return Object.values(countBySuit(cards)).some(c => c >= 5);
}

function matchStraight(cards) {
  const ranks = [...new Set(cards.map(c => c.rank))].sort((a,b)=>a-b);

  // A2345
  if (ranks.includes(14)) ranks.unshift(1);

  let run = 1;
  for (let i = 1; i < ranks.length; i++) {
    if (ranks[i] === ranks[i-1] + 1) {
      run++;
      if (run >= 5) return true;
    } else if (ranks[i] !== ranks[i-1]) {
      run = 1;
    }
  }
  return false;
}
function matchRule(cards, rule) {
  if (!rule.enabled) return null;
  const results = rule.conditions.map(c => matchCondition(cards, c));
  const ok = rule.matchMode === "any"
    ? results.some(Boolean)
    : results.every(Boolean);          // 默认 all
  return ok ? buildHandValue(cards, rule) : null;
}

function buildContext(cards, rule) {
  const ranks = cards.map(c => c.rank).sort((a,b)=>b-a);

  const counts = {};
  for (const r of ranks) counts[r] = (counts[r] || 0) + 1;

  const groups = Object.entries(counts)
    .map(([r,c]) => ({ rank:+r, count:c }))
    .sort((a,b)=> b.count - a.count || b.rank - a.rank);
	const quad = groups.find(g => g.count >= 4);

  return {
    cards,
    ranks,
    counts,
    groups,

    quadRank: quad ? quad.rank : null,
    tripleRank: groups.find(g=>g.count===3)?.rank,
    pairRanks: groups.filter(g=>g.count===2).map(g=>g.rank),
    pairRank: groups.find(g=>g.count===2)?.rank,

    restRanks: groups
  .filter(g => g.count === 1)
  .map(g => g.rank)
  .sort((a,b)=>b-a),

    sortedRanks: [...ranks]
  };
}
const STRING_KICKERS = {
  quadRank: ctx => [ctx.quadRank],
  tripleRank: ctx => [ctx.tripleRank],
  pairRank: ctx => [ctx.pairRank],
  pairRanks: ctx => ctx.pairRanks,
  kicker: ctx => ctx.restRanks.slice(0, 1),
  restRanks: ctx => ctx.restRanks,
  sortedRanks: ctx => ctx.sortedRanks
};
function evalStringKicker(k, ctx) {
  const fn = STRING_KICKERS[k];
  return fn ? fn(ctx) : [];
}
function buildKickers(kickersDSL, ctx) {
  const out = [];
  for (const k of kickersDSL) {
    if (typeof k === "string") {                 // 兼容旧 DSL
      out.push(...evalStringKicker(k, ctx));
      continue;
    }
    if (k.source === "rank" && k.rank) {
      for (let i = 0; i < (k.count || 1); i++) out.push(k.rank);
    } else if (k.source === "remaining") {
      out.push(...ctx.restRanks.slice(0, k.count || 1));
    }
  }
  return out.filter(v => typeof v === "number");
}
function buildHandValue(cards, rule) {
  const ctx = buildContext(cards, rule);   // 语义分析
  const kickers = buildKickers(rule.kickers, ctx);

  return {
    priority: rule.priority,
    kickers,
    cards,
    ruleName: rule.name
  };
}


function combinations(arr, k) {
  const res = [];
  function dfs(start, path) {
    if (path.length === k) {
      res.push([...path]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      path.push(arr[i]);
      dfs(i + 1, path);
      path.pop();
    }
  }
  dfs(0, []);
  return res;
}
function evaluateHand(cards, rules) {
  let best = null;

  for (const five of combinations(cards, 5)) {
    for (const rule of rules) {
      const hv = matchRule(five, rule);
      if (!rule.enabled) continue;
      if (!hv) continue;
      const hvWithCards = {
        ...hv,
        cards: five   // ★ 关键
      };
      if (!best || compareHandValue(hvWithCards, best) > 0) {
        best = hvWithCards;
      }
    }
  }
  if (!best) {
    return {
      ruleName: "无匹配规则",
      priority: -1,
      kickers: [],
      cards: []
    };
  }
  console.log(best);
  return best;
}

function compareHandValue(a, b) {
  if (a.priority !== b.priority) {
    return a.priority - b.priority;
  }
  const len = Math.max(a.kickers.length, b.kickers.length);
  for (let i = 0; i < len; i++) {
    const ka = a.kickers[i] ?? -1;
    const kb = b.kickers[i] ?? -1;
    if (ka !== kb) return ka - kb;
  }
  return 0;
}



/* ===== 结果区 ===== */
function getBoardCards() {
  return [...document.querySelectorAll("#board select")]
    .map(sel => sel.value)
    .filter(v => v);   // 去掉空
}
function getPlayersCards() {
  const rows = document.querySelectorAll("#players .card-row");
  return [...rows].map(row =>
    [...row.querySelectorAll("select")]
      .map(sel => sel.value)
      .filter(v => v)
  );
}
function updateResults() {
  const board = getBoardCards();
  const players = getPlayersCards();
  const results = players.map((hand, i) => {
    const cards = [...hand, ...board].map(parseCard)
    const r = evaluateHand(cards, rules);
    return r;
  });
  renderResults(results);
}


function getWinners(results) {
  let best = null;

  for (const r of results) {
    if (!r) continue;
    //if (r.status !== "ok") continue;

    if (!best || compareHandValue(r, best) > 0) {
      best = r;
    }
  }
  if (!best) {
    return 0;
  }
  return results.map(r =>
    r && compareHandValue(r, best) === 0
  );
}

function cardToText(c) {
  const map = { 11:"J",12:"Q",13:"K",14:"A" };
  const r = map[c.rank] || c.rank;
  return r + c.suit;
}
function renderResults(results) {
  const box = document.getElementById("results");
  box.innerHTML = "";

  const winners = getWinners(results);

	results.forEach((r, i) => {
	  const div = document.createElement("div");
	  div.className = "result-row";

	  /*if (r[i].status === "incomplete") {
	    div.textContent = `玩家 ${i + 1}：牌未凑齐`;
	  }
	  else if (r[i].status === "no-match") {
	    div.textContent = `玩家 ${i + 1}：无匹配牌型（请检查规则）`;
	  }
	  else*/ {
	  	//console.log(r);
	    const used = r.cards.map(cardToText).join(" ");
	    div.innerHTML = `
	      ${players[i].name} ：
	      <strong>${r.ruleName}</strong>
	      （等级 ${r.priority}）
	      <br/>
	      使用牌：${used}
	      <br/>
	      Kickers：${r.kickers.join(", ")}
	    `;
	  }

	  box.appendChild(div);
	});

}
/* =========================================================
 *  德州扑克：牌堆 / 抽牌 / 发牌
 *  追加到 CardDecision.js 末尾即可
 * ========================================================= */

const DECK_RANKS = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"];
const DECK_SUITS = ["♠","♥","♦","♣"];

/** 当前剩余牌堆（数组末尾 = 牌堆顶部） */
let deck = [];

/* ---------- 牌堆基础 ---------- */

/** 造一副 52 张的牌，元素形如 "T♠"，与 createCardSelect 的 option.value 完全一致 */
function createDeck() {
  const d = [];
  for (const r of DECK_RANKS) {
    for (const s of DECK_SUITS) {
      d.push(r + s);
    }
  }
  return d;
}

/** Fisher-Yates 原地洗牌 */
function shuffleDeck(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 重新洗一副完整的牌，并重置牌堆 */
function resetDeck() {
  deck = shuffleDeck(createDeck());
  return deck;
}

/** 从牌堆抽 n 张（抽走的牌不会再出现），牌堆不足时返回实际抽到的张数 */
function drawCards(n = 1) {
  const out = [];
  while (out.length < n && deck.length > 0) {
    out.push(deck.pop());
  }
  return out;
}

/** 从牌堆抽 1 张，没有则返回 null */
function drawCard() {
  return drawCards(1)[0] ?? null;
}

/* ---------- 工具 ---------- */

/** 把某张牌写入一个 <select>，成功返回 true */
function setSelectValue(sel, value) {
  if (!sel || !value) return false;
  const ok = Array.from(sel.options).some(o => o.value === value);
  if (!ok) return false;
  sel.value = value;
  return true;
}

/** 取公共牌的 5 个 select */
function getBoardSelects() {
  return Array.from(document.querySelectorAll("#board select"));
}

/** 取每个玩家的手牌 select（二维数组：玩家 -> [select, select]） */
function getPlayerSelects() {
  return Array.from(document.querySelectorAll("#players .card-row"))
    .map(row => Array.from(row.querySelectorAll("select")));
}

/* ---------- 主函数：发一整手牌 ---------- */

/**
 * 发牌：
 *  1. 重置并洗牌
 *  2. 给每个玩家轮流发 2 张
 *  3. 给公共牌区发 5 张
 *  4. 同步 players 数据模型 + 重算结果
 */
function dealCards() {
  const boardSelects  = getBoardSelects();
  const playerSelects = getPlayerSelects();

  const need =
    playerSelects.reduce((n, sels) => n + sels.length, 0) +
    boardSelects.length;

  if (need > 52) {
    alert(`需要 ${need} 张牌，但一副牌只有 52 张`);
    return;
  }

  //resetDeck();

  /* 1) 每个玩家轮流发牌（第一轮每人一张，第二轮每人一张） */
  const maxHand = playerSelects.length
    ? Math.max(...playerSelects.map(sels => sels.length))
    : 0;

  for (let round = 0; round < maxHand; round++) {
    for (const sels of playerSelects) {
      if (round >= sels.length) continue;
      const card = drawCard();
      if (card) setSelectValue(sels[round], card);
    }
  }

  /* 2) 公共牌 5 张（如需真实感可在每次发牌前先 drawCard() 烧一张） */
  for (const sel of boardSelects) {
    const card = drawCard();
    if (card) setSelectValue(sel, card);
  }

  /* 3) 同步数据模型，保持 players 与 DOM 一致 */
  players.forEach((p, i) => {
    const sels = playerSelects[i];
    if (sels) p.cards = sels.map(s => s.value);
  });
  updateResults();
/* ---------- 生成发牌文字 ---------- */

/**
 * 根据当前界面上的牌，生成一段发牌说明文字
 * 形如：
 *   公共牌：A♠ K♥ Q♦ J♣ T♠
 *   1号的手牌是：A♠ K♥
 *   2号的手牌是：Q♦ J♣
 */
function buildDealText() {
  const lines = [];

  /* 公共牌 */
  const board = getBoardSelects()
    .map(sel => sel.value)
    .filter(v => v);
  lines.push(`公共牌：${board.length ? board.join(" ") : "（未发）"}`);

  /* 每个玩家 */
  getPlayerSelects().forEach((sels, i) => {
    const cards = sels.map(s => s.value).filter(v => v);
    // 优先用玩家名（含 placeholder 默认名），拿不到就退化成「i号」
    const name = (players[i] && players[i].name) || `${i + 1}号`;
    lines.push(`${name} 的手牌是：${cards.length ? cards.join(" ") : "（未发）"}`);
  });

  return lines.join("\n");
}

/* ---------- 显示到界面 ---------- */

function renderDealText() {
  const box = document.getElementById("deal-text");
  if (!box) return;
  box.textContent = buildDealText();
}
  /* 4) 重算结果 */
  updateResults();
  renderDealText();
}

/* ---------- 可选：只抽牌不分配（调试 / 扩展用） ---------- */

/** 抽 n 张牌并以 ["T♠", ...] 返回，不写入界面 */
function peekCards(n = 1) {
  return drawCards(n);
}

/* ---------- 绑定按钮 ---------- */

(function bindDealButton() {
  const btn = document.getElementById("deal-btn");
  if (btn) btn.addEventListener("click", dealCards);
})();

/* =========================================================
 *  导入：把「发牌文字」解析并填入界面
 * ========================================================= */

/* ---------- 解析 ---------- */

const VALID_RANKS = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"];
const SUIT_ALIAS = {
  "♠":"♠","♥":"♥","♦":"♦","♣":"♣",
  "S":"♠","H":"♥","D":"♦","C":"♣"
};

/** 把 "as" / "10♥" / "A♠" 等写法统一成 "A♠" 这种规范格式 */
function normalizeCard(tok) {
  if (!tok) return null;
  tok = tok.trim();
  if (!tok) return null;

  const suitChar = tok.slice(-1);
  let rankPart = tok.slice(0, -1).toUpperCase();
  const suit = SUIT_ALIAS[suitChar.toUpperCase()] || SUIT_ALIAS[suitChar];
  if (!suit) return null;

  if (rankPart === "10") rankPart = "T";
  if (!VALID_RANKS.includes(rankPart)) return null;

  return rankPart + suit;
}

/** 把 "A♠ K♥ Q♦" / "A♠,K♥,Q♦" 解析成 ["A♠","K♥","Q♦"] */
function parseCardList(str) {
  if (!str) return [];
  return str
    .split(/[\s,，、;；]+/)
    .map(normalizeCard)
    .filter(Boolean);
}

/** 解析整段发牌文字 */
function parseDealText(text) {
  const result = { board: [], players: [] };
  const lines = String(text || "").split(/\r?\n/);

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    /* 公共牌：... */
    const boardMatch = line.match(/^公共牌\s*[：:]\s*(.*)$/);
    if (boardMatch) {
      result.board = parseCardList(boardMatch[1]);
      continue;
    }

    /* xxx 的手牌是：... */
    const handMatch = line.match(/^(.+?)\s*的手牌是\s*[：:]\s*(.*)$/);
    if (handMatch) {
      const name = handMatch[1].trim();
      const cards = parseCardList(handMatch[2]);
      if (cards.length) result.players.push({ name, cards });
      continue;
    }
  }

  return result;
}

/* ---------- 应用 ---------- */

function importDealText(text) {
  const parsed = parseDealText(text);

  if (!parsed.board.length && !parsed.players.length) {
    alert("没有解析到有效的牌，请检查格式");
    return;
  }

  /* 1) 让玩家数量与导入内容对齐（只多不少，至少保留 1 个） */
  if (parsed.players.length) {
    while (players.length < parsed.players.length) {
      players.push({ id: nextPlayerId++, name: "", cards: ["", ""] });
    }
    while (players.length > parsed.players.length && players.length > 1) {
      players.pop();
    }
  }

  /* 2) 写入数据模型 */
  parsed.players.forEach((p, i) => {
    const name = p.name || `咏雷电子${i + 1}号`;
    players[i].name = name;
    while (players[i].cards.length < p.cards.length) {
      players[i].cards.push("");
    }
    players[i].cards = p.cards.slice();
  });

  /* 3) 重渲染玩家区域（会重建下拉框与名字输入框） */
  renderPlayers();

  /* 4) 填玩家名
        注意：createNameInput() 里会把 player.name 重置为 placeholder，
        所以这里在 renderPlayers() 之后手动写回输入框并同步数据模型 */
  const nameInputs = document.querySelectorAll("#players .player-name");
  parsed.players.forEach((p, i) => {
    const input = nameInputs[i];
    const name = p.name || `咏雷电子${i + 1}号`;
    if (input) {
      input.value = name;
      players[i].name = name;
    }
  });

  /* 5) 填玩家手牌 */
  const playerSelects = getPlayerSelects();
  parsed.players.forEach((p, i) => {
    const sels = playerSelects[i] || [];
    p.cards.forEach((card, j) => setSelectValue(sels[j], card));
  });

  /* 6) 填公共牌 */
  const boardSelects = getBoardSelects();
  parsed.board.forEach((card, i) => setSelectValue(boardSelects[i], card));

  /* 7) 刷新结果与文字 */
  updateResults();
  renderDealText();
}

/* ---------- 绑定按钮 ---------- */

(function bindImportButton() {
  const btn = document.getElementById("import-btn");
  const box = document.getElementById("import-text");
  if (!btn || !box) return;

  btn.addEventListener("click", () => importDealText(box.value));

  // 可选：Ctrl/Cmd + Enter 快速导入
  box.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      importDealText(box.value);
    }
  });
})();
/* ===== 初始化 ===== */
resetDeck();
renderBoard();
addPlayer();
addPlayer();
