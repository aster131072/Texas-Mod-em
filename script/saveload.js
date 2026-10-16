const PRESET_RULES = [
	{
	  name: "高牌",
	  priority: 0,
	  enabled: true,
	  preset: true,
	  conditions: [],
	  kickers: ["sortedRanks"]
	},
	{
	  name: "一对",
	  priority: 1,
	  enabled: true,
	  preset: true,
	  conditions: [
			{
			  type: "pairCount",          // count | flush | straight | not
			  mode: "exact",
			  value: 1                // 数量
			}
	  ],
	  kickers: ["pairRank","restRanks"]
	},
	{
	  name: "两对",
	  priority: 2,
	  enabled: true,
	  preset: true,
	  conditions: [
			{
			  type: "pairCount",          // count | flush | straight | not
			  mode: "exact",
			  value: 2                // 数量
			}
	  ],
	  kickers: ["pairRanks","restRanks"]
	},
  {
    name: "826",
    priority: 2.1,
    enabled: true,
    preset: false,
    conditions: [
      { type: "count", rank: "8", countMode: "exact", value: 1 },
      { type: "count", rank: "2", countMode: "exact", value: 1 },
      { type: "count", rank: "6", countMode: "exact", value: 1 }
    ],
    kickers: ["restRanks"]
  },
  {
    name: "132",
    priority: 2.2,
    enabled: true,
    preset: false,
    conditions: [
      { type: "count", rank: "1", countMode: "exact", value: 1 },
      { type: "count", rank: "3", countMode: "exact", value: 1 },
      { type: "count", rank: "2", countMode: "exact", value: 1 }
    ],
    kickers: ["restRanks"]
  },
  {
    name: "三条",
    priority: 3,
    enabled: true,
    preset: true,
    conditions: [
      { type: "count", rank: "*", countMode: "exact", value: 3 }
    ],
    kickers: ["tripleRank"]
  },
  {
    name: "826+一对",
    priority: 3.1,
    enabled: true,
    preset: false,
    conditions: [
    	{ type: "pairCount", mode: "exact", value: 1 },
      { type: "count", rank: "8", countMode: "exact", value: 1 },
      { type: "count", rank: "2", countMode: "exact", value: 1 },
      { type: "count", rank: "6", countMode: "exact", value: 1 }
    ],
    kickers: ["pairRank","restRanks"]
  },
  {
    name: "132+一对",
    priority: 3.2,
    enabled: true,
    preset: false,
    conditions: [
    	{ type: "pairCount", mode: "exact", value: 1 },
      { type: "count", rank: "1", countMode: "exact", value: 1 },
      { type: "count", rank: "3", countMode: "exact", value: 1 },
      { type: "count", rank: "2", countMode: "exact", value: 1 }
    ],
    kickers: ["pairRank","restRanks"]
  },
  {
    name: "顺子",
    priority: 4,
    enabled: true,
    preset: true,
    conditions: [
      { type: "straight" }
    ],
    kickers: ["sortedRanks"]
  },
  {
    name: "同花",
    priority: 5,
    enabled: true,
    preset: true,
    conditions: [
      { type: "flush" },
    ],
    kickers: ["sortedRanks"]
  },
	{
	  name: "葫芦",
	  priority: 6,
	  enabled: true,
	  preset: true,
	  conditions: [
		  { type: "pairCount", mode: "exact", value: 2 },
		  { type: "count", rank: "*", countMode: "exact", value: 3 }
	  ],
	  kickers: ["tripleRank","pairRank"]
	},
  {
    name: "52794",
    priority: 6.1,
    enabled: true,
    preset: false,
    conditions: [
      { type: "count", rank: "5", countMode: "exact", value: 1 },
      { type: "count", rank: "2", countMode: "exact", value: 1 },
      { type: "count", rank: "7", countMode: "exact", value: 1 },
      { type: "count", rank: "9", countMode: "exact", value: 1 },
      { type: "count", rank: "4", countMode: "exact", value: 1 }
    ],
    kickers: ["sortedRanks"]
  },
  {
    name: "54826",
    priority: 6.2,
    enabled: true,
    preset: false,
    conditions: [
      { type: "count", rank: "5", countMode: "exact", value: 1 },
      { type: "count", rank: "4", countMode: "exact", value: 1 },
      { type: "count", rank: "8", countMode: "exact", value: 1 },
      { type: "count", rank: "2", countMode: "exact", value: 1 },
      { type: "count", rank: "6", countMode: "exact", value: 1 }
    ],
    kickers: ["sortedRanks"]
  },
  {
    name: "13826",
    priority: 6.3,
    enabled: true,
    preset: false,
    conditions: [
      { type: "count", rank: "14", countMode: "exact", value: 1 },
      { type: "count", rank: "3", countMode: "exact", value: 1 },
      { type: "count", rank: "8", countMode: "exact", value: 1 },
      { type: "count", rank: "2", countMode: "exact", value: 1 },
      { type: "count", rank: "6", countMode: "exact", value: 1 }
    ],
    kickers: ["sortedRanks"]
  },
  {
    name: "54132",
    priority: 6.4,
    enabled: true,
    preset: false,
    conditions: [
      { type: "count", rank: "5", countMode: "exact", value: 1 },
      { type: "count", rank: "4", countMode: "exact", value: 1 },
      { type: "count", rank: "14", countMode: "exact", value: 1 },
      { type: "count", rank: "3", countMode: "exact", value: 1 },
      { type: "count", rank: "2", countMode: "exact", value: 1 }
    ],
    kickers: ["sortedRanks"]
  },
  {
    name: "59645",
    priority: 6.5,
    enabled: true,
    preset: false,
    conditions: [
      { type: "count", rank: "5", countMode: "exact", value: 2 },
      { type: "count", rank: "9", countMode: "exact", value: 1 },
      { type: "count", rank: "6", countMode: "exact", value: 1 },
      { type: "count", rank: "4", countMode: "exact", value: 1 }
    ],
    kickers: ["sortedRanks"]
  },
  {
    name: "四条",
    priority: 7,
    enabled: true,
    preset: true,
    conditions: [
			{
			  type: "count",          // count | flush | straight | not
			  rank: "*",                // 仅 count 使用
			  countMode: "exact",     // exact | min | max
			  value: 4                // 数量
			}
    ],
    kickers: ["quadRank", "kicker"]
  },
  {
    name: "826+两对",
    priority: 7.1,
    enabled: true,
    preset: false,
    conditions: [
    	{ type: "pairCount", mode: "exact", value: 2 },
      { type: "count", rank: "8", countMode: "exact", value: 1 },
      { type: "count", rank: "2", countMode: "exact", value: 1 },
      { type: "count", rank: "6", countMode: "exact", value: 1 }
    ],
    kickers: ["pairRanks","restRanks"]
  },
  {
    name: "132+两对",
    priority: 7.2,
    enabled: true,
    preset: false,
    conditions: [
    	{ type: "pairCount", mode: "exact", value: 2 },
      { type: "count", rank: "14", countMode: "exact", value: 1 },
      { type: "count", rank: "3", countMode: "exact", value: 1 },
      { type: "count", rank: "2", countMode: "exact", value: 1 }
    ],
    kickers: ["pairRanks","restRanks"]
  },
  {
    name: "826+三条",
    priority: 7.3,
    enabled: true,
    preset: false,
    conditions: [
    	{ type: "count", rank: "*", countMode: "exact", value: 3 },
      { type: "count", rank: "8", countMode: "exact", value: 1 },
      { type: "count", rank: "2", countMode: "exact", value: 1 },
      { type: "count", rank: "6", countMode: "exact", value: 1 }
    ],
    kickers: ["tripleRank","restRanks"]
  },
  {
    name: "132+三条",
    priority: 7.4,
    enabled: true,
    preset: false,
    conditions: [
    	{ type: "count", rank: "*", countMode: "exact", value: 3 },
      { type: "count", rank: "14", countMode: "exact", value: 1 },
      { type: "count", rank: "3", countMode: "exact", value: 1 },
      { type: "count", rank: "2", countMode: "exact", value: 1 }
    ],
    kickers: ["tripleRank","restRanks"]
  },
  {
    name: "826+同花",
    priority: 7.5,
    enabled: true,
    preset: false,
    conditions: [
    	{ type: "flush" },
      { type: "count", rank: "8", countMode: "exact", value: 1 },
      { type: "count", rank: "2", countMode: "exact", value: 1 },
      { type: "count", rank: "6", countMode: "exact", value: 1 }
    ],
    kickers: ["restRanks"]
  },
  {
    name: "132+同花",
    priority: 7.6,
    enabled: true,
    preset: false,
    conditions: [
    	{ type: "flush" },
      { type: "count", rank: "14", countMode: "exact", value: 1 },
      { type: "count", rank: "3", countMode: "exact", value: 1 },
      { type: "count", rank: "2", countMode: "exact", value: 1 }
    ],
    kickers: ["restRanks"]
  },
  {
    name: "同花顺",
    priority: 8,
    enabled: true,
    preset: true,
    conditions: [
      { type: "flush" },
      { type: "straight" }
    ],
    kickers: ["sortedRanks"]
  },
  {
    name: "同花52794",
    priority: 8.1,
    enabled: true,
    preset: false,
    conditions: [
    	{ type: "flush" },
      { type: "count", rank: "5", countMode: "exact", value: 1 },
      { type: "count", rank: "2", countMode: "exact", value: 1 },
      { type: "count", rank: "7", countMode: "exact", value: 1 },
      { type: "count", rank: "9", countMode: "exact", value: 1 },
      { type: "count", rank: "4", countMode: "exact", value: 1 }
    ],
    kickers: ["sortedRanks"]
  },
  {
    name: "同花54826",
    priority: 8.2,
    enabled: true,
    preset: false,
    conditions: [
    { type: "flush" },
      { type: "count", rank: "5", countMode: "exact", value: 1 },
      { type: "count", rank: "4", countMode: "exact", value: 1 },
      { type: "count", rank: "8", countMode: "exact", value: 1 },
      { type: "count", rank: "2", countMode: "exact", value: 1 },
      { type: "count", rank: "6", countMode: "exact", value: 1 }
    ],
    kickers: ["sortedRanks"]
  },
  {
    name: "同花13826",
    priority: 8.3,
    enabled: true,
    preset: false,
    conditions: [
    { type: "flush" },
      { type: "count", rank: "14", countMode: "exact", value: 1 },
      { type: "count", rank: "3", countMode: "exact", value: 1 },
      { type: "count", rank: "8", countMode: "exact", value: 1 },
      { type: "count", rank: "2", countMode: "exact", value: 1 },
      { type: "count", rank: "6", countMode: "exact", value: 1 }
    ],
    kickers: ["sortedRanks"]
  },
  {
    name: "同花54132",
    priority: 8.4,
    enabled: true,
    preset: false,
    conditions: [
    { type: "flush" },
      { type: "count", rank: "5", countMode: "exact", value: 1 },
      { type: "count", rank: "4", countMode: "exact", value: 1 },
      { type: "count", rank: "14", countMode: "exact", value: 1 },
      { type: "count", rank: "3", countMode: "exact", value: 1 },
      { type: "count", rank: "2", countMode: "exact", value: 1 }
    ],
    kickers: ["sortedRanks"]
  },

];

