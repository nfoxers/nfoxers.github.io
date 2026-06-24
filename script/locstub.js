export async function llang(code, sect) {
  try {
    const res = await fetch(`/locale/${code}.json`);
    const trans = await res.json();

    document.querySelectorAll('[data-i18n]').forEach(e => {
      const key = e.getAttribute('data-i18n');
      if(trans[sect][key]) {
        e.textContent = trans[sect][key];
      }
    });

    document.documentElement.lang = code;
    localStorage.setItem('preferredlang', code);

    const cl = document.getElementById('cl');
    if(cl) {
      cl.value = code;
    }

  } catch(e) {
    console.error("load lang error: ", e);
  }
}

export function chtheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  const ct = document.getElementById('ct');
  if(ct) {
    ct.value = theme;
  }
}

export async function deflang(sect) {
  const lang = localStorage.getItem('preferredlang');

  if(lang) {
    await llang(lang, sect);
  } else {
    await llang("en-US", sect);
  }
}

export function deftheme() {
  const theme = localStorage.getItem("theme");

  if(theme) {
    chtheme(theme);
  } else {
    chtheme("light");
  }
}