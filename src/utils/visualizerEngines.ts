export type AlgoId =
  | "binary_search"
  | "two_pointers"
  | "sliding_window"
  | "bubble_sort"
  | "hash_lookup"
  | "bfs_graph"
  | "recursion_stack"
  | "min_heap"
  | "dp_table"
  | "system_design";

export interface RecursionFrame {
  id: string;
  callLabel: string;
  note: string;
  state: "active" | "waiting" | "returning" | "base";
  returnValue?: string;
}

export interface SystemDesignNode {
  id: string;
  label: string;
  role: string;
  metric: string;
  loadPct: number;
  status: "idle" | "active" | "hit" | "warn" | "shed";
}

export interface AlgoStep {
  title: string;
  explanation: string;
  rule: string;
  vars: { label: string; value: string; highlight?: boolean }[];
  arr?: number[];
  targetVal?: number;
  lo?: number;
  hi?: number;
  mid?: number | null;
  foundIdx?: number | null;
  left?: number;
  right?: number;
  matchedPair?: [number, number] | null;
  winStart?: number;
  winEnd?: number;
  bestStart?: number;
  bestEnd?: number;
  winSum?: number;
  bestSum?: number;
  droppedVal?: number | null;
  addedVal?: number | null;
  isNewBest?: boolean;
  comparePair?: [number, number] | null;
  swapped?: boolean;
  sortedFrom?: number;
  activeIdx?: number;
  needVal?: number;
  hashMap?: Record<string, number>;
  lookupHit?: { need: number; idx: number } | null;
  currentNode?: string | null;
  newlyQueued?: string[];
  queue?: string[];
  visited?: string[];
  targetNode?: string;
  foundTarget?: boolean;
  // Recursion & Call Stack
  stackFrames?: RecursionFrame[];
  memoEntries?: { key: string; value: string }[];
  // Min-Heap Priority Queue
  heap?: number[];
  activeHeapIdx?: number | null;
  parentHeapIdx?: number | null;
  swappedPair?: [number, number] | null;
  poppedValues?: number[];
  heapActionLabel?: string;
  // Dynamic Programming Table
  dpRowLabels?: string[];
  dpColLabels?: string[];
  dpGrid?: (number | null)[][];
  activeCell?: [number, number] | null;
  sourceCells?: [number, number][];
  dpFormula?: string;
  // System Design Traffic Simulator
  sysNodes?: SystemDesignNode[];
  sysFlowTitle?: string;
  sysLatencyMs?: number;
  sysOutcomeBadge?: string;
  sysOutcomeTone?: "hit" | "miss" | "throttled" | "replicated";
}