function exportRules() {
  const data = JSON.stringify(rules, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "poker_rules.json";
  a.click();

  URL.revokeObjectURL(url);
}
function resetRules() {
	if (!confirm("将重置当前所有牌型，是否继续？")) {
	  return;
	}
	rules = PRESET_RULES.map(r => structuredClone(r));
	localStorage.setItem("poker_rules", JSON.stringify(rules));
	alert("初始化成功");
	renderAll();
}
function loadRules() {
	const saved = localStorage.getItem("poker_rules");
	if (saved) {
	  rules = JSON.parse(saved);
	}else{
		rules = PRESET_RULES.map(r => structuredClone(r));
	}
	renderAll();
}
function triggerImport() {
  document.getElementById("import-file").click();
}
document
  .getElementById("import-file")
  .addEventListener("change", handleImport);

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      importRules(parsed);
    } catch (err) {
      alert("文件不是合法的 JSON");
    }
  };
  reader.readAsText(file);
}
function importRules(data) {
  if (!Array.isArray(data)) {
    alert("规则文件格式错误：应为数组");
    return;
  }
  if (!validateRules(data)) return;
	if (!confirm("导入将覆盖当前所有牌型，是否继续？")) {
	  return;
	}
  rules = data;
  alert("规则导入成功，共 " + rules.length + " 个牌型");
  currentRuleIndex = 0;
  renderAll();
}
function validateRules(data) {
  for (const r of data) {
    if (typeof r.name !== "string") {
      alert("规则缺少 name");
      return false;
    }
    if (typeof r.priority !== "number") {
      alert(`规则 ${r.name} priority 非法`);
      return false;
    }
    if (!Array.isArray(r.conditions)) {
      alert(`规则 ${r.name} conditions 非法`);
      return false;
    }
    if (!Array.isArray(r.kickers)) {
      alert(`规则 ${r.name} kickers 非法`);
      return false;
    }
  }
  return true;
}
