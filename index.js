var inquirer = require("inquirer");
var printf   = require("printf");
var util     = require("util");
const mysql  = require('mysql');

const employee   = "employee";
const role       = "role";
const department = "department";
// let departments = [
//     { 
//         name: "Engineering",
//         key: 1
//     },
//     {
//         name: "Sales",
//         key: "2"
//     },
//     {
//         name: "Legal",
//         key: 3
//     },
//     {
//         name: "Finance",
//         key: 4
//     }
// ];

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

function getDepartments() {
    let departments = [];
    connection.query('SELECT name FROM department', function (err, data) {
        if (err) throw err;
        data.forEach(element => departments.push(element.name));
    })
    return departments;
}

function askQuestions() {
    getDepartments();
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
        // console.log(answers);
        switch (answers.choice) {
            case "View all employees":
                getAllEmployees()
                break;

            case "View all employees by department":
                getEmployeesByDepartment()
                break;

            case "Add employee":
                getMultiEntryArtistData()
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
    connection.query('SELECT * FROM employee', function (err, data) {
        if (err) throw err;
        console.table(data);
        askQuestions();
    })
}

function getEmployeesByDepartment() {
    connection.query('SELECT name FROM department', function (err, results) {
        if (err) throw err;
        //console.log(results[0].name);
        
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
                let query = 'SELECT * FROM employee WHERE manager_id = ? ';
                connection.query(query, chosenDpt, function (err, data) {
                    if (err) throw err;
                    console.table(data);
                       askQuestions();
                })
            })
    });
}

function artistSearch() {
    inquirer
      .prompt({
        name: "artist",
        type: "input",
        message: "What artist would you like to search for?"
      })
      .then(function(answer) {
        var query = "SELECT position, song, year FROM top5000 WHERE ?";
        connection.query(query, { artist: answer.artist }, function(err, res) {
          if (err) throw err;
          for (var i = 0; i < res.length; i++) {
            console.log("Position: " + res[i].position + " || Song: " + res[i].song + " || Year: " + res[i].year);
          }
          runSearch();
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
    console.log(printf("////////////////////////////////////////////////////////////"));
    console.log(printf("/                                                          /"));
    console.log(printf("/     ////  /   /  ////  /    ///  /   /  ////  ////       /"));
    console.log(printf("/     /     // //  /  /  /    / /   / /   /     /          /"));
    console.log(printf("/     //    / / /  ////  /    / /    /    //    //         /"));
    console.log(printf("/     /     /   /  /     /    / /    /    /     /          /"));
    console.log(printf("/     ////  /   /  /     ///  ///    /    ////  ////       /"));
    console.log(printf("/                                                          /"));
    console.log(printf("/      /   /    /    /  /    /    ////  ////  ////         /"));
    console.log(printf("/      // //   / /   // /   / /   /     /     /  /         /"));
    console.log(printf("/      / / /   / /   / //   / /   / //  //    //           /"));
    console.log(printf("/      /   /  /   /  /  /  /   /  /  /  /     / /          /"));
    console.log(printf("/      /   /  /   /  /  /  /   /  ////  ////  /  /         /"));
    console.log(printf("/                                                          /"));
    console.log(printf("////////////////////////////////////////////////////////////"));
}