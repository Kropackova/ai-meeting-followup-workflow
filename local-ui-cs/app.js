const STORAGE_KEY = 'meetingFollowup.localUiCs.baseUrl';
const DEFAULT_BASE_URL = 'http://localhost:5678';
const DISPLAY_LOCALE = 'cs-CZ';
const DISPLAY_TIMEZONE = 'Europe/Prague';

const state = {
  baseUrl: '',
  queueItems: [],
  selectedRunId: '',
  selectedItem: null,
  toastTimer: null,
};

const els = {
  baseUrl: document.getElementById('baseUrl'),
  saveBaseUrlBtn: document.getElementById('saveBaseUrlBtn'),
  connectionStatus: document.getElementById('connectionStatus'),
  tabSubmit: document.getElementById('tabSubmit'),
  tabAudio: document.getElementById('tabAudio'),
  tabReview: document.getElementById('tabReview'),
  submitView: document.getElementById('submitView'),
  audioView: document.getElementById('audioView'),
  reviewView: document.getElementById('reviewView'),
  submitForm: document.getElementById('submitForm'),
  submitResetBtn: document.getElementById('submitResetBtn'),
  submitStatus: document.getElementById('submitStatus'),
  submitResponse: document.getElementById('submitResponse'),
  audioForm: document.getElementById('audioForm'),
  audioResetBtn: document.getElementById('audioResetBtn'),
  audioStatus: document.getElementById('audioStatus'),
  audioResponse: document.getElementById('audioResponse'),
  queueFilter: document.getElementById('queueFilter'),
  refreshQueueBtn: document.getElementById('refreshQueueBtn'),
  queueStatus: document.getElementById('queueStatus'),
  queueList: document.getElementById('queueList'),
  detailStatus: document.getElementById('detailStatus'),
  detailEmpty: document.getElementById('detailEmpty'),
  detailContent: document.getElementById('detailContent'),
  detailTitle: document.getElementById('detailTitle'),
  detailDepartment: document.getElementById('detailDepartment'),
  detailStatusValue: document.getElementById('detailStatusValue'),
  detailReviewer: document.getElementById('detailReviewer'),
  detailSubmitted: document.getElementById('detailSubmitted'),
  detailNotifyChannel: document.getElementById('detailNotifyChannel'),
  summaryList: document.getElementById('summaryList'),
  actionsList: document.getElementById('actionsList'),
  decisionsList: document.getElementById('decisionsList'),
  risksList: document.getElementById('risksList'),
  draftPreview: document.getElementById('draftPreview'),
  editedMarkdown: document.getElementById('editedMarkdown'),
  reviewerNotes: document.getElementById('reviewerNotes'),
  copyDraftToEditedBtn: document.getElementById('copyDraftToEditedBtn'),
  approveBtn: document.getElementById('approveBtn'),
  approveEditedBtn: document.getElementById('approveEditedBtn'),
  rejectBtn: document.getElementById('rejectBtn'),
  reviewResponse: document.getElementById('reviewResponse'),
  actionToast: document.getElementById('actionToast'),
};

function normalizeBaseUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function setStatus(element, tone, text) {
  element.className = `inline-status ${tone}`;
  element.textContent = text;
}

function setView(viewName) {
  const isSubmit = viewName === 'submit';
  const isAudio = viewName === 'audio';
  const isReview = viewName === 'review';
  els.submitView.classList.toggle('is-active', isSubmit);
  els.audioView.classList.toggle('is-active', isAudio);
  els.reviewView.classList.toggle('is-active', isReview);
  els.tabSubmit.classList.toggle('is-active', isSubmit);
  els.tabAudio.classList.toggle('is-active', isAudio);
  els.tabReview.classList.toggle('is-active', isReview);
}

function endpoint(path) {
  const base = normalizeBaseUrl(state.baseUrl || DEFAULT_BASE_URL);
  return `${base}/webhook${path}`;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const message = data?.error || data?.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}

