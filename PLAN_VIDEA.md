# Plan video prezentacije — KaloMjer (5–7 min)

> Snimka mora biti oštra (ne mutna). Snimaj cijeli ekran + mikrofon (npr. QuickTime ili OBS).

---

## 0:00–0:30 — Uvod (kamera uključena)
- Upali kameru, pokaži **lice i iksicu (student karticu)**.
- Izgovori: *"Ime i prezime, ime i prezime, projekt iz Informacijskih sustava — KaloMjer."*
- Nakon toga možeš ugasiti kameru.

## 0:30–1:30 — Opis projekta i poslovna primjena
Reci ukratko (svojim riječima):
- KaloMjer je web aplikacija za **praćenje dnevnog unosa kalorija** — uneseš obroke i odmah vidiš koliko si kcal pojeo.
- **Zašto bi je klijent koristio / poslovna primjena:**
  - **Teretane i fitness centri** — članovima nude alat za praćenje prehrane uz trening.
  - **Nutricionisti** — brzo unose i prate obroke klijenata, vide grafove po danima.
  - **Osobno praćenje** — jednostavno, bez kompliciranja, sve na jednom mjestu.
- Naglasi: sve radi lokalno, **bez vanjskih servisa**, podaci u vlastitoj bazi.

## 1:30–2:30 — Pokretanje kroz Docker (OBAVEZNO)
Pokaži u terminalu (Docker Desktop mora biti upaljen):
```
docker build -t kcal-app .
docker run -p 8080:8080 kcal-app
```
- Reci: *"Aplikaciju pokrećem kroz Docker, image se bualda iz Dockerfile-a, sluša na portu 8080."*
- Otvori browser na `http://localhost:8080`.

## 2:30–6:00 — Prolazak kroz funkcionalnosti
Pokaži redom (klikaj polako, objasni svaki korak):

1. **Dodavanje obroka — gotovo jelo**
   - Odaberi tip (Doručak/Ručak/Večera) → klikni jelo → promijeni gramažu → kcal se sami preračunaju → "Dodaj obrok".
   - Pokaži da se odmah pojavi u tablici i na grafu.

2. **Ručni unos / sastavljač jela**
   - Klikni "Unesi svoje" → sastavi jelo od više namirnica (npr. piletina + riža), mijenjaj grame → kalorije se zbrajaju.

3. **Statistika (gore)**
   - Ukupno kcal danas, broj obroka, prosjek po obroku.

4. **Graf "Kalorije po danu"**
   - Stupci po danima, obojani po tipu obroka (doručak/ručak/večera).

5. **Tablica unesenih obroka — uredi i obriši (CRUD)**
   - Uredi jedan obrok (promijeni kalorije) → spremi.
   - Obriši jedan obrok.

6. **Filter po datumu**
   - Filtriraj obroke za jedan dan → pa "Sve" da vratiš.

7. **Baza podataka** (kratko spomeni)
   - Dvije tablice: Obrok i Namirnica (SQLite), baza se sama napravi pri prvom pokretanju.

## 6:00–6:45 — Zaključak
- Kratko ponovi: CRUD nad obrocima, sastavljač jela, statistika, graf, sve u Dockeru, vlastiti web servis bez vanjskih servisa.
- *"Hvala na pažnji."*

---

## Checklist prije snimanja
- [ ] Docker Desktop upaljen
- [ ] Promjene pushane na GitHub
- [ ] Browser zoom na 100%, prozor čist
- [ ] Mikrofon radi, snimka oštra
- [ ] Probni unos obrisan (čist start) — ili ostavi par obroka da graf nije prazan
