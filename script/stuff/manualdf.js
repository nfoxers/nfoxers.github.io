import { deflang, deftheme, g_trans } from "/script/locstub.js";

await deflang("stuff");
deftheme();

if(!window.isSecureContext) {
  document.getElementById('err').style = "display: block;";
}

function b64(s) {
  return btoa(String.fromCharCode(...new Uint8Array(s)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function btok(b) {
  let base = b
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const pad = base.length % 4;
  if(pad) {
    base += '='.repeat(4 - pad);
  }

  const bin = atob(base);
  const bytes = new Uint8Array(bin.length);
  for(let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }

  return bytes
}

async function aes_enc(key, m) {
  const e = new TextEncoder();
  const data = e.encode(m);

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const cp = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    data
  );

  return {
    c: new Uint8Array(cp),
    i: iv
  };
}

async function aes_dec(key, c, iv) {
  const dec = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    c
  );

  const d = new TextDecoder();
  return d.decode(dec);
}

let key = await window.crypto.subtle.generateKey(
  {
    name: "ECDH",
    namedCurve: "P-256"
  },
  true,
  ["deriveKey", "deriveBits"]
);

let shared;

let pk = b64(await window.crypto.subtle.exportKey("raw", key.publicKey));

const ck = document.getElementById('clk');
const yk = document.getElementById('yk');
const tk = document.getElementById('tk');
const cf = document.getElementById('cf');
const reg = document.getElementById('reg');
const tm = document.getElementById('tm');
const ym = document.getElementById('ym');
const out = document.getElementById('out');

const send = document.getElementById('send');
const recv = document.getElementById('recv');
const log = document.getElementById('log');

yk.value = pk;

yk.addEventListener('click', async () => {
  await navigator.clipboard.writeText(pk);
  ck.textContent = g_trans.stuff.cpy;
  setTimeout(() => ck.textContent = g_trans.stuff.clk, 1000);
})

reg.addEventListener('click', async () => {
  key = await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256"
    },
    true,
    ["deriveKey", "deriveBits"]
  );
  
  pk = b64(await window.crypto.subtle.exportKey("raw", key.publicKey))
  yk.value = pk;

  document.getElementById('warn').style = "";
})

cf.addEventListener('click', async () => {
  const de = btok(tk.value.trim());
  let o = await window.crypto.subtle.importKey(
    "raw",
    de.buffer,
    {
      name: "ECDH",
      namedCurve: "P-256"
    },
    true,
    []
  );
  
  shared = await window.crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: o
    },
    key.privateKey,
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );

  document.getElementById('warn').style = "display: none;";
  // console.log(b64(await window.crypto.subtle.exportKey("raw", shared)));
})

/*
cf2.addEventListener('click', async () => {
  const chp = await aes_enc(shared, ym.value);
  
  const buf = new Uint8Array(chp.c.length + chp.i.length);
  buf.set(chp.i, 0);
  buf.set(chp.c, chp.i.length);

  out.textContent = `copy this: ${b64(buf)}`

  if(tm.value) {
    const d = btok(tm.value.trim());
    const iv = d.slice(0, 12);
    const ch = d.slice(12);

    const s = await aes_dec(shared, ch.buffer, iv);

    out.textContent += `\n msg: ${s}`;  
  }
});

*/

let suc = 0;

ym.addEventListener('input', async () => {
  suc = 0;
  const chp = await aes_enc(shared, ym.value);
  suc = 1;

  const buf = new Uint8Array(chp.c.length + chp.i.length);
  buf.set(chp.i, 0);
  buf.set(chp.c, chp.i.length);

  let k = b64(buf);

  tm.readOnly = true;
  recv.disabled = true;
  tm.value = k + `\n\n(${g_trans.stuff.clk})`;
  tm.style = "cursor: pointer;";

  tm.addEventListener('click', async () => {
    
    tm.value = '';
    tm.style = '';
    tm.readOnly = false;
    recv.disabled = false;

    await navigator.clipboard.writeText(k);
    if(ym.value) {
      log.innerHTML += `<p class="pre pre2">${g_trans.stuff.you}: ${ym.value}</p>`;
      ym.value = '';
    }

    suc = 0;

  }, { once: true });
  
});

send.addEventListener('click', () => {
  if(suc) {
    log.innerHTML += `<p class="pre pre2">${g_trans.stuff.you}: ${ym.value}</p>`;
    ym.value = '';
  }
})

recv.addEventListener('click', async () => {
  if(tm.value) {
    const d = btok(tm.value.trim());
    const iv = d.slice(0, 12);
    const ch = d.slice(12);

    const s = await aes_dec(shared, ch.buffer, iv);

    log.innerHTML += `<p class="pre pre2">${g_trans.stuff.they}: ${s}</p>`;
    tm.value = '';
  }
})