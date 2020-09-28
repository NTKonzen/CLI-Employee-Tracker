const mysql = require('mysql')
const cTable = require('console.table');
const inquirer = require('inquirer');
const wordart = require('./assets/wordart')

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'employee_db'
});

const initOptions = ['View All Employees', 'View All Roles', 'View All Departments', 'View All Employees by Department', 'Update Employee', 'Add New Employee', 'Add New Role', 'Add New Department', 'Exit Program'];
const employeeUpdateChoices = ['Role', 'Manager', 'Name'];

console.log(wordart);

function testConnection() {
    return new Promise((res, rej) => {
        connection.connect((err, response) => {
            if (err) throw err;
            console.log(`Connection made at id ${connection.threadId}`)
            res();
        });
    })
};

async function mainRoute(route) {
    return new Promise(async (res, rej) => {
        if (route.value === initOptions[0]) {
            connection.query(`
            SELECT
	            e.employee_id "ID",
	            e.first_name "First Name",
                e.last_name "Last Name",
                e.manager_id "Manager ID",
                r.title "Role",
                r.salary "Salary",
                d.name "Department"
            FROM
	            employees e,
	            roles r,
	            departments d
            WHERE 
            	e.role_id = r.role_id
                AND r.department_id = d.department_id
            ORDER BY e.employee_id
            `,
                (err, result) => {
                    if (err) throw err;
                    console.log('')
                    console.table(result)
                    res();
                });
        } else if (route.value === initOptions[1]) {
            connection.query(`SELECT r.title "Title", r.salary "Salary", d.name "Department" 
            FROM roles r, departments d
            WHERE d.department_id = r.department_id`,
                (err, result) => {
                    if (err) throw err;

                    console.log('')
                    console.table(result)
                    res();
                });
        } else if (route.value === initOptions[2]) {
            connection.query('SELECT d.name "Department Name" FROM departments d', (err, result) => {
                if (err) throw err;

                console.log('')
                console.table(result)
                res();
            });
        } else if (route.value === initOptions[3]) {
            const departments = await getDepartments();
            const departmentsArray = [];

            console.log('');
            departments.forEach(val => {
                departmentsArray.push(val.name)
            })

            const department = await inquirer.prompt({
                name: 'value',
                type: 'list',
                choices: departmentsArray,
                message: 'Select a Department'
            })
            console.table(await getByDepartment(department.value));

            res();
        } else if (route.value === initOptions[4]) {
            const employees = await getEmployees();
            const employeeArray = [];

            employees.forEach(val => {
                employeeArray.push({ name: `${val.first_name} ${val.last_name} ID: ${val.employee_id}`, value: { id: val.employee_id, first_name: val.first_name, last_name: val.last_name } })
            });

            const employee = await inquirer.prompt({
                name: 'value',
                type: 'list',
                choices: employeeArray,
                message: 'Which employee did you want to update?'
            });

            const propsToUpdate = await inquirer.prompt({
                name: 'value',
                type: 'list',
                choices: employeeUpdateChoices,
                message: 'What properties do you want to update on this employee?'
            });

            switch (propsToUpdate.value) {
                case 'Role':
                    const roles = await getRolesByEmployeeId(employee.value.id);
                    const rolesArray = [];
                    roles.forEach(roleObj => {
                        rolesArray.push({ name: `${roleObj.title}`, value: roleObj.role_id })
                    });

                    const roleToTake = await inquirer.prompt({
                        name: 'value',
                        type: 'list',
                        choices: rolesArray,
                        message: 'Which role would you like to move the employee to?'
                    });

                    await updateEmployeeRole(roleToTake.value, employee.value.id)
                    break;

                case 'Manager':
                    const possibleManagers = await getCoworkersById(employee.value.id);
                    const managersArray = [];

                    possibleManagers.forEach(managerObj => {
                        managersArray.push({ name: `${managerObj.first_name} ${managerObj.last_name} ID: ${managerObj.employee_id}`, value: managerObj.role_id })
                    });

                    managersArray.push({ name: 'No Manager', value: null })

                    const newManager = await inquirer.prompt({
                        name: 'id',
                        type: 'list',
                        choices: managersArray,
                        message: 'Which coworker would you like to assign as this employee\'s new manager?'
                    });

                    updateEmployeeManager(newManager.id, employee.value.id);
                    break;

                case 'Name':
                    console.log(employee)

                    let newName = await inquirer.prompt({
                        name: 'value',
                        type: 'input',
                        message: `You are editing ${employee.value.first_name} ${employee.value.last_name}\nEnter the new first and last name of the employee separated by a space\n`
                    });

                    newName = newName.value.split(' ')

                    updateEmployeeName(newName, employee.value.id)

                    break;
            }

            res();
        } else if (route.value === initOptions[5]) {
            let newName = await inquirer.prompt({
                name: 'name',
                type: 'input',
                message: 'Enter the new employee\'s first and last name separated by a space\n'
            })

            newName = newName.name.split(' ');

            const departments = await getDepartments();
            const departmentChoicesArray = []

            departments.forEach(departmentObj => {
                departmentChoicesArray.push({ name: `${departmentObj.name}`, value: departmentObj.department_id })
            })

            const whichDepartment = await inquirer.prompt({
                name: 'department_id',
                type: 'list',
                choices: departmentChoicesArray,
                message: 'Which department do you want to assign the new employee to?'
            })

            const availableRoles = await getRolesByDepartmentId(whichDepartment.department_id);
            const rolesChoicesArray = [];

            availableRoles.forEach(role => {
                rolesChoicesArray.push({ name: `${role.title}`, value: role.role_id })
            })

            const whichRole = await inquirer.prompt({
                name: 'role_id',
                type: 'list',
                choices: rolesChoicesArray,
                message: 'Which role do you want to assign the new employee to?'
            });

            const possibleManagers = await getEmployeesByDepartmentId(whichDepartment.department_id);
            const managersChoicesArray = [];

            possibleManagers.forEach(manager => {
                managersChoicesArray.push({ name: `${manager.first_name} ${manager.last_name} ID: ${manager.employee_id}`, value: manager.employee_id })
            })

            managersChoicesArray.push({ name: 'No Manager', value: null })
            console.log(managersChoicesArray)

            const whichManager = await inquirer.prompt({
                name: 'manager_id',
                type: 'list',
                choices: managersChoicesArray,
                message: 'Who do you want to assign as the new employee\'s manager?'
            });

            await createNewEmployee(newName[0], newName[1], whichRole.role_id, whichManager.manager_id)

            res();

        } else if (route.value === initOptions[6]) {
            const departments = await getDepartments();
            const departmentChoicesArray = []

            departments.forEach(departmentObj => {
                departmentChoicesArray.push({ name: `${departmentObj.name}`, value: departmentObj.department_id })
            })

            const whichDepartment = await inquirer.prompt({
                name: 'department_id',
                type: 'list',
                choices: departmentChoicesArray,
                message: 'Which department do you want to add the new role to?'
            });

            const newRoleName = await inquirer.prompt({
                name: 'name',
                type: 'input',
                message: 'What do you want to call this new role?\n'
            });

            const newRoleSalary = await inquirer.prompt({
                name: 'salary',
                type: 'input',
                message: 'What salary do you want to set for this role?\n'
            });
            newRoleSalary.salary += '.00';
            newRoleSalary.salary = parseInt(newRoleSalary.salary)
            console.log(newRoleSalary.salary)

            createNewRole(newRoleName.name, newRoleSalary.salary, whichDepartment.department_id)

            res();

        } else if (route.value === initOptions[7]) {
            const newDepartment = await inquirer.prompt({
                name: 'name',
                type: 'input',
                message: 'What do you want to all the new department?'
            });

            await createNewDepartment(newDepartment.name);
            res();
        } else {
            connection.end();
        }
    })
};

