variable "resource_group_name" {
  description = "The name of the resource group"
  type        = string
  default     = "MyResourceGroup"
}

variable "location" {
  description = "Azure region to deploy the resources"
  type        = string
  default     = "eastus"
}

variable "key_vault_name" {
  description = "Name of the Azure Key Vault (must be globally unique)"
  type        = string
  default     = "mykeyvault123"
}

variable "storage_account_name" {
  description = "The name of the storage account (must be globally unique)"
  type        = string
  default     = "mystorageaccount123"
}

variable "function_app_name" {
  description = "The name of the Function App"
  type        = string
  default     = "my-pg-functions"
}

variable "runtime_stack" {
  description = "The runtime stack for the Function App (e.g., node)"
  type        = string
  default     = "node"
}

variable "node_version" {
  description = "The Node.js version to use for the Function App"
  type        = string
  default     = "16"
}

variable "postgres_server_name" {
  description = "The name of the Azure PostgreSQL Flexible Server (must be globally unique)"
  type        = string
  default     = "mypostgresserver123"
}

variable "postgres_admin_login" {
  description = "The administrator login for the PostgreSQL server"
  type        = string
  default     = "postgresadmin"
}

variable "postgres_admin_password" {
  description = "The administrator password for the PostgreSQL server"
  type        = string
  sensitive   = true
}

variable "app_insights_name" {
  description = "The name of the Application Insights resource"
  type        = string
  default     = "myappinsights123"
}