export function buildFactorialRecursionSteps(n: number): AlgoStep[] {
  const frames: RecursionFrame[] = [];
  const steps: AlgoStep[] = [];

  for (let k = n; k >= 1; k--) {
    const isBase = k === 1;
    for (let i = 0; i < frames.length; i++) {
      frames[i] = { ...frames[i], state: "waiting" };
    }
    frames.push({
      id: `f-${k}`,
      callLabel: `fact(${k})`,
      note: isBase ? "Base case reached → returns 1" : `Needs ${k} × fact(${k - 1})`,
      state: isBase ? "base" : "active",
      returnValue: isBase ? "1" : undefined,
    });
    steps.push({
      title: isBase
        ? "Base Case Reached: fact(1) returns 1"
        : `Push Frame: fact(${k}) waits for fact(${k - 1})`,
      explanation: isBase
        ? "We stop diving deeper because fact(1) is known immediately (1). Now every waiting frame above can unwind in reverse order."
        : `fact(${k}) pauses with k=${k} saved on its stack frame and pushes fact(${k - 1}) on top of the call stack.`,
      rule: isBase ? "k == 1 → stop recursion & return 1" : `Push fact(${k - 1}) onto stack`,
      vars: [
        { label: "active_call", value: `fact(${k})`, highlight: true },
        { label: "stack_depth", value: String(frames.length), highlight: true },
        { label: "phase", value: isBase ? "BASE CASE" : "DIVING DOWN" },
      ],
      stackFrames: frames.map((f) => ({ ...f })),
    });
  }

  let acc = 1;
  while (frames.length > 1) {
    const child = frames.pop()!;
    const parent = frames[frames.length - 1];
    const parentK = parseInt(parent.callLabel.replace(/\D/g, ""), 10);
    acc = parentK * acc;
    parent.state = "returning";
    parent.note = `Receives ${child.callLabel}=${child.returnValue} → returns ${parentK}×${child.returnValue}=${acc}`;
    parent.returnValue = String(acc);

    steps.push({
      title: `Pop ${child.callLabel} → ${parent.callLabel} Computes ${acc}`,
      explanation: `${child.callLabel} finishes and pops off the stack, handing ${child.returnValue} back to ${parent.callLabel}, which multiplies ${parentK} × ${child.returnValue} = ${acc}.`,
      rule: `Pop frame & return ${acc}`,
      vars: [
        { label: "returning", value: parent.callLabel, highlight: true },
        { label: "result", value: String(acc), highlight: true },
        { label: "stack_depth", value: String(frames.length) },
      ],
      stackFrames: frames.map((f) => ({ ...f })),
    });
  }

  return steps;
}

export function buildFibMemoSteps(): AlgoStep[] {
  const memo: { key: string; value: string }[] = [
    { key: "fib(0)", value: "0" },
    { key: "fib(1)", value: "1" },
  ];
  return [
    {
      title: "Call fib(4): Branch into Subproblems",
      explanation:
        "fib(4) needs fib(3) + fib(2). Without a memo cache, both branches would recompute fib(2) repeatedly.",
      rule: "Save fib(4) waiting on fib(3)",
      vars: [
        { label: "active_call", value: "fib(4)", highlight: true },
        { label: "memo_size", value: "2" },
        { label: "cache_hit", value: "no" },
      ],
      stackFrames: [
        { id: "4", callLabel: "fib(4)", note: "Needs fib(3) + fib(2)", state: "active" },
      ],
      memoEntries: [...memo],
    },
    {
      title: "Dive Deep to Base Cases via fib(3) → fib(2)",
      explanation:
        "fib(3) calls fib(2), which adds cached fib(1) + fib(0) = 1. We immediately store fib(2) = 1 in memo.",
      rule: "Store fib(2) = 1 in memo",
      vars: [
        { label: "active_call", value: "fib(2)", highlight: true },
        { label: "computed", value: "1 + 0 = 1", highlight: true },
        { label: "cache_hit", value: "stored" },
      ],
      stackFrames: [
        { id: "4", callLabel: "fib(4)", note: "Waiting for fib(3)", state: "waiting" },
        { id: "3", callLabel: "fib(3)", note: "Needs fib(2) + fib(1)", state: "waiting" },
        { id: "2", callLabel: "fib(2)", note: "fib(1)+fib(0) = 1", state: "returning", returnValue: "1" },
      ],
      memoEntries: [...memo, { key: "fib(2)", value: "1" }],
    },
    {
      title: "fib(3) Combines fib(2)=1 and fib(1)=1 → 2",
      explanation:
        "fib(2) pops off the stack. fib(3) reads fib(1)=1 from memo in O(1), computes 1+1=2, and caches fib(3)=2.",
      rule: "Store fib(3) = 2 in memo",
      vars: [
        { label: "active_call", value: "fib(3)", highlight: true },
        { label: "computed", value: "1 + 1 = 2", highlight: true },
        { label: "cache_hit", value: "fib(1)=1" },
      ],
      stackFrames: [
        { id: "4", callLabel: "fib(4)", note: "Needs fib(3) + fib(2)", state: "waiting" },
        { id: "3", callLabel: "fib(3)", note: "Returns 1 + 1 = 2", state: "returning", returnValue: "2" },
      ],
      memoEntries: [...memo, { key: "fib(2)", value: "1" }, { key: "fib(3)", value: "2" }],
    },
    {
      title: "Instant Cache Hit on fib(2) → fib(4) Returns 3!",
      explanation:
        "When fib(4) asks for fib(2) as its second term, memo returns 1 immediately without any recursive subtree! Final answer: 2 + 1 = 3.",
      rule: "Cache Hit fib(2)=1 → Return 3",
      vars: [
        { label: "active_call", value: "fib(4)", highlight: true },
        { label: "cache_hit", value: "fib(2)=1 ⚡", highlight: true },
        { label: "final_value", value: "3", highlight: true },
      ],
      stackFrames: [
        {
          id: "4",
          callLabel: "fib(4)",
          note: "fib(3)=2 + cached fib(2)=1 → 3",
          state: "base",
          returnValue: "3",
        },
      ],
      memoEntries: [
        ...memo,
        { key: "fib(2)", value: "1" },
        { key: "fib(3)", value: "2" },
        { key: "fib(4)", value: "3" },
      ],
    },
  ];
}

