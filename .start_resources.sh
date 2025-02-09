# Start all Web Apps
az webapp start --ids $(az webapp list --query "[].id" -o tsv)

# Start all Function Apps
az functionapp start --ids $(az functionapp list --query "[].id" -o tsv)

# Start all VMs
az vm start --ids $(az vm list --query "[].id" -o tsv)

# Scale back AKS nodes
az aks scale --name <AKS_CLUSTER_NAME> --resource-group <RESOURCE_GROUP_NAME> --node-count 3  # Adjust count as needed

# Resume SQL Databases
az sql db resume --name <DB_NAME> --server <SQL_SERVER_NAME> --resource-group <RESOURCE_GROUP_NAME>
