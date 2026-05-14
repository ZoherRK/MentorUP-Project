/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.6-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: mentorup
-- ------------------------------------------------------
-- Server version	11.8.6-MariaDB-0+deb13u1 from Debian

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `admins_usuario_id_foreign` (`usuario_id`),
  CONSTRAINT `admins_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES
(1,1,'2026-05-07 09:38:55','2026-05-07 09:38:55'),
(2,1,'2026-05-07 09:53:34','2026-05-07 09:53:34');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `alumnos`
--

DROP TABLE IF EXISTS `alumnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `alumnos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `alumnos_usuario_id_foreign` (`usuario_id`),
  CONSTRAINT `alumnos_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumnos`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `alumnos` WRITE;
/*!40000 ALTER TABLE `alumnos` DISABLE KEYS */;
INSERT INTO `alumnos` VALUES
(3,7,'2026-05-07 14:05:05','2026-05-07 14:05:05'),
(4,9,'2026-05-08 10:18:00','2026-05-08 10:18:00'),
(5,11,'2026-05-13 12:50:33','2026-05-13 12:50:33');
/*!40000 ALTER TABLE `alumnos` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `anuncios`
--

DROP TABLE IF EXISTS `anuncios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `anuncios` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `profesor_id` bigint(20) unsigned NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `asignatura` varchar(100) NOT NULL,
  `nivel` enum('primaria','eso','bachillerato','universidad','adultos','otro') NOT NULL,
  `precio_hora` decimal(6,2) NOT NULL,
  `descripcion` text NOT NULL,
  `verificado` enum('pendiente','aprobado','rechazado') NOT NULL DEFAULT 'pendiente',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `destacado` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `anuncios_profesor_id_foreign` (`profesor_id`),
  CONSTRAINT `anuncios_profesor_id_foreign` FOREIGN KEY (`profesor_id`) REFERENCES `profesores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anuncios`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `anuncios` WRITE;