export function buildMinHeapInsertSteps(values: number[]): AlgoStep[] {
  const heap: number[] = [];
  const steps: AlgoStep[] = [];

  for (const val of values) {
    heap.push(val);
    let idx = heap.length - 1;

    steps.push({
      title: `Append ${val} at End (index ${idx})`,
      explanation: `New items always enter at the next open tree leaf (index ${idx}). Next, compare with its parent to restore the Min-Heap rule (parent ≤ child).`,
      rule: `Push ${val} → index ${idx}`,
      vars: [
        { label: "pushed", value: String(val), highlight: true },
        { label: "idx", value: String(idx) },
        { label: "heap_min", value: String(heap[0]) },
      ],
      heap: [...heap],
      activeHeapIdx: idx,
      parentHeapIdx: idx > 0 ? Math.floor((idx - 1) / 2) : null,
      swappedPair: null,
      heapActionLabel: `Inserted ${val} at leaf [${idx}]`,
    });

    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      if (heap[parentIdx] <= heap[idx]) {
        steps.push({
          title: `Parent [${parentIdx}]=${heap[parentIdx]} ≤ ${heap[idx]} → Heap Valid!`,
          explanation: `Since parent ${heap[parentIdx]} is already smaller than or equal to ${heap[idx]}, bubbling stops here.`,
          rule: "Heap order restored",
          vars: [
            { label: "parent", value: String(heap[parentIdx]) },
            { label: "child", value: String(heap[idx]) },
            { label: "heap_min", value: String(heap[0]), highlight: true },
          ],
          heap: [...heap],
          activeHeapIdx: idx,
          parentHeapIdx: parentIdx,
          swappedPair: null,
          heapActionLabel: `${heap[idx]} settled at [${idx}]`,
        });
        break;
      }

      const movedChild = heap[idx];
      const movedParent = heap[parentIdx];
      [heap[parentIdx], heap[idx]] = [heap[idx], heap[parentIdx]];
      steps.push({
        title: `Bubble Up! Swap ${movedChild} < Parent ${movedParent}`,
        explanation: `${movedChild} is smaller than its parent ${movedParent} at index ${parentIdx}, so we swap them upward toward the root.`,
        rule: `Swap [${idx}] ↔ [${parentIdx}]`,
        vars: [
          { label: "swapped", value: `${movedChild} ↔ ${movedParent}`, highlight: true },
          { label: "new_idx", value: String(parentIdx) },
          { label: "heap_min", value: String(heap[0]), highlight: true },
        ],
        heap: [...heap],
        activeHeapIdx: parentIdx,
        parentHeapIdx: idx,
        swappedPair: [parentIdx, idx],
        heapActionLabel: `Bubbled ${movedChild} up to [${parentIdx}]`,
      });
      idx = parentIdx;
    }
  }

  return steps;
}

