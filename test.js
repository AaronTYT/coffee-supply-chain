
// Thinking Process:

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

//if same key, it overwrites from the latest object
//before: b = 2, after: b = 4
const target = { a: 1, b: 2 };
const source = { b: 4, c: 5 };

const returnedTarget = Object.assign(target, source);
console.log(returnedTarget);

// const t = {};
// for(i = 0; i < 2; i++){
//     Object.assign(t, {b: 4});
// }
// console.log(t);

// const nestedObject = {};
// Object.assign(nestedObject, {Miller: {Roaster: 4}});
// Object.assign(nestedObject, {d: {e: 4}});
// console.log(nestedObject);

// nestedObject = {};

// names = ["Fresh Millers", "Mount Millers"];

// for(var i = 0; i < names.length; i++){
//     nestedObject[names[i]] = {};
// }

nestedObjectTest = {}
millersArray = ["Fresh Millers", "Mount Millers", "Easy Milling"]
roasterArray = ["We Roast Beans", "Burnt Beans"];

//Creates a dynamic object within an object using nestedObjectTest
//Created two key pairs from eachMiller: 
//{ 'We Roast Beans': 600, 'Burnt Beans': 600 }
millersArray.forEach(eachMiller => {
    nestedObjectTest[eachMiller] = {};
});

console.log(nestedObjectTest);

roasterArray.forEach((eachRoaster, count) => {
    millersArray.forEach(eachMiller => {
        nestedObjectTest[eachMiller][eachRoaster] = 600;
    });
})

console.log(nestedObjectTest);


// nestedObject = {};

// //Fresh Millers
// var millerName = "Fresh Millers";
// var roasterName = "We Roast Beans";
// nestedObject[millerName][roasterName] = 600;

// var roasterName2 = "Burnt Beans";
// nestedObject[millerName][roasterName2] = 700;

// //Mount Millers
// var millerName2 = "Mount Millers";
// var roasterName2 = "We Roast Beans";
// nestedObject[millerName2][roasterName2] = 6000;

// var roasterName3 = "Burnt Beans";
// nestedObject[millerName2][roasterName3] = 700;

// console.log(nestedObject);

const months = ['Jan', 'March', 'April', 'June'];

// var end = months.at(-1)
// months.splice(0, 0, end)
// months.pop();
// console.log(months);

// months.splice(1, 0, 'Feb');
// // Inserts at index 1
// console.log(months);
// // expected output: Array ["Jan", "Feb", "March", "April", "June"]

// months.splice(4, 1, 'May');
// // Replaces 1 element at index 4
// console.log(months);
// expected output: Array ["Jan", "Feb", "March", "April", "May"]

var a = ["Roaster 1", "Roaster 2", "Merchant"];

var end = a.at(-1)
a.splice(0, 0, end)
a.pop();

a.forEach(num => console.log(num));

var roaster1 = {"PartyName":"Roaster","CompanyName":"We Roast Beans","Buy":800,"Sell":1000,"CountryName":"Brazil"}
var roaster2 = {"PartyName":"Roaster","CompanyName":"Burnt Beans","Buy":800,"Sell":1100,"CountryName":"Mexico"}
var merchant = {"PartyName":"Merchant","CompanyName":"Gold Coffee Merchants","Buy":1050,"Sell":0,"CountryName":"Brazil"}

console.log(roaster1);


