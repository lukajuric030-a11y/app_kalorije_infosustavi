import os
import json
from datetime import datetime

from bottle import Bottle, request, response, static_file, HTTPError
from pony.orm import db_session, select

from modeli import db, Obrok, Namirnica, init_db

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
init_db(os.path.join(BASE_DIR, "obroci.db"))

app = Bottle()
STATIC = os.path.join(BASE_DIR, "static")

TIPOVI = {"dorucak", "rucak", "vecera"}


def u_dict(o):
    return {
        "id": o.id,
        "datum": o.datum.isoformat(),
        "tip": o.tip,
        "naziv_jela": o.naziv_jela,
        "kalorije": o.kalorije,
    }


def kao_json(podaci):
    response.content_type = "application/json"
    return json.dumps(podaci, ensure_ascii=False)


# pocetna stranica
@app.route("/")
def index():
    return static_file("index.html", root=STATIC)


@app.route("/static/<putanja:path>")
def static_fajlovi(putanja):
    odgovor = static_file(putanja, root=STATIC)
    odgovor.set_header("Cache-Control", "no-cache, no-store, must-revalidate")
    return odgovor


# dohvacanje obroka (po datumu)
@app.route("/api/obroci", method="GET")
@db_session
def dohvati():
    datum = request.query.get("datum")
    if datum:
        try:
            d = datetime.strptime(datum, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPError(400, "krivi datum")
        q = select(o for o in Obrok if o.datum == d)
    else:
        q = select(o for o in Obrok)

    obroci = q.order_by(lambda o: (o.datum, o.id))[:]
    return kao_json([u_dict(o) for o in obroci])


# dodavanje obroka
@app.route("/api/obroci", method="POST")
@db_session
def dodaj():
    p = request.json
    if not p:
        raise HTTPError(400, "nema podataka")

    tip = p.get("tip")
    if tip not in TIPOVI:
        raise HTTPError(400, "krivi tip obroka")

    try:
        novi = Obrok(
            datum=datetime.strptime(p["datum"], "%Y-%m-%d").date(),
            tip=tip,
            naziv_jela=p["naziv_jela"].strip(),
            kalorije=int(p["kalorije"]),
        )
    except (KeyError, ValueError):
        raise HTTPError(400, "krivi podaci")

    db.commit()
    response.status = 201
    return kao_json(u_dict(novi))


# uredivanje obroka
@app.route("/api/obroci/<id:int>", method="PUT")
@db_session
def uredi(id):
    o = Obrok.get(id=id)
    if o is None:
        raise HTTPError(404, "obrok ne postoji")

    p = request.json or {}
    try:
        if "datum" in p:
            o.datum = datetime.strptime(p["datum"], "%Y-%m-%d").date()
        if "tip" in p:
            o.tip = p["tip"]
        if "naziv_jela" in p:
            o.naziv_jela = p["naziv_jela"].strip()
        if "kalorije" in p:
            o.kalorije = int(p["kalorije"])
    except ValueError:
        raise HTTPError(400, "krivi podaci")

    return kao_json(u_dict(o))


# brisanje obroka
@app.route("/api/obroci/<id:int>", method="DELETE")
@db_session
def obrisi(id):
    o = Obrok.get(id=id)
    if o is None:
        raise HTTPError(404, "obrok ne postoji")
    o.delete()
    return kao_json({"id": id})


# zbrajanje kalorija po danu i tipu (za graf)
@app.route("/api/kalorije-po-danu", method="GET")
@db_session
def po_danu():
    r = select((o.datum, o.tip, sum(o.kalorije)) for o in Obrok).order_by(lambda d, t, uk: d)[:]
    return kao_json([{"datum": d.isoformat(), "tip": t, "ukupno": uk} for d, t, uk in r])


def n_dict(n):
    return {"id": n.id, "naziv": n.naziv, "kcal100": n.kcal100}


# dohvacanje svih namirnica
@app.route("/api/namirnice", method="GET")
@db_session
def namirnice():
    ns = select(n for n in Namirnica).order_by(lambda n: n.naziv)[:]
    return kao_json([n_dict(n) for n in ns])


# dodavanje namirnice
@app.route("/api/namirnice", method="POST")
@db_session
def dodaj_namirnicu():
    p = request.json or {}
    naziv = (p.get("naziv") or "").strip()
    if not naziv:
        raise HTTPError(400, "nedostaje naziv")
    if Namirnica.get(naziv=naziv):
        raise HTTPError(400, "namirnica vec postoji")
    try:
        n = Namirnica(naziv=naziv, kcal100=int(p["kcal100"]))
    except (KeyError, ValueError):
        raise HTTPError(400, "krivi podaci")
    db.commit()
    response.status = 201
    return kao_json(n_dict(n))


# brisanje namirnice
@app.route("/api/namirnice/<id:int>", method="DELETE")
@db_session
def obrisi_namirnicu(id):
    n = Namirnica.get(id=id)
    if n is None:
        raise HTTPError(404, "namirnica ne postoji")
    n.delete()
    return kao_json({"id": id})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