export function buildMinHeapPopSteps(initial: number[]): AlgoStep[] {
  const heap = [...initial];
  const popped: number[] = [];
  const steps: AlgoStep[] = [
    {
      title: `Valid Min-Heap Ready (Root Min = ${heap[0]})`,
      explanation:
        "The smallest value is always pinned at index 0 (the root). Let's pop the root twice and watch the heap repair itself in O(log n).",
      rule: "Root [0] always holds minimum",
      vars: [
        { label: "root_min", value: String(heap[0]), highlight: true },
        { label: "size", value: String(heap.length) },
        { label: "popped", value: "[]" },
      ],
      heap: [...heap],
      activeHeapIdx: 0,
      poppedValues: [],
      heapActionLabel: "Initial valid Min-Heap",
    },
  ];

  for (let round = 0; round < 2 && heap.length > 0; round++) {
    const minVal = heap[0];
    popped.push(minVal);
    if (heap.length === 1) {
      heap.pop();
      break;
    }
    const lastVal = heap.pop()!;
    heap[0] = lastVal;

    steps.push({
      title: `Pop Min ${minVal} → Move Leaf ${lastVal} to Root [0]`,
      explanation: `Remove root ${minVal} and temporarily place the rightmost leaf (${lastVal}) at index 0 to keep the tree shape complete.`,
      rule: `Pop ${minVal}, lift ${lastVal} to [0]`,
      vars: [
        { label: "popped_min", value: String(minVal), highlight: true },
        { label: "temp_root", value: String(lastVal) },
        { label: "popped", value: `[${popped.join(", ")}]` },
      ],
      heap: [...heap],
      activeHeapIdx: 0,
      poppedValues: [...popped],
      heapActionLabel: `Removed ${minVal}; sifting ${lastVal} down`,
    });

    let idx = 0;
    while (true) {
      const leftIdx = 2 * idx + 1;
      const rightIdx = 2 * idx + 2;
      if (leftIdx >= heap.length) break;

      const smallerIdx =
        rightIdx < heap.length && heap[rightIdx] < heap[leftIdx]
          ? rightIdx
          : leftIdx;

      if (heap[idx] <= heap[smallerIdx]) {
        steps.push({
          title: `${heap[idx]} ≤ Children → Heap Restored!`,
          explanation: `${heap[idx]} is now smaller than its children, so sifting stops and ${heap[0]} sits as the new minimum.`,
          rule: "Min-Heap invariant restored",
          vars: [
            { label: "new_min", value: String(heap[0]), highlight: true },
            { label: "popped", value: `[${popped.join(", ")}]` },
          ],
          heap: [...heap],
          activeHeapIdx: idx,
          poppedValues: [...popped],
          heapActionLabel: `New minimum is ${heap[0]}`,
        });
        break;
      }

      const childVal = heap[smallerIdx];
      [heap[idx], heap[smallerIdx]] = [heap[smallerIdx], heap[idx]];
      steps.push({
        title: `Sift Down: Swap ${heap[smallerIdx]} with Smaller Child ${childVal}`,
        explanation: `Between children, ${childVal} (index ${smallerIdx}) is smaller. Swapping pulls ${childVal} up so parent ≤ child holds everywhere.`,
        rule: `Swap [${idx}] ↔ [${smallerIdx}]`,
        vars: [
          { label: "swapped", value: `${heap[smallerIdx]} ↔ ${childVal}`, highlight: true },
          { label: "new_min", value: String(heap[0]), highlight: true },
          { label: "popped", value: `[${popped.join(", ")}]` },
        ],
        heap: [...heap],
        activeHeapIdx: smallerIdx,
        parentHeapIdx: idx,
        swappedPair: [idx, smallerIdx],
        poppedValues: [...popped],
        heapActionLabel: `Pulled smaller child ${childVal} up`,
      });
      idx = smallerIdx;
    }
  }

  return steps;
}

