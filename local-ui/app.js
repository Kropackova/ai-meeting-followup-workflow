const STORAGE_KEY = 'meetingFollowup.localUi.baseUrl';
const DEFAULT_BASE_URL = 'http://localhost:5678';
const DISPLAY_LOCALE = 'en-GB';
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
    li.textContent = 'No items available.';
    listEl.appendChild(li);
    return;
  }
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = formatter(item);
    listEl.appendChild(li);
  });
}

function humanizeStatus(value) {
  const raw = String(value || '').trim();
  if (!raw) return 'Unknown status';

  const labels = {
    draft: 'Draft ready',
    approved: 'Approved',
    approved_edited: 'Approved with edits',
    rejected: 'Rejected',
    minimax_failed: 'Model request failed',
    json_repair_failed: 'JSON repair failed',
    rejected_input: 'Input rejected',
    received: 'Received',
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
  if (!item || typeof item !== 'object') return 'Invalid action item';
  const title = item.task || item.action || 'Untitled task';
  const pieces = [title];
  if (item.owner) pieces.push(`Owner: ${item.owner}`);
  if (item.deadline) pieces.push(`Deadline: ${item.deadline}`);
  return pieces.join(' | ');
}

function formatDecision(item) {
  if (typeof item === 'string') return item;
  if (!item || typeof item !== 'object') return 'Invalid decision item';

  const pieces = [];
  if (item.decision) pieces.push(item.decision);
  if (item.rationale) pieces.push(`Rationale: ${item.rationale}`);
  if (item.status) pieces.push(`Status: ${item.status}`);
  if (item.note) pieces.push(`Note: ${item.note}`);

  return pieces.length ? pieces.join(' | ') : JSON.stringify(item);
}

function formatRisk(item) {
  if (typeof item === 'string') return item;
  if (!item || typeof item !== 'object') return 'Invalid risk item';

  const primary = item.risk || item.question || item.title || item.text || item.issue;
  const pieces = [primary || JSON.stringify(item)];
  if (item.mitigation) pieces.push(`Mitigation: ${item.mitigation}`);
  if (item.status) pieces.push(`Status: ${item.status}`);
  if (item.owner) pieces.push(`Owner: ${item.owner}`);

  return pieces.join(' | ');
}

function buildSubmitStatus(data) {
  const status = String(data?.status || '').trim();
  if (status === 'draft') {
    return { tone: 'success', label: 'Draft ready for review' };
  }

  return {
    tone: 'error',
    label: humanizeStatus(status || 'request_failed'),
  };
}

function buildReviewActionStatus(data) {
  const status = String(data?.status || '').trim();
  if (!status) {
    return { tone: 'success', label: 'Review action sent' };
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
    approve: { button: els.approveBtn, label: 'Approving...' },
    approve_with_sheet_edits: { button: els.approveEditedBtn, label: 'Approving edits...' },
    reject: { button: els.rejectBtn, label: 'Rejecting...' },
  };

  const originals = {
    approve: 'Approve',
    approve_with_sheet_edits: 'Approve with edits',
    reject: 'Reject',
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
  els.approveBtn.textContent = 'Approve';
  els.approveEditedBtn.textContent = 'Approve with edits';
  els.rejectBtn.textContent = 'Reject';
}

async function loadQueue() {
  setStatus(els.queueStatus, 'busy', 'Loading queue');
  const status = els.queueFilter.value;
  const url = status ? `${endpoint('/meeting-followup/review-items')}?status=${encodeURIComponent(status)}` : endpoint('/meeting-followup/review-items');
  try {
    const data = await requestJson(url, { method: 'GET' });
    state.queueItems = Array.isArray(data.items) ? data.items : [];
    renderQueue();
    setStatus(els.queueStatus, 'success', `${state.queueItems.length} item(s)`);
    setStatus(els.connectionStatus, 'success', 'Connected');
  } catch (error) {
    state.queueItems = [];
    els.queueList.innerHTML = '<div class="empty-state">Unable to load queue. Check the base URL, publish the workflow, and confirm the webhook is reachable from the browser.</div>';
    setStatus(els.queueStatus, 'error', 'Queue failed');
    setStatus(els.connectionStatus, 'error', error.message);
  }
}

function renderQueue() {
  els.queueList.innerHTML = '';
  if (!state.queueItems.length) {
    els.queueList.innerHTML = '<div class="empty-state">No rows returned for this filter.</div>';
    return;
  }

  state.queueItems.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `queue-item${item.run_id === state.selectedRunId ? ' is-active' : ''}`;
    button.innerHTML = `
      <h3>${escapeHtml(item.meeting_title || 'Untitled')}</h3>
      <div class="queue-item-meta">
        <span>${escapeHtml(item.department || 'No department')}</span>
        <span>Status: ${escapeHtml(item.status || 'unknown')}</span>
        <span>Reviewer: ${escapeHtml(item.reviewer_name || '—')}</span>
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
    setStatus(els.detailStatus, 'busy', 'Loading detail');
  }
  try {
    const data = await requestJson(endpoint(`/meeting-followup/review-item?run_id=${encodeURIComponent(runId)}`), { method: 'GET' });
    if (!data.ok || !data.item) throw new Error(data.error || 'No item returned.');
    state.selectedItem = data.item;
    renderDetail(data.item);
    if (!options.keepStatus) {
      setStatus(els.detailStatus, 'success', 'Detail loaded');
    }
  } catch (error) {
    state.selectedItem = null;
    els.detailContent.hidden = true;
    els.detailEmpty.hidden = false;
    els.detailEmpty.textContent = `Unable to load row ${runId}: ${error.message}`;
    setStatus(els.detailStatus, 'error', 'Detail failed');
  }
}

function renderDetail(item) {
  els.detailEmpty.hidden = true;
  els.detailContent.hidden = false;
  els.detailTitle.textContent = item.meeting_title || 'Untitled';
  els.detailDepartment.textContent = item.department || '—';
  els.detailStatusValue.textContent = humanizeStatus(item.status || '');
  els.detailReviewer.textContent = item.reviewer_name || '—';
  els.detailSubmitted.textContent = formatDate(item.submitted_at);
  els.detailNotifyChannel.textContent = item.notify_channel || 'none';
  renderList(els.summaryList, item.summary_lines || [], (line) => line);
  renderList(els.actionsList, item.action_items || [], formatAction);
  renderList(els.decisionsList, item.key_decisions || [], formatDecision);
  renderList(els.risksList, item.risks_open_questions || [], formatRisk);
  els.draftPreview.textContent = item.final_markdown_draft || 'No delivery draft returned.';
  els.editedMarkdown.value = item.final_markdown_edited || item.final_markdown_draft || '';
  els.reviewerNotes.value = item.reviewer_notes || '';
  els.reviewResponse.textContent = 'No action sent yet.';
}

async function submitDraft(event) {
  event.preventDefault();
  setStatus(els.submitStatus, 'busy', 'Submitting to n8n');
  showToast('busy', 'Sending transcript for summarization. When it finishes, the second step will open automatically.', 6500);
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
    setStatus(els.connectionStatus, submitStatus.tone === 'success' ? 'success' : 'error', submitStatus.tone === 'success' ? 'Connected' : (data.error_message || submitStatus.label));

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
    setStatus(els.submitStatus, 'error', 'Submit failed');
    setStatus(els.connectionStatus, 'error', error.message);
  }
}

async function submitAudio(event) {
  event.preventDefault();
  setStatus(els.audioStatus, 'busy', 'Sending audio to n8n');
  showToast('busy', 'Sending demo audio for transcription. The review queue opens after a draft is created.', 7000);

  const formData = new FormData(els.audioForm);
  formData.set('demo_data_confirmed', els.audioForm.demo_data_confirmed.checked ? 'true' : 'false');

  try {
    const data = await requestFormData(endpoint('/meeting-followup/audio-intake'), formData);
    els.audioResponse.textContent = JSON.stringify(data, null, 2);

    const audioStatus = buildSubmitStatus(data);
    setStatus(els.audioStatus, audioStatus.tone, audioStatus.label);
    setStatus(els.connectionStatus, 'success', 'Connected');

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
    setStatus(els.audioStatus, 'error', 'Audio processing failed');
    setStatus(els.connectionStatus, 'error', error.message);
  }
}

async function sendReviewAction(decision) {
  if (!state.selectedItem || !state.selectedItem.run_id) {
    setStatus(els.detailStatus, 'error', 'No row selected');
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
      setStatus(els.detailStatus, 'error', 'Edited markdown required');
      showToast('error', 'Edited markdown is required before Approve with edits.');
      return;
    }
  }

  setReviewButtonsBusy(decision);
  setStatus(els.detailStatus, 'busy', 'Sending review action');
  showToast('busy', decision === 'reject' ? 'Rejecting...' : (decision === 'approve_with_sheet_edits' ? 'Approving with edits...' : 'Approving...'));

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
    setStatus(els.detailStatus, 'error', 'Review action failed');
    showToast('error', `Review action failed: ${error.message}`);
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
  setStatus(els.connectionStatus, 'neutral', `Saved: ${state.baseUrl}`);
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
    els.submitResponse.textContent = 'No request sent yet.';
    setStatus(els.submitStatus, 'neutral', 'Idle');
  });
  els.audioResetBtn.addEventListener('click', () => {
    els.audioResponse.textContent = 'No audio request sent yet.';
    setStatus(els.audioStatus, 'neutral', 'Idle');
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
