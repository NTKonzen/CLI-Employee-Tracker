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

connection.connect((err, res) => {
    if (err) throw err;
    console.log(`Connection made at id ${connection.threadId}`)
});

const initOptions = ['View All Employees', 'View All Roles', 'View All Departments'];

console.log(wordart);

function mainRoute(route) {
    return new Promise((res, rej) => {
        if (route.value === initOptions[0]) {
            connection.query('SELECT * FROM employees', (err, result) => {
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
        }
    })
};

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
