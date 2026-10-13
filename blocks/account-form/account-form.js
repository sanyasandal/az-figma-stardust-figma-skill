const FIELD_TYPES = ['email', 'password', 'text'];
const ROW_TYPES = [...FIELD_TYPES, 'checkbox', 'divider', 'note', 'status', 'image'];

let fieldCount = 0;

function cellText(cell) {
  return cell ? cell.textContent.replace(/\s+/g, ' ').trim() : '';
}

function nextId() {
  fieldCount += 1;
  return `account-field-${fieldCount}`;
}

function iconImg(name) {
  const img = document.createElement('img');
  img.src = `${window.hlx.codeBasePath}/icons/${name}.svg`;
  img.alt = '';
  img.width = 20;
  img.height = 20;
  return img;
}

function buildField(type, labelCell, extraCell) {
  const id = nextId();
  const raw = cellText(labelCell);
  const required = /\*$/.test(raw);
  const wrapper = document.createElement('div');
  wrapper.className = 'account-form-field';

  const top = document.createElement('div');
  top.className = 'account-form-label-row';
  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = raw.replace(/\*$/, '').trim();
  if (required) {
    const mark = document.createElement('span');
    mark.className = 'account-form-required';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = '*';
    label.append(mark);
  }
  top.append(label);

  const input = document.createElement('input');
  input.id = id;
  input.name = id;
  input.type = type;
  input.required = required;
  input.autocomplete = type === 'email' ? 'email' : 'off';

  const link = extraCell && extraCell.querySelector('a');
  if (link) {
    link.className = 'account-form-inline-link';
    top.append(link);
  } else if (cellText(extraCell)) {
    input.placeholder = cellText(extraCell);
  }

  const control = document.createElement('div');
  control.className = 'account-form-control';
  control.append(input);
  if (type === 'password') {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'account-form-toggle';
    toggle.setAttribute('aria-label', 'Show password');
    toggle.setAttribute('aria-controls', id);
    toggle.append(iconImg('eye'));
    toggle.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      toggle.replaceChildren(iconImg(show ? 'eye-off' : 'eye'));
    });
    control.append(toggle);
  }
  wrapper.append(top, control);
  return wrapper;
}

function buildCheckbox(labelCell) {
  const id = nextId();
  const wrapper = document.createElement('div');
  wrapper.className = 'account-form-checkbox';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = id;
  input.name = id;
  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = cellText(labelCell);
  wrapper.append(input, label);
  return wrapper;
}

function buildDivider(cell) {
  const divider = document.createElement('div');
  divider.className = 'account-form-divider';
  const text = document.createElement('span');
  text.textContent = cellText(cell) || 'Or';
  divider.append(text);
  return divider;
}

function buildStatus(cell) {
  const status = document.createElement('div');
  status.className = 'account-form-status';
  status.setAttribute('role', 'status');
  const dots = document.createElement('span');
  dots.className = 'account-form-dots';
  dots.setAttribute('aria-hidden', 'true');
  dots.append(document.createElement('span'), document.createElement('span'));
  const text = document.createElement('p');
  text.textContent = cellText(cell);
  status.append(dots, text);
  return status;
}

/* group consecutive button paragraphs into one action row */
function groupActions(container) {
  [...container.querySelectorAll('p.button-wrapper')].forEach((p) => {
    if (p.parentElement.classList.contains('account-form-actions')) return;
    const group = document.createElement('div');
    group.className = 'account-form-actions';
    p.before(group);
    let next = p;
    while (next && next.matches('p.button-wrapper')) {
      const following = next.nextElementSibling;
      group.append(next);
      next = following;
    }
  });
}

/* the first primary button submits; field values are never sent anywhere */
function wireForm(form) {
  const submit = form.querySelector('a.button.primary');
  if (!submit) return;
  const button = document.createElement('button');
  button.type = 'submit';
  button.className = submit.className;
  button.textContent = submit.textContent;
  const href = submit.getAttribute('href');
  submit.replaceWith(button);

  const message = document.createElement('p');
  message.className = 'account-form-message';
  message.setAttribute('role', 'status');
  form.append(message);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const target = href ? new URL(href, window.location) : null;
    if (target && target.pathname !== window.location.pathname) {
      window.location.assign(target.pathname);
      return;
    }
    message.textContent = 'Design preview only. No data was sent.';
  });
}

function wrapIntro(panel) {
  const heading = panel.querySelector('h1, h2, h3');
  if (!heading) return;
  heading.classList.add('account-form-title');
  const intro = document.createElement('div');
  intro.className = 'account-form-intro';
  heading.before(intro);
  let node = heading;
  while (node && (node === heading
    || (node.tagName === 'P' && !node.classList.contains('button-wrapper'))
    || node.classList.contains('account-form-status'))) {
    const following = node.nextElementSibling;
    intro.append(node);
    node = following;
  }
}

export default function decorate(block) {
  const isCard = block.classList.contains('card');
  const panel = document.createElement('div');
  panel.className = 'account-form-panel';
  const form = document.createElement('form');
  form.className = 'account-form-body';
  let current = panel;
  let media = null;
  let note = null;

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const key = cellText(cells[0]).toLowerCase();
    if (cells.length < 2 || !ROW_TYPES.includes(key)) {
      cells.forEach((cell) => current.append(...cell.childNodes));
      return;
    }
    const [, first, second] = cells;
    if (FIELD_TYPES.includes(key) || key === 'checkbox') {
      if (current !== form) {
        panel.append(form);
        current = form;
      }
      form.append(key === 'checkbox' ? buildCheckbox(first) : buildField(key, first, second));
    } else if (key === 'divider') {
      current.append(buildDivider(first));
    } else if (key === 'status') {
      current.append(buildStatus(first));
    } else if (key === 'note') {
      note = document.createElement('div');
      note.className = 'account-form-note';
      note.append(...first.childNodes);
    } else if (key === 'image') {
      media = first.querySelector('picture') || first.querySelector('img');
    }
  });

  groupActions(panel);
  if (form.parentElement) wireForm(form);
  if (!isCard) wrapIntro(panel);
  else panel.querySelector('h1, h2, h3')?.classList.add('account-form-title');

  block.replaceChildren();
  if (isCard) {
    if (media) {
      const bg = document.createElement('div');
      bg.className = 'account-form-media';
      bg.append(media);
      block.append(bg);
    }
    const card = document.createElement('div');
    card.className = 'account-form-card';
    card.append(panel);
    if (note) card.append(note);
    block.append(card);
  } else {
    block.append(panel);
    if (note) block.append(note);
  }
}
