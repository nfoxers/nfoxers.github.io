import { llang, chtheme, deflang, deftheme } from "./locstub.js"

deftheme();
await deflang("main");

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
  llang(val, "main");
})

const ct = document.getElementById('ct');
ct.addEventListener('change', () => {
  const idx = ct.selectedIndex;
  const val = ct.options[idx].value;
  chtheme(val);
})


await getcommit();