export function buildKnapsackDpSteps(): AlgoStep[] {
  const items = [
    { name: "Item 1 (w=2, v=6)", w: 2, v: 6 },
    { name: "Item 2 (w=3, v=10)", w: 3, v: 10 },
    { name: "Item 3 (w=4, v=12)", w: 4, v: 12 },
  ];
  const cap = 5;
  const colLabels = ["c=0", "c=1", "c=2", "c=3", "c=4", "c=5"];
  const rowLabels = ["0 items", ...items.map((it) => it.name.replace(/Item /, "I"))];

  const grid: (number | null)[][] = Array.from({ length: items.length + 1 }, (_, r) =>
    Array.from({ length: cap + 1 }, (__, c) => (r === 0 || c === 0 ? 0 : null)),
  );

  const cloneGrid = () => grid.map((row) => [...row]);

  const steps: AlgoStep[] = [
    {
      title: "Initialize Base Row & Column to 0",
      explanation:
        "With 0 items or 0 backpack capacity, maximum value is always 0. We fill each remaining cell using earlier subproblem answers.",
      rule: "Base cases: dp[0][c] = 0, dp[r][0] = 0",
      vars: [
        { label: "capacity", value: "5" },
        { label: "subproblems", value: "3 × 5 = 15" },
        { label: "best_so_far", value: "0" },
      ],
      dpRowLabels: rowLabels,
      dpColLabels: colLabels,
      dpGrid: cloneGrid(),
      activeCell: null,
      sourceCells: [],
      dpFormula: "dp[i][c] = max(skip: dp[i-1][c], take: val + dp[i-1][c-wt])",
    },
  ];

  for (let r = 1; r <= items.length; r++) {
    const item = items[r - 1];
    for (let c = 1; c <= cap; c++) {
      const skip = grid[r - 1][c] ?? 0;
      const canTake = c >= item.w;
      const take = canTake ? item.v + (grid[r - 1][c - item.w] ?? 0) : -1;
      const best = Math.max(skip, take);
      grid[r][c] = best;

      if (c === item.w || c === cap || (r === 2 && c === 3)) {
        const sources: [number, number][] = canTake
          ? [
              [r - 1, c],
              [r - 1, c - item.w],
            ]
          : [[r - 1, c]];
        const formula = canTake
          ? `dp[${r}][${c}] = max(skip=${skip}, take=${item.v}+${grid[r - 1][c - item.w]}) = ${best}`
          : `dp[${r}][${c}] = skip only (${item.w} > ${c}) = ${best}`;

        steps.push({
          title:
            take > skip
              ? `Take ${item.name} at Cap ${c} → Value ${best}`
              : `Skip ${item.name} at Cap ${c} → Keep ${best}`,
          explanation: canTake
            ? `Comparing skipping (${skip}) vs taking ${item.name} plus leftover capacity ${c - item.w} (${grid[r - 1][c - item.w]}) = ${take}. Best is ${best}.`
            : `${item.name} weighs ${item.w}, which exceeds capacity ${c}, so copy ${skip} from the row above.`,
          rule: take > skip ? "Take item improves value" : "Keep previous best",
          vars: [
            { label: "cell", value: `[${r}][${c}]`, highlight: true },
            { label: "skip", value: String(skip) },
            { label: "take", value: canTake ? String(take) : "too heavy", highlight: take > skip },
            { label: "cell_val", value: String(best), highlight: true },
          ],
          dpRowLabels: rowLabels,
          dpColLabels: colLabels,
          dpGrid: cloneGrid(),
          activeCell: [r, c],
          sourceCells: sources,
          dpFormula: formula,
        });
      }
    }
  }

  return steps;
}

