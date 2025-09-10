-- Fix MySQL root password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root123';
FLUSH PRIVILEGES;

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS timetable;