var inquirer = require("inquirer");
var printf   = require("printf");
var util     = require("util");
const mysql  = require('mysql');

const employee   = "employee";
const role       = "role";
const department = "department";

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "password",
    database: "employees_DB"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    askQuestions();
});

async function getRoleId(role_id) {
    connection.query('SELECT title FROM role WHERE id = ?', role_id, function (err, role) {
        if (err) throw err;        
        return role[0].title;
    });
}

function askQuestions() {
    mainHeader();
    inquirer.prompt({
        message: "what would you like to do?",
        type: "list",
        choices: [
            "View all employees",
            "View all employees by department",
            "Add employee",
            "Remove employee",
            "View all roles",
            "QUIT"
        ],
        name: "choice"
    }).then(answers => {
        switch (answers.choice) {
            case "View all employees":
                getAllEmployees()
                break;

            case "View all employees by department":
                getEmployeesByDepartment()
                break;

            case "Add employee":
                addEmployee()
                break;

            case "Remove employee":
                getSongData()
                break;

            case "View all roles":
                chartTimeRelease()
                break;

            default:
                connection.end()
                break;
        }
    })
}

function getAllEmployees() {    
    connection.query('SELECT employee.first_name AS `First Name`, employee.last_name `Last Name`, employee.role_id, employee.manager_id, role.id, role.title AS `Role`, role.salary AS `Salary` FROM employee INNER JOIN role ON employee.role_id = role.id', function (err, data) {
        if (err) throw err;
        data.forEach( element => {
            delete element.role_id;
            delete element.manager_id;
            delete element.id;
        })
        console.table(data);
        askQuestions();
    })
}

function getEmployeesByDepartment() {
    connection.query('SELECT name FROM department', function (err, results) {
        if (err) throw err;
        
        inquirer
            .prompt({
                message: "Choose department:",
                name: "choice",
                type: "list",
                choices: function() {
                    var choiceArray = [];
                    for (var i = 0; i < results.length; i++) {
                        choiceArray.push(results[i].name);
                    }
                    return choiceArray;
                }
            })
            .then(function(answer){
                //departments.find( ({ name }) => name === answer.choice)
                //let chosenDepartment = results.find( ({name}) => name === answer.choice).name;   
                //let chosenDepartment = results.indexOf(answer.choice);
                let chosenDpt;
                for( let index = 0; index < results.length; index++)
                {
                    if (results[index].name === answer.choice) chosenDpt = ++index;
                }          
                // let query = 'SELECT * FROM employee WHERE manager_id = ? ';
                let managerInfo = [];
                connection.query('SELECT employee.first_name AS `First Name`, employee.last_name AS `Last Name`, employee.role_id, employee.manager_id, role.id, role.title AS `Role`, role.salary AS `Salary` FROM employee JOIN role ON employee.role_id = ? AND role.title = ? AND role.department_id = ?', [ chosenDpt, 'Manager', chosenDpt], function (err, manager) {
                        if (err) throw err;        
                        managerInfo = manager;
                });
               
                let query = 'SELECT employee.first_name AS `First Name`, employee.last_name `Last Name`, employee.role_id, employee.manager_id, role.id, role.title AS `Role`, role.salary AS `Salary` FROM employee INNER JOIN role ON employee.role_id = role.id AND employee.manager_id = ?';
                connection.query(query, chosenDpt, function (err, data) {
                    if (err) throw err;
                    data.push(managerInfo[0]);
                    data.forEach(element => {
                        delete element.role_id;
                        delete element.manager_id;
                        delete element.id;
                    });
                    console.table(data);
                    askQuestions();
                })
            })
    });
}
//SELECT * FROM employee.first_name, employee.last_name, manager.first_name AS manager_First, manager_last LEFT JOIN employee AS manager ON employee.manager_id = manager.id

//SELECT * FROM employee.first_name, employee.last_name, manager.first_name AS manager_First, manager_last 
//LEFT JOIN empoloyee AS manager ON employee.manager_id = manager.id
//JOIN role ON employee.role_id = role.id

