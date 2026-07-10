export interface ComboboxOption {
  value: string;
  label: string;
}

type AnyInput = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export function attachCombobox(
  input: AnyInput | null,
  options: ComboboxOption[],
  errMsg = 'Please select a valid option from the list',
): void {
  if (!input || !options.length) return;
  const inputEl: AnyInput = input;
  if (inputEl.dataset.cbAttached) return;
  inputEl.dataset.cbAttached = '1';

  const parent = inputEl.parentElement!;
  if (!parent.classList.contains('cb-wrap')) {
    const wrap = document.createElement('div');
    wrap.className = 'cb-wrap';
    parent.insertBefore(wrap, inputEl);
    wrap.appendChild(inputEl);
  }
  const wrap = inputEl.parentElement as HTMLElement;
  const dd = document.createElement('div');
  dd.className = 'cb-dropdown';
  wrap.appendChild(dd);
  const err = document.createElement('div');
  err.className = 'cb-error';
  err.textContent = errMsg;
  wrap.parentElement!.insertBefore(err, wrap.nextSibling);

  let selVal = '';
  let activeIdx = -1;
  let selecting = false;

  function currentValue(): string { return (inputEl as HTMLInputElement).value; }
  function setValue(v: string): void { (inputEl as HTMLInputElement).value = v; }

  function render(q: string): void {
    const needle = (q || '').toLowerCase().trim();
    const m = needle
      ? options.filter((o) => o.value.toLowerCase().includes(needle) || o.label.toLowerCase().includes(needle)).slice(0, 50)
      : options.slice(0, 50);
    activeIdx = -1;
    dd.innerHTML = m.length
      ? m.map((o, i) =>
          `<div class="cb-option" data-value="${o.value}" data-idx="${i}">` +
          `<div class="cb-option-value">${o.value}</div>` +
          `<div class="cb-option-label">${o.label}</div></div>`,
        ).join('')
      : '<div class="cb-empty">No matches</div>';
    dd.classList.add('visible');
  }

  function hide(): void {
    dd.classList.remove('visible');
    activeIdx = -1;
  }

  function validate(): boolean {
    const v = currentValue().trim();
    if (!v || selVal === v) {
      err.classList.remove('visible');
      inputEl.classList.remove('field-invalid');
      return true;
    }
    const match = options.find((o) => o.value.toLowerCase() === v.toLowerCase());
    if (match) {
      selVal = match.value;
      err.classList.remove('visible');
      inputEl.classList.remove('field-invalid');
      return true;
    }
    err.classList.add('visible');
    inputEl.classList.add('field-invalid');
    return false;
  }

  function setActive(i: number): void {
    dd.querySelectorAll('.cb-active').forEach((el) => el.classList.remove('cb-active'));
    const opts = dd.querySelectorAll<HTMLElement>('.cb-option');
    if (i >= 0 && i < opts.length) {
      opts[i].classList.add('cb-active');
      opts[i].scrollIntoView({ block: 'nearest' });
      activeIdx = i;
    }
  }

  inputEl.addEventListener('focus', () => render(currentValue()));
  inputEl.addEventListener('input', () => {
    if (selecting) return;
    selVal = '';
    render(currentValue());
    validate();
  });
  inputEl.addEventListener('keydown', (e: Event) => {
    const ev = e as KeyboardEvent;
    const opts = dd.querySelectorAll<HTMLElement>('.cb-option');
    if (!dd.classList.contains('visible') || !opts.length) return;
    if (ev.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(activeIdx + 1, opts.length - 1)); }
    else if (ev.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(activeIdx - 1, 0)); }
    else if (ev.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); opts[activeIdx].click(); }
    else if (ev.key === 'Escape') hide();
  });
  dd.addEventListener('mousedown', (e: Event) => e.preventDefault());
  dd.addEventListener('click', (e: Event) => {
    const opt = (e.target as HTMLElement).closest('.cb-option') as HTMLElement | null;
    if (!opt) return;
    selecting = true;
    setValue(opt.dataset.value!);
    selVal = opt.dataset.value!;
    hide();
    validate();
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    selecting = false;
  });
  inputEl.addEventListener('blur', () => { setTimeout(() => { hide(); validate(); }, 150); });
}
