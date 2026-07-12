<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

interface CodeExample {
  authority: string;
  source: string;
  target: string;
  identifying: string;
  authorityLabel: string;
  sourceLabel: string;
  targetLabel: string;
  identifyingLabel: string;
}

const codes: CodeExample[] = [
  {
    authority: 'UN', source: 'ara-Arab', target: 'Latn', identifying: '2017',
    authorityLabel: 'United Nations', sourceLabel: 'Arabic · Arab', targetLabel: 'Latin',
    identifyingLabel: 'Year of adoption',
  },
  {
    authority: 'BGN-PCGN', source: 'zho-Hans', target: 'Latn', identifying: '1979',
    authorityLabel: 'BGN/PCGN Joint Agency', sourceLabel: 'Chinese · Han (Simplified)', targetLabel: 'Latin',
    identifyingLabel: 'Year of agreement',
  },
  {
    authority: 'ALA-LC', source: 'mal-Mlym', target: 'Latn', identifying: '2012',
    authorityLabel: 'ALA / Library of Congress', sourceLabel: 'Malayalam · Malayalam', targetLabel: 'Latin',
    identifyingLabel: 'Edition year',
  },
  {
    authority: 'ISO', source: 'Cyrl', target: 'Latn', identifying: '9-1995',
    authorityLabel: 'International Org. for Standardization', sourceLabel: 'Cyrillic (any language)', targetLabel: 'Latin',
    identifyingLabel: 'Standard number',
  },
  {
    authority: 'DIN', source: 'bel-Cyrl', target: 'Latn', identifying: '1460-1982',
    authorityLabel: 'German Institute for Standardization', sourceLabel: 'Belarusian · Cyrillic', targetLabel: 'Latin',
    identifyingLabel: 'DIN standard no.',
  },
  {
    authority: 'ESKT', source: 'udm-Cyrl', target: 'est-Latn', identifying: '2021',
    authorityLabel: 'Estonian Language Committee', sourceLabel: 'Udmurt · Cyrillic', targetLabel: 'Estonian · Latin',
    identifyingLabel: 'Year of approval',
  },
  {
    authority: 'LV', source: 'eng-Latn', target: 'lav-Latn', identifying: '2006',
    authorityLabel: 'Republic of Latvia', sourceLabel: 'English · Latin', targetLabel: 'Latvian · Latin',
    identifyingLabel: 'Year of issue',
  },
  {
    authority: 'ICAO', source: 'Arab', target: 'Latn', identifying: '2015',
    authorityLabel: 'Int\'l Civil Aviation Organization', sourceLabel: 'Arabic (any language)', targetLabel: 'Latin',
    identifyingLabel: 'Edition year',
  },
];

const interval = 4200;
const flipDuration = 500;
const cascadeGap = 120;

const activeIndex = ref(0);
const phase = ref<'idle' | 'flipping'>('idle');

const flipStates = ref([false, false, false, false]);

let timer: ReturnType<typeof setInterval> | null = null;

function startCascade() {
  if (phase.value === 'flipping') return;
  phase.value = 'flipping';

  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      flipStates.value[i] = true;
      setTimeout(() => {
        flipStates.value[i] = false;
        if (i === 3) {
          activeIndex.value = (activeIndex.value + 1) % codes.length;
          phase.value = 'idle';
        }
      }, flipDuration);
    }, i * cascadeGap);
  }
}

