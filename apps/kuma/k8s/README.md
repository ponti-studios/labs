# Kubernetes Deployment

Production-ready Kubernetes manifests for the MCP Server using Kustomize.

## Structure

```
k8s/
├── base/                    # Base manifests
│   ├── kustomization.yaml
│   ├── deployment.yaml      # 3 replicas, security hardening
│   ├── service.yaml         # ClusterIP service
│   ├── ingress.yaml         # NGINX ingress with TLS
│   ├── configmap.yaml       # Non-sensitive config
│   ├── secret.yaml          # Sensitive data (requires customization)
│   ├── serviceaccount.yaml  # Minimal permissions
│   ├── hpa.yaml            # Horizontal Pod Autoscaler
│   └── pdb.yaml            # Pod Disruption Budget
│
└── overlays/
    ├── production/         # Production environment
    │   ├── kustomization.yaml
    │   └── deployment-patch.yaml
    └── staging/           # Staging environment
        └── kustomization.yaml
```

## Quick Start

### 1. Update Secrets

Edit `k8s/base/secret.yaml` with your actual values:

```bash
# Generate base64 encoded values
echo -n 'your-db-password' | base64
echo -n 'your-jwt-secret' | base64

# Or use kubectl to create secret (recommended)
kubectl create secret generic kuma-secrets \
  --from-literal=DB_PASSWORD='your-password' \
  --from-literal=JWT_SECRET='your-secret' \
  --from-literal=DATABASE_URL='postgresql://...' \
  --dry-run=client -o yaml > k8s/base/secret.yaml
```

### 2. Deploy to Staging

```bash
# Deploy to staging namespace
kubectl apply -k k8s/overlays/staging/

# Verify deployment
kubectl get pods -n staging -l app=kuma
kubectl logs -n staging -l app=kuma --tail=50
```

### 3. Deploy to Production

```bash
# Create namespace
kubectl create namespace production

# Deploy to production
kubectl apply -k k8s/overlays/production/

# Verify deployment
kubectl get pods -n production -l app=kuma
kubectl get svc -n production
kubectl get ingress -n production
```

## Configuration

### Environment-Specific Settings

| Environment | Replicas | Resources | Log Level |
|-------------|----------|-----------|-----------|
| Base        | 3        | 128Mi/512Mi | info |
| Staging     | 1        | 128Mi/512Mi | debug |
| Production  | 3        | 256Mi/1Gi   | warn |

### Auto-Scaling

The HPA is configured to:
- Scale between 3-10 replicas
- Scale up when CPU > 70% or Memory > 80%
- Scale down gradually (5-minute stabilization)

### High Availability

- Pod Disruption Budget ensures minimum 2 pods available
- Pod anti-affinity spreads pods across nodes
- Rolling update strategy with 0 maxUnavailable

## Security

### Pod Security
- Runs as non-root user (UID 65532)
- Read-only root filesystem
- No privilege escalation
- All capabilities dropped
- Seccomp profile enabled (via RuntimeDefault)

### Network Security
- TLS termination at ingress
- CORS headers configured
- Rate limiting support (requires NGINX modsecurity)

## Monitoring

### Prometheus Metrics
The service exposes metrics at `/metrics` endpoint. Prometheus ServiceMonitor can be added:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: kuma
spec:
  selector:
    matchLabels:
      app: kuma
  endpoints:
    - port: http
      path: /metrics
      interval: 30s
```

### Health Checks

- **Liveness**: `/health` - Restarts pod if failing
- **Readiness**: `/health` - Removes from service endpoints if failing
- **Startup**: `/health` - Allows slow-starting pods time to initialize

## Troubleshooting

### Check Pod Status
```bash
kubectl get pods -n production
kubectl describe pod -n production -l app=kuma
```

### View Logs
```bash
kubectl logs -n production -l app=kuma --tail=100 -f
```

### Check Events
```bash
kubectl get events -n production --sort-by='.lastTimestamp'
```

### Port Forward for Local Testing
```bash
kubectl port-forward -n production svc/prod-kuma 8080:80
```

## Updating the Deployment

### Rolling Update
```bash
# Update image tag in overlays/production/kustomization.yaml
# Then apply
kubectl apply -k k8s/overlays/production/
```

### Blue-Green Deployment
See `scripts/blue-green-deploy.sh` for zero-downtime deployment script.

## Cleanup

```bash
# Remove production deployment
kubectl delete -k k8s/overlays/production/

# Remove staging deployment
kubectl delete -k k8s/overlays/staging/
```

## Customization

### Adding New Environment

1. Create `k8s/overlays/<environment>/`
2. Create `kustomization.yaml` referencing `../../base`
3. Add environment-specific patches
4. Apply with `kubectl apply -k k8s/overlays/<environment>/`

### Modifying Resources

Edit the base manifests or create patches in overlays:

```yaml
# patches/deployment-resources.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kuma
spec:
  template:
    spec:
      containers:
        - name: kuma
          resources:
            requests:
              memory: "512Mi"
```

## References

- [Kustomize Documentation](https://kubectl.docs.kubernetes.io/references/kustomize/)
- [Kubernetes Deployment Best Practices](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#best-practices)
- [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/)