async function requestFormData(url, formData) {
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const message = data?.error || data?.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function renderList(listEl, items, formatter) {
  listEl.innerHTML = '';
  if (!items || items.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Nejsou k dispozici žádné položky.';
    listEl.appendChild(li);
    return;
  }
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = formatter(item);
    listEl.appendChild(li);
  });
}

function formatQueueCount(count) {
  const abs = Math.abs(Number(count) || 0);
  const mod10 = abs % 10;
  const mod100 = abs % 100;

  let noun = 'položek';
  if (mod10 === 1 && mod100 !== 11) {
    noun = 'položka';
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    noun = 'položky';
  }

  return `${abs} ${noun}`;
}

function humanizeStatus(value) {
  const raw = String(value || '').trim();
  if (!raw) return 'Neznámý status';

  const labels = {
    draft: 'Návrh připraven',
    approved: 'Schváleno',
    approved_edited: 'Schváleno s úpravami',
    rejected: 'Zamítnuto',
    minimax_failed: 'Volání modelu selhalo',
    json_repair_failed: 'Oprava JSON selhala',
    rejected_input: 'Vstup zamítnut',
    received: 'Přijato',
  };

  return labels[raw] || raw.replaceAll('_', ' ');
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    timeZone: DISPLAY_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

function formatAction(item) {
  if (!item || typeof item !== 'object') return 'Neplatná akce';
  const title = item.task || item.action || 'Úkol bez názvu';
  const pieces = [title];
  if (item.owner) pieces.push(`Vlastník: ${item.owner}`);
  if (item.deadline) pieces.push(`Termín: ${item.deadline}`);
  return pieces.join(' | ');
}

function formatDecision(item) {
  if (typeof item === 'string') return item;
  if (!item || typeof item !== 'object') return 'Neplatné rozhodnutí';

  const pieces = [];
  if (item.decision) pieces.push(item.decision);
  if (item.rationale) pieces.push(`Důvod: ${item.rationale}`);
  if (item.status) pieces.push(`Status: ${item.status}`);
  if (item.note) pieces.push(`Poznámka: ${item.note}`);

  return pieces.length ? pieces.join(' | ') : JSON.stringify(item);
}

function formatRisk(item) {
  if (typeof item === 'string') return item;
  if (!item || typeof item !== 'object') return 'Neplatná položka rizika';

  const primary = item.risk || item.question || item.title || item.text || item.issue;
  const pieces = [primary || JSON.stringify(item)];
  if (item.mitigation) pieces.push(`Mitigace: ${item.mitigation}`);
  if (item.status) pieces.push(`Status: ${item.status}`);
  if (item.owner) pieces.push(`Vlastník: ${item.owner}`);

  return pieces.join(' | ');
}

function buildSubmitStatus(data) {
  const status = String(data?.status || '').trim();
  if (status === 'draft') {
    return { tone: 'success', label: 'Návrh připraven k revizi' };
  }

  return {
    tone: 'error',
    label: humanizeStatus(status || 'request_failed'),
  };
}

function buildReviewActionStatus(data) {
  const status = String(data?.status || '').trim();
  if (!status) {
    return { tone: 'success', label: 'Schvalovací akce byla odeslána' };
  }

  return {
    tone: ['approved', 'approved_edited', 'rejected'].includes(status) ? 'success' : 'error',
    label: humanizeStatus(status),
  };
}

function showToast(tone, text, duration = 5000) {
  clearTimeout(state.toastTimer);
  els.actionToast.hidden = false;
  els.actionToast.className = `action-toast ${tone}`;
  els.actionToast.textContent = text;
  state.toastTimer = setTimeout(() => {
    els.actionToast.hidden = true;
  }, duration);
}

function setReviewButtonsBusy(decision) {
  const config = {
    approve: { button: els.approveBtn, label: 'Schvaluji...' },
    approve_with_sheet_edits: { button: els.approveEditedBtn, label: 'Schvaluji s úpravami...' },
    reject: { button: els.rejectBtn, label: 'Zamítám...' },
  };

  const originals = {
    approve: 'Schválit',
    approve_with_sheet_edits: 'Schválit s úpravami',
    reject: 'Zamítnout',
  };

  els.approveBtn.disabled = true;
  els.approveEditedBtn.disabled = true;
  els.rejectBtn.disabled = true;
  els.approveBtn.textContent = originals.approve;
  els.approveEditedBtn.textContent = originals.approve_with_sheet_edits;
  els.rejectBtn.textContent = originals.reject;

  if (config[decision]) {
    config[decision].button.textContent = config[decision].label;
  }
}

function resetReviewButtons() {
  els.approveBtn.disabled = false;
  els.approveEditedBtn.disabled = false;
  els.rejectBtn.disabled = false;
  els.approveBtn.textContent = 'Schválit';
  els.approveEditedBtn.textContent = 'Schválit s úpravami';
  els.rejectBtn.textContent = 'Zamítnout';
}

async function loadQueue() {
  setStatus(els.queueStatus, 'busy', 'Načítám frontu');
  const status = els.queueFilter.value;
  const url = status ? `${endpoint('/meeting-followup/review-items')}?status=${encodeURIComponent(status)}` : endpoint('/meeting-followup/review-items');
  try {
    const data = await requestJson(url, { method: 'GET' });
    state.queueItems = Array.isArray(data.items) ? data.items : [];
    renderQueue();
    setStatus(els.queueStatus, 'success', formatQueueCount(state.queueItems.length));
    setStatus(els.connectionStatus, 'success', 'Připojeno');
  } catch (error) {
    state.queueItems = [];
    els.queueList.innerHTML = '<div class="empty-state">Nepodařilo se načíst frontu. Zkontroluj základní URL, publikování workflow a dostupnost webhooku z prohlížeče.</div>';
    setStatus(els.queueStatus, 'error', 'Načtení fronty selhalo');
    setStatus(els.connectionStatus, 'error', error.message);
  }
}

function renderQueue() {
  els.queueList.innerHTML = '';
  if (!state.queueItems.length) {
    els.queueList.innerHTML = '<div class="empty-state">Tento filtr nevrátil žádné řádky.</div>';
    return;
  }

  state.queueItems.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `queue-item${item.run_id === state.selectedRunId ? ' is-active' : ''}`;
    button.innerHTML = `
      <h3>${escapeHtml(item.meeting_title || 'Bez názvu')}</h3>
      <div class="queue-item-meta">
        <span>${escapeHtml(item.department || 'Bez oddělení')}</span>
        <span>Status: ${escapeHtml(humanizeStatus(item.status || 'neznámý'))}</span>
        <span>Schvalovatel: ${escapeHtml(item.reviewer_name || '—')}</span>
        <span>${escapeHtml(formatDate(item.submitted_at))}</span>
      </div>
    `;
    button.addEventListener('click', () => loadDetail(item.run_id));
    els.queueList.appendChild(button);
  });
}

