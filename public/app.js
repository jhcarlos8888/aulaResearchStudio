'use strict';

const state = { projects: [], activeProject: null, activeView: 'dashboard', draftDirty: false, draftProjectId: null, toastTimer: null };
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const viewLabels = {
  dashboard: 'Panel principal', new: 'Crear trabajo', workspace: 'Resumen y encargo',
  sources: 'Fuentes y documentos', draft: 'Borrador y exportación', opencode: 'OpenCode y agentes', settings: 'Editar encargo'
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

async function api(url, options = {}) {
  const response = await fetch(url, options);
  const isJson = (response.headers.get('content-type') || '').includes('application/json');
  const payload = isJson ? await response.json() : null;
  if (!response.ok) throw new Error(payload?.error || `La solicitud falló (${response.status}).`);
  return payload;
}

function toast(message, isError = false) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.toggle('error', isError);
  element.classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => element.classList.remove('show'), 3200);
}

function showView(view) {
  if (!viewLabels[view]) view = 'dashboard';
  state.activeView = view;
  $$('.view').forEach((item) => item.classList.toggle('active', item.id === `view-${view}`));
  $$('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.view === view));
  $('#breadcrumb-current').textContent = viewLabels[view];
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (view === 'settings') fillEditForm();
  if (view === 'opencode') refreshEnvironmentStatus();
}

function setActiveProject(project) {
  state.activeProject = project;
  if (project?.id) localStorage.setItem('aulaResearchActiveProject', project.id);
  else localStorage.removeItem('aulaResearchActiveProject');
  renderProjectDependentViews();
}

async function loadProjects() {
  state.projects = await api('/api/projects');
  $('#stat-projects').textContent = state.projects.length;
  $('#stat-sources').textContent = state.projects.reduce((total, project) => total + (project.referenceCount || 0), 0);
  $('#stat-words').textContent = state.projects.reduce((total, project) => total + (project.draftWordCount || 0), 0).toLocaleString('es-CO');
  renderRecentProjects();
  if (state.activeProject?.id) {
    const fresh = state.projects.find((project) => project.id === state.activeProject.id);
    if (fresh) await loadProjectDetails(fresh.id, false);
  }
}

function renderRecentProjects() {
  const container = $('#recent-projects');
  if (!state.projects.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">▤</div><h3>Tu primer trabajo empieza aquí</h3><p>Crea el encargo y define el tema, las normas de citación y los datos de la institución.</p><button class="btn btn-primary" data-action="go-new">Crear primer trabajo</button></div>`;
    return;
  }
  container.innerHTML = state.projects.slice(0, 6).map((project, index) => `
    <article class="project-card" role="button" tabindex="0" data-open-project="${escapeHtml(project.id)}" aria-label="Abrir ${escapeHtml(project.title)}">
      <div class="project-card-head"><div class="project-card-icon">${['▤', '◎', '¶', '▧', '✦', '✎'][index % 6]}</div><span class="tag ${project.apaVersion === '7' ? 'tag-blue' : 'tag-neutral'}">${escapeHtml(project.citationStyle || 'APA')} ${escapeHtml(project.apaVersion || '')}</span></div>
      <h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.topic)}</p>
      <div class="project-card-bottom"><span>${escapeHtml(project.workType || 'Trabajo académico')} · ${(project.referenceCount || 0)} fuentes</span><strong>Abrir →</strong></div>
    </article>`).join('');
}

async function loadProjectDetails(id, navigate = true) {
  const project = await api(`/api/projects/${encodeURIComponent(id)}`);
  state.activeProject = project;
  localStorage.setItem('aulaResearchActiveProject', project.id);
  renderProjectDependentViews();
  if (navigate) showView('workspace');
  return project;
}

function projectOrToast() {
  if (!state.activeProject) {
    toast('Primero crea un trabajo o selecciónalo en el panel principal.', true);
    showView('dashboard');
    return false;
  }
  return true;
}

function renderProjectDependentViews() {
  const project = state.activeProject;
  const hasProject = Boolean(project);
  $('#no-project-workspace').classList.toggle('hidden', hasProject);
  $('#project-workspace-content').classList.toggle('hidden', !hasProject);
  $('#sources-no-project').classList.toggle('hidden', hasProject);
  $('#sources-content').classList.toggle('hidden', !hasProject);
  $('#draft-no-project').classList.toggle('hidden', hasProject);
  $('#draft-content').classList.toggle('hidden', !hasProject);
  $('#settings-no-project').classList.toggle('hidden', hasProject);
  $('#settings-content').classList.toggle('hidden', !hasProject);
  $('#delete-project-button').classList.toggle('hidden', !hasProject);
  // Los paneles de resultado pertenecen a un proyecto concreto: vaciarlos
  // cuando hay cambio de proyecto o cuando ya no hay proyecto activo.
  if (!hasProject || (state.draftProjectId && state.draftProjectId !== project.id)) {
    for (const panelId of ['export-result', 'opencode-prepare-result', 'revision-result', 'edit-success']) {
      const panel = document.getElementById(panelId);
      if (panel) { panel.innerHTML = ''; panel.classList.add('hidden'); }
    }
  }
  if (!project) {
    // Sin proyecto activo: limpiar el encargo anterior y el editor.
    state.draftDirty = false;
    state.draftProjectId = null;
    $('#workspace-title').textContent = 'Resumen del trabajo';
    $('#workspace-subtitle').textContent = 'Encargo, criterios y estado actual del proyecto.';
    $('#workspace-banner-title').textContent = '';
    $('#workspace-topic').textContent = '';
    $('#workspace-status').textContent = 'En planificación';
    $('#workspace-worktype').textContent = 'Trabajo académico';
    $('#workspace-apa').textContent = 'APA 7.ª edición';
    $('#workspace-wordcount').textContent = '0';
    $('#quick-ref-count').textContent = '0 documentos';
    $('#workspace-meta').innerHTML = '';
    $('#draft-text').value = '';
    return;
  }

  $('#workspace-title').textContent = project.title;
  $('#workspace-subtitle').textContent = `${project.workType || 'Trabajo académico'} · Actualizado ${formatDate(project.updatedAt)}`;
  $('#workspace-worktype').textContent = project.workType || 'Trabajo académico';
  $('#workspace-apa').textContent = project.citationStyle === 'APA' ? `APA ${project.apaVersion === '7' ? '7.ª edición' : project.apaVersion === '6' ? '6.ª edición' : 'institucional'}` : project.citationStyle;
  $('#workspace-status').textContent = project.status || 'En planificación';
  $('#workspace-banner-title').textContent = project.title;
  $('#workspace-topic').textContent = project.topic;
  const wordCount = (String(project.draftText || '').match(/\S+/g) || []).length;
  $('#workspace-wordcount').textContent = wordCount.toLocaleString('es-CO');
  $('#quick-ref-count').textContent = `${(project.referenceFiles || []).length} documento(s)`;
  const metadata = [
    ['Institución', project.institution], ['Materia', project.course], ['Profesor', project.professor], ['Estudiante(s)', project.student],
    ['Nivel académico', project.educationLevel], ['Extensión objetivo', project.wordCountTarget ? `${project.wordCountTarget} palabras` : 'Por definir'],
    ['Entrega', project.deliveryDate || 'No especificada'], ['Pregunta', project.researchQuestion], ['Objetivo general', project.objective]
  ];
  $('#workspace-meta').innerHTML = metadata.map(([label, value]) => `<div class="meta-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || 'No indicado')}</strong></div>`).join('');
  $('#sources-project-name').textContent = project.title;
  $('#draft-project-name').textContent = project.title;
  const draftTextarea = $('#draft-text');
  if (state.draftProjectId !== project.id) {
    // Cambió de proyecto: el editor carga SIEMPRE el borrador del proyecto nuevo,
    // aunque hubiera cambios sin guardar en el anterior, para no mezclar textos.
    state.draftProjectId = project.id;
    state.draftDirty = false;
    draftTextarea.value = project.draftText || '';
    $('#draft-save-state').textContent = 'Sin cambios guardados';
    $('#draft-save-state').classList.remove('saved');
  } else if (!state.draftDirty) {
    draftTextarea.value = project.draftText || '';
  }
  updateDraftWordCount();
  renderSourceList();
  fillEditForm();
}

function formatDate(value) {
  if (!value) return 'sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'sin fecha';
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function renderSourceList() {
  const project = state.activeProject;
  if (!project) return;
  const refs = project.referenceFiles || [];
  $('#source-count').textContent = refs.length;
  const container = $('#source-list');
  if (!refs.length) {
    container.innerHTML = `<div class="empty-inline"><div>▧</div><strong>Aún no hay referencias</strong><p>Al cargar un documento aparecerá aquí y se preparará para los agentes.</p></div>`;
    return;
  }
  container.innerHTML = refs.map((ref) => {
    const ext = (ref.originalName.split('.').pop() || 'file').toUpperCase().slice(0, 4);
    const statusClass = /No se pudo|Sin texto/.test(ref.extractionStatus || '') ? 'error' : /parcial|Pendiente/.test(ref.extractionStatus || '') ? 'warn' : '';
    return `<div class="source-item"><div class="source-file-icon">${escapeHtml(ext)}</div><div class="source-main"><strong>${escapeHtml(ref.title || ref.originalName)}</strong><div class="source-meta">${escapeHtml(ref.author || 'Autor no indicado')}${ref.year ? ` · ${escapeHtml(ref.year)}` : ''}<br>${escapeHtml(ref.originalName)} · ${formatBytes(ref.size)}${ref.url ? `<br>${escapeHtml(ref.url)}` : ''}</div><span class="source-status ${statusClass}">${escapeHtml(ref.extractionStatus || 'Pendiente')} · ${(ref.extractedChars || 0).toLocaleString('es-CO')} caracteres</span>${ref.extractionNote ? `<div class="source-meta">${escapeHtml(ref.extractionNote)}</div>` : ''}</div><div class="source-actions"><button class="delete-source" data-delete-source="${escapeHtml(ref.id)}" title="Eliminar referencia" aria-label="Eliminar ${escapeHtml(ref.originalName)}">×</button></div></div>`;
  }).join('');
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function updateDraftWordCount() {
  const text = $('#draft-text').value || '';
  const count = (text.match(/\S+/g) || []).length;
  $('#draft-word-count').textContent = `${count.toLocaleString('es-CO')} palabra(s)`;
  if (state.draftDirty) {
    $('#draft-save-state').textContent = 'Cambios sin guardar';
    $('#draft-save-state').classList.remove('saved');
  }
}

async function saveDraft() {
  if (!projectOrToast()) return;
  const draftText = $('#draft-text').value;
  const result = await api(`/api/projects/${state.activeProject.id}/draft`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ draftText })
  });
  state.draftDirty = false;
  $('#draft-save-state').textContent = `Guardado · ${new Date(result.updatedAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
  $('#draft-save-state').classList.add('saved');
  state.activeProject.draftText = draftText;
  state.activeProject.status = draftText ? 'Borrador en edición' : 'En planificación';
  $('#workspace-status').textContent = state.activeProject.status;
  $('#workspace-wordcount').textContent = result.wordCount.toLocaleString('es-CO');
  await loadProjects();
  if (result.truncated) toast('Aviso: el borrador supera el límite de 500.000 caracteres y se guardó truncado.', true);
  else toast('Borrador guardado.');
}

function fillEditForm() {
  if (!state.activeProject) return;
  const project = state.activeProject;
  const form = $('#edit-project-form');
  for (const [key, value] of Object.entries(project)) {
    const element = form.elements.namedItem(key);
    if (element && typeof value === 'string') element.value = value;
  }
}

function formObject(form) {
  const output = {};
  for (const [key, value] of new FormData(form).entries()) output[key] = value;
  return output;
}

async function prepareProject() {
  if (!projectOrToast()) return;
  const result = await api(`/api/projects/${state.activeProject.id}/prepare`, { method: 'POST' });
  const content = `Paquete preparado en:\n${result.absolutePath}\n\nArchivos: ${result.files.join(', ')}\n\nPrompt inicial:\n${result.startPrompt}`;
  const html = `<strong>Paquete de OpenCode preparado.</strong><p>Carpeta: <code>${escapeHtml(result.path)}</code></p><button class="btn btn-small btn-secondary" data-copy-text="${escapeHtml(encodeURIComponent(result.startPrompt))}">Copiar prompt inicial</button><button class="btn btn-small btn-secondary" data-download-text="${escapeHtml(encodeURIComponent(content))}" data-download-name="INSTRUCCIONES_OPENCODE.txt">Descargar instrucciones</button>`;
  $('#opencode-prepare-result').innerHTML = html;
  $('#opencode-prepare-result').classList.remove('hidden');
  $('#opencode-prepare-result').dataset.prompt = result.startPrompt;
  // El resultado vive en la vista "OpenCode y agentes"; lleva el usuario allí.
  if (state.activeView !== 'opencode') showView('opencode');
  toast('Archivos preparados para OpenCode.');
}

async function deleteActiveProject() {
  const project = state.activeProject;
  if (!project) return;
  const confirmed = window.confirm(
    `¿Eliminar el proyecto "${project.title}"?\n\nSe borrarán también sus referencias, el borrador y los archivos de trabajo de la carpeta workspace. Esta acción no se puede deshacer.`
  );
  if (!confirmed) return;
  const result = await api(`/api/projects/${encodeURIComponent(project.id)}`, { method: 'DELETE' });
  state.activeProject = null;
  state.draftDirty = false;
  state.draftProjectId = null;
  localStorage.removeItem('aulaResearchActiveProject');
  renderProjectDependentViews();
  await loadProjects();
  showView('dashboard');
  if (result.filesDeleted === false) {
    toast('Proyecto eliminado, pero algunos archivos no se pudieron borrar de workspace. Revisa la carpeta manualmente.', true);
  } else {
    toast('Proyecto eliminado.');
  }
}

async function refreshEnvironmentStatus() {
  const container = $('#environment-status');
  if (!container) return;
  container.innerHTML = `<div class="environment-item"><span class="spinner"></span><div><strong>Comprobando entorno…</strong><p>Node.js, OpenCode y configuración del MCP.</p></div></div>`;
  try {
    const result = await api('/api/health');
    const items = [
      { label: `Node.js ${result.node}`, detail: 'Runtime de la aplicación', ok: true },
      { label: result.opencodeAvailable ? `OpenCode disponible (${result.opencodeVersion})` : 'OpenCode no detectado en PATH', detail: result.opencodeAvailable ? 'Puedes iniciar el flujo de agentes desde la terminal.' : 'Instálalo o asegúrate de que el comando opencode esté en PATH.', ok: result.opencodeAvailable },
      { label: result.mcpConfig ? 'Configuración Playwright MCP presente' : 'Configuración Playwright MCP no encontrada', detail: 'Configuración local en opencode.json.', ok: result.mcpConfig },
      { label: 'Almacenamiento local activo', detail: `Referencias de hasta ${result.uploadLimitMB} MB por archivo.`, ok: true }
    ];
    container.innerHTML = items.map((item) => `<div class="environment-item"><span class="env-icon ${item.ok ? '' : 'warn'}">${item.ok ? '✓' : '!'}</span><div><strong>${escapeHtml(item.label)}</strong><p>${escapeHtml(item.detail)}</p></div></div>`).join('');
  } catch (error) {
    container.innerHTML = `<div class="environment-item"><span class="env-icon warn">!</span><div><strong>No se pudo consultar el entorno</strong><p>${escapeHtml(error.message)}</p></div></div>`;
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Texto copiado al portapapeles.');
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    textarea.remove();
    toast(success ? 'Texto copiado al portapapeles.' : 'No se pudo copiar automáticamente. Selecciona el texto y cópialo.', !success);
  }
}

function downloadText(text, filename) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

// Top navigation and dynamic buttons.
document.addEventListener('click', async (event) => {
  const nav = event.target.closest('[data-view]');
  if (nav && nav.classList.contains('nav-item')) {
    showView(nav.dataset.view);
    return;
  }
  const openCard = event.target.closest('[data-open-project]');
  if (openCard) {
    try { await loadProjectDetails(openCard.dataset.openProject); }
    catch (error) { toast(error.message, true); }
    return;
  }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action) {
    try {
      if (action === 'go-dashboard') showView('dashboard');
      if (action === 'go-new') showView('new');
      if (action === 'go-opencode') showView('opencode');
      if (action === 'go-settings') { if (projectOrToast()) showView('settings'); }
      if (action === 'go-sources') { if (projectOrToast()) showView('sources'); }
      if (action === 'go-draft') { if (projectOrToast()) showView('draft'); }
      if (action === 'prepare-project') await prepareProject();
      if (action === 'delete-project') await deleteActiveProject();
    } catch (error) { toast(error.message, true); }
    return;
  }
  const copyButton = event.target.closest('[data-copy-text]');
  if (copyButton) {
    await copyText(decodeURIComponent(copyButton.dataset.copyText));
    return;
  }
  const downloadButton = event.target.closest('[data-download-text]');
  if (downloadButton) {
    downloadText(decodeURIComponent(downloadButton.dataset.downloadText), downloadButton.dataset.downloadName || 'instrucciones.txt');
    return;
  }
  const deleteButton = event.target.closest('[data-delete-source]');
  if (deleteButton) {
    if (!state.activeProject) return;
    if (!window.confirm('¿Eliminar esta referencia y su texto extraído? El resto del proyecto se conservará.')) return;
    try {
      const result = await api(`/api/projects/${state.activeProject.id}/references/${deleteButton.dataset.deleteSource}`, { method: 'DELETE' });
      state.activeProject = result.project;
      renderProjectDependentViews();
      await loadProjects();
      toast('Referencia eliminada.');
    } catch (error) { toast(error.message, true); }
  }
});

$('#project-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  // Capturar el formulario antes del primer await: event.currentTarget es null
  // cuando la promesa se reanuda (el dispatch del evento ya terminó).
  const form = event.currentTarget;
  const submit = event.submitter;
  if (submit) { submit.disabled = true; submit.textContent = 'Creando proyecto…'; }
  try {
    const project = await api('/api/projects', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formObject(form))
    });
    form.reset();
    // Restore useful select defaults after resetting.
    $('#workType').value = 'Ensayo argumentativo';
    $('#educationLevel').value = 'Universidad / pregrado';
    $('#citationStyle').value = 'APA';
    $('#apaVersion').value = '7';
    $('#language').value = 'Español';
    setActiveProject(project);
    await loadProjects();
    await loadProjectDetails(project.id, false);
    showView('workspace');
    toast('Proyecto creado. Ya puedes cargar fuentes y preparar los agentes.');
  } catch (error) { toast(error.message, true); }
  finally { if (submit) { submit.disabled = false; submit.innerHTML = 'Crear proyecto <span>→</span>'; } }
});

$('#edit-project-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!projectOrToast()) return;
  try {
    const result = await api(`/api/projects/${state.activeProject.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formObject(form))
    });
    state.activeProject = result.project;
    renderProjectDependentViews();
    await loadProjects();
    const box = $('#edit-success');
    box.textContent = result.filesSynced
      ? 'Cambios guardados. El brief y el prompt para OpenCode se han actualizado.'
      : 'Cambios guardados, pero no se pudieron regenerar los archivos del proyecto. Vuelve a pulsar «Preparar para OpenCode».';
    box.classList.remove('hidden');
    toast('Encargo actualizado.');
  } catch (error) { toast(error.message, true); }
});

