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
    mainHeader();
    askQuestions();
});

function askQuestions() {
    inquirer.prompt({
        message: "what would you like to do?",
        type: "list",
        choices: [
            "View all employees",
            "View all employees by department",
            "View all roles",
            "Add employee",
            "Add department",
            "Add role",
            "Update employee role",
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

            case "View all roles":
                getAllRoles()
                break;

            case "Add employee":
                addEmployee()
                break;

            case "Add department":
                addDepartment()
                break;

            case "Add role":
                addRole()
                break;

            case "Update employee role":
                updateRole()
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

function getAllRoles() {    
    connection.query('SELECT role.title, role.salary, department.name FROM department JOIN role ON role.department_id = department.id', function (err, res)
    {
        if (err) throw err;
        console.table(res);    
        askQuestions();    
    })
}

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
            if (roles[index].title === answer.role) break;
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

  function addDepartment() {
  
    inquirer
      .prompt([{
            name: "department",
            type: "input",
            message: "What is new department name?"
        }])
      .then(function(answer) {
        connection.query("INSERT INTO department SET ?", 
        {
            name: answer.department          
        }, function (err, res) {
            if (err) throw err;
            console.log("Employee was added to the database.");
            askQuestions();
        });
        
      });
  }

  function addRole() {
    var departments;
    connection.query('SELECT name FROM department', function (err, res)
    {
        if (err) throw err;
        departments = res;    
    }) 
    inquirer
      .prompt([{
            name: "role",
            type: "input",
            message: "What is new role title?"
        },
        {
            name: "salary",
            type: "input",
            message: "What is new role salary"
        },
        {
            name: "department",
            type: "list",
            message: "What is the department of the new role?",
            choices: function() {
                return departments;
            }
        }
    ])
      .then(function(answer) {
        for(var index = 1; index >= departments.length; index++){
            if (departments[index] === answer.department) break;
        } 
        connection.query("INSERT INTO role SET ?", 
        {
            title: answer.role,
            salary: answer.salary,
            department_id: index

        }, function (err, res) {
            if (err) throw err;
            console.log("Employee was added to the database.");
            askQuestions();
        });
        
      });
  }

function updateRole() {  
    var first_names = [];
    var last_names = [];
    var roles;
    connection.query('SELECT first_name, last_name FROM employee', function (err, res)
    {
        if (err) throw err;
        res.forEach( element => first_names.push(element.first_name));
        res.forEach( element => last_names.push(element.last_name));
    console.log(first_names);
    })
    connection.query('SELECT role.title FROM role', function (err, res)
    {
        if (err) throw err;
        roles = res;        
    })
    
    inquirer
      .prompt([
        {
            name: "first_name",
            type: "list",
            message: "Choose employee first name:",
            choices: function() {
                return first_names;
            }
        },
        {
            name: "last_name",
            type: "list",
            message: "Choose employee last name:",
            choices: function() {
                return last_names;
            }
        },
        {
            name: "role",
            type: "list",
            message: "What is the employee's role",
            choices: function() {
                return roles;
            }
        }])
      .then(function(answer) {
        for(var index = 1; index >= roles.length; index++){
            if (roles[index] === answer.role) break;
        }         
        connection.query("UPDATE employee SET ? WHERE ?",
        [
        {
            role_id: index,
        },
        {
            first_name: answer.first_name,
            last_name: answer.last_name
        }
        ], function (err, res)
        {
            if (err) throw err;
            console.table(res);    
            askQuestions();    
        });
    });
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