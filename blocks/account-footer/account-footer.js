function rowMap(block) {
  const rows = {};
  [...block.children].forEach((row) => {
    const [keyCell, ...cells] = row.children;
    const key = keyCell?.textContent.trim().toLowerCase();
    if (key && cells.length) rows[key] = cells;
  });
  return rows;
}

function linkColumn(cell) {
  const ul = document.createElement('ul');
  cell.querySelectorAll('a').forEach((a) => {
    a.removeAttribute('class');
    const li = document.createElement('li');
    li.append(a);
    ul.append(li);
  });
  return ul;
}

export default function decorate(block) {
  const rows = rowMap(block);
  block.replaceChildren();

  const inner = document.createElement('div');
  inner.className = 'account-footer-inner';

  const top = document.createElement('div');
  top.className = 'account-footer-main';

  if (rows.brand) {
    const brand = document.createElement('div');
    brand.className = 'account-footer-brand';
    rows.brand.forEach((cell) => brand.append(...cell.childNodes));
    brand.querySelector('img')?.setAttribute('alt', 'AstraZeneca');
    top.append(brand);
  }

  if (rows.links) {
    const nav = document.createElement('nav');
    nav.className = 'account-footer-links';
    nav.setAttribute('aria-label', 'Footer');
    rows.links.forEach((cell) => nav.append(linkColumn(cell)));
    top.append(nav);
  }
  inner.append(top);

  const bottom = document.createElement('div');
  bottom.className = 'account-footer-bottom';
  if (rows.social) {
    const social = document.createElement('ul');
    social.className = 'account-footer-social';
    rows.social[0].querySelectorAll('a').forEach((a) => {
      const icon = a.querySelector('.icon');
      const name = icon ? [...icon.classList].find((c) => c.startsWith('icon-social-')) : null;
      if (name && !a.getAttribute('aria-label')) {
        const label = name.replace('icon-social-', '');
        a.setAttribute('aria-label', label === 'x' ? 'X' : label.charAt(0).toUpperCase() + label.slice(1));
      }
      a.removeAttribute('class');
      const li = document.createElement('li');
      li.append(a);
      social.append(li);
    });
    bottom.append(social);
  }
  if (rows.code) {
    const code = document.createElement('p');
    code.className = 'account-footer-code';
    code.textContent = rows.code[0].textContent.trim();
    bottom.append(code);
  }
  inner.append(bottom);
  block.append(inner);
}
