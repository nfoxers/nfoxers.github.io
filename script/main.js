async function llang(code) {
  try {
    const res = await fetch(`./locale/${code}.json`);
    const trans = await res.json();

    document.querySelectorAll('[data-i18n]').forEach(e => {
      const key = e.getAttribute('data-i18n');
      if(trans[key]) {
        e.textContent = trans[key];
      }
    });

    document.documentElement.lang = code;
    localStorage.setItem('preferredlang', code);

    document.getElementById('cl').selectedIndex = trans['idx'];

  } catch(e) {
    console.error("load lang error: ", e);
  }
}

async function getcommit() {
  try {
    const res = await fetch("https://api.github.com/repos/nfoxers/nfoxers.github.io/branches/master");
    const js = await res.json();

    console.log(js.commit);

    const lu = document.getElementById('lu');
    const ch = document.getElementById('ch');
    const cm = document.getElementById('cm');
    lu.textContent = js.commit.commit.committer.date;
    ch.textContent = js.commit.sha;
    cm.textContent = js.commit.commit.message;

  } catch(e) {
    console.error("cant update stats: ", e);
  }
}

const cl = document.getElementById('cl');
cl.addEventListener('change', () => {
  const idx = cl.selectedIndex;
  const val = cl.options[idx].value;
  llang(val);
})

const lang = localStorage.getItem('preferredlang');

if(lang) {
  llang(lang);
} else {
  llang("en-US");
}

getcommit();