$('#source-file').addEventListener('change', () => {
  const file = $('#source-file').files?.[0];
  $('#selected-file-name').textContent = file ? `${file.name} · ${formatBytes(file.size)}` : 'No se ha seleccionado ningún archivo';
  if (file && !$('#source-title').value) $('#source-title').value = file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
});

const uploadZone = $('#upload-zone');
['dragenter', 'dragover'].forEach((eventName) => uploadZone.addEventListener(eventName, (event) => {
  event.preventDefault(); uploadZone.classList.add('dragover');
}));
['dragleave', 'drop'].forEach((eventName) => uploadZone.addEventListener(eventName, (event) => {
  event.preventDefault(); uploadZone.classList.remove('dragover');
  if (eventName === 'drop' && event.dataTransfer.files.length) {
    $('#source-file').files = event.dataTransfer.files;
    $('#source-file').dispatchEvent(new Event('change'));
  }
}));

$('#source-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!projectOrToast()) return;
  const button = $('#upload-button');
  button.disabled = true;
  button.textContent = 'Cargando y extrayendo texto…';
  try {
    const formData = new FormData(form);
    const result = await api(`/api/projects/${state.activeProject.id}/references`, { method: 'POST', body: formData });
    state.activeProject = result.project;
    form.reset();
    $('#selected-file-name').textContent = 'No se ha seleccionado ningún archivo';
    renderProjectDependentViews();
    await loadProjects();
    toast(result.reference.extractionStatus === 'Texto extraído' ? 'Fuente cargada y texto extraído.' : 'Fuente guardada; revisa el estado de extracción.');
  } catch (error) { toast(error.message, true); }
  finally { button.disabled = false; button.innerHTML = 'Cargar referencia <span>↑</span>'; }
});

