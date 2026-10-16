

//let rules = PRESET_RULES.map(r => structuredClone(r));


let currentRuleIndex = 0;

/* ---------- 渲染 ---------- */

function renderRuleList() {
  const box = document.getElementById("rules-div");
  box.innerHTML = "";
  rules.forEach((r, i) => {
    const div = document.createElement("div");
    div.className = "rule-item" + (i === currentRuleIndex ? " active" : "");
    div.innerHTML = `
      <input type="checkbox" ${r.enabled ? "checked" : ""} onclick="toggleEnabled(event,${i})">
      ${r.name} 等级 ${r.priority}
    `;
    if(r.preset){
    	div.innerHTML += " [原版]";
    }
    div.onclick = () => selectRule(i);
    box.appendChild(div);
  });
}

function renderEditor() {
  const r = rules[currentRuleIndex];
  document.getElementById("rule-name").value = r.name;
  document.getElementById("rule-priority").value = r.priority;
  document.getElementById("rule-enabled").checked = r.enabled;
  document.getElementById("match-mode").value = r.matchMode;

  renderConditions();
  renderKickers();
  renderDSL();
}

/* ---------- 条件 ---------- */

function renderConditions() {
  const rule = rules[currentRuleIndex];
  const box = document.getElementById("conditions");
  box.innerHTML = "";

  rule.conditions.forEach((cond, index) => {
    const row = document.createElement("div");
    row.className = "condition-row";

    // 条件类型选择
    const typeSelect = document.createElement("select");
    ["count","paircount", "flush", "straight", "not"].forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = {
        count: "点数计数",
        paircount: "对子计数",
        flush: "同花",
        straight: "顺子",
        //not: "否定（NOT）"
      }[t];
      if (cond.type === t) opt.selected = true;
      typeSelect.appendChild(opt);
    });

    typeSelect.onchange = e => {
      const t = e.target.value;
      rule.conditions[index] =
        t === "count"
          ? { type: "count", rank: 2, countMode: "exact", value: 2 }
          : t === "not"
          ? { type: "not", inner: { type: "flush" } }
          : { type: t };
      renderAll();
    };

    row.appendChild(typeSelect);

    /* ---------- count ---------- */
    if (cond.type === "count") {
      // rank
      const anyRank = document.createElement("input");
      anyRank.type = "checkbox";
      row.append(" 任意点数？ ", anyRank);
      if( cond.rank=="*"){
      	anyRank.value = true;
      }
      const rankInput = document.createElement("input");
      rankInput.type = "number";
      rankInput.min = 2;
      rankInput.max = 14;
      rankInput.value = cond.rank;
      rankInput.oninput = e => {
      	if(!anyRank){
      		cond.rank = Number(e.target.value);
      		renderDSL();
      	}
      };
      if(anyRank) cond.rank = "*";
      row.append(" 点数 ", rankInput);
			
			


      // mode
      const modeSelect = document.createElement("select");
      ["exact", "min", "max"].forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.textContent = {
          exact: "恰好",
          min: "至少",
          max: "至多"
        }[m];
        if (cond.countMode === m) opt.selected = true;
        modeSelect.appendChild(opt);
      });
      modeSelect.onchange = e => {
        cond.countMode = e.target.value;
        renderDSL();
      };
      row.append(" 数量 ", modeSelect);

      // value
      const valueInput = document.createElement("input");
      valueInput.type = "number";
      valueInput.min = 1;
      valueInput.max = 4;
      valueInput.value = cond.value;
      valueInput.oninput = e => {
        cond.value = Number(e.target.value);
        renderDSL();
      };
      row.append(valueInput);
    }

    /* ---------- NOT ---------- */
    if (cond.type === "not") {
      const innerSelect = document.createElement("select");
      ["flush", "straight"].forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t === "flush" ? "同花" : "顺子";
        if (cond.inner.type === t) opt.selected = true;
        innerSelect.appendChild(opt);
      });

      innerSelect.onchange = e => {
        cond.inner = { type: e.target.value };
        renderDSL();
      };

      row.append(" 否定 ", innerSelect);
    }

    /* ---------- 删除按钮 ---------- */
    const del = document.createElement("button");
    del.textContent = "删除";
    del.className = "secondary";
    del.onclick = () => {
      rule.conditions.splice(index, 1);
      renderAll();
    };

    row.appendChild(del);
    box.appendChild(row);
  });
}


function addCondition() {
  rules[currentRuleIndex].conditions.push(
    { type: "count", rank: 2, mode: "exact", value: 2 }
  );
  renderEditor();
}

/* ---------- Kickers ---------- */

