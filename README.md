# KaloMjer - aplikacija za praćenje kalorija

Projekt iz kolegija Informacijski sustavi. Aplikacija služi za praćenje dnevnog unosa
kalorija - korisnik unosi obroke koje pojede kroz dan i vidi koliko je kalorija unio.
Ima CRUD operacije nad obrocima, podatke sprema u SQLite bazu, a kalorije prikazuje na grafu.

## Ideja
Kao profesionalni sportaš i Hrvatski reprezentativac cilj mi je bio napraviti jednostavnu aplikaciju gdje brzo zapišeš što si pojeo i odmah vidiš koliko si
kcal unio, bez kompliciranja. Na početku sam imao dvije klase (Obrok i DnevniCilj) ali
su bile nepovezane pa sam to pojednostavio. Kasnije sam namirnice izdvojio u svoju tablicu.

Gdje bi se ovo koristilo: npr. u teretani, kod nutricionista ili za osobno praćenje prehrane.

## Use case

Korisnik može:
- dodati obrok (datum, tip - doručak/ručak/večera, naziv jela, kalorije)
- pregledati sve obroke
- urediti obrok
- obrisati obrok
- filtrirati obroke po datumu
- vidjeti graf kalorija po danima

## Tehnologije koje sam koristio: 

- Python + Bottle - web servis
- PonyORM + SQLite - baza podataka
- HTML, CSS, Bootstrap - frontend
- Chart.js - graf
- Docker - pokretanje

Nije korišten nijedan vanjski web servis, sve je u sklopu aplikacije.

## Funkcionalnosti

- CRUD nad obrocima (dodaj, pregledaj, uredi, obriši)
- filtriranje obroka po datumu
- gotova jela - 12 jela (4 doručak, 4 ručak, 4 večera), odabereš jelo i skaliraš gramažu
- sastavljanje jela od više namirnica - svakoj namirnici mijenjaš grame, kalorije se zbrajaju
- baza namirnica - namirnice s kcal/100g spremljene su u zasebnoj tablici
- dnevna statistika - ukupno kcal, broj obroka i prosjek za danas
- graf kalorija po danu, obojan po tipu obroka (doručak/ručak/večera)

## Baza podataka

Dvije tablice:

**Obrok**: id, datum, tip, naziv_jela, kalorije

**Namirnica**: id, naziv, kcal100 (kalorije na 100g)


## Kako pokrenuti ovu aplikaciju? 



Putem terminala
```
docker build -t kcal-app .
docker run -p 8080:8080 kcal-app
```
Pa otvoriti link na pregledniku ( google ili safari ): http://localhost:8080
Baza se sama napravi pri prvom pokretanju i napuni početnim namirnicama.

## Pokretanje lokalno
```
pip install -r requirements.txt
python aplikacija.py
```
Isto je dostupno na http://localhost:8080

## Pokretanje kroz docker


## Datoteke koristene u ovom projektu 

- `aplikacija.py` - web servis (Bottle rute + CRUD logika)
- `modeli.py` - PonyORM tablice (Obrok i Namirnica) + spajanje na bazu
- `requirements.txt` - biblioteke (bottle, pony)
- `Dockerfile` - za pokretanje u Dockeru
- `static/` - frontend
  - `index.html` - sučelje
  - `app.js` - logika (fetch pozivi, sastavljač jela, graf)
  - `style.css` - stilovi
  - `img/` - slike
