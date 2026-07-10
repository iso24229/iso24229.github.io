import MiniSearch from 'minisearch';

interface SearchEntry {
  type: string;
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  description?: string;
  keywords?: string[];
}

const TYPE_LABEL: Record<string, string> = {
  'system-code': 'System',
  'authority': 'Authority',
  'spelling-system': 'Spelling system',
  'enum': 'Reference',
  'page': 'Page',
  'news': 'News',
};

let mini: MiniSearch<SearchEntry> | null = null;
let loadingPromise: Promise<void> | null = null;
let highlightedIndex = -1;
let currentResults: Array<{ entry: SearchEntry; score: number }> = [];
let bound = false;

async function loadIndex(): Promise<void> {
  if (mini) return;
  if (!loadingPromise) {
    loadingPromise = (async () => {
      const res = await fetch('/search-index.json');
      const data: SearchEntry[] = await res.json();
      mini = new MiniSearch({
        fields: ['title', 'subtitle', 'description', 'keywords'],
        storeFields: ['type', 'id', 'href', 'title', 'subtitle', 'description'],
        searchOptions: {
          boost: { title: 3, subtitle: 2, keywords: 2.5, description: 1 },
          prefix: true,
          fuzzy: 0.2,
          combineWith: 'AND',
        },
      });
      mini.addAll(data as any);
    })();
  }
  await loadingPromise;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function bind(): void {
  if (bound) return;
  bound = true;

  const trigger = document.getElementById('search-trigger');
  const modal = document.getElementById('search-modal');
  const input = document.getElementById('search-input') as HTMLInputElement | null;
  const resultsEl = document.getElementById('search-results');
  if (!trigger || !modal || !input || !resultsEl) return;

  function openModal() {
    modal!.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    input!.value = '';
    resultsEl!.innerHTML = '';
    highlightedIndex = -1;
    currentResults = [];
    setTimeout(() => input!.focus(), 50);
    loadIndex().catch((err) => {
      resultsEl!.innerHTML = `<div class="px-4 py-6 text-sm text-ink-muted">Failed to load search index: ${String(err)}</div>`;
    });
  }

  function closeModal() {
    modal!.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function highlightResult(i: number) {
    highlightedIndex = i;
    const items = resultsEl!.querySelectorAll('[data-result-idx]');
    items.forEach((el, idx) => {
      el.classList.toggle('bg-paper-raised', idx === i);
      el.classList.toggle('text-ink', idx === i);
    });
    if (i >= 0) {
      const target = items[i] as HTMLElement | undefined;
      target?.scrollIntoView({ block: 'nearest' });
    }
  }

  function renderResults(query: string) {
    if (!mini) return;
    if (!query.trim()) {
      resultsEl!.innerHTML = '';
      currentResults = [];
      return;
    }
    const raw = mini.search(query, { prefix: true, fuzzy: 0.2, combineWith: 'AND', boost: { title: 3, subtitle: 2, keywords: 2.5, description: 1 } });
    const top = raw.slice(0, 30);
    currentResults = top.map((r) => ({ entry: r as unknown as SearchEntry, score: r.score }));
    highlightedIndex = top.length > 0 ? 0 : -1;
    if (top.length === 0) {
      resultsEl!.innerHTML = `<div class="px-4 py-6 text-sm text-ink-muted">No matches for "<span class="font-mono">${escapeHtml(query)}</span>".</div>`;
      return;
    }
    resultsEl!.innerHTML = top.map((r, i) => {
      const e = r as unknown as SearchEntry;
      const typeLabel = TYPE_LABEL[e.type] ?? e.type;
      const sub = e.subtitle ? `<span class="block font-mono text-xs text-ink-subtle truncate">${escapeHtml(e.subtitle)}</span>` : '';
      const desc = e.description ? `<span class="block text-xs text-ink-muted mt-0.5 line-clamp-2">${escapeHtml(e.description)}</span>` : '';
      return `<a href="${e.href}" data-result-idx="${i}" class="block px-4 py-2.5 border-b border-rule hover:bg-paper-raised transition-colors">
        <div class="flex items-baseline justify-between gap-3">
          <span class="flex-1 min-w-0">
            <span class="block font-display text-sm font-semibold tracking-[-0.012em] text-ink truncate">${escapeHtml(e.title)}</span>
            ${sub}
            ${desc}
          </span>
          <span class="shrink-0 text-[0.65rem] font-mono uppercase tracking-wider text-ink-subtle">${escapeHtml(typeLabel)}</span>
        </div>
      </a>`;
    }).join('');
    if (highlightedIndex >= 0) highlightResult(highlightedIndex);
  }

  trigger.addEventListener('click', openModal);
  modal.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.hasAttribute('data-search-close')) closeModal();
  });

  input.addEventListener('input', () => renderResults(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(); e.preventDefault(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentResults.length === 0) return;
      highlightResult(Math.min(highlightedIndex + 1, currentResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightResult(Math.max(highlightedIndex - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && currentResults[highlightedIndex]) {
        e.preventDefault();
        window.location.href = currentResults[highlightedIndex].entry.href;
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modal!.classList.contains('hidden')) openModal(); else closeModal();
    }
  });
}

bind();
document.addEventListener('astro:page-load', () => { bound = false; bind(); });
