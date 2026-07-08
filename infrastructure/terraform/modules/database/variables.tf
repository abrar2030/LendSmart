variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "lendsmart"
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "private_subnet_ids" {
  description = "IDs of the private subnets"
  type        = list(string)
}

variable "security_group_ids" {
  description = "List of security group IDs"
  type        = list(string)
}

variable "db_instance_class" {
  description = "The instance class for the DocumentDB cluster instances"
  type        = string
  default     = "db.t3.medium"
}

variable "db_name" {
  description = "The application database name (created on first write in DocumentDB)"
  type        = string
  default     = "lendsmartdb"
}

variable "db_username" {
  description = "The master username for the DocumentDB cluster"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "The master password for the DocumentDB cluster"
  type        = string
  sensitive   = true
}

variable "db_skip_final_snapshot" {
  description = "Determines whether a final snapshot is created before deletion"
  type        = bool
  default     = false
}

variable "db_kms_key_id" {
  description = "The ARN of the KMS key for encryption at rest"
  type        = string
  default     = null
}

variable "db_backup_retention_period" {
  description = "The number of days to retain backups"
  type        = number
  default     = 7
}

variable "db_backup_window" {
  description = "The daily time range (in UTC) for automated backups"
  type        = string
  default     = "03:00-04:00"
}

variable "db_maintenance_window" {
  description = "The weekly time range for system maintenance"
  type        = string
  default     = "sun:05:00-sun:06:00"
}

variable "db_multi_az" {
  description = "When true, provisions two cluster instances across AZs"
  type        = bool
  default     = false
}

variable "db_deletion_protection" {
  description = "Whether deletion protection is enabled for the cluster"
  type        = bool
  default     = true
}
