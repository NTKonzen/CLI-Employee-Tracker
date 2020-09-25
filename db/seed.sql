USE employee_db;

INSERT INTO departments
    (name)
VALUES
    ('Sales'),
    ('Accounting'),
    ('Legal'),
    ('Engineering');

INSERT INTO roles
    (title, salary, department_id)
VALUES
    ('Junior Engineer', 70000.00, 4),
    ('Engineer', 110000.00, 4),
    ('Head Engineer', 150000.00, 4),
    ('Lawyer', 120000.00, 3),
    ('Legal Team Lead', 200000.00, 3),
    ('Legal Intern', 50000.00, 3),
    ('Accountant', 90000.00, 2),
    ('Accounting Manager', 150000.00, 2),
    ('Salesperson', 80000.00, 1),
    ('Sales Team Lead', 160000.00, 1);

INSERT INTO employees
    (first_name, last_name, role_id, manager_id)
VALUES
    ('Jared', 'Karton', 3, null),
    ('Rachel', 'Barlow', 2, 1),
    ('Jessica', 'Sulio', 1, 2),
    ('Mark', 'Laurel', 1, 2),
    ('Isaac', 'Johanassen', 5, null),
    ('Kurt', 'Waters', 4, 5),
    ('Sabrina', 'Waters', 4, 5),
    ('Jeremiah', 'Heathrow', 6, 7),
    ('Lauren', 'Westeros', 6, 6),
    ('Paula', 'Abdul', 8, null),
    ('Ryan', 'Seacrest', 7, 10),
    ('Tera', 'Nova', 7, 10),
    ('Barbara', 'Streisand', 10, null),
    ('Stefani', 'Germanotta', 9, 13),
    ('Dixie', 'Percutio', 9, 13),
    ('Elizabeth', 'Grant', 9, 13);