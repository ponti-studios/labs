#!/bin/bash
# Blue-Green Deployment Script for MCP Server
# Implements zero-downtime deployment using Kubernetes

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAMESPACE="${1:-production}"
APP_NAME="kuma"
HEALTH_CHECK_RETRIES=30
HEALTH_CHECK_DELAY=5
TIMEOUT=300

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log_info "Prerequisites check passed"
}

# Get current deployment color
get_current_color() {
    local current
    current=$(kubectl get deployment -n "$NAMESPACE" -l app="$APP_NAME",color=blue -o name 2>/dev/null | wc -l)
    if [[ $current -gt 0 ]]; then
        echo "blue"
    else
        current=$(kubectl get deployment -n "$NAMESPACE" -l app="$APP_NAME",color=green -o name 2>/dev/null | wc -l)
        if [[ $current -gt 0 ]]; then
            echo "green"
        else
            echo "none"
        fi
    fi
}

# Determine next color
get_next_color() {
    local current_color="$1"
    if [[ "$current_color" == "blue" ]]; then
        echo "green"
    else
        echo "blue"
    fi
}

# Create deployment with specific color
create_deployment() {
    local color="$1"
    local version="$2"
    
    log_info "Creating $color deployment with version $version..."
    
    # Apply base manifests with color label
    kubectl apply -k "${SCRIPT_DIR}/../k8s/overlays/${NAMESPACE}" --dry-run=client -o yaml | \
        sed "s/name: ${APP_NAME}/name: ${APP_NAME}-${color}/g" | \
        sed "s/color: .*/color: ${color}/g" | \
        sed "s/version: .*/version: ${version}/g" | \
        kubectl apply -f -
    
    log_info "Deployment $APP_NAME-$color created"
}

# Wait for deployment to be ready
wait_for_deployment() {
    local color="$1"
    local retries=0
    
    log_info "Waiting for $color deployment to be ready..."
    
    while [[ $retries -lt $HEALTH_CHECK_RETRIES ]]; do
        if kubectl rollout status deployment/${APP_NAME}-${color} -n "$NAMESPACE" --timeout=0 &> /dev/null; then
            log_info "$color deployment is ready"
            return 0
        fi
        
        retries=$((retries + 1))
        log_warn "Deployment not ready yet, retry $retries/$HEALTH_CHECK_RETRIES"
        sleep "$HEALTH_CHECK_DELAY"
    done
    
    log_error "Deployment failed to become ready within timeout"
    return 1
}

# Run health checks
health_check() {
    local color="$1"
    local service_url
    local retries=0
    
    log_info "Running health checks on $color deployment..."
    
    # Port-forward to the service for health check
    kubectl port-forward -n "$NAMESPACE" "svc/${APP_NAME}-${color}" 8080:80 &
    local pf_pid=$!
    
    # Wait for port-forward to be ready
    sleep 3
    
    # Run health checks
    while [[ $retries -lt $HEALTH_CHECK_RETRIES ]]; do
        if curl -sf http://localhost:8080/health > /dev/null 2>&1; then
            log_info "Health check passed for $color deployment"
            kill $pf_pid 2>/dev/null || true
            return 0
        fi
        
        retries=$((retries + 1))
        log_warn "Health check failed, retry $retries/$HEALTH_CHECK_RETRIES"
        sleep "$HEALTH_CHECK_DELAY"
    done
    
    kill $pf_pid 2>/dev/null || true
    log_error "Health checks failed for $color deployment"
    return 1
}

# Switch traffic to new deployment
switch_traffic() {
    local new_color="$1"
    local old_color="$2"
    
    log_info "Switching traffic from $old_color to $new_color..."
    
    # Update service selector to point to new color
    kubectl patch service "$APP_NAME" -n "$NAMESPACE" -p "{\"spec\":{\"selector\":{\"color\":\"$new_color\"}}}"
    
    log_info "Traffic switched to $new_color deployment"
}

# Cleanup old deployment
cleanup_old_deployment() {
    local old_color="$1"
    
    log_info "Cleaning up old $old_color deployment..."
    
    # Delete old deployment
    kubectl delete deployment "${APP_NAME}-${old_color}" -n "$NAMESPACE" --grace-period=60
    
    log_info "Old $old_color deployment cleaned up"
}

