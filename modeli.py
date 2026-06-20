from datetime import date
from pony.orm import Database, Required, PrimaryKey, db_session

db = Database()


# tablica obroka
class Obrok(db.Entity):
    _table_ = "obrok"
    id = PrimaryKey(int, auto=True)
    datum = Required(date)
    tip = Required(str)
    naziv_jela = Required(str)
    kalorije = Required(int)


# tablica namirnica
class Namirnica(db.Entity):
    _table_ = "namirnica"
    id = PrimaryKey(int, auto=True)
    naziv = Required(str, unique=True)
    kcal100 = Required(int)


# pocetne namirnice za bazu
ZADANE_NAMIRNICE = {
    "Piletina (prsa)": 165, "Govedina": 250, "Svinjetina": 242, "Losos": 208,
    "Tuna": 132, "Jaje": 155, "Šunka": 145, "Sir gauda": 356, "Svježi sir": 98,
    "Mlijeko": 64, "Jogurt": 60, "Riža (kuhana)": 130, "Tjestenina (kuhana)": 158,
    "Krumpir (kuhani)": 87, "Kruh": 265, "Zobene pahuljice": 370, "Grah (kuhani)": 127,
    "Banana": 89, "Jabuka": 52, "Naranča": 47, "Avokado": 160, "Rajčica": 18,
    "Krastavac": 15, "Zelena salata": 15, "Mrkva": 41, "Badem": 579, "Orah": 654,
    "Maslinovo ulje": 884, "Maslac": 717, "Čokolada": 546, "Med": 304,
    "Bolognez umak": 150, "Umak od rajčice": 60, "Pesto": 300, "Pomfrit": 312,
}


# spajanje na bazu i punjenje namirnica
def init_db(filename="obroci.db"):
    db.bind(provider="sqlite", filename=filename, create_db=True)
    db.generate_mapping(create_tables=True)
    with db_session:
        if Namirnica.select().count() == 0:
            for naziv, kcal in ZADANE_NAMIRNICE.items():
                Namirnica(naziv=naziv, kcal100=kcal)