function getDepartments() {
    return new Promise((res, rej) => {
        connection.query('SELECT * FROM departments', (err, result) => {
            if (err) throw err;

            res(result);
        })
    })
};

function getEmployees() {
    return new Promise((res, rej) => {
        connection.query('Select employee_id, first_name, last_name FROM employees', (err, result) => {
            if (err) throw err;

            res(result);
        })
    })
};

function createNewEmployee(first, last, role, manager) {
    return new Promise((res, rej) => {
        connection.query('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES(?, ?, ?, ?)',
            [first, last, role, manager],
            (err, result) => {
                if (err) throw err;

                res(result);
            })
    })
};

function createNewRole(title, salary, department) {
    return new Promise((res, rej) => {
        connection.query('INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)',
            [title, salary, department],
            (err, result) => {
                if (err) throw err;

                res(result);
            })
    })
};

function createNewDepartment(name) {
    return new Promise((res, rej) => {
        connection.query('INSERT INTO departments (name) VALUES (?)',
            [name],
            (err, result) => {
                if (err) throw err;

                res(result);
            })
    })
}

function getByDepartment(department) {
    return new Promise((res, rej) => {
        connection.query(`
        SELECT 
	        e.employee_id "Employee ID", 
	        e.first_name "First Name", 
            e.last_name "Last Name", 
            e.manager_id "Manager ID", 
            r.title "Role", 
            r.salary "Salary",
            d.name "Department" 
        FROM 
	        employees e, 
            departments d, 
            roles r
        WHERE 
	        r.role_id = e.role_id 
            AND r.department_id = d.department_id 
            AND d.name = ?`, [department], (err, result) => {
            if (err) throw err;

            res(result);
        })
    })
};