# Rollback deployment
rollback() {
    local color="$1"
    
    log_error "Deployment failed, rolling back..."
    
    # Delete failed deployment
    kubectl delete deployment "${APP_NAME}-${color}" -n "$NAMESPACE" --grace-period=0 --force 2>/dev/null || true
    
    log_info "Rollback completed"
}

# Main deployment function
deploy() {
    local version="${1:-latest}"
    local current_color
    local next_color
    
    log_info "Starting blue-green deployment for version $version"
    
    # Check prerequisites
    check_prerequisites
    
    # Get current color
    current_color=$(get_current_color)
    log_info "Current deployment color: $current_color"
    
    # Determine next color
    next_color=$(get_next_color "$current_color")
    log_info "Next deployment color: $next_color"
    
    # Create new deployment
    create_deployment "$next_color" "$version"
    
    # Wait for deployment to be ready
    if ! wait_for_deployment "$next_color"; then
        rollback "$next_color"
        exit 1
    fi
    
    # Run health checks
    if ! health_check "$next_color"; then
        rollback "$next_color"
        exit 1
    fi
    
    # Switch traffic
    switch_traffic "$next_color" "$current_color"
    
    # Wait for traffic to stabilize
    log_info "Waiting for traffic to stabilize..."
    sleep 10
    
    # Cleanup old deployment if it exists
    if [[ "$current_color" != "none" ]]; then
        cleanup_old_deployment "$current_color"
    fi
    
    log_info "Deployment completed successfully!"
    log_info "New version $version is now live with $next_color deployment"
}

# Dry run function
dry_run() {
    local version="${1:-latest}"
    local current_color
    local next_color
    
    log_info "DRY RUN: Simulating deployment for version $version"
    
    current_color=$(get_current_color)
    next_color=$(get_next_color "$current_color")
    
    log_info "Current color: $current_color"
    log_info "Next color: $next_color"
    log_info "Would create deployment ${APP_NAME}-${next_color}"
    log_info "Would wait for deployment to be ready"
    log_info "Would run health checks"
    log_info "Would switch traffic to $next_color"
    log_info "Would cleanup $current_color deployment"
    
    log_info "DRY RUN completed"
}

# Usage
usage() {
    cat <<EOF
Blue-Green Deployment Script for MCP Server

Usage:
    $0 [command] [options]

Commands:
    deploy [version]      Deploy new version using blue-green strategy
    dry-run [version]     Simulate deployment without making changes
    status               Show current deployment status
    rollback             Rollback to previous deployment
    help                 Show this help message

Examples:
    $0 deploy v1.2.3                    Deploy version v1.2.3
    $0 deploy latest                    Deploy latest version
    $0 dry-run v1.2.3                   Simulate deployment
    $0 status                           Show current status
    $0 production deploy v1.2.3         Deploy to production namespace

Environment Variables:
    NAMESPACE           Kubernetes namespace (default: production)
    HEALTH_CHECK_RETRIES Number of health check retries (default: 30)
    HEALTH_CHECK_DELAY   Delay between retries in seconds (default: 5)
EOF
}

# Show status
show_status() {
    log_info "Current deployment status in namespace $NAMESPACE:"
    
    kubectl get deployments -n "$NAMESPACE" -l app="$APP_NAME" -o wide
    echo
    kubectl get pods -n "$NAMESPACE" -l app="$APP_NAME"
    echo
    kubectl get svc -n "$NAMESPACE" "$APP_NAME" -o yaml | grep -A5 "selector:"
}

# Main
main() {
    local command="${1:-help}"
    
    case "$command" in
        deploy)
            deploy "${2:-latest}"
            ;;
        dry-run)
            dry_run "${2:-latest}"
            ;;
        status)
            show_status
            ;;
        rollback)
            log_info "Manual rollback not yet implemented"
            log_info "Use 'kubectl rollout undo deployment/NAME' for manual rollback"
            ;;
        help|--help|-h)
            usage
            ;;
        *)
            log_error "Unknown command: $command"
            usage
            exit 1
            ;;
    esac
}

main "$@"
