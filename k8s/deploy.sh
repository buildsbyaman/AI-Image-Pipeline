#!/usr/bin/env bash

set -euo pipefail

REGISTRY="${REGISTRY:-your-registry}"
TAG="${TAG:-latest}"
NAMESPACE="imagepipeline"

SKIP_BUILD=false
for arg in "$@"; do
  [[ "$arg" == "--skip-build" ]] && SKIP_BUILD=true
done

if [[ ! -f "k8s/01-secrets.yaml" ]]; then
  echo "❌ Error: k8s/01-secrets.yaml not found."
  echo "Please copy k8s/01-secrets.example.yaml to k8s/01-secrets.yaml and configure your secrets."
  exit 1
fi

if [[ "$SKIP_BUILD" == false ]]; then
  echo "▶ Building images..."
  docker build -t "$REGISTRY/express-server:$TAG" -f "Express Server/Dockerfile" "Express Server"
  docker build -t "$REGISTRY/worker:$TAG"         -f "Worker System/Dockerfile"  "Worker System"
  docker build -t "$REGISTRY/notification:$TAG"   -f "Email System/Dockerfile"   "Email System"
  docker build -t "$REGISTRY/frontend:$TAG"       -f "Frontend/Dockerfile.prod"  "Frontend"

  echo "▶ Pushing images..."
  docker push "$REGISTRY/express-server:$TAG"
  docker push "$REGISTRY/worker:$TAG"
  docker push "$REGISTRY/notification:$TAG"
  docker push "$REGISTRY/frontend:$TAG"
fi

echo "▶ Patching image references..."
kubectl set image deployment/express-server express-server="$REGISTRY/express-server:$TAG" -n "$NAMESPACE" 2>/dev/null || true
kubectl set image deployment/worker         worker="$REGISTRY/worker:$TAG"                 -n "$NAMESPACE" 2>/dev/null || true
kubectl set image deployment/notification   notification="$REGISTRY/notification:$TAG"     -n "$NAMESPACE" 2>/dev/null || true
kubectl set image deployment/frontend       frontend="$REGISTRY/frontend:$TAG"             -n "$NAMESPACE" 2>/dev/null || true

echo "▶ Applying manifests..."
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-secrets.yaml
kubectl apply -f k8s/02-configmap.yaml
kubectl apply -f k8s/03-mongo.yaml
kubectl apply -f k8s/04-redis.yaml
kubectl apply -f k8s/05-server.yaml
kubectl apply -f k8s/06-worker.yaml
kubectl apply -f k8s/07-notification.yaml
kubectl apply -f k8s/08-frontend.yaml
kubectl apply -f k8s/09-ingress.yaml

echo "▶ Waiting for rollouts to complete..."
kubectl rollout status deployment/express-server -n "$NAMESPACE"
kubectl rollout status deployment/worker         -n "$NAMESPACE"
kubectl rollout status deployment/notification   -n "$NAMESPACE"
kubectl rollout status deployment/frontend       -n "$NAMESPACE"

echo ""
echo "✅ Deployment complete."
kubectl get pods -n "$NAMESPACE"
