import { deflang, deftheme } from "/script/locstub.js"

await deflang("stuff");
deftheme();

const step = document.getElementById('step');
const reset = document.getElementById('reset');

const cpop = document.getElementById('cpop');
const cpro = document.getElementById('cpro');
const sfund = document.getElementById('sfund');
const sinc = document.getElementById('sinc');
const stax = document.getElementById('stax');

const taxs = document.getElementById('taxs');
const incs = document.getElementById('incs');

const taxr = document.getElementById('taxr');
const incm = document.getElementById('incm');

let pop = 1;
let pro = 2500;
let surp = 0;
let state = 0;

let initpro = 2500;
let promult = 10;

let incmult = 0.2;
let taxrate = 0.2;

taxs.value = taxrate;
incs.value = incmult;
taxr.textContent = taxrate.toFixed(2);
incm.textContent = incmult.toFixed(2);

function display() {
  cpop.textContent = pop;
  sfund.textContent = state;
  sinc.textContent = surp * incmult | 0;
  stax.textContent = pop * taxrate | 0;
  cpro.textContent = initpro + state * incmult | 0;
}

step.addEventListener('click', () => {
  pro = initpro + state * promult;
  
  if(pop * 5 > pro) {
    surp = pro;
  } else {
    surp = pop * 5;
  }
  
  pro -= surp;
  if(surp - pop < 0) {
    pop = surp;
    surp = 0;
    console.log("crash");
  } else {
    surp -= pop;
  }

  state = surp * incmult | 0;
  state -= pop * taxrate | 0;
  surp -= surp * incmult | 0;

  if(state < 0) state = 0;

  pop += surp / 4 | 0;

  display();
})

reset.addEventListener('click', () => {
  pop = 1;
  pro = initpro;
  surp = 0;
  state = 0;

  display();
})

taxs.addEventListener('input', () => {
  taxrate = parseFloat(taxs.value)
  taxr.textContent = taxrate.toFixed(2);
  display();
})

incs.addEventListener('input', () => {
  incmult = parseFloat(incs.value)
  incm.textContent = incmult.toFixed(2);
  display();
})