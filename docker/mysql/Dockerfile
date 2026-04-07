FROM mysql:8.4

# Copy initialization scripts
COPY init-db.sh /docker-entrypoint-initdb.d/
COPY init-spatial.sql /docker-entrypoint-initdb.d/
COPY init-rls.sql /docker-entrypoint-initdb.d/

# Set character set
RUN echo "[mysqld]" >> /etc/mysql/conf.d/custom.cnf && \
    echo "character-set-server=utf8mb4" >> /etc/mysql/conf.d/custom.cnf && \
    echo "collation-server=utf8mb4_unicode_ci" >> /etc/mysql/conf.d/custom.cnf && \
    echo "innodb-buffer-pool-size=1G" >> /etc/mysql/conf.d/custom.cnf && \
    echo "innodb-log-file-size=256M" >> /etc/mysql/conf.d/custom.cnf
