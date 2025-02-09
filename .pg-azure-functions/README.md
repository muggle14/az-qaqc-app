npm install -g azure-functions-core-tools@4


mkdir pg-azure-functions
cd pg-azure-functions
func init . --javascript



""" You need to install Azure Functions Core Tools. For example, using APT:

wget -q https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install azure-functions-core-tools-
"""

<!-- After installation, try running: -->

func init . --javascript


npm install -g azure-functions-core-tools@4 --unsafe-perm true

create a postgresql with flexible, server, 


<!-- "postgres://postgres:admin123!@postgres-server-qaqc.postgres.database.azure.com" -->

"""
export PGHOST=postgres-server-qaqc.postgres.database.azure.com
export PGUSER=h.chaturvedi14@gmail.com
export PGPORT=5432
export PGDATABASE=postgres
export PGPASSWORD="$(az account get-access-token --resource https://ossrdbms-aad.database.windows.net --query accessToken --output tsv)" 


The error indicates the Azure CLI ("az") command wasn’t found when running start.sh. You have two options:

─────────────────────────
Option 1: Install Azure CLI
─────────────────────────
Install the Azure CLI so that the "az" command is available. For Ubuntu, you can follow these steps:
# Install prerequisites
sudo apt-get update
sudo apt-get install -y ca-certificates curl apt-transport-https lsb-release gnupg

# Add Microsoft signing key and repository
curl -sL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/microsoft.gpg > /dev/null
AZ_REPO=$(lsb_release -cs)
echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ $AZ_REPO main" | sudo tee /etc/apt/sources.list.d/azure-cli.list

# Install the Azure CLI
sudo apt-get update
sudo apt-get install -y azure-cli


After installing, running az in your terminal should work.

on portal>postgres-server-qaqc >settings >connect set: 
#Authentication method = postgresql

>through az cli or cloud cli 
export PGHOST=postgres-server-qaqc.postgres.database.azure.com
export PGUSER=postgres
export PGPORT=5432
export PGDATABASE=postgres
export PGPASSWORD=admin123!
psql -h postgres-server-qaqc.postgres.database.azure.com -p 5432 -U postgres postgres -f sample_schema.sql
>password: admin123!


=========================================================================================
4. Deploy to Azure

# Log into Azure
az login

# Create a resource group if you don't have one
az group create --name MyResourceGroup --location eastus

# Create a new Storage Account (required by Azure Functions)
az storage account create \
  --name mystorageaccount123 \
  --location eastus \
  --resource-group MyResourceGrouphc \
  --sku Standard_LRS

# Create the Function App
az functionapp create \
  --resource-group MyResourceGroup \
  --consumption-plan-location eastus \
  --runtime node \
  --functions-version 4 \
  --name my-pg-functions \
  --storage-account mystorageaccount123hc

#publish func app
cd pg-azure-functions
func azure functionapp publish my-pg-functions
