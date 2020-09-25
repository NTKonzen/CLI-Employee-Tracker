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

const initOptions = ['View All Employees', 'View All Roles', 'View All Departments', 'View All Employees by Department', 'Exit Program'];

console.log(wordart);

function testConnection() {
    return new Promise((res, rej) => {
        connection.connect((err, response) => {
            if (err) throw err;
            console.log(`Connection made at id ${connection.threadId}`)
            res();
        });
    })
}

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
                d.name "Department"
            FROM
	            employees e,
	            roles r,
	            departments d
            WHERE 
            	e.role_id = r.role_id
                AND r.department_id = d.department_id
            ORDER BY e.employee_id;
            `,
                (err, result) => {
                    if (err) throw err;
                    console.log('')
                    console.table(result)
                    res();
                });
        } else if (route.value === initOptions[1]) {
            connection.query('SELECT * FROM roles', (err, result) => {
                if (err) throw err;

                console.log('')
                console.table(result)
                res();
            });
        } else if (route.value === initOptions[2]) {
            connection.query('SELECT * FROM departments', (err, result) => {
                if (err) throw err;

                console.log('')
                console.table(result)
                res();
            });
        } else if (route.value === initOptions[3]) {
            const departments = await getDepartments();
            const departmentsArray = []

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
