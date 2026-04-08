FROM postgres:17

# --- Set PostgreSQL major version ---
ENV PG_MAJOR=17

# --- Install build dependencies and pgvector ---
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    postgresql-server-dev-${PG_MAJOR} \
    && rm -rf /var/lib/apt/lists/* \
    && cd /tmp \
    && git clone --branch v0.7.4 https://github.com/pgvector/pgvector.git \
    && cd pgvector \
    && make clean \
    && make OPTFLAGS="" \
    && make install \
    && cd / \
    && rm -rf /tmp/pgvector /tmp/pgvector.git \
    # Remove build dependencies to reduce image size
    && apt-get purge -y build-essential git postgresql-server-dev-${PG_MAJOR} \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# --- Install runtime Postgres extensions ---
# Use postgis instead of versioned packages for PostgreSQL 17
RUN apt-get update && apt-get install -y \
    postgresql-17-pgrouting \
    postgresql-17-postgis-3 \
    postgis \
    gdal-bin \
    && rm -rf /var/lib/apt/lists/*

# --- Add init script for local/dev only (extensions should be managed by migrations in production) ---
COPY docker/init-extensions.sh /docker-entrypoint-initdb.d/init-extensions.sh
RUN chmod +x /docker-entrypoint-initdb.d/init-extensions.sh

# --- Add Grafana database initialization ---
COPY docker/init-grafana-db.sh /docker-entrypoint-initdb.d/init-grafana-db.sh
RUN chmod +x /docker-entrypoint-initdb.d/init-grafana-db.sh