/*!40000 ALTER TABLE `anuncios` DISABLE KEYS */;
INSERT INTO `anuncios` VALUES
(2,2,'clase mates','matematicas','eso',15.00,'es una clase','aprobado',1,0,'2026-05-07 14:09:35','2026-05-07 14:10:18'),
(3,3,'programacion','programacion','universidad',20.00,'clases de programacion','aprobado',1,0,'2026-05-08 10:19:09','2026-05-08 10:19:28'),
(4,4,'IPO','IPO','bachillerato',10.00,'es ipo y ya tete','pendiente',1,0,'2026-05-13 12:53:18','2026-05-13 12:53:18'),
(5,4,'IPO','IPO','bachillerato',10.00,'es ipo y ya tete','pendiente',1,0,'2026-05-13 12:53:21','2026-05-13 12:53:21'),
(6,4,'IPO','IPO','bachillerato',10.00,'es ipo y ya tete','pendiente',1,0,'2026-05-13 12:53:29','2026-05-13 12:53:29'),
(7,4,'IPO','IPO','bachillerato',10.00,'es ipo y ya tete','pendiente',1,0,'2026-05-13 12:55:47','2026-05-13 12:55:47'),
(8,4,'IPO','IPO','bachillerato',10.00,'es ipo y ya tete','aprobado',1,0,'2026-05-13 12:58:00','2026-05-13 12:58:32'),
(14,2,'te','tes','eso',12.00,'adsasd','pendiente',1,0,'2026-05-14 14:45:43','2026-05-14 14:45:43'),
(15,2,'a','a','eso',1.00,'aa','pendiente',1,0,'2026-05-14 14:46:53','2026-05-14 14:46:53'),
(16,2,'a','a','eso',123.00,'asd','pendiente',1,0,'2026-05-14 14:47:41','2026-05-14 14:47:41'),
(17,2,'a','a','eso',1.00,'a','pendiente',1,0,'2026-05-14 14:48:56','2026-05-14 14:48:56'),
(18,2,'a','a','eso',1.00,'a','pendiente',1,0,'2026-05-14 14:49:42','2026-05-14 14:49:42'),
(19,2,'aa','aa','universidad',22.00,'aa','aprobado',1,0,'2026-05-14 14:52:58','2026-05-14 14:53:20');
/*!40000 ALTER TABLE `anuncios` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `disponibilidad_horaria`
--

DROP TABLE IF EXISTS `disponibilidad_horaria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `disponibilidad_horaria` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `profesor_id` bigint(20) unsigned NOT NULL,
  `dia_semana` tinyint(4) NOT NULL COMMENT '0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes, 5=Sábado, 6=Domingo',
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `disponibilidad_horaria_profesor_id_dia_semana_index` (`profesor_id`,`dia_semana`),
  CONSTRAINT `disponibilidad_horaria_profesor_id_foreign` FOREIGN KEY (`profesor_id`) REFERENCES `profesores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disponibilidad_horaria`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `disponibilidad_horaria` WRITE;
/*!40000 ALTER TABLE `disponibilidad_horaria` DISABLE KEYS */;
INSERT INTO `disponibilidad_horaria` VALUES
(1,4,0,'09:00:00','11:00:00',1,'2026-05-13 12:58:00','2026-05-13 12:58:00'),
(2,4,2,'10:00:00','12:00:00',1,'2026-05-13 12:58:00','2026-05-13 12:58:00'),
(3,4,4,'07:00:00','22:00:00',1,'2026-05-13 12:58:00','2026-05-13 12:58:00'),
(22,2,0,'00:30:00','01:00:00',1,'2026-05-14 14:45:20','2026-05-14 14:45:20');
/*!40000 ALTER TABLE `disponibilidad_horaria` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES
(1,'2014_10_12_000000_create_users_table',1),
(2,'2014_10_12_100000_create_password_reset_tokens_table',1),
(3,'2019_08_19_000000_create_failed_jobs_table',1),
(4,'2019_12_14_000001_create_personal_access_tokens_table',1),
(5,'2026_01_01_000001_create_usuarios_table',1),
(6,'2026_01_01_000002_create_alumnos_table',1),
(7,'2026_01_01_000003_create_profesores_table',1),
(8,'2026_01_01_000004_create_admins_table',1),
(9,'2026_01_01_000005_create_anuncios_table',1),
(10,'2026_01_01_000006_create_reservas_table',1),
(11,'2026_01_01_000007_create_valoraciones_table',1),
(12,'2026_04_08_145634_create_sessions_table',1),
(13,'2026_01_01_000008_create_disponibilidad_horaria_table',2);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `profesores`
--

DROP TABLE IF EXISTS `profesores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `profesores` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `profesores_usuario_id_foreign` (`usuario_id`),
  CONSTRAINT `profesores_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profesores`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `profesores` WRITE;
/*!40000 ALTER TABLE `profesores` DISABLE KEYS */;
INSERT INTO `profesores` VALUES
(2,8,'2026-05-07 14:09:13','2026-05-07 14:09:13'),
(3,10,'2026-05-08 10:18:39','2026-05-08 10:18:39'),
(4,12,'2026-05-13 12:51:51','2026-05-13 12:51:51');
/*!40000 ALTER TABLE `profesores` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `reservas`
--

DROP TABLE IF EXISTS `reservas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `alumno_id` bigint(20) unsigned NOT NULL,
  `anuncio_id` bigint(20) unsigned NOT NULL,
  `fecha_clase` datetime NOT NULL,
  `duracion_h` decimal(4,1) NOT NULL COMMENT 'Duration in hours: 0.5, 1, 1.5, 2',
  `precio_total` decimal(8,2) NOT NULL,
  `notas_alumno` text DEFAULT NULL,
  `estado` enum('pendiente','confirmada','completada','cancelada') NOT NULL DEFAULT 'pendiente',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reservas_alumno_id_foreign` (`alumno_id`),
  KEY `reservas_anuncio_id_foreign` (`anuncio_id`),
  CONSTRAINT `reservas_alumno_id_foreign` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservas_anuncio_id_foreign` FOREIGN KEY (`anuncio_id`) REFERENCES `anuncios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservas`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `reservas` WRITE;
/*!40000 ALTER TABLE `reservas` DISABLE KEYS */;
INSERT INTO `reservas` VALUES
(2,3,2,'2026-05-14 12:12:00',0.5,7.50,NULL,'completada','2026-05-07 14:12:41','2026-05-07 14:13:20'),
(3,4,3,'2026-05-15 10:10:00',0.5,10.00,NULL,'completada','2026-05-08 10:20:19','2026-05-08 10:20:46'),
(4,5,8,'2026-05-15 12:12:00',1.0,10.00,'una clase pa repasar jeje','completada','2026-05-13 13:00:05','2026-05-13 13:03:18'),
(8,5,19,'2026-05-18 00:30:00',0.5,11.00,'a','pendiente','2026-05-14 14:54:06','2026-05-14 14:54:06');
/*!40000 ALTER TABLE `reservas` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(150) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `bloqueado` tinyint(1) NOT NULL DEFAULT 0,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES
(1,'Administrador','MentorUP','admin@mentorup.test','$2y$12$9Uj.m4uBWFqofDe8ZZRozOfqpqscEpv35D9rlg/GU2G59l5yX5LLS',NULL,NULL,0,NULL,NULL,'2026-05-07 09:38:55','2026-05-07 10:01:01'),
(3,'Test','Test','test@test.com','$2y$12$P5tDEtzPmoajrUd1GAA54eQLr1P4hEZqEA/d6.W5wRgPK0mx5A9Uu',NULL,NULL,0,NULL,NULL,'2026-05-07 12:29:09','2026-05-07 12:29:09'),
(7,'Jose','jose','jose@gmail.com','$2y$12$tVHOF9NZfduiRfo1hvTLQeUx3Zy40oyJCNE4wgdtX24fLrvueteOy',NULL,NULL,0,NULL,NULL,'2026-05-07 14:05:05','2026-05-07 14:05:05'),
(8,'profe','profes','profe@gmail.com','$2y$12$AE107KSeOr9G2KLrtkVh7.uHMF5XR4EYqwKFZ8/xrzBwWCDQqDY.O',NULL,NULL,0,NULL,NULL,'2026-05-07 14:09:13','2026-05-07 14:09:13'),
(9,'zoher','re','zoher@gmail.com','$2y$12$2oG8bNwAKi/Lr0bk1xvVKO3HoX1F6MUDVhRJK85F/tmErCDu4F9.C',NULL,NULL,0,NULL,NULL,'2026-05-08 10:18:00','2026-05-08 10:18:00'),
(10,'toni','gi','toni@gmail.com','$2y$12$qOIJPeAW74/67UKr7P8LQO7NgJnV/SC9V1DfMG6gB6ntB2GsmxnMe',NULL,NULL,0,NULL,NULL,'2026-05-08 10:18:39','2026-05-08 10:18:39'),
(11,'ale','jandro','ale@gmail.com','$2y$12$Zt37ab1PXUmYx5ybCokBxuUpT/TsAjcTKfu0IAuyWIo5xCbkx/6Oy',NULL,'09876543123',0,NULL,NULL,'2026-05-13 12:50:33','2026-05-13 12:50:33'),
(12,'ped','ro','perdo@gmail.com','$2y$12$NwIH1wh2Pu2IhqrePTZH8e55Ttf6V06sUPQuIZTvdi0KN3pqyOGbW',NULL,'123123123',0,NULL,NULL,'2026-05-13 12:51:51','2026-05-13 12:51:51');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `valoraciones`
--

DROP TABLE IF EXISTS `valoraciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `valoraciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `alumno_id` bigint(20) unsigned NOT NULL,
  `anuncio_id` bigint(20) unsigned NOT NULL,
  `puntuacion` tinyint(3) unsigned NOT NULL COMMENT '1 to 5 stars',
  `comentario` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `valoraciones_alumno_id_anuncio_id_unique` (`alumno_id`,`anuncio_id`),
  KEY `valoraciones_anuncio_id_foreign` (`anuncio_id`),
  CONSTRAINT `valoraciones_alumno_id_foreign` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `valoraciones_anuncio_id_foreign` FOREIGN KEY (`anuncio_id`) REFERENCES `anuncios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `valoraciones`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `valoraciones` WRITE;
/*!40000 ALTER TABLE `valoraciones` DISABLE KEYS */;
INSERT INTO `valoraciones` VALUES
(1,3,2,5,'QUE LOKUUUUUURA','2026-05-07 14:54:12','2026-05-07 14:54:12'),
(2,4,3,5,'me ha encantado','2026-05-08 10:21:17','2026-05-08 10:21:17'),
(3,5,8,5,'HA SIDO MUY GANGSTER GERMA','2026-05-13 13:03:53','2026-05-13 13:03:53');
/*!40000 ALTER TABLE `valoraciones` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-05-14 19:04:16
