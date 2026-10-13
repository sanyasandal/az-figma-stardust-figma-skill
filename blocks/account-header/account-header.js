function rowMap(block) {
  const rows = {};
  [...block.children].forEach((row) => {
    const [keyCell, valueCell] = row.children;
    const key = keyCell?.textContent.trim().toLowerCase();
    if (key && valueCell) rows[key] = valueCell;
  });
  return rows;
}

function linkList(cell, className, label) {
  const nav = document.createElement('nav');
  nav.className = className;
  if (label) nav.setAttribute('aria-label', label);
  const ul = document.createElement('ul');
  cell.querySelectorAll('a').forEach((a) => {
    const li = document.createElement('li');
    a.removeAttribute('class');
    if (a.closest('strong')) {
      a.setAttribute('aria-current', 'true');
      li.classList.add('active');
    }
    li.append(a);
    ul.append(li);
  });
  nav.append(ul);
  return nav;
}

function buildToggle(block, menu) {
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'account-header-toggle';
  toggle.setAttribute('aria-controls', menu.id);
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');
  toggle.append(document.createElement('span'));
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    block.classList.toggle('menu-open', open);
  });
  return toggle;
}

export default function decorate(block) {
  const rows = rowMap(block);
  block.replaceChildren();

  if (rows.utility || rows.languages) {
    const bar = document.createElement('div');
    bar.className = 'account-header-utility';
    const inner = document.createElement('div');
    inner.className = 'account-header-inner';
    if (rows.utility) inner.append(linkList(rows.utility, 'account-header-links', 'Utility'));
    if (rows.languages) inner.append(linkList(rows.languages, 'account-header-languages', 'Language'));
    bar.append(inner);
    block.append(bar);
  }

  const main = document.createElement('div');
  main.className = 'account-header-main';
  const inner = document.createElement('div');
  inner.className = 'account-header-inner';

  if (rows.logo) {
    const logo = document.createElement('div');
    logo.className = 'account-header-logo';
    const link = rows.logo.querySelector('a');
    const pic = rows.logo.querySelector('picture') || rows.logo.querySelector('img');
    if (link && pic && !link.contains(pic)) link.replaceChildren(pic);
    logo.append(link || pic);
    logo.querySelector('a')?.setAttribute('aria-label', 'AstraZeneca home');
    logo.querySelector('img')?.setAttribute('alt', 'AstraZeneca');
    inner.append(logo);
  }

  let menu;
  if (rows.nav) {
    menu = linkList(rows.nav, 'account-header-nav', 'Main');
    menu.id = 'account-header-menu';
    inner.append(menu);
  }

  if (rows.actions) {
    const actions = document.createElement('div');
    actions.className = 'account-header-actions';
    rows.actions.querySelectorAll('a').forEach((a) => {
      if (a.querySelector('.icon')) {
        a.className = 'account-header-icon';
        a.setAttribute('aria-label', a.title || 'Search');
      } else {
        a.className = 'account-header-button';
      }
      actions.append(a);
    });
    if (menu) actions.append(buildToggle(block, menu));
    inner.append(actions);
  }

  main.append(inner);
  block.append(main);
}