onMounted(() => {
  timer = setInterval(startCascade, interval);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const current = (i: number) => {
  const next = (activeIndex.value + 1) % codes.length;
  return flipStates.value[i] ? codes[next] : codes[activeIndex.value];
};

const segments = [
  { key: 'authority' as const, color: 'var(--color-gold-deep)', brightColor: 'var(--color-gold-bright)' },
  { key: 'source' as const, color: 'var(--color-blue)', brightColor: 'var(--color-blue-bright)' },
  { key: 'target' as const, color: 'var(--color-blue)', brightColor: 'var(--color-blue-bright)' },
  { key: 'identifying' as const, color: 'var(--color-ink)', brightColor: 'var(--color-ink)' },
];
</script>

<template>
  <div class="ticker-root">
    <!-- The code display -->
    <div class="ticker-code">
      <template v-for="(seg, i) in segments" :key="seg.key">
        <div v-if="i > 0" class="ticker-colon">:</div>
        <div class="ticker-cell" :style="{ '--flip-duration': flipDuration + 'ms' }">
          <div class="ticker-card" :class="{ 'is-flipped': flipStates[i] }">
            <div class="ticker-face ticker-face-front">
              <span class="ticker-text" :style="{ color: seg.color }">
                {{ codes[activeIndex][seg.key] }}
              </span>
            </div>
            <div class="ticker-face ticker-face-back">
              <span
                class="ticker-text"
                :style="{ color: seg.brightColor }"
              >
                {{ codes[(activeIndex + 1) % codes.length][seg.key] }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Labels with brackets -->
    <div class="ticker-labels">
      <div
        v-for="(seg, i) in segments"
        :key="seg.key"
        class="ticker-label-cell"
        :style="{ gridColumn: `${i * 2 + 1} / ${i * 2 + 2}` }"
      >
        <p class="ticker-label-eyebrow">{{ seg.key }}</p>
        <p class="ticker-label-detail">{{ current(i)[(`${seg.key}Label` as keyof CodeExample)] }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticker-root {
  font-family: var(--font-mono, 'JetBrains Mono Variable', monospace);
  --cell-pad-x: 0.85rem;
  --cell-pad-y: 1.1rem;
}

/* ── Code row ─────────────────────────────────────────────── */
.ticker-code {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  flex-wrap: nowrap;
}

.ticker-colon {
  font-size: clamp(1.25rem, 3.5vw, 2rem);
  font-weight: 500;
  color: var(--color-ink-subtle, #888);
  padding: 0 0.15rem;
  user-select: none;
  line-height: 1;
  align-self: center;
  padding-top: var(--cell-pad-y);
  padding-bottom: var(--cell-pad-y);
}

/* ── Flip cell ────────────────────────────────────────────── */
.ticker-cell {
  perspective: 800px;
}

.ticker-card {
  position: relative;
  transform-style: preserve-3d;
  transition: transform var(--flip-duration, 500ms) cubic-bezier(0.55, 0.085, 0.68, 0.53);
  padding: var(--cell-pad-y) var(--cell-pad-x);
}

.ticker-card.is-flipped {
  transform: rotateX(180deg);
}

.ticker-face {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.ticker-face-back {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotateX(180deg);
  padding: var(--cell-pad-y) var(--cell-pad-x);
}

.ticker-text {
  font-family: var(--font-mono, 'JetBrains Mono Variable', monospace);
  font-size: clamp(1.25rem, 3.5vw, 2rem);
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1;
}

/* ── Labels ───────────────────────────────────────────────── */
.ticker-labels {
  display: grid;
  margin-top: 1rem;
  position: relative;
  border-top: 1px solid var(--color-rule, #d5d3c9);
  padding-top: 1.25rem;
}

.ticker-label-cell {
  text-align: center;
}

.ticker-label-eyebrow {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-ink-subtle, #888);
  margin-bottom: 0.35rem;
}

.ticker-label-detail {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.72rem;
  color: var(--color-ink-muted, #4a4d56);
  line-height: 1.3;
  transition: opacity 0.2s ease;
}

/* ── Responsive: stack label columns to match code columns ── */
@media (min-width: 640px) {
  .ticker-labels {
    grid-template-columns: repeat(7, auto);
    justify-content: center;
    gap: 0;
  }
  .ticker-label-cell {
    padding: 0 0.3rem;
  }
  .ticker-label-cell:nth-child(1) { grid-column: 1; }
  .ticker-label-cell:nth-child(2) { grid-column: 3; }
  .ticker-label-cell:nth-child(3) { grid-column: 5; }
  .ticker-label-cell:nth-child(4) { grid-column: 7; }
}
@media (max-width: 639px) {
  .ticker-labels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    text-align: left;
  }
}
</style>
