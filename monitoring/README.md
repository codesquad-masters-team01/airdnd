# airdnd monitoring (Prometheus + Grafana)

Continuous dashboards for the three latency layers, fed by real traffic:

| Layer | Source | Key signals |
|-------|--------|-------------|
| **App / pool** | Spring actuator (`:8081/actuator/prometheus`) | `hikaricp_connections_pending`, `hikaricp_connections_acquire_seconds` (wait), `hikaricp_connections_usage_seconds` (hold), `tomcat_threads_busy`, `http_server_requests_seconds` p95/p99 |
| **MySQL** | `mysqld-exporter` | `mysql_global_status_threads_running`, slow queries, InnoDB row ops, lock waits, per-digest latency |
| **Machine** | `node-exporter` + `cadvisor` | host CPU / load / disk-IO, per-container CPU & memory |

Everything stays **private**: Grafana binds to `127.0.0.1:3000` on the box and is reached
through an SSM tunnel; the actuator port `8081` is not in the public security group; the
exporters and Prometheus have no published ports at all.

## One-time setup

1. **Deploy the app change** (adds the actuator deps + `:8081` management port). Confirm:
   `curl -s localhost:8081/actuator/prometheus | head` on the box returns metrics.
2. **Create the MySQL exporter user** (read-only):
   ```bash
   docker exec -i airdnd-mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" < monitoring/sql/exporter-user.sql
   ```
   Use a real password in both that file and the .my.cnf below.
3. **Fill in secrets** (gitignored):
   ```bash
   cp monitoring/.env.example monitoring/.env                      # set GF_ADMIN_PASSWORD
   cp monitoring/mysqld-exporter/.my.cnf.example \
      monitoring/mysqld-exporter/.my.cnf                           # set the exporter password
   ```
4. **Security group:** ensure inbound 8081 / 3000 / 9090 / 9100 / 9104 / 8080 are NOT open
   to the internet. CloudFront should only target 8080 (the app).

## Run it (on the box)

```bash
docker compose -f monitoring/docker-compose.yml --env-file monitoring/.env up -d
docker compose -f monitoring/docker-compose.yml ps          # all healthy?
```

## View it (from your laptop)

```bash
scripts/monitoring-tunnel.sh        # SSM port-forward 3000 -> localhost:3000
# open http://localhost:3000  (admin / GF_ADMIN_PASSWORD)
```

## Import dashboards

Datasource "Prometheus" is auto-provisioned. In Grafana → **Dashboards → Import**, paste an ID:

| ID | Dashboard | Layer |
|----|-----------|-------|
| **4701** | JVM (Micrometer) | app/pool — has a HikariCP section |
| **6756** | Spring Boot Statistics | app/pool — http p95/p99, threads |
| **7362** | MySQL Overview | MySQL |
| **1860** | Node Exporter Full | machine |
| **14282** | cAdvisor | per-container |

(Or download each JSON into `monitoring/grafana/dashboards/` to auto-provision them.)

## Reading it — find the bottleneck

Put these side by side at peak traffic:

- `hikaricp_connections_acquire_seconds` **high** while `*_usage_seconds` low → **pool too small** (raise Hikari `maximum-pool-size`).
- `*_usage_seconds` / MySQL digest latency **high** → **query/index** (the PK-walk; EXPLAIN).
- `tomcat_threads_busy` near max with MySQL idle → **business logic** holding threads.
- node/cadvisor CPU or disk-IO saturated → **machine** is the ceiling.

## Tear down

```bash
docker compose -f monitoring/docker-compose.yml down          # keep data volumes
docker compose -f monitoring/docker-compose.yml down -v       # also wipe history
```