async function loadDetail(runId, options = {}) {
  state.selectedRunId = runId;
  renderQueue();
  if (!options.keepStatus) {
    setStatus(els.detailStatus, 'busy', 'Načítám detail');
  }
  try {
    const data = await requestJson(endpoint(`/meeting-followup/review-item?run_id=${encodeURIComponent(runId)}`), { method: 'GET' });
    if (!data.ok || !data.item) throw new Error(data.error || 'Nebyly vráceny žádné detaily.');
    state.selectedItem = data.item;
    renderDetail(data.item);
    if (!options.keepStatus) {
      setStatus(els.detailStatus, 'success', 'Detail načten');
    }
  } catch (error) {
    state.selectedItem = null;
    els.detailContent.hidden = true;
    els.detailEmpty.hidden = false;
    els.detailEmpty.textContent = `Nepodařilo se načíst řádek ${runId}: ${error.message}`;
    setStatus(els.detailStatus, 'error', 'Načtení detailu selhalo');
  }
}

function renderDetail(item) {
  els.detailEmpty.hidden = true;
  els.detailContent.hidden = false;
  els.detailTitle.textContent = item.meeting_title || 'Bez názvu';
  els.detailDepartment.textContent = item.department || '—';
  els.detailStatusValue.textContent = humanizeStatus(item.status || '');
  els.detailReviewer.textContent = item.reviewer_name || '—';
  els.detailSubmitted.textContent = formatDate(item.submitted_at);
  els.detailNotifyChannel.textContent = item.notify_channel || 'none';
  renderList(els.summaryList, item.summary_lines || [], (line) => line);
  renderList(els.actionsList, item.action_items || [], formatAction);
  renderList(els.decisionsList, item.key_decisions || [], formatDecision);
  renderList(els.risksList, item.risks_open_questions || [], formatRisk);
  els.draftPreview.textContent = item.final_markdown_draft || 'Workflow nevrátil žádný návrh.';
  els.editedMarkdown.value = item.final_markdown_edited || item.final_markdown_draft || '';
  els.reviewerNotes.value = item.reviewer_notes || '';
  els.reviewResponse.textContent = 'Zatím nebyla odeslána žádná akce.';
}