function updateEmployeeRole(newRoleId, id) {
    return new Promise((res, rej) => {
        connection.query('UPDATE employees, roles SET employees.role_id = ? WHERE employees.employee_id = ? AND roles.role_id = employees.employee_id', [newRoleId, id], (err, result) => {
            if (err) throw err;

            res(result);
        })
    })
};

function updateEmployeeManager(newManagerId, id) {
    return new Promise((res, rej) => {
        connection.query('UPDATE employees, roles SET employees.manager_id = ? WHERE employees.employee_id = ?',
            [newManagerId, id],
            (err, result) => {
                if (err) throw err;

                res(result);
            })
    })
};

function updateEmployeeName(newNameArray, employeeId) {
    newNameArray.push(employeeId);
    return new Promise((res, rej) => {
        connection.query('UPDATE employees SET employees.first_name = ?, employees.last_name = ? WHERE employees.employee_id = ?', newNameArray, (err, result) => {
            if (err) throw err;

            res(result);
        })
    })
}

function getRolesByEmployeeId(id) {
    return new Promise((res, rej) => {
        connection.query(`
        SELECT r.title, r.role_id
        FROM roles r, employees e, departments departments
        WHERE r.department_id = (
            SELECT r.department_id
            FROM roles r, employees e, departments d
            WHERE e.employee_id = ?
                AND r.role_id = e.role_id
                AND r.department_id = d.department_id
        )
    GROUP BY role_id`, [id], (err, result) => {
            if (err) throw err;

            res(result);
        })
    });
};

function getRolesByDepartmentId(id) {
    return new Promise((res, rej) => {
        connection.query(`
            SELECT d.department_id, r.role_id, r.title FROM departments d, roles r
	            WHERE d.department_id = r.department_id
                AND d.department_id = ?`,
            [id],
            (err, result) => {
                if (err) throw err;

                res(result)
            })
    })
}

function getCoworkersById(id) {
    return new Promise((res, rej) => {
        connection.query(`
            SELECT e.first_name, e.last_name, e.employee_id, e.role_id FROM employees e 
	            WHERE e.role_id IN (SELECT r.role_id
                    FROM roles r, employees e, departments departments
                    WHERE r.department_id = (
                        SELECT r.department_id
                        FROM roles r, employees e, departments d
                        WHERE e.employee_id = ?
                            AND r.role_id = e.role_id
                            AND r.department_id = d.department_id
                    )
                    GROUP BY role_id
                )
                AND e.employee_id != ?`,
            [id, id],
            (err, result) => {
                if (err) throw err;

                res(result);
            })
    })
}

function getEmployeesByDepartmentId(id) {
    return new Promise((res, rej) => {
        connection.query(`
            SELECT e.employee_id, e.first_name, e.last_name FROM departments d, roles r, employees e
	            WHERE d.department_id = r.department_id
                AND d.department_id = ?
                AND e.role_id = r.role_id`,
            [id],
            (err, result) => {
                if (err) throw err;

                res(result);
            })
    })
}

async function init() {
    await testConnection();

    async function main() {
        const where = await inquirer.prompt({
            name: 'value',
            type: 'list',
            choices: initOptions,
            message: 'What would you like to do?'
        })

        await mainRoute(where);

        main();
    }

    main();
}

init();