export function buildCoinChangeDpSteps(coins: number[], target: number): AlgoStep[] {
  const rowLabels = ["min_coins"];
  const colLabels = Array.from({ length: target + 1 }, (_, i) => `amt=${i}`);
  const dp: (number | null)[] = Array.from({ length: target + 1 }, (_, i) =>
    i === 0 ? 0 : null,
  );

  const steps: AlgoStep[] = [
    {
      title: `Setup 1D DP Table for Coins [${coins.join(", ")}] → Target ${target}`,
      explanation:
        "Greedy fails on [1, 3, 4] for target 6 (it picks 4+1+1 = 3 coins). DP computes the true minimum coins for every amount from 1 up to 6.",
      rule: "Base case: dp[0] = 0 coins",
      vars: [
        { label: "coins", value: `[${coins.join(", ")}]` },
        { label: "target", value: String(target) },
        { label: "dp[0]", value: "0", highlight: true },
      ],
      dpRowLabels: rowLabels,
      dpColLabels: colLabels,
      dpGrid: [[...dp]],
      activeCell: [0, 0],
      sourceCells: [],
      dpFormula: "dp[a] = 1 + min(dp[a - c] for c in coins if a >= c)",
    },
  ];

  for (let amt = 1; amt <= target; amt++) {
    let best = Infinity;
    let bestCoin = coins[0];
    const usedSources: [number, number][] = [];

    for (const c of coins) {
      if (amt >= c && dp[amt - c] !== null) {
        usedSources.push([0, amt - c]);
        const candidate = 1 + dp[amt - c]!;
        if (candidate < best) {
          best = candidate;
          bestCoin = c;
        }
      }
    }
    dp[amt] = best;

    steps.push({
      title: `amt=${amt}: Best is ${best} Coin${best === 1 ? "" : "s"} (use ${bestCoin} + dp[${amt - bestCoin}])`,
      explanation:
        amt === target
          ? `For amt=6, using coin 3 + dp[3]=1 gives 2 coins (3+3), beating greedy's 4+1+1 (3 coins)!`
          : `Checked subtracting valid coins from ${amt}. Lowest subproblem + 1 comes from coin ${bestCoin} + dp[${amt - bestCoin}] (${dp[amt - bestCoin]}).`,
      rule: `dp[${amt}] = 1 + dp[${amt - bestCoin}] = ${best}`,
      vars: [
        { label: "amount", value: String(amt), highlight: true },
        { label: "chosen_coin", value: String(bestCoin) },
        { label: `dp[${amt}]`, value: String(best), highlight: true },
      ],
      dpRowLabels: rowLabels,
      dpColLabels: colLabels,
      dpGrid: [[...dp]],
      activeCell: [0, amt],
      sourceCells: usedSources,
      dpFormula: `dp[${amt}] = 1 + dp[${amt - bestCoin}] = ${best} (coin ${bestCoin})`,
    });
  }

  return steps;
}

