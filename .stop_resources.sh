#!/bin/bash

# Stop All Virtual Machines
echo "Stopping all Virtual Machines..."
az vm deallocate --ids $(az vm list --query "[].id" -o tsv)

# Stop All Web Apps
echo "Stopping all Web Apps..."
az webapp stop --ids $(az webapp list --query "[].id" -o tsv)

# Stop All Function Apps
echo "Stopping all Function Apps..."
az functionapp stop --ids $(az functionapp list --query "[].id" -o tsv)

# Scale Down All App Service Plans to Free Tier
echo "Scaling down App Service Plans to Free Tier..."
for plan in $(az appservice plan list --query "[?sku.tier!='Free'].name" -o tsv); do
  az appservice plan update --name $plan --resource-group $(az appservice plan list --query "[?name=='$plan'].resourceGroup" -o tsv) --sku F1;
done

# Move Storage Accounts to Cool/Archive Tier
echo "Optimizing Storage Accounts..."
for sa in $(az storage account list --query "[].name" -o tsv); do
    az storage account update --name $sa --set kind=StorageV2;
done

# Pause All SQL Serverless Databases
echo "Pausing SQL Databases..."
for db in $(az sql db list --query "[?status=='Online'].name" -o tsv); do
  az sql db pause --name $db --server $(az sql server list --query "[0].name" -o tsv) --resource-group $(az sql server list --query "[0].resourceGroup" -o tsv);
done

# Scale Down Azure Kubernetes Service (AKS) Clusters
echo "Scaling down AKS clusters..."
for cluster in $(az aks list --query "[].name" -o tsv); do
  az aks scale --name $cluster --resource-group $(az aks list --query "[?name=='$cluster'].resourceGroup" -o tsv) --node-count 0;
done

# Disable Logic Apps
echo "Disabling Logic Apps..."
for logicapp in $(az logicapp list --query "[].name" -o tsv); do
  az logicapp update --name $logicapp --resource-group $(az logicapp list --query "[?name=='$logicapp'].resourceGroup" -o tsv) --set state=Disabled;
done

# Disable Automation Jobs
echo "Disabling Automation Jobs..."
az automation account list --query "[].name" -o tsv | xargs -I {} az automation account update --name {} --resource-group $(az automation account list --query "[].resourceGroup" -o tsv) --set state=Disabled

# Stop Azure Synapse SQL Pools
echo "Pausing Azure Synapse SQL Pools..."
for pool in $(az synapse sql pool list --workspace-name $(az synapse workspace list --query "[0].name" -o tsv) --query "[].name" -o tsv); do
  az synapse sql pool pause --name $pool --workspace-name $(az synapse workspace list --query "[0].name" -o tsv) --resource-group $(az synapse workspace list --query "[0].resourceGroup" -o tsv);
done

# Stop Databricks Clusters
echo "Stopping Databricks Clusters..."
for ws in $(az databricks workspace list --query "[].name" -o tsv); do
  az databricks cluster list --resource-group $(az databricks workspace list --query "[?name=='$ws'].resourceGroup" -o tsv) --workspace-name $ws | jq -r '.[] | .cluster_id' | xargs -I {} az databricks cluster delete --cluster-id {};
done

echo "All services stopped or scaled down successfully."