$('#draft-text').addEventListener('input', () => {
  state.draftDirty = true;
  updateDraftWordCount();
});
$('#save-draft').addEventListener('click', async () => {
  try { await saveDraft(); } catch (error) { toast(error.message, true); }
});
$('#import-draft').addEventListener('click', async () => {
  if (!projectOrToast()) return;
  try {
    const result = await api(`/api/projects/${state.activeProject.id}/import-draft`, { method: 'POST' });
    $('#draft-text').value = result.draftText;
    state.draftDirty = true;
    updateDraftWordCount();
    if (result.truncated) toast('Aviso: el archivo supera el límite de 500.000 caracteres y se importó truncado.', true);
    else toast(`Importado ${result.sourceFile}. Guarda el borrador para conservarlo en la app.`);
  } catch (error) { toast(error.message, true); }
});

$('#export-word').addEventListener('click', async () => {
  if (!projectOrToast()) return;
  const draftText = $('#draft-text').value;
  if (!draftText.trim()) return toast('El borrador está vacío. Escribe, pega o importa contenido antes de exportar.', true);
  const button = $('#export-word');
  const resultBox = $('#export-result');
  button.disabled = true;
  button.textContent = 'Generando documento…';
  resultBox.classList.add('hidden');
  try {
    const result = await api(`/api/projects/${state.activeProject.id}/export`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftText, includeSources: $('#include-sources').checked })
    });
    state.draftDirty = false;
    state.activeProject.draftText = draftText;
    resultBox.innerHTML = `<strong>Word listo.</strong><p>${result.wordCount.toLocaleString('es-CO')} palabras · ${escapeHtml(result.filename)}</p><a href="${escapeHtml(result.downloadUrl)}" download>Descargar documento .docx →</a>`;
    resultBox.classList.remove('hidden');
    $('#draft-save-state').textContent = 'Exportado';
    $('#draft-save-state').classList.add('saved');
    await loadProjects();
    if (result.truncated) toast('Aviso: el borrador supera los 500.000 caracteres y el documento se generó con la parte que cupo.', true);
    else toast('Documento Word generado. Revisa el formato antes de entregarlo.');
  } catch (error) { toast(error.message, true); }
  finally { button.disabled = false; button.innerHTML = 'Generar y descargar Word <span>↓</span>'; }
});

