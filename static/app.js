const TIP_LABELE = { dorucak: "Doručak", rucak: "Ručak", vecera: "Večera" };
const TIP_KLASA = { dorucak: "tip-dorucak", rucak: "tip-rucak", vecera: "tip-vecera" };

// gotova jela po tipu (kcal/100g + uobicajena porcija u gramima)
const JELA = {
    dorucak: [
        { n: "Zobena kaša s bananom", k: 110, g: 300 },
        { n: "Omlet sa sirom", k: 165, g: 200 },
        { n: "Jaja i tost", k: 200, g: 200 },
        { n: "Jogurt s granolom", k: 150, g: 250 }
    ],
    rucak: [
        { n: "Pileća prsa s rižom", k: 150, g: 350 },
        { n: "Špageti bolognese", k: 160, g: 350 },
        { n: "Grah s kobasicom", k: 140, g: 350 },
        { n: "Cezar salata s piletinom", k: 170, g: 300 }
    ],
    vecera: [
        { n: "Losos s povrćem", k: 160, g: 300 },
        { n: "Pizza Margherita", k: 266, g: 300 },
        { n: "Cheeseburger", k: 250, g: 250 },
        { n: "Tuna salata", k: 120, g: 300 }
    ]
};

// namirnice (kcal/100g) - puni se iz baze preko /api/namirnice
let NAMIRNICE = {};

let graf = null;

const forma = document.getElementById("obrok-forma");
const tablica = document.getElementById("tablica-obroka");
const praznoBlok = document.getElementById("prazno-blok");
const tablicaWrap = document.getElementById("tablica-wrap");
const formaNaslov = document.getElementById("forma-naslov");
const odustaniBtn = document.getElementById("odustani-btn");


// === prebacivanje modova ===
const panelGotovo = document.getElementById("panel-gotovo");
const segGotovo = document.getElementById("seg-gotovo");
const segRucno = document.getElementById("seg-rucno");

segGotovo.addEventListener("click", () => prebaciMod("gotovo"));
segRucno.addEventListener("click", () => prebaciMod("rucno"));

function prebaciMod(mod) {
    const gotovo = mod === "gotovo";
    segGotovo.className = "btn seg-btn " + (gotovo ? "btn-success" : "btn-outline-success");
    segRucno.className = "btn seg-btn " + (gotovo ? "btn-outline-success" : "btn-success");
    panelGotovo.classList.toggle("d-none", !gotovo);
    forma.classList.toggle("d-none", gotovo);
}


// === gotova jela: tabovi i kartice ===
let aktivniTip = "dorucak";
let odabranoJelo = null;

const jelaGrid = document.getElementById("jela-grid");
const odabir = document.getElementById("odabir");
const gGrami = document.getElementById("g-grami");

document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        aktivniTip = tab.dataset.tip;
        odabranoJelo = null;
        odabir.classList.add("d-none");
        prikaziJela();
    });
});

function prikaziJela() {
    jelaGrid.innerHTML = "";
    JELA[aktivniTip].forEach((jelo, i) => {
        const kcalPorcija = Math.round(jelo.k * jelo.g / 100);
        const kartica = document.createElement("button");
        kartica.type = "button";
        kartica.className = "jelo-kartica";
        kartica.innerHTML = `<span class="jelo-naziv">${jelo.n}</span>
            <span class="jelo-kcal">${kcalPorcija} kcal · ${jelo.g}g</span>`;
        kartica.addEventListener("click", () => odaberiJelo(i, kartica));
        jelaGrid.appendChild(kartica);
    });
}

function odaberiJelo(i, kartica) {
    document.querySelectorAll(".jelo-kartica").forEach(k => k.classList.remove("odabrana"));
    kartica.classList.add("odabrana");
    odabranoJelo = JELA[aktivniTip][i];
    document.getElementById("odabir-naziv").textContent = odabranoJelo.n;
    gGrami.value = odabranoJelo.g;
    osvjeziGKcal();
    odabir.classList.remove("d-none");
}

function osvjeziGKcal() {
    const grami = parseFloat(gGrami.value) || 0;
    document.getElementById("g-kcal").textContent = Math.round(odabranoJelo.k * grami / 100);
}
gGrami.addEventListener("input", () => { if (odabranoJelo) osvjeziGKcal(); });

// spremanje gotovog jela
document.getElementById("g-dodaj-obrok").addEventListener("click", async () => {
    if (!odabranoJelo) { alert("Odaberi jelo."); return; }
    const grami = parseFloat(gGrami.value);
    if (!grami || grami <= 0) { alert("Upiši količinu u gramima."); return; }

    let datum = document.getElementById("g-datum").value;
    if (!datum) {
        datum = new Date().toISOString().slice(0, 10);
        document.getElementById("g-datum").value = datum;
    }

    const podaci = {
        datum: datum,
        tip: aktivniTip,
        naziv_jela: `${odabranoJelo.n} ${grami}g`,
        kalorije: Math.round(odabranoJelo.k * grami / 100)
    };
    const r = await fetch("/api/obroci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(podaci)
    });
    if (!r.ok) { alert("Obrok nije spremljen, provjeri unos."); return; }

    odabranoJelo = null;
    odabir.classList.add("d-none");
    document.querySelectorAll(".jelo-kartica").forEach(k => k.classList.remove("odabrana"));
    osvjezi();
});