function renderKickers() {
  const rule = rules[currentRuleIndex];
  const box = document.getElementById("kickers");
  box.innerHTML = "";

  rule.kickers.forEach((k, index) => {
    const row = document.createElement("div");
    row.className = "kicker-row";

    /* ===== source ===== */
    const sourceSel = document.createElement("select");
    [
      { v: "remaining", t: "剩余牌" },
      { v: "rank", t: "指定点数" }
    ].forEach(o => {
      const opt = document.createElement("option");
      opt.value = o.v;
      opt.textContent = o.t;
      if (k.source === o.v) opt.selected = true;
      sourceSel.appendChild(opt);
    });

    sourceSel.onchange = e => {
      const v = e.target.value;
      rule.kickers[index] =
        v === "rank"
          ? { source: "rank", rank: 14, count: 1 }
          : { source: "remaining", rank: null, count: 1 };
      renderAll();
    };

    row.appendChild(sourceSel);

    /* ===== rank（可选） ===== */
    if (k.source === "rank") {
      const rankInput = document.createElement("input");
      rankInput.type = "number";
      rankInput.min = 2;
      rankInput.max = 14;
      rankInput.value = k.rank;
      rankInput.oninput = e => {
        k.rank = Number(e.target.value);
        renderDSL();
      };
      row.append(" 点数 ", rankInput);
    }

    /* ===== count ===== */
    const countInput = document.createElement("input");
    countInput.type = "number";
    countInput.min = 1;
    countInput.max = 5;
    countInput.value = k.count;
    countInput.oninput = e => {
      k.count = Number(e.target.value);
      renderDSL();
    };

    row.append(" 张数 ", countInput);

    /* ===== 删除 ===== */
    const del = document.createElement("button");
    del.textContent = "删除";
    del.className = "secondary";
    del.onclick = () => {
      rule.kickers.splice(index, 1);
      renderAll();
    };

    row.appendChild(del);
    box.appendChild(row);
  });
}


function addKicker() {
  rules[currentRuleIndex].kickers.push({
    source: "remaining",
    rank: null,
    count: 1
  });
  renderAll();
}

/* ---------- DSL ---------- */

function renderDSL() {
  const r = rules[currentRuleIndex];
  const dsl = {
    name: r.name,
    priority: r.priority,
    enabled: r.enabled,
    match: {
      [r.matchMode]: r.conditions.map(c => {
        if (c.type === "count") {
          return { count: { rank: c.rank, mode: c.countMode, value: c.value } };
        }
        if (c.type === "paircount") {
          return { count: { mode: c.countMode, value: c.value } };
        }
        if (c.type === "flush") return { flush: true };
        if (c.type === "straight") return { straight: true };
      })
    },
    kickers: r.kickers.map(k => {
      if (k.type === "matchedRank") return { type: "rank", from: "matched" };
      if (k.type === "restRank") return { type: "rank", from: "rest" };
      if (k.type === "straightHigh") return { type: "straightHigh" };
    })
  };
  document.getElementById("dsl-preview").textContent =
    JSON.stringify(dsl, null, 2);
}

/* ---------- 事件 ---------- */

function selectRule(i) {
  currentRuleIndex = i;
  renderRuleList();
  renderEditor();
}

function toggleEnabled(e,i){
  e.stopPropagation();
  rules[i].enabled = e.target.checked;
  localStorage.setItem("poker_rules", JSON.stringify(rules));
  renderEditor();
}

function updateCondition(i,key,val){
  rules[currentRuleIndex].conditions[i][key]=Number(val);
  localStorage.setItem("poker_rules", JSON.stringify(rules));
  renderDSL();
}

function updateConditionType(i,val){
  rules[currentRuleIndex].conditions[i]={type:val};
  localStorage.setItem("poker_rules", JSON.stringify(rules));
  renderEditor();
}

document.getElementById("rule-name").oninput = e => {
  rules[currentRuleIndex].name = e.target.value;
  localStorage.setItem("poker_rules", JSON.stringify(rules));
  renderAll();
};
document.getElementById("rule-priority").oninput = e => {
  rules[currentRuleIndex].priority = Number(e.target.value);
  localStorage.setItem("poker_rules", JSON.stringify(rules));
  renderAll();
};
document.getElementById("rule-enabled").onchange = e => {
  rules[currentRuleIndex].enabled = e.target.checked;
  localStorage.setItem("poker_rules", JSON.stringify(rules));
  renderAll();
};


function removeCondition(i){
  rules[currentRuleIndex].conditions.splice(i,1);
  localStorage.setItem("poker_rules", JSON.stringify(rules));
  renderEditor();
}

function updateKicker(i,val){
  rules[currentRuleIndex].kickers[i].type=val;
  localStorage.setItem("poker_rules", JSON.stringify(rules));
  renderDSL();
}

function removeKicker(i){
  rules[currentRuleIndex].kickers.splice(i,1);
  localStorage.setItem("poker_rules", JSON.stringify(rules));
  renderEditor();
}

function addRule(){
  rules.push({
    name:"新牌型",
    priority:5,
    enabled:true,
    preset: false,
    matchMode:"all",
    conditions:[],
    kickers:[]
  });
  selectRule(rules.length-1);
}

function deleteCurrentRule() {
  const r = rules[currentRuleIndex];

  // 1. 内置规则保护（可选）
  /*if (r.preset) {
    alert("原版牌型不能删除，但可选择禁用");
    return;
  }*/

  // 2. 确认
  if (!confirm(`确定要删除牌型「${r.name}」吗？`)) {
    return;
  }

  // 3. 删除
  rules.splice(currentRuleIndex, 1);

  // 4. 修正 currentRuleIndex
  if (rules.length === 0) {
    // 可选：自动创建一个空规则
    rules.push(createEmptyRule());
    currentRuleIndex = 0;
  } else if (currentRuleIndex >= rules.length) {
    currentRuleIndex = rules.length - 1;
  }

  // 5. 刷新 UI
  renderAll();
}

function createEmptyRule() {
  return {
    name: "新牌型",
    priority: 5,
    enabled: true,
    preset: false,
    matchMode: "all",
    conditions: [],
    kickers: []
  };
}

/* ---------- 初始 ---------- */
function renderAll() {
  renderRuleList();
  renderEditor();
  renderBoard();
}
renderAll();
