// let activities = [
//     ['Work', 9],
//     ['Eat', 1],
//     ['Commute', 2],
//     ['Play Game', 1],
//     ['Sleep', 7]
// ];

// console.log(activities[0][1]);


// const fs = require("fs");
// fs.writeFile('state.txt', 'false', err => {
//     if (err) throw err;
//     console.log('State File set to false');
// });
    
// fs.readFile('state.txt', (err, data) => {
//     if(data == "true"){
//         app.get("/", (req, res) => {
//             res.sendFile(__dirname + "/index.html")
//         });
//     }
// });
// const mysql = require('mysql');

// const con = mysql.createConnection({
//     host: 'localhost',
//     user: process.env.USER,
//     port: process.env.DBPORT,
//     password: process.env.PASSWORD
// });

// var useDatabase = 
//     `USE coffee`
//     con.query(useDatabase, (err, result) => {
//         if(err) throw err;
//         console.log("Used.");
// });

// var data = [];
// var selectCountryQuery = `SELECT * FROM Company`
// // `SELECT Company.CompanyName, Country.CountryName, Company.Buy, Company.Sell\
// // FROM Company\
// // INNER JOIN Country ON Company.CountryID = Country.CountryID\
// // WHERE Country.CountryName = '${search}';`
// con.query(selectCountryQuery, (err, result) =>{
//     if(err) throw err;
//     console.log("Result: " + result);
//     data.push(result);
//     console.log("Data: " + data);
//     console.log("Got Country query from DB");
// });


var dataPoints = ["CompanyName", "PartyName", "Buy", "Sell"]
console.log(dataPoints[0]);

//newListItems[i]["CompanyName"]