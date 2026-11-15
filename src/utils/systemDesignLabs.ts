export type SystemLabArchetype =
  | "rate_limiter"
  | "cache_layer"
  | "sharding_ring"
  | "resilience_circuit"
  | "queue_pipeline"
  | "quorum_rollout";

export interface SystemLabParamSpec {
  key: string;
  label: string;
  kind: "range" | "toggle";
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  defaultValue: number;
  hint: string;
}

export interface SystemLabMetric {
  label: string;
  valueText: string;
  fillPercent: number;
  tone: "good" | "warn" | "bad";
}

export interface SystemLabSlaCheck {
  label: string;
  actual: string;
  target: string;
  passed: boolean;
}

export interface SystemLabSimulationResult {
  health: "HEALTHY" | "DEGRADED" | "OVERLOAD";
  headline: string;
  metrics: SystemLabMetric[];
  slaChecks: SystemLabSlaCheck[];
  allSlaPassed: boolean;
  tradeoffNote: string;
}

export interface SystemDesignLabSpec {
  archetype: SystemLabArchetype;
  badge: string;
  title: string;
  subtitle: string;
  challengePrompt: string;
  params: SystemLabParamSpec[];
  recommendedPreset: Record<string, number>;
  simulate: (values: Record<string, number>) => SystemLabSimulationResult;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function inferArchetype(lesson: {
  lesson_order?: number;
  title?: string;
  category?: string;
}): SystemLabArchetype {
  const order = lesson.lesson_order ?? 1;
  const hay = `${lesson.title || ""} ${lesson.category || ""}`.toLowerCase();

  if (
    order === 2 ||
    order === 18 ||
    order === 19 ||
    order === 24 ||
    hay.includes("cache") ||
    hay.includes("lru") ||
    hay.includes("ttl") ||
    hay.includes("pagination")
  ) {
    return "cache_layer";
  }
  if (
    order === 4 ||
    order === 5 ||
    order === 12 ||
    order === 23 ||
    hay.includes("shard") ||
    hay.includes("hash") ||
    hay.includes("ring") ||
    hay.includes("cdn")
  ) {
    return "sharding_ring";
  }
  if (
    order === 7 ||
    order === 9 ||
    order === 11 ||
    order === 13 ||
    hay.includes("circuit") ||
    hay.includes("backoff") ||
    hay.includes("failover") ||
    hay.includes("alarm") ||
    hay.includes("jitter")
  ) {
    return "resilience_circuit";
  }
  if (
    order === 6 ||
    order === 10 ||
    order === 16 ||
    order === 20 ||
    hay.includes("queue") ||
    hay.includes("dlq") ||
    hay.includes("batch") ||
    hay.includes("autoscale") ||
    hay.includes("pub/sub")
  ) {
    return "queue_pipeline";
  }
  if (
    order === 8 ||
    order === 14 ||
    order === 17 ||
    hay.includes("quorum") ||
    hay.includes("rollout") ||
    hay.includes("consensus") ||
    hay.includes("flag")
  ) {
    return "quorum_rollout";
  }
  return "rate_limiter";
}

export function getSystemDesignLabForLesson(lesson: {
  title?: string;
  category?: string;
  lesson_order?: number;
}): SystemDesignLabSpec {
  const archetype = inferArchetype(lesson);

  if (archetype === "rate_limiter") {
    return {
      archetype,
      badge: "TRAFFIC & THROTTLING SIMULATOR",
      title: `${lesson.title || "Rate Limiter"} · Load Lab`,
      subtitle:
        "Tune bucket capacity and refill speed against burst traffic without melting your database.",
      challengePrompt:
        "SLA Goal: Survive incoming bursts with DB Load <= 70%, p99 Latency <= 60ms, and Allow Rate >= 75%.",
      params: [
        {
          key: "incomingRps",
          label: "Incoming Traffic",
          kind: "range",
          min: 50,
          max: 500,
          step: 25,
          unit: "rps",
          defaultValue: 250,
          hint: "Total requests arriving at the API gateway per second.",
        },
        {
          key: "capacity",
          label: "Bucket / Gateway Cap",
          kind: "range",
          min: 50,
          max: 400,
          step: 25,
          unit: "req",
          defaultValue: 150,
          hint: "Peak burst allowed before returning HTTP 429.",
        },
        {
          key: "dbWorkers",
          label: "Backend Pool Size",
          kind: "range",
          min: 2,
          max: 12,
          step: 1,
          unit: "nodes",
          defaultValue: 4,
          hint: "Each backend node handles ~45 rps comfortably.",
        },
        {
          key: "burstMode",
          label: "Traffic Spike (1.5x)",
          kind: "toggle",
          defaultValue: 1,
          hint: "Simulates flash-sale spike multiplier.",
        },
      ],
      recommendedPreset: {
        incomingRps: 250,
        capacity: 225,
        dbWorkers: 8,
        burstMode: 1,
      },
      simulate: (vals) => {
        const incoming = vals.incomingRps ?? 250;
        const cap = vals.capacity ?? 150;
        const workers = vals.dbWorkers ?? 4;
        const burst = (vals.burstMode ?? 1) === 1;

        const effectiveDemand = Math.round(incoming * (burst ? 1.4 : 1));
        const allowedRps = Math.min(effectiveDemand, cap);
        const throttledPct = Math.round(
          ((effectiveDemand - allowedRps) / Math.max(1, effectiveDemand)) * 100,
        );
        const allowPct = 100 - throttledPct;
        const dbCapacity = workers * 45;
        const dbLoadPct = Math.round((allowedRps / dbCapacity) * 100);
        const p99Ms =
          dbLoadPct <= 75
            ? Math.round(18 + dbLoadPct * 0.45)
            : Math.round(52 + (dbLoadPct - 75) * 4.2);

        const slaChecks: SystemLabSlaCheck[] = [
          {
            label: "DB CPU Load",
            actual: `${dbLoadPct}%`,
            target: "<= 70%",
            passed: dbLoadPct <= 70,
          },
          {
            label: "p99 Latency",
            actual: `${p99Ms}ms`,
            target: "<= 60ms",
            passed: p99Ms <= 60,
          },
          {
            label: "Allowed Traffic",
            actual: `${allowPct}%`,
            target: ">= 60%",
            passed: allowPct >= 60,
          },
        ];
        const allSlaPassed = slaChecks.every((c) => c.passed);
        const health =
          dbLoadPct > 95
            ? "OVERLOAD"
            : allSlaPassed
              ? "HEALTHY"
              : "DEGRADED";

        return {
          health,
          headline:
            dbLoadPct > 95
              ? `DB saturating at ${dbLoadPct}%! Tighten rate limit or scale workers.`
              : throttledPct > 45
                ? `Throttling ${throttledPct}% of users — raise capacity or add workers.`
                : `Balanced: serving ${allowedRps} rps safely (${throttledPct}% shed).`,
          metrics: [
            {
              label: "Allowed RPS",
              valueText: `${allowedRps} / ${effectiveDemand} rps`,
              fillPercent: clamp(allowPct, 4, 100),
              tone: allowPct >= 70 ? "good" : allowPct >= 50 ? "warn" : "bad",
            },
            {
              label: "HTTP 429 Shed Rate",
              valueText: `${throttledPct}%`,
              fillPercent: clamp(throttledPct, 2, 100),
              tone: throttledPct <= 25 ? "good" : throttledPct <= 45 ? "warn" : "bad",
            },
            {
              label: "Database Saturation",
              valueText: `${dbLoadPct}%`,
              fillPercent: clamp(dbLoadPct, 5, 100),
              tone: dbLoadPct <= 70 ? "good" : dbLoadPct <= 90 ? "warn" : "bad",
            },
            {
              label: "p99 Response Latency",
              valueText: `${p99Ms} ms`,
              fillPercent: clamp(Math.round((p99Ms / 200) * 100), 5, 100),
              tone: p99Ms <= 60 ? "good" : p99Ms <= 110 ? "warn" : "bad",
            },
          ],
          slaChecks,
          allSlaPassed,
          tradeoffNote:
            "Raising bucket capacity lets more bursts in, but pushing allowed RPS past backend capacity spikes tail latency exponentially.",
        };
      },
    };
  }

  if (archetype === "cache_layer") {
    return {
      archetype,
      badge: "CACHING & TTL EVICTION LAB",
      title: `${lesson.title || "Cache Layer"} · Hit-Rate Sim`,
      subtitle:
        "Balance RAM capacity and TTL freshness against database read QPS and stale-data exposure.",
      challengePrompt:
        "SLA Goal: Achieve Hit Rate >= 82%, DB Reads <= 250 qps, and Avg Latency <= 18ms.",
      params: [
        {
          key: "cacheSlots",
          label: "Cache Capacity (RAM)",
          kind: "range",
          min: 10,
          max: 100,
          step: 10,
          unit: "% keys",
          defaultValue: 30,
          hint: "Fraction of hot keys that fit in Redis/LRU RAM.",
        },
        {
          key: "ttlSec",
          label: "TTL Window",
          kind: "range",
          min: 5,
          max: 300,
          step: 15,
          unit: "sec",
          defaultValue: 45,
          hint: "Higher TTL lifts hit rate but risks serving stale rows.",
        },
        {
          key: "readQps",
          label: "Read Traffic",
          kind: "range",
          min: 200,
          max: 2000,
          step: 200,
          unit: "qps",
          defaultValue: 1000,
          hint: "Cache misses fall straight through to SQL.",
        },
        {
          key: "zipfHotset",
          label: "80/20 Hot-Key Skew",
          kind: "toggle",
          defaultValue: 1,
          hint: "Realistic workloads concentrate reads on hot keys.",
        },
      ],
      recommendedPreset: {
        cacheSlots: 80,
        ttlSec: 120,
        readQps: 1000,
        zipfHotset: 1,
      },
      simulate: (vals) => {
        const slots = vals.cacheSlots ?? 30;
        const ttl = vals.ttlSec ?? 45;
        const qps = vals.readQps ?? 1000;
        const zipf = (vals.zipfHotset ?? 1) === 1;

        const coverageBoost = zipf ? Math.pow(slots / 100, 0.45) * 92 : slots * 0.85;
        const ttlFactor = Math.min(1, 0.55 + Math.log10(Math.max(10, ttl)) * 0.23);
        const hitRate = clamp(Math.round(coverageBoost * ttlFactor), 8, 98);
        const dbQps = Math.round(qps * (1 - hitRate / 100));
        const avgLatencyMs = Math.round(
          (hitRate / 100) * 2 + (1 - hitRate / 100) * 58,
        );
        const staleRiskPct = clamp(Math.round((ttl / 300) * 75), 2, 85);

        const slaChecks: SystemLabSlaCheck[] = [
          {
            label: "Cache Hit Rate",
            actual: `${hitRate}%`,
            target: ">= 82%",
            passed: hitRate >= 82,
          },
          {
            label: "SQL Fallthrough",
            actual: `${dbQps} qps`,
            target: "<= 250 qps",
            passed: dbQps <= 250,
          },
          {
            label: "Avg Read Latency",
            actual: `${avgLatencyMs}ms`,
            target: "<= 18ms",
            passed: avgLatencyMs <= 18,
          },
        ];
        const allSlaPassed = slaChecks.every((c) => c.passed);
        const health =
          dbQps > 550 ? "OVERLOAD" : allSlaPassed ? "HEALTHY" : "DEGRADED";

        return {
          health,
          headline:
            dbQps > 550
              ? `Cache thrashing! ${dbQps} qps hitting primary DB directly.`
              : staleRiskPct > 55
                ? `High hit rate (${hitRate}%), but ${ttl}s TTL increases stale read window.`
                : `${hitRate}% hits in RAM keeps DB calm at ${dbQps} qps.`,
          metrics: [
            {
              label: "Cache Hit Ratio",
              valueText: `${hitRate}%`,
              fillPercent: hitRate,
              tone: hitRate >= 82 ? "good" : hitRate >= 60 ? "warn" : "bad",
            },
            {
              label: "DB Queries / sec",
              valueText: `${dbQps} qps`,
              fillPercent: clamp(Math.round((dbQps / 1200) * 100), 4, 100),
              tone: dbQps <= 250 ? "good" : dbQps <= 500 ? "warn" : "bad",
            },
            {
              label: "Avg Read Latency",
              valueText: `${avgLatencyMs} ms`,
              fillPercent: clamp(Math.round((avgLatencyMs / 60) * 100), 4, 100),
              tone: avgLatencyMs <= 18 ? "good" : avgLatencyMs <= 30 ? "warn" : "bad",
            },
            {
              label: "Stale Data Exposure",
              valueText: `${staleRiskPct}%`,
              fillPercent: staleRiskPct,
              tone: staleRiskPct <= 35 ? "good" : staleRiskPct <= 60 ? "warn" : "bad",
            },
          ],
          slaChecks,
          allSlaPassed,
          tradeoffNote:
            "Longer TTL cuts DB traffic dramatically, whereas short TTL + cache-aside invalidation preserves freshness.",
        };
      },
    };
  }

  if (archetype === "sharding_ring") {
    return {
      archetype,
      badge: "CONSISTENT HASHING & SHARD SIM",
      title: `${lesson.title || "Hash Ring"} · Balance Lab`,
      subtitle:
        "See how virtual nodes (vnodes) prevent hotspots and minimize key movement when a shard fails.",
      challengePrompt:
        "SLA Goal: Keep Shard Load Skew <= 25%, Relocated Keys <= 30% on failure, and Zero Hotspots.",
      params: [
        {
          key: "nodes",
          label: "Physical Shards",
          kind: "range",
          min: 2,
          max: 10,
          step: 1,
          unit: "nodes",
          defaultValue: 4,
          hint: "More shards split storage horizontally.",
        },
        {
          key: "vnodes",
          label: "Virtual Nodes / Shard",
          kind: "range",
          min: 1,
          max: 32,
          step: 1,
          unit: "vnodes",
          defaultValue: 2,
          hint: "Higher vnodes smooth ring spacing across partitions.",
        },
        {
          key: "nodeDown",
          label: "Simulate 1 Shard Crash",
          kind: "toggle",
          defaultValue: 0,
          hint: "Measures key churn and neighbor pressure during outage.",
        },
      ],
      recommendedPreset: {
        nodes: 5,
        vnodes: 16,
        nodeDown: 1,
      },
      simulate: (vals) => {
        const nodes = vals.nodes ?? 4;
        const vnodes = vals.vnodes ?? 2;
        const nodeDown = (vals.nodeDown ?? 0) === 1;

        const baseSkew = Math.round(72 / Math.sqrt(Math.max(1, vnodes)));
        const downPenalty = nodeDown ? Math.round(100 / Math.max(2, nodes)) : 0;
        const maxSkewPct = clamp(baseSkew + (vnodes < 4 ? 12 : 0), 5, 95);
        const relocatedPct = nodeDown
          ? Math.round(100 / Math.max(2, nodes))
          : 0;
        const avgUtilization = clamp(
          Math.round((100 / nodes) * (1 + maxSkewPct / 100) + downPenalty * 0.5),
          12,
          100,
        );

        const slaChecks: SystemLabSlaCheck[] = [
          {
            label: "Load Skew",
            actual: `${maxSkewPct}%`,
            target: "<= 25%",
            passed: maxSkewPct <= 25,
          },
          {
            label: "Failover Churn",
            actual: `${relocatedPct}%`,
            target: "<= 30%",
            passed: relocatedPct <= 30,
          },
          {
            label: "Ring Balance",
            actual: `${vnodes} vnodes`,
            target: ">= 8 vnodes",
            passed: vnodes >= 8,
          },
        ];
        const allSlaPassed = slaChecks.every((c) => c.passed);
        const health =
          maxSkewPct > 55 || avgUtilization > 90
            ? "OVERLOAD"
            : allSlaPassed
              ? "HEALTHY"
              : "DEGRADED";

        return {
          health,
          headline:
            maxSkewPct > 40
              ? `Severe partition skew (${maxSkewPct}%) with only ${vnodes} vnodes/shard!`
              : nodeDown
                ? `Only ~${relocatedPct}% of keys moved after 1 shard dropped.`
                : `Even hash distribution across ${nodes * vnodes} virtual ring slots.`,
          metrics: [
            {
              label: "Partition Load Skew",
              valueText: `${maxSkewPct}%`,
              fillPercent: maxSkewPct,
              tone: maxSkewPct <= 25 ? "good" : maxSkewPct <= 45 ? "warn" : "bad",
            },
            {
              label: "Keys Relocated on Outage",
              valueText: `${relocatedPct}%`,
              fillPercent: clamp(relocatedPct, 4, 100),
              tone: relocatedPct <= 30 ? "good" : relocatedPct <= 50 ? "warn" : "bad",
            },
            {
              label: "Hottest Shard Load",
              valueText: `${avgUtilization}%`,
              fillPercent: avgUtilization,
              tone: avgUtilization <= 65 ? "good" : avgUtilization <= 82 ? "warn" : "bad",
            },
          ],
          slaChecks,
          allSlaPassed,
          tradeoffNote:
            "Consistent hashing moves ~1/N keys instead of ~100% during scaling, and vnodes avoid uneven arcs.",
        };
      },
    };
  }

  if (archetype === "resilience_circuit") {
    return {
      archetype,
      badge: "RETRY STORM & CIRCUIT BREAKER LAB",
      title: `${lesson.title || "Circuit Breaker"} · Resilience Lab`,
      subtitle:
        "Stop cascading retry storms with fail-fast circuit tripping and randomized backoff jitter.",
      challengePrompt:
        "SLA Goal: Keep Retry Amplification <= 1.8x, Herd Risk <= 25%, and fail fast when downstream > 50% broken.",
      params: [
        {
          key: "failRate",
          label: "Downstream Error Rate",
          kind: "range",
          min: 0,
          max: 90,
          step: 10,
          unit: "%",
          defaultValue: 60,
          hint: "Percent of downstream RPC calls failing right now.",
        },
        {
          key: "retries",
          label: "Max Retry Attempts",
          kind: "range",
          min: 0,
          max: 5,
          step: 1,
          unit: "x",
          defaultValue: 3,
          hint: "Too many blind retries multiply load during outages.",
        },
        {
          key: "breakerEnabled",
          label: "Circuit Breaker Guard",
          kind: "toggle",
          defaultValue: 0,
          hint: "Trips OPEN to stop hammering a failing dependency.",
        },
        {
          key: "jitter",
          label: "Exponential Jitter",
          kind: "toggle",
          defaultValue: 0,
          hint: "Spreads retry timers so clients don't stampede simultaneously.",
        },
      ],
      recommendedPreset: {
        failRate: 60,
        retries: 2,
        breakerEnabled: 1,
        jitter: 1,
      },
      simulate: (vals) => {
        const failRate = vals.failRate ?? 60;
        const retries = vals.retries ?? 3;
        const breaker = (vals.breakerEnabled ?? 0) === 1;
        const jitter = (vals.jitter ?? 0) === 1;

        const circuitTripped = breaker && failRate >= 40;
        const rawAmp = 1 + (failRate / 100) * retries;
        const ampFactor = Number(
          (circuitTripped ? Math.min(1.25, rawAmp * 0.35) : rawAmp).toFixed(1),
        );
        const herdRisk = clamp(
          Math.round(
            (jitter ? 12 : 48) +
              (retries >= 3 && !breaker ? 35 : 0) +
              failRate * 0.25 -
              (circuitTripped ? 25 : 0),
          ),
          5,
          98,
        );
        const recoverySec = circuitTripped ? (jitter ? 6 : 12) : retries * 9 + 12;

        const slaChecks: SystemLabSlaCheck[] = [
          {
            label: "Traffic Amplification",
            actual: `${ampFactor}x`,
            target: "<= 1.8x",
            passed: ampFactor <= 1.8,
          },
          {
            label: "Thundering Herd Risk",
            actual: `${herdRisk}%`,
            target: "<= 25%",
            passed: herdRisk <= 25,
          },
          {
            label: "Fail-Fast Protection",
            actual: circuitTripped ? "OPEN (SAFE)" : breaker ? "CLOSED" : "OFF",
            target: failRate >= 40 ? "OPEN (SAFE)" : "ARMED",
            passed: failRate < 40 || circuitTripped,
          },
        ];
        const allSlaPassed = slaChecks.every((c) => c.passed);
        const health =
          ampFactor >= 2.6 || herdRisk > 65
            ? "OVERLOAD"
            : allSlaPassed
              ? "HEALTHY"
              : "DEGRADED";

        return {
          health,
          headline:
            ampFactor >= 2.5
              ? `Retry storm! Clients are generating ${ampFactor}x load against a dying service.`
              : circuitTripped
                ? "Circuit OPEN: failing fast and protecting upstream worker threads."
                : "Resilient retries with low amplification and smooth jitter.",
          metrics: [
            {
              label: "Retry Load Multiplier",
              valueText: `${ampFactor}x`,
              fillPercent: clamp(Math.round((ampFactor / 5) * 100), 10, 100),
              tone: ampFactor <= 1.8 ? "good" : ampFactor <= 2.5 ? "warn" : "bad",
            },
            {
              label: "Thundering Herd Risk",
              valueText: `${herdRisk}%`,
              fillPercent: herdRisk,
              tone: herdRisk <= 25 ? "good" : herdRisk <= 50 ? "warn" : "bad",
            },
            {
              label: "Est. Recovery Window",
              valueText: `${recoverySec}s`,
              fillPercent: clamp(Math.round((recoverySec / 60) * 100), 8, 100),
              tone: recoverySec <= 15 ? "good" : recoverySec <= 30 ? "warn" : "bad",
            },
          ],
          slaChecks,
          allSlaPassed,
          tradeoffNote:
            "Immediate synchronous retries amplify outages 3x–5x; breaking early + jittered half-open probes preserves uptime.",
        };
      },
    };
  }

  if (archetype === "queue_pipeline") {
    return {
      archetype,
      badge: "ASYNC QUEUE & DLQ SIMULATOR",
      title: `${lesson.title || "Queue Engine"} · Throughput Sim`,
      subtitle:
        "Size consumer workers and batch chunks to keep queue lag near zero and isolate poison jobs.",
      challengePrompt:
        "SLA Goal: Clear >= 100% of producer rate (Zero Backlog Growth), Drain <= 10s, and isolate poison jobs in DLQ.",
      params: [
        {
          key: "producerRate",
          label: "Producer Publish Rate",
          kind: "range",
          min: 100,
          max: 800,
          step: 100,
          unit: "msg/s",
          defaultValue: 400,
          hint: "Incoming jobs pushed to the broker per second.",
        },
        {
          key: "workers",
          label: "Consumer Workers",
          kind: "range",
          min: 1,
          max: 12,
          step: 1,
          unit: "nodes",
          defaultValue: 3,
          hint: "Parallel workers pulling batches from the queue.",
        },
        {
          key: "batchSize",
          label: "Batch Chunk Size",
          kind: "range",
          min: 1,
          max: 20,
          step: 1,
          unit: "msgs",
          defaultValue: 2,
          hint: "Larger batches amortize network round-trips.",
        },
        {
          key: "dlqEnabled",
          label: "Dead-Letter Queue (DLQ)",
          kind: "toggle",
          defaultValue: 1,
          hint: "Sidelining bad payloads prevents infinite consumer crashes.",
        },
      ],
      recommendedPreset: {
        producerRate: 400,
        workers: 5,
        batchSize: 5,
        dlqEnabled: 1,
      },
      simulate: (vals) => {
        const producer = vals.producerRate ?? 400;
        const workers = vals.workers ?? 3;
        const batch = vals.batchSize ?? 2;
        const dlq = (vals.dlqEnabled ?? 1) === 1;

        const perWorkerThroughput = 45 * Math.min(3.5, 1 + Math.log2(batch) * 0.45);
        const rawCapacity = Math.round(workers * perWorkerThroughput);
        const effectiveCapacity = dlq ? rawCapacity : Math.round(rawCapacity * 0.6);
        const backlogPerSec = Math.max(0, producer - effectiveCapacity);
        const drainSec =
          backlogPerSec > 0 ? 99 : Math.max(1, Math.round(producer / Math.max(1, effectiveCapacity) * 8));
        const utilizationPct = clamp(
          Math.round((producer / Math.max(1, effectiveCapacity)) * 100),
          10,
          100,
        );

        const slaChecks: SystemLabSlaCheck[] = [
          {
            label: "Consumer Throughput",
            actual: `${effectiveCapacity} msg/s`,
            target: `>= ${producer} msg/s`,
            passed: effectiveCapacity >= producer,
          },
          {
            label: "Backlog Growth",
            actual: `${backlogPerSec} msg/s`,
            target: "0 msg/s",
            passed: backlogPerSec === 0,
          },
          {
            label: "Poison-Pill Isolation",
            actual: dlq ? "DLQ ACTIVE" : "STUCK RETRY",
            target: "DLQ ACTIVE",
            passed: dlq,
          },
        ];
        const allSlaPassed = slaChecks.every((c) => c.passed);
        const health =
          backlogPerSec > 100 || !dlq
            ? "OVERLOAD"
            : allSlaPassed
              ? "HEALTHY"
              : "DEGRADED";

        return {
          health,
          headline:
            !dlq
              ? "Poison messages block worker threads! Enable DLQ triage."
              : backlogPerSec > 0
                ? `Queue growing +${backlogPerSec} msg/s — scale workers or batch size.`
                : `Draining cleanly at ${effectiveCapacity} msg/s with zero runaway lag.`,
          metrics: [
            {
              label: "Worker Capacity",
              valueText: `${effectiveCapacity} / ${producer} msg/s`,
              fillPercent: clamp(
                Math.round((effectiveCapacity / Math.max(1, producer)) * 80),
                6,
                100,
              ),
              tone: effectiveCapacity >= producer ? "good" : "bad",
            },
            {
              label: "Queue Saturation",
              valueText: `${utilizationPct}%`,
              fillPercent: utilizationPct,
              tone: utilizationPct <= 75 ? "good" : utilizationPct <= 95 ? "warn" : "bad",
            },
            {
              label: "Lag Clear Time",
              valueText: backlogPerSec > 0 ? "GROWING ∞" : `~${drainSec}s`,
              fillPercent: backlogPerSec > 0 ? 100 : clamp(drainSec * 4, 8, 90),
              tone: backlogPerSec === 0 && drainSec <= 10 ? "good" : "bad",
            },
          ],
          slaChecks,
          allSlaPassed,
          tradeoffNote:
            "Batching boosts throughput massively per worker, while DLQs prevent 1 malformed JSON payload from stalling the whole queue.",
        };
      },
    };
  }

  // quorum_rollout
  return {
    archetype,
    badge: "QUORUM & ROLLOUT CONSENSUS LAB",
    title: `${lesson.title || "Quorum"} · Consistency Lab`,
    subtitle:
      "Tune Replication Factor (N), Write Quorum (W), and Read Quorum (R) to trade latency for strict consistency.",
    challengePrompt:
      "SLA Goal: Enforce Strong Consistency (W + R > N) while tolerating >= 1 node outage.",
    params: [
      {
        key: "n",
        label: "Replica Nodes (N)",
        kind: "range",
        min: 3,
        max: 7,
        step: 2,
        unit: "nodes",
        defaultValue: 3,
        hint: "Total replicas storing each partition.",
      },
      {
        key: "w",
        label: "Write Quorum (W)",
        kind: "range",
        min: 1,
        max: 5,
        step: 1,
        unit: "acks",
        defaultValue: 2,
        hint: "Replicas required to confirm a write.",
      },
      {
        key: "r",
        label: "Read Quorum (R)",
        kind: "range",
        min: 1,
        max: 5,
        step: 1,
        unit: "reads",
        defaultValue: 1,
        hint: "Replicas queried per read.",
      },
    ],
    recommendedPreset: {
      n: 3,
      w: 2,
      r: 2,
    },
    simulate: (vals) => {
      const n = vals.n ?? 3;
      const w = Math.min(n, vals.w ?? 2);
      const r = Math.min(n, vals.r ?? 1);

      const stronglyConsistent = w + r > n;
      const writeTolerance = Math.max(0, n - w);
      const readTolerance = Math.max(0, n - r);
      const quorumLatencyMs = Math.round(12 + Math.max(w, r) * 8);

      const slaChecks: SystemLabSlaCheck[] = [
        {
          label: "Strong Read-After-Write",
          actual: `${w} + ${r} = ${w + r} (vs N=${n})`,
          target: `W + R > ${n}`,
          passed: stronglyConsistent,
        },
        {
          label: "Write Fault Tolerance",
          actual: `${writeTolerance} down ok`,
          target: ">= 1 node down",
          passed: writeTolerance >= 1,
        },
        {
          label: "Read Fault Tolerance",
          actual: `${readTolerance} down ok`,
          target: ">= 1 node down",
          passed: readTolerance >= 1,
        },
      ];
      const allSlaPassed = slaChecks.every((c) => c.passed);
      const health = !stronglyConsistent
        ? "OVERLOAD"
        : allSlaPassed
          ? "HEALTHY"
          : "DEGRADED";

      return {
        health,
        headline: stronglyConsistent
          ? `Quorum overlap guaranteed (${w}+${r} > ${n}): reads always observe latest write.`
          : `Stale read danger! Because ${w}+${r} <= ${n}, reads can miss the newest replica.`,
        metrics: [
          {
            label: "Quorum Overlap (W + R)",
            valueText: `${w + r} / ${n + 1}+ needed`,
            fillPercent: clamp(Math.round(((w + r) / (n + 2)) * 100), 15, 100),
            tone: stronglyConsistent ? "good" : "bad",
          },
          {
            label: "Outage Tolerance (Min)",
            valueText: `${Math.min(writeTolerance, readTolerance)} node(s)`,
            fillPercent: clamp(Math.min(writeTolerance, readTolerance) * 35, 6, 100),
            tone:
              Math.min(writeTolerance, readTolerance) >= 1 ? "good" : "bad",
          },
          {
            label: "Coordinator Latency",
            valueText: `${quorumLatencyMs} ms`,
            fillPercent: clamp(Math.round((quorumLatencyMs / 65) * 100), 10, 100),
            tone: quorumLatencyMs <= 35 ? "good" : "warn",
          },
        ],
        slaChecks,
        allSlaPassed,
        tradeoffNote:
          "Setting W=N gives zero write tolerance; Dynamo-style clusters pick W=2, R=2 on N=3 to tolerate 1 failure cleanly.",
      };
    },
  };
}
