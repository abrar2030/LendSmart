# Amazon DocumentDB (MongoDB-compatible) cluster for LendSmart.
# The application uses the MongoDB driver (mongoose); DocumentDB is the AWS
# managed, MongoDB-compatible service (RDS/Aurora cannot serve MongoDB).

resource "aws_docdb_subnet_group" "main" {
  name       = "${var.environment}-${var.project_name}-docdb-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name        = "${var.environment}-${var.project_name}-docdb-subnet-group"
    Environment = var.environment
  }
}

resource "aws_docdb_cluster" "lend_smart_db" {
  cluster_identifier = "${var.project_name}-${var.environment}-docdb"
  engine             = "docdb"
  master_username    = var.db_username
  master_password    = var.db_password

  db_subnet_group_name   = aws_docdb_subnet_group.main.name
  vpc_security_group_ids = var.security_group_ids

  storage_encrypted = true
  kms_key_id        = var.db_kms_key_id

  backup_retention_period      = var.db_backup_retention_period
  preferred_backup_window      = var.db_backup_window
  preferred_maintenance_window = var.db_maintenance_window

  deletion_protection       = var.db_deletion_protection
  skip_final_snapshot       = var.db_skip_final_snapshot
  final_snapshot_identifier = var.db_skip_final_snapshot ? null : "${var.project_name}-${var.environment}-final-snapshot"

  enabled_cloudwatch_logs_exports = ["audit", "profiler"]

  tags = {
    Name        = "${var.project_name}-${var.environment}-docdb"
    Environment = var.environment
  }
}

resource "aws_docdb_cluster_instance" "lend_smart_db" {
  # A single instance for non-prod; two (multi-AZ) when db_multi_az is set.
  count = var.db_multi_az ? 2 : 1

  identifier         = "${var.project_name}-${var.environment}-docdb-${count.index + 1}"
  cluster_identifier = aws_docdb_cluster.lend_smart_db.id
  instance_class     = var.db_instance_class

  auto_minor_version_upgrade = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-docdb-instance-${count.index + 1}"
    Environment = var.environment
  }
}