async function submitDraft(event) {
  event.preventDefault();
  setStatus(els.submitStatus, 'busy', 'Odesílám do n8n');
  showToast('busy', 'Posílám transkript na sumarizaci, po dokončení se automaticky otevře druhý krok.', 6500);
  const formData = new FormData(els.submitForm);
  const payload = Object.fromEntries(formData.entries());
  payload.demo_data_confirmed = els.submitForm.demo_data_confirmed.checked;

  try {
    const data = await requestJson(endpoint('/meeting-followup/create-draft'), {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    els.submitResponse.textContent = JSON.stringify(data, null, 2);

    const submitStatus = buildSubmitStatus(data);
    setStatus(els.submitStatus, submitStatus.tone, submitStatus.label);
    setStatus(els.connectionStatus, submitStatus.tone === 'success' ? 'success' : 'error', submitStatus.tone === 'success' ? 'Připojeno' : (data.error_message || submitStatus.label));

    if (data.status && els.queueFilter.querySelector(`option[value="${data.status}"]`)) {
      els.queueFilter.value = data.status;
    }

    setView('review');
    await loadQueue();
    if (data.run_id) {
      await loadDetail(data.run_id);
    }
  } catch (error) {
    els.submitResponse.textContent = JSON.stringify({ error: error.message }, null, 2);
    setStatus(els.submitStatus, 'error', 'Odeslání selhalo');
    setStatus(els.connectionStatus, 'error', error.message);
  }
}

async function submitAudio(event) {
  event.preventDefault();
  setStatus(els.audioStatus, 'busy', 'Odesílám audio do n8n');
  showToast('busy', 'Posílám demo audio na transkripci. Po vytvoření draftu se otevře fronta ke kontrole.', 7000);

  const formData = new FormData(els.audioForm);
  formData.set('demo_data_confirmed', els.audioForm.demo_data_confirmed.checked ? 'true' : 'false');

  try {
    const data = await requestFormData(endpoint('/meeting-followup/audio-intake'), formData);
    els.audioResponse.textContent = JSON.stringify(data, null, 2);

    const audioStatus = buildSubmitStatus(data);
    setStatus(els.audioStatus, audioStatus.tone, audioStatus.label);
    setStatus(els.connectionStatus, 'success', 'Připojeno');

    if (data.status !== 'draft') {
      showToast('error', data.error_message || audioStatus.label);
      return;
    }

    if (data.status && els.queueFilter.querySelector(`option[value="${data.status}"]`)) {
      els.queueFilter.value = data.status;
    }

    setView('review');
    await loadQueue();
    if (data.run_id) {
      await loadDetail(data.run_id);
    }
  } catch (error) {
    els.audioResponse.textContent = JSON.stringify({ error: error.message }, null, 2);
    setStatus(els.audioStatus, 'error', 'Audio zpracování selhalo');
    setStatus(els.connectionStatus, 'error', error.message);
  }
}

async function sendReviewAction(decision) {
  if (!state.selectedItem || !state.selectedItem.run_id) {
    setStatus(els.detailStatus, 'error', 'Není vybraný žádný řádek');
    return;
  }

  const payload = {
    run_id: state.selectedItem.run_id,
    decision,
    reviewer_notes: els.reviewerNotes.value.trim(),
  };

  if (decision === 'approve_with_sheet_edits') {
    payload.final_markdown_edited = els.editedMarkdown.value;
    if (!payload.final_markdown_edited.trim()) {
      setStatus(els.detailStatus, 'error', 'Upravený text je povinný');
      showToast('error', 'Před volbou Schválit s úpravami je potřeba vyplnit upravený text.');
      return;
    }
  }

  setReviewButtonsBusy(decision);
  setStatus(els.detailStatus, 'busy', 'Odesílám schvalovací akci');
  showToast('busy', decision === 'reject' ? 'Zamítám...' : (decision === 'approve_with_sheet_edits' ? 'Schvaluji s úpravami...' : 'Schvaluji...'));

  try {
    const data = await requestJson(endpoint('/meeting-followup/review-action'), {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    els.reviewResponse.textContent = JSON.stringify(data, null, 2);
    const reviewStatus = buildReviewActionStatus(data);
    setStatus(els.detailStatus, reviewStatus.tone, reviewStatus.label);
    showToast(reviewStatus.tone, reviewStatus.label);
    await loadQueue();
    await loadDetail(state.selectedRunId, { keepStatus: true });
  } catch (error) {
    els.reviewResponse.textContent = JSON.stringify({ error: error.message }, null, 2);
    setStatus(els.detailStatus, 'error', 'Schvalovací akce selhala');
    showToast('error', `Akce review selhala: ${error.message}`);
  } finally {
    resetReviewButtons();
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function saveBaseUrl() {
  state.baseUrl = normalizeBaseUrl(els.baseUrl.value || DEFAULT_BASE_URL);
  localStorage.setItem(STORAGE_KEY, state.baseUrl);
  els.baseUrl.value = state.baseUrl;
  setStatus(els.connectionStatus, 'neutral', `Uloženo: ${state.baseUrl}`);
}

function init() {
  state.baseUrl = normalizeBaseUrl(localStorage.getItem(STORAGE_KEY) || DEFAULT_BASE_URL);
  els.baseUrl.value = state.baseUrl;

  els.saveBaseUrlBtn.addEventListener('click', saveBaseUrl);
  els.tabSubmit.addEventListener('click', () => setView('submit'));
  els.tabAudio.addEventListener('click', () => setView('audio'));
  els.tabReview.addEventListener('click', async () => {
    setView('review');
    await loadQueue();
  });
  els.refreshQueueBtn.addEventListener('click', loadQueue);
  els.queueFilter.addEventListener('change', loadQueue);
  els.submitForm.addEventListener('submit', submitDraft);
  els.audioForm.addEventListener('submit', submitAudio);
  els.submitResetBtn.addEventListener('click', () => {
    els.submitResponse.textContent = 'Zatím nebyl odeslán žádný požadavek.';
    setStatus(els.submitStatus, 'neutral', 'Neaktivní');
  });
  els.audioResetBtn.addEventListener('click', () => {
    els.audioResponse.textContent = 'Zatím nebyl odeslán žádný audio požadavek.';
    setStatus(els.audioStatus, 'neutral', 'Neaktivní');
  });
  els.copyDraftToEditedBtn.addEventListener('click', () => {
    if (state.selectedItem?.final_markdown_draft) {
      els.editedMarkdown.value = state.selectedItem.final_markdown_draft;
    }
  });
  els.approveBtn.addEventListener('click', () => sendReviewAction('approve'));
  els.approveEditedBtn.addEventListener('click', () => sendReviewAction('approve_with_sheet_edits'));
  els.rejectBtn.addEventListener('click', () => sendReviewAction('reject'));
}

init();
