+---------------------------------+
| Resource Group: MyResourceGroup |
|   Location: eastus              |
+---------------------------------+
             |
             | Contains
             V
+----------------------+      +-------------------------------+
| Key Vault            |      | Storage Account:              |
| (for secrets)        |      |   mystorageaccount123         |
+----------------------+      +-------------------------------+
             |                           |
             | Contains                  | Used by
             V                           V
+----------------------+      +-------------------------------+
| PostgreSQL Server    |      | Function App: my-pg-functions |
| (Azure SQL DB if needed)     |   - Consumption plan (eastus) |
+----------------------+      |   - Runtime: node             |
             |               |   - References Storage        |
             V               +-------------------------------+
+----------------------+      
| Application Insights |
| (Monitoring)         |
+----------------------+
