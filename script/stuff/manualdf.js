import { deflang, deftheme } from "/script/locstub.js";

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

if(!window.isSecureContext) {
  document.getElementById('err').style = "display: block;";
}

await deflang("stuff");
deftheme();

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
    c: cp,
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



const key = await window.crypto.subtle.generateKey(
  {
    name: "ECDH",
    namedCurve: "P-256"
  },
  true,
  ["deriveKey", "deriveBits"]
);



let shared; // (o)ther-key

const pk = b64(await window.crypto.subtle.exportKey("raw", key.publicKey));
document.getElementById("pk").textContent = pk;

const ik = document.getElementById('ik');
const cf = document.getElementById('cf');
const tm = document.getElementById('tm');
const ym = document.getElementById('ym');
const cf2 = document.getElementById('cf2');
const out = document.getElementById('out');
cf.addEventListener('click', async () => {
  const de = btok(ik.value.trim());
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
  console.log(b64(await window.crypto.subtle.exportKey("raw", shared)));
})

// todo: set iv to base 64

cf2.addEventListener('click', async () => {
  const chp = await aes_enc(shared, ym.value);
  
  chp.c = b64(chp.c);
  out.textContent = `copy this: ${JSON.stringify(chp)}`

  if(tm.value) {
    const d = JSON.parse(tm.value.trim());
    d.c = btok(d.c).buffer;
    d.i = new Uint8Array(Object.values(d.i));
    console.log(d);
    tm.value = "";
    const s = await aes_dec(shared, d.c, d.i);
    console.log(s);

    out.textContent += `\n msg: ${s}`;
    
  }
})