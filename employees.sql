DROP DATABASE IF EXISTS employees_DB;

CREATE DATABASE employees_DB;

USE employees_DB;

CREATE TABLE department (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(30),
    PRIMARY KEY (id)
);

CREATE TABLE role (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30),
    salary DECIMAL,
    department_id INT,
    PRIMARY KEY (id),
    FOREIGN kEY (department_id) REFERENCES department(id)
);

CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30) NULL,
  last_name VARCHAR(30) NULL,
  role_id INT,
  manager_id INT,
  PRIMARY KEY (id),
  FOREIGN KEY (role_id) REFERENCES role(id),
  FOREIGN KEY (role_id) REFERENCES role(id)
);

INSERT INTO department (name) VALUES ('Engineering');
INSERT INTO department (name) VALUES ("Sales");
INSERT INTO department (name) VALUES ("Legal");
INSERT INTO department (name) VALUES ("Finance");

INSERT INTO role (title, salary, department_id) VALUES ("Manager", "200000", 1);
INSERT INTO role (title, salary, department_id) VALUES ("Manager", "200000", 2);
INSERT INTO role (title, salary, department_id) VALUES ("Manager", "200000", 3);
INSERT INTO role (title, salary, department_id) VALUES ("Manager", "200000", 4);
INSERT INTO role (title, salary, department_id) VALUES ("Engineer I", "150000", 1);
INSERT INTO role (title, salary, department_id) VALUES ("Engineer II", "115000", 1);
INSERT INTO role (title, salary, department_id) VALUES ("Engineer III", "90000", 1);
INSERT INTO role (title, salary, department_id) VALUES ("Intern", "50000", 1);
INSERT INTO role (title, salary, department_id) VALUES ("Admin", "65000", 1);
INSERT INTO role (title, salary, department_id) VALUES ("Sales Person", "70000", 2);
INSERT INTO role (title, salary, department_id) VALUES ("Attorney", "150000", 3);
INSERT INTO role (title, salary, department_id) VALUES ("Finance Analyst", "80000", 4);
INSERT INTO role (title, salary, department_id) VALUES ("Treasurer", "80000", 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Peter", "Smith", 1, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Bob", "Smith", 5, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Darlene", "Smith", 7, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Paul", "Smith", 10, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Linette", "Smith", 9, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Karen", "Smith", 2, null);