export function buildCacheFlowSteps(): AlgoStep[] {
  return [
    {
      title: "1. Cold Request Arrives at API Edge (Cache Empty)",
      explanation:
        "GET /user/42 hits the Load Balancer and reaches the App Server, which checks Redis first before touching the database.",
      rule: "Always check fast in-memory cache first",
      vars: [
        { label: "endpoint", value: "GET /u/42", highlight: true },
        { label: "cache", value: "Checking...", highlight: true },
        { label: "latency", value: "4 ms" },
      ],
      sysFlowTitle: "READ-THROUGH CACHE ARCHITECTURE",
      sysLatencyMs: 4,
      sysOutcomeBadge: "EDGE ROUTED",
      sysOutcomeTone: "miss",
      sysNodes: [
        { id: "client", label: "Mobile App", role: "GET /user/42", metric: "1 req", loadPct: 25, status: "active" },
        { id: "lb", label: "Load Balancer", role: "TLS + Route", metric: "18% CPU", loadPct: 20, status: "active" },
        { id: "cache", label: "Redis Cache", role: "Key lookup", metric: "0 keys hit", loadPct: 12, status: "warn" },
        { id: "db", label: "Postgres DB", role: "Idle", metric: "Disk I/O", loadPct: 15, status: "idle" },
      ],
    },
    {
      title: "2. Cache Miss → Query Postgres Primary",
      explanation:
        "Redis returns NIL (Cache Miss). App Server falls back to Postgres, executes an indexed lookup (38ms), and gets the user row.",
      rule: "Cache Miss → Fall back to DB (~42ms)",
      vars: [
        { label: "cache", value: "MISS ✕", highlight: true },
        { label: "db_read", value: "38 ms", highlight: true },
        { label: "total_latency", value: "42 ms" },
      ],
      sysFlowTitle: "READ-THROUGH CACHE ARCHITECTURE",
      sysLatencyMs: 42,
      sysOutcomeBadge: "CACHE MISS · DB READ",
      sysOutcomeTone: "miss",
      sysNodes: [
        { id: "client", label: "Mobile App", role: "Waiting...", metric: "42 ms", loadPct: 30, status: "idle" },
        { id: "lb", label: "Load Balancer", role: "Proxied", metric: "22% CPU", loadPct: 25, status: "idle" },
        { id: "cache", label: "Redis Cache", role: "NIL (Miss)", metric: "MISS", loadPct: 15, status: "warn" },
        { id: "db", label: "Postgres DB", role: "Index Scan", metric: "38 ms I/O", loadPct: 72, status: "active" },
      ],
    },
    {
      title: "3. Populate Redis with 60s TTL (Write-Back to Cache)",
      explanation:
        "Before responding, the server writes `user:42 → JSON` into Redis with a 60s TTL so future bursts don't hammer Postgres.",
      rule: "Store result in Redis with TTL=60s",
      vars: [
        { label: "cache_write", value: "SET EX 60", highlight: true },
        { label: "db_load", value: "Dropping", highlight: true },
        { label: "ttl", value: "60s" },
      ],
      sysFlowTitle: "READ-THROUGH CACHE ARCHITECTURE",
      sysLatencyMs: 44,
      sysOutcomeBadge: "CACHE POPULATED (TTL 60s)",
      sysOutcomeTone: "replicated",
      sysNodes: [
        { id: "client", label: "Mobile App", role: "200 OK JSON", metric: "44 ms", loadPct: 20, status: "hit" },
        { id: "lb", label: "Load Balancer", role: "Response OK", metric: "18% CPU", loadPct: 18, status: "idle" },
        { id: "cache", label: "Redis Cache", role: "SET u:42 ✓", metric: "TTL 60s", loadPct: 32, status: "hit" },
        { id: "db", label: "Postgres DB", role: "Query Done", metric: "18% CPU", loadPct: 18, status: "idle" },
      ],
    },
    {
      title: "4. Next 500 Requests → Instant 3ms Cache Hits!",
      explanation:
        "Repeat requests hit RAM inside Redis in under 3ms. Postgres stays completely untouched (~5% idle CPU) — 14× lower latency!",
      rule: "RAM Hit = 3ms & Zero DB Load",
      vars: [
        { label: "cache", value: "HIT ✓", highlight: true },
        { label: "latency", value: "3 ms (14×)", highlight: true },
        { label: "db_queries", value: "0 saved!", highlight: true },
      ],
      sysFlowTitle: "READ-THROUGH CACHE ARCHITECTURE",
      sysLatencyMs: 3,
      sysOutcomeBadge: "CACHE HIT · 3ms FAST PATH",
      sysOutcomeTone: "hit",
      sysNodes: [
        { id: "client", label: "Mobile App", role: "500 req/s", metric: "3 ms p95", loadPct: 45, status: "hit" },
        { id: "lb", label: "Load Balancer", role: "Keep-Alive", metric: "24% CPU", loadPct: 24, status: "active" },
        { id: "cache", label: "Redis Cache", role: "RAM HIT ✓", metric: "99.4% hit", loadPct: 48, status: "hit" },
        { id: "db", label: "Postgres DB", role: "Protected", metric: "5% idle", loadPct: 5, status: "idle" },
      ],
    },
  ];
}

