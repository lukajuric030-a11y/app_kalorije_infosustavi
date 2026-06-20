# Sluzbeni Python image (mala "slim" verzija)
FROM python:3.12-slim

# Radni direktorij unutar kontejnera
WORKDIR /app

# Prvo kopiramo samo requirements.txt i instaliramo biblioteke.
# (Tako Docker ne mora ponovno instalirati sve kad se promijeni samo kod.)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopiramo ostatak projekta u kontejner
COPY . .

# Aplikacija slusa na portu 8080
EXPOSE 8080

# Naredba koja se pokrece kad kontejner krene
CMD ["python", "aplikacija.py"]
