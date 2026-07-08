output "db_endpoint" {
  description = "Writer endpoint of the DocumentDB cluster"
  value       = aws_docdb_cluster.lend_smart_db.endpoint
}

output "db_reader_endpoint" {
  description = "Reader endpoint of the DocumentDB cluster"
  value       = aws_docdb_cluster.lend_smart_db.reader_endpoint
}

output "db_port" {
  description = "Port of the DocumentDB cluster"
  value       = aws_docdb_cluster.lend_smart_db.port
}

output "db_name" {
  description = "Application database name"
  value       = var.db_name
}

output "db_username" {
  description = "Master username for the DocumentDB cluster"
  value       = aws_docdb_cluster.lend_smart_db.master_username
  sensitive   = true
}

output "db_arn" {
  description = "ARN of the DocumentDB cluster"
  value       = aws_docdb_cluster.lend_smart_db.arn
}
