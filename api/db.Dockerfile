FROM mongo:4.2.1

COPY ./init-db.d/seed.js /docker-entrypoint-initdb.d/