export function buildRateLimitFailoverSteps(): AlgoStep[] {
  return [
    {
      title: "1. Traffic Spike Hits Token Bucket Rate Limiter",
      explanation:
        "A noisy script sends 1,200 req/s. Each user bucket allows 100 req/min so excess requests are dropped cleanly before hitting app workers.",
      rule: "Token Bucket sheds excess burst",
      vars: [
        { label: "incoming", value: "1,200 req/s", highlight: true },
        { label: "allowed", value: "100/min" },
        { label: "status", value: "429 Shed", highlight: true },
      ],
      sysFlowTitle: "RATE LIMITER & READ REPLICA FAILOVER",
      sysLatencyMs: 2,
      sysOutcomeBadge: "429 TOO MANY REQUESTS · EDGE BLOCK",
      sysOutcomeTone: "throttled",
      sysNodes: [
        { id: "client", label: "Burst Bot", role: "1,200 req/s", metric: "Spiking", loadPct: 95, status: "shed" },
        { id: "limiter", label: "Token Bucket", role: "0 tokens left", metric: "429 DROP", loadPct: 88, status: "shed" },
        { id: "app", label: "App Cluster", role: "Healthy", metric: "30% CPU", loadPct: 30, status: "hit" },
        { id: "replica", label: "Primary + Replica", role: "Protected", metric: "Steady", loadPct: 28, status: "idle" },
      ],
    },
    {
      title: "2. Primary DB Slows Under Write Lock",
      explanation:
        "Even with burst protection, a heavy write job saturates the Primary DB at 92% CPU. Health checks flag read latency climbing.",
      rule: "Keep reads off overloaded Primary",
      vars: [
        { label: "primary_cpu", value: "92% WARN", highlight: true },
        { label: "replica_lag", value: "12 ms" },
        { label: "action", value: "Split Reads", highlight: true },
      ],
      sysFlowTitle: "RATE LIMITER & READ REPLICA FAILOVER",
      sysLatencyMs: 68,
      sysOutcomeBadge: "PRIMARY HOT · ROUTING READS",
      sysOutcomeTone: "miss",
      sysNodes: [
        { id: "client", label: "Valid Users", role: "Read queries", metric: "Normal", loadPct: 40, status: "active" },
        { id: "limiter", label: "Token Bucket", role: "Allowing OK", metric: "Pass ✓", loadPct: 35, status: "hit" },
        { id: "app", label: "App Cluster", role: "CQRS Router", metric: "55% CPU", loadPct: 55, status: "warn" },
        { id: "replica", label: "Primary DB", role: "Write Lock", metric: "92% CPU!", loadPct: 92, status: "shed" },
      ],
    },
    {
      title: "3. Read Traffic Fails Over to Async Read Replica",
      explanation:
        "App Router directs 100% of SELECT reads to the warm Read Replica, restoring crisp 11ms response times while Primary finishes writes safely.",
      rule: "Replica serves reads → 11ms recovered",
      vars: [
        { label: "read_target", value: "Replica ✓", highlight: true },
        { label: "latency", value: "11 ms", highlight: true },
        { label: "availability", value: "99.99%" },
      ],
      sysFlowTitle: "RATE LIMITER & READ REPLICA FAILOVER",
      sysLatencyMs: 11,
      sysOutcomeBadge: "FAILOVER HEALTHY · 11ms REPLICA READS",
      sysOutcomeTone: "replicated",
      sysNodes: [
        { id: "client", label: "Valid Users", role: "200 OK Fast", metric: "11 ms", loadPct: 40, status: "hit" },
        { id: "limiter", label: "Token Bucket", role: "Edge Guard", metric: "Steady", loadPct: 32, status: "hit" },
        { id: "app", label: "App Cluster", role: "Read→Replica", metric: "38% CPU", loadPct: 38, status: "active" },
        { id: "replica", label: "Read Replica", role: "Serving Reads", metric: "34% CPU ✓", loadPct: 34, status: "hit" },
      ],
    },
  ];
}