$('#revision-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!projectOrToast()) return;
  try {
    const instruction = $('#revision-instruction').value.trim();
    const result = await api(`/api/projects/${state.activeProject.id}/revision`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ instruction })
    });
    const payload = `Lee workspace/projects/${state.activeProject.id}/SOLICITUD_REVISION.md y ejecuta las correcciones solicitadas con los agentes y skills. Conserva las citas verificables y registra los cambios en BITACORA_REVISIONES.md.`;
    $('#revision-result').innerHTML = `<strong>Solicitud guardada.</strong><p>Archivo: <code>${escapeHtml(result.file)}</code></p><button class="btn btn-small btn-secondary" data-copy-text="${escapeHtml(encodeURIComponent(payload))}">Copiar prompt para OpenCode</button><button class="btn btn-small btn-secondary" data-download-text="${escapeHtml(encodeURIComponent(result.task))}" data-download-name="SOLICITUD_REVISION.md">Descargar solicitud</button>`;
    $('#revision-result').classList.remove('hidden');
    toast('Las instrucciones de corrección quedaron preparadas.');
  } catch (error) { toast(error.message, true); }
});

$('#refresh-status').addEventListener('click', refreshEnvironmentStatus);

// Keyboard support for project cards.
document.addEventListener('keydown', async (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-open-project]')) {
    event.preventDefault();
    try { await loadProjectDetails(event.target.dataset.openProject); } catch (error) { toast(error.message, true); }
  }
});

(async function init() {
  try {
    await loadProjects();
    const savedId = localStorage.getItem('aulaResearchActiveProject');
    if (savedId && state.projects.some((project) => project.id === savedId)) await loadProjectDetails(savedId, false);
    showView('dashboard');
    refreshEnvironmentStatus();
  } catch (error) {
    toast(`No se pudo inicializar la aplicación: ${error.message}`, true);
  }
})();