// === tablica obroka ===
async function ucitajObroke(datum = null) {
    let url = "/api/obroci";
    if (datum) url += "?datum=" + datum;

    const r = await fetch(url);
    const obroci = await r.json();

    tablica.innerHTML = "";
    const prazno = obroci.length === 0;
    praznoBlok.classList.toggle("d-none", !prazno);
    tablicaWrap.classList.toggle("d-none", prazno);

    for (const o of obroci) {
        const red = document.createElement("tr");
        red.innerHTML = `
            <td>${formatDatum(o.datum)}</td>
            <td><span class="tip-badge ${TIP_KLASA[o.tip] || ""}">${TIP_LABELE[o.tip] || o.tip}</span></td>
            <td class="fw-500">${o.naziv_jela}</td>
            <td><span class="kcal-cell">${o.kalorije} kcal</span></td>
            <td class="text-end akcije">
                <button class="btn-ikona" title="Uredi" onclick='pocniUredivanje(${JSON.stringify(o)})'>✎</button>
                <button class="btn-ikona obrisi" title="Obriši" onclick="obrisiObrok(${o.id})">🗑</button>
            </td>`;
        tablica.appendChild(red);
    }
}

// statistika za danas ili za filtrirani dan
async function ucitajStatistiku(datum = null) {
    const dan = datum || new Date().toISOString().slice(0, 10);
    const r = await fetch("/api/obroci?datum=" + dan);
    const obroci = await r.json();

    const ukupno = obroci.reduce((z, o) => z + o.kalorije, 0);
    const broj = obroci.length;
    document.getElementById("stat-ukupno").textContent = ukupno;
    document.getElementById("stat-broj").textContent = broj;
    document.getElementById("stat-prosjek").textContent = broj ? Math.round(ukupno / broj) : 0;

    const oznaka = datum ? formatDatum(datum) : "danas";
    document.getElementById("lbl-ukupno").textContent = oznaka;
    document.getElementById("lbl-broj").textContent = oznaka;
}

// graf kalorija po danu i tipu
const BOJE_TIP = { dorucak: "#f0ad4e", rucak: "#198754", vecera: "#6f42c1" };

async function ucitajGraf() {
    const r = await fetch("/api/kalorije-po-danu");
    const podaci = await r.json();

    // jedinstveni datumi i jedan dataset po tipu obroka
    const datumi = [...new Set(podaci.map(p => p.datum))].sort();
    const tipovi = ["dorucak", "rucak", "vecera"];
    const datasets = tipovi.map(t => ({
        label: TIP_LABELE[t],
        backgroundColor: BOJE_TIP[t],
        data: datumi.map(d => {
            const nadjen = podaci.find(p => p.datum === d && p.tip === t);
            return nadjen ? nadjen.ukupno : 0;
        })
    }));

    if (graf) graf.destroy();
    const ctx = document.getElementById("graf-kalorija").getContext("2d");
    graf = new Chart(ctx, {
        type: "bar",
        data: { labels: datumi.map(formatDatum), datasets: datasets },
        options: {
            plugins: { legend: { display: true } },
            scales: {
                x: { stacked: true, grid: { display: false } },
                y: {
                    stacked: true, beginAtZero: true, max: 3500,
                    afterBuildTicks: os => { os.ticks = [0, 400, 600, 1000, 1500, 2000, 2500, 3000, 3500].map(v => ({ value: v })); },
                    grid: { color: "rgba(0,0,0,0.05)" }
                }
            }
        }
    });
}

function osvjezi() {
    ucitajObroke();
    ucitajStatistiku();
    ucitajGraf();
}


// === rucni unos (forma) ===
forma.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("obrok-id").value;
    const podaci = {
        datum: document.getElementById("datum").value,
        tip: document.getElementById("tip").value,
        naziv_jela: document.getElementById("naziv_jela").value,
        kalorije: document.getElementById("kalorije").value
    };

    let r;
    if (id) {
        r = await fetch("/api/obroci/" + id, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(podaci) });
    } else {
        r = await fetch("/api/obroci", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(podaci) });
    }
    if (!r.ok) { alert("Obrok nije spremljen, provjeri unos."); return; }

    resetForme();
    osvjezi();
});

