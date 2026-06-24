const th = localStorage.getItem('theme');

if(th) {
  document.documentElement.setAttribute("data-theme", th);
} else {
  localStorage.setItem('theme', 'light');
  document.documentElement.setAttribute("data-theme", 'light');
}

document.documentElement.classList.add('i18n-load');