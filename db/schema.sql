CREATE SCHEMA
`employee_db` ;

USE `employee_db`;

CREATE TABLE `employee_db`.`departments`
(
  `department_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR
(45) NOT NULL,
  PRIMARY KEY
(`department_id`),
  UNIQUE INDEX `name_UNIQUE`
(`name` ASC));

CREATE TABLE `employee_db`.`roles`
(
  `role_id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR
(45) NOT NULL,
  `salary` DECIMAL
(9,2) NOT NULL,
  `department_id` INT NOT NULL,
  PRIMARY KEY
(`role_id`),
  UNIQUE INDEX `title_UNIQUE`
(`title` ASC),
  INDEX `department_id_idx`
(`department_id` ASC),
  CONSTRAINT `department_id`
    FOREIGN KEY
(`department_id`)
    REFERENCES `employee_db`.`departments`
(`department_id`)
    ON
DELETE NO ACTION
    ON
UPDATE NO ACTION);

CREATE TABLE `employee_db`.`employees`
(
  `employee_id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR
(45) NOT NULL,
  `last_name` VARCHAR
(45) NOT NULL,
  `role_id` INT NOT NULL,
  PRIMARY KEY
(`employee_id`),
  INDEX `role_id_idx`
(`role_id` ASC),
  CONSTRAINT `role_id`
    FOREIGN KEY
(`role_id`)
    REFERENCES `employee_db`.`roles`
(`role_id`)
    ON
DELETE NO ACTION
    ON
UPDATE NO ACTION);

ALTER TABLE `employee_db`.`employees`
ADD COLUMN `manager_id` INT NULL AFTER `role_id`,
ADD INDEX `employee_id_idx`
(`manager_id` ASC);
;
ALTER TABLE `employee_db`.`employees`
ADD CONSTRAINT `employee_id`
  FOREIGN KEY
(`manager_id`)
  REFERENCES `employee_db`.`employees`
(`employee_id`)
  ON
DELETE NO ACTION
  ON
UPDATE NO ACTION;
