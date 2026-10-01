/* Fonctions communes à toutes les pages */
const PAGES = [
  ['index.html', 'Accueil'],
  ['concurrents.html', 'Concurrents'],
  ['carte.html', 'Carte des prix'],
  ['enseignes.html', 'Enseignes'],
  ['format-familial.html', 'Format familial'],
  ['rentabilite.html', 'Rentabilité'],
  ['methodologie.html', 'Méthodologie']
];
const ENSEIGNES = ['Carrefour', 'Auchan', 'Leclerc', 'Intermarché'];
const COUL_ENS = { Carrefour: '#1565c0', Auchan: '#c62828', Leclerc: '#ef6c00', 'Intermarché': '#6a1b9a' };
const COUL_CAT = { 'Référence': '#c62828', 'Concurrent direct': '#2e7d32', 'Concurrent indirect': '#1565c0', 'Substitut': '#ef6c00' };
const CAT_CLASS = { 'Référence': 't-ref', 'Concurrent direct': 't-direct', 'Concurrent indirect': 't-indirect', 'Substitut': 't-substitut' };
const VICO = 0;

function nav() {
  const here = location.pathname.split('/').pop() || 'index.html';
  const n = document.createElement('nav');
  n.className = 'top';
  n.innerHTML = PAGES.map(([h, t]) => `<a href="${h}"${h === here ? ' class="on"' : ''}>${t}</a>`).join('');
  document.querySelector('.wrap').prepend(n);
  const f = document.createElement('footer');
  f.innerHTML = `Projet étudiant · Prix relevés le ${DATA.date} sur les sites drive de Carrefour, Auchan, E.Leclerc et Intermarché · <span id="credits">Équipe et cours : à compléter</span>`;
  document.querySelector('.wrap').append(f);
}
document.addEventListener('DOMContentLoaded', nav);

/* Formatage */
const fmt = (x, d = 2) => x == null || isNaN(x) ? '–' : x.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const eur = (x, d = 2) => x == null || isNaN(x) ? '–' : fmt(x, d) + ' €';
const pct = (x, d = 0) => x == null || isNaN(x) ? '–' : (x > 0 ? '+' : '') + fmt(x * 100, d) + ' %';

/* Accès aux données */
const prod = id => DATA.produits.find(p => p.id === id);
const mag = id => DATA.magasins[id];
const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;

/* Lignes de prix enrichies : {p, m, prix, kg, enseigne, ville} */
const LIGNES = DATA.prix.map(([p, m, prix, kg]) => ({ p, m, prix, kg, enseigne: mag(m).enseigne, ville: mag(m).ville }));

function lignes(f = {}) {
  return LIGNES.filter(l => (f.p == null || l.p === f.p) && (!f.enseigne || l.enseigne === f.enseigne) && (!f.ville || l.ville === f.ville));
}
function moyKg(f) { return mean(lignes(f).map(l => l.kg)); }

/* Moyenne nationale €/kg de chaque produit (toutes enseignes, toutes villes) */
const MOY_NAT = {};
DATA.produits.forEach(p => MOY_NAT[p.id] = moyKg({ p: p.id }));

/* Indice de prix (100 = moyenne nationale) d'un ensemble de lignes */
function indice(ls) {
  const r = ls.map(l => l.kg / MOY_NAT[l.p]);
  return r.length ? 100 * mean(r) : null;
}

/* Couleur d'un indice : vert (moins cher) -> rouge (plus cher) */
function couleurIndice(v, min = 92, max = 112) {
  if (v == null) return '#eee';
  const t = Math.max(0, Math.min(1, (v - min) / (max - min)));
  const a = [46, 125, 50], b = [250, 250, 250], c = [198, 40, 40];
  const mix = (x, y, k) => x.map((v, i) => Math.round(v + (y[i] - v) * k));
  const rgb = t < .5 ? mix(a, b, t * 2) : mix(b, c, (t - .5) * 2);
  return `rgb(${rgb.join(',')})`;
}

/* Paires petit format / grand format relevées dans le même magasin */
function pairesFormats() {
  const out = [];
  DATA.prixGF.forEach(([gf, m, prix, g]) => {
    const G = DATA.grandsFormats.find(x => x.id === gf);
    const petit = LIGNES.find(l => l.p === G.petit && l.m === m);
    if (!petit) return;
    const P = prod(G.petit);
    const gPetit = (mag(m).enseigne === 'Intermarché' && P.id === 12) ? 270 : P.g;
    const kgG = prix / g * 1000;
    out.push({ gf: G, petit: P, m, enseigne: mag(m).enseigne, ville: mag(m).ville,
      kgPetit: petit.kg, kgGrand: kgG, prixPetit: petit.prix, prixGrand: prix, gPetit, gGrand: g,
      ratioTaille: g / gPetit, baisse: kgG / petit.kg - 1 });
  });
  return out;
}

function option(sel, values, labelFn = v => v, all) {
  sel.innerHTML = (all ? `<option value="">${all}</option>` : '') + values.map(v => `<option value="${v}">${labelFn(v)}</option>`).join('');
}
