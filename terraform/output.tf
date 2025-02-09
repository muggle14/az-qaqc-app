output "function_app_default_hostname" {
  description = "The default hostname of the Function App"
  value       = azurerm_function_app.function_app.default_hostname
}

output "postgres_server_fqdn" {
  description = "The fully qualified domain name of the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.postgres.fully_qualified_domain_name
}

output "app_insights_instrumentation_key" {
  description = "Instrumentation key for Application Insights"
  value       = azurerm_application_insights.app_insights.instrumentation_key
}