function pocniUredivanje(o) {
    prebaciMod("rucno");
    document.getElementById("obrok-id").value = o.id;
    document.getElementById("datum").value = o.datum;
    document.getElementById("tip").value = o.tip;
    document.getElementById("naziv_jela").value = o.naziv_jela;
    document.getElementById("kalorije").value = o.kalorije;
    formaNaslov.textContent = "Uredi obrok";
    document.getElementById("spremi-btn").textContent = "Spremi izmjene";
    odustaniBtn.classList.remove("d-none");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForme() {
    forma.reset();
    document.getElementById("obrok-id").value = "";
    document.getElementById("datum").valueAsDate = new Date();
    formaNaslov.textContent = "Dodaj obrok";
    document.getElementById("spremi-btn").textContent = "Dodaj obrok";
    odustaniBtn.classList.add("d-none");
    sastojci = [];
    osvjeziSastojke();
}

odustaniBtn.addEventListener("click", resetForme);

async function obrisiObrok(id) {
    if (!confirm("Obrisati ovaj obrok?")) return;
    await fetch("/api/obroci/" + id, { method: "DELETE" });
    osvjezi();
}


// === filter ===
document.getElementById("filter-btn").addEventListener("click", () => {
    const datum = document.getElementById("filter-datum").value;
    if (datum) { ucitajObroke(datum); ucitajStatistiku(datum); }
});
document.getElementById("filter-reset").addEventListener("click", () => {
    document.getElementById("filter-datum").value = "";
    ucitajObroke();
    ucitajStatistiku();
});

function formatDatum(iso) {
    const [g, m, d] = iso.split("-");
    return `${d}.${m}.`;
}


// === sastavljac od namirnica (rucni mod) ===
const lista = document.getElementById("namirnice-lista");

// dohvacanje namirnica i punjenje liste
async function ucitajNamirnice() {
    const r = await fetch("/api/namirnice");
    const arr = await r.json();
    NAMIRNICE = {};
    lista.innerHTML = "";
    arr.forEach(n => {
        NAMIRNICE[n.naziv] = n.kcal100;
        const opt = document.createElement("option");
        opt.value = n.naziv;
        lista.appendChild(opt);
    });
}

let sastojci = [];
const bNamirnica = document.getElementById("b-namirnica");
const bGrami = document.getElementById("b-grami");
const bKcal = document.getElementById("b-kcal");

function predloziKcal() {
    const na100 = NAMIRNICE[bNamirnica.value.trim()];
    const grami = parseFloat(bGrami.value);
    if (na100 && grami > 0) bKcal.value = Math.round(na100 * grami / 100);
}
bNamirnica.addEventListener("input", predloziKcal);
bGrami.addEventListener("input", predloziKcal);

document.getElementById("b-dodaj").addEventListener("click", () => {
    const naziv = bNamirnica.value.trim();
    const grami = parseFloat(bGrami.value);
    const kcal = parseInt(bKcal.value);
    if (!naziv || !grami || !kcal) { alert("Upiši namirnicu, grame i kalorije."); return; }
    // per100 nam treba da kasnije mozemo mijenjati gramazu i preracunati
    const per100 = NAMIRNICE[naziv] != null ? NAMIRNICE[naziv] : Math.round(kcal / grami * 100);
    sastojci.push({ naziv, grami, per100 });
    bNamirnica.value = ""; bGrami.value = ""; bKcal.value = "";
    bNamirnica.focus();
    osvjeziSastojke();
});

function kcalSastojka(s) {
    return Math.round(s.per100 * s.grami / 100);
}

function osvjeziSastojke() {
    const ul = document.getElementById("sastojci-lista");
    ul.innerHTML = "";
    sastojci.forEach((s, i) => {
        const li = document.createElement("li");
        li.innerHTML = `<span class="s-naziv">${s.naziv}</span>
            <span class="s-desno">
                <input type="number" class="s-grami" min="0" value="${s.grami}" data-i="${i}"> g
                <b class="s-kcal" data-i="${i}">${kcalSastojka(s)}</b> kcal
                <button type="button" class="b-makni" onclick="makniSastojak(${i})">×</button>
            </span>`;
        ul.appendChild(li);
    });
    // promjena gramaze nekog sastojka preracunava njegove kcal i ukupno
    ul.querySelectorAll(".s-grami").forEach(inp => {
        inp.addEventListener("input", () => {
            const i = +inp.dataset.i;
            sastojci[i].grami = parseFloat(inp.value) || 0;
            ul.querySelector('.s-kcal[data-i="' + i + '"]').textContent = kcalSastojka(sastojci[i]);
            azurirajZbroj();
        });
    });
    azurirajZbroj();
}

function azurirajZbroj() {
    let ukupno = 0;
    sastojci.forEach(s => ukupno += kcalSastojka(s));
    document.getElementById("builder-ukupno").textContent = ukupno;
    if (sastojci.length) {
        document.getElementById("naziv_jela").value = sastojci.map(s => `${s.naziv} ${s.grami}g`).join(", ");
        document.getElementById("kalorije").value = ukupno;
    }
}

function makniSastojak(i) {
    sastojci.splice(i, 1);
    osvjeziSastojke();
}


// start
document.getElementById("datum").valueAsDate = new Date();
document.getElementById("g-datum").valueAsDate = new Date();
ucitajNamirnice();
prikaziJela();
osvjezi();