//SELECT employee.id as 'Employee ID', employee.first_name AS 'First Name', employee.last_name AS 'Last Name', role.title AS 'Role', role.salary AS 'Salary',
//department.name AS 'Department', manager.first_name AS 'Manager First', manager.last_name AS 'Manager Last'
//FROM employee 
//LEFT JOIN employee ON employee.manager_id = manager.id
//LEFT JOIN role ON employee.role_id = role.id
//LEFT JOIN department ON role.department_id = department_id;


function addEmployee() {
    let roles;
    let managers;
    connection.query('SELECT title FROM role', function (err, res)
    {
        if (err) throw err;
        roles = res;
        
    })
    connection.query('SELECT * FROM employee WHERE manager_id IS null', function (err, res)
    {
        if (err) throw err;
        managers = res;    
    })   
    inquirer
      .prompt([{
            name: "first_name",
            type: "input",
            message: "What is the employee's first name?"
        },
        {
            name: "last_name",
            type: "input",
            message: "What is the employee's last name?"
        },
        {
            name: "role",
            type: "list",
            choices: function() {
                var choiceArray = [];
                for (var i = 0; i < roles.length; i++) {
                    choiceArray.push(roles[i].title);
                }
                return choiceArray;
            }        
        },
        {
            name: "manager",
            type: "list",
            choices: function() {
                var choiceArray = [];
                for (var i = 0; i < managers.length; i++) {
                    choiceArray[i] = managers[i].first_name + " " + managers[i].last_name;
                }
                return choiceArray;
            }
        }])
      .then(function(answer) {
        for(var index = 1; index >= roles.length; index++){
            if (roles[index].title === answer.role);
            console.log(roles[index].title, answer.role, index);            
            break;
        } 
        connection.query("INSERT INTO employee SET ?", 
        {
            first_name: answer.first_name,
            last_name: answer.last_name,
            role_id: index           
        }, function (err, res) {
            if (err) throw err;
            console.log("Employee was added to the database.");
            askQuestions();
        });
        
      });
  }

function getRangedData() {
    inquirer.prompt([
        {
            type: "number",
            name: "start",
            message: "which position to start at?"
        },
        {
            type: "number",
            name: "end",
            message: "which position to end at?"
        }
    ]).then(function (rangedAnswers) {
        console.log(rangedAnswers);
        connection.query('SELECT * FROM top5000 WHERE position BETWEEN ? AND ?', [rangedAnswers.start, rangedAnswers.end], function (err, data) {
            if (err) throw err;
            console.table(data);
            askQuestions();
        })
    })
}

function getMultiEntryArtistData() {
    connection.query(" SELECT artist, COUNT(artist) AS count FROM top5000 GROUP BY artist HAVING count>1 ORDER BY count DESC",function(err,data){
        if(err) throw err;
        console.table(data);
    })
}


function mainHeader() {
    console.log("////////////////////////////////////////////////////////////");
    console.log("/                                                          /");
    console.log("/     ////  /   /  ////  /    ///  /   /  ////  ////       /");
    console.log("/     /     // //  /  /  /    / /   / /   /     /          /");
    console.log("/     //    / / /  ////  /    / /    /    //    //         /");
    console.log("/     /     /   /  /     /    / /    /    /     /          /");
    console.log("/     ////  /   /  /     ///  ///    /    ////  ////       /");
    console.log("/                                                          /");
    console.log("/      /   /    /    /  /    /    ////  ////  ////         /");
    console.log("/      // //   / /   // /   / /   /     /     /  /         /");
    console.log("/      / / /   / /   / //   / /   / //  //    //           /");
    console.log("/      /   /  /   /  /  /  /   /  /  /  /     / /          /");
    console.log("/      /   /  /   /  /  /  /   /  ////  ////  /  /         /");
    console.log("/                                                          /");
    console.log("////////////////////////////////////////////////////////////");
}