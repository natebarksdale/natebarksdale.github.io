#!/bin/bash
REPO="natebarksdale/natebarksdale.github.io"
WORKFLOWS=("Deploy Astro site to Pages with Metadata Enhancement" "Astro Studio")
INTERVAL=30  # How often to check (in seconds)

echo "Monitoring GitHub Actions in $REPO for workflows: ${WORKFLOWS[*]}"

while true; do
  for WORKFLOW in "${WORKFLOWS[@]}"; do
    STATUS=$(gh run list -w "$WORKFLOW" -R "$REPO" --limit 1 --json status,conclusion --jq '.[0] | "\(.status) \(.conclusion)"')

    read -r RUN_STATUS RUN_CONCLUSION <<< "$STATUS"

    if [[ "$RUN_STATUS" == "completed" ]]; then
      if [[ "$RUN_CONCLUSION" == "success" ]]; then
        say "$WORKFLOW has completed successfully"
      else
        say "$WORKFLOW has failed"
      fi
      break 2  # Exit both loops once a workflow completes
    fi
  done

  echo "Workflows still running... checking again in $INTERVAL seconds."
  sleep $INTERVAL
done

