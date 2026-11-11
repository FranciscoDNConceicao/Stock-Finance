FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /code

# Dependências primeiro para aproveitar a cache de camadas
COPY requirements.txt .
RUN pip install --upgrade -r requirements.txt

# O código importa "app.*", por isso o pacote fica em /code/app
COPY ./app ./app
# Migrações da base de dados (aplicadas no arranque, ver CMD)
COPY alembic.ini ./
COPY ./migrations ./migrations
# Scripts de carga de dados, usados pelo serviço "scheduler" do docker-compose
COPY ./utils ./utils

# Correr sem privilégios de root
RUN useradd --create-home --uid 1000 appuser
USER appuser

EXPOSE 8000
# Aplica as migrações pendentes e só depois arranca a API (exec: o uvicorn recebe os sinais do Docker)
CMD ["sh", "-c", "alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port 8000"]
