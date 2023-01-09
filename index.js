
//express dependencies:
const express = require("express");
const bodyParser = require("body-parser");

//environment variables config
require("dotenv").config();

//csv dependencies:
const {parse} = require("csv-parse");

const fs = require("fs");
const app = express();

////Use this to see the static file css pages: 
app.use(express.static("public"));

//view engine to use ejs feature
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

//----------------------------MYSQL (local database) script here: ---------------------------------------
// implement the logic if it has a database created then
const mysql = require('mysql');

const con = mysql.createConnection({
    host: 'localhost',
    user: process.env.USER,
    port: process.env.DBPORT,
    password: process.env.PASSWORD
});

con.connect((err) => {
if (err){
    throw err;
} else {
    console.log('Connected to MySQL Server!')
}});

    
app.get("/createDatabase", (req, res) => {
    var createDatabase = 
    `CREATE DATABASE IF NOT EXISTS coffee`
    con.query(createDatabase, (err, result) => {
        if(err) throw err;
        console.log("Database created.");
    });

    var useDatabase = 
    `USE coffee`
    con.query(useDatabase, (err, result) => {
        if(err) throw err;
        console.log("Used.");
    });
});

app.get("/createTables", (req, res) => {
    //Create Party Table
    var createPartyTable = 
    "CREATE TABLE IF NOT EXISTS Party(PartyID INT NOT NULL AUTO_INCREMENT, PartyName varchar(256), PRIMARY KEY(PartyID));"
    con.query(createPartyTable, (err, result) =>{
        if(err) throw err;
            console.log("Party Table has been created");
    });

    //Create Country Table
    var createCountryTable =
    "CREATE TABLE IF NOT EXISTS Country(CountryID INT NOT NULL AUTO_INCREMENT, CountryName varchar(256), PRIMARY KEY(CountryID));" 
    con.query(createCountryTable, (err, result) =>{
        if(err) throw err;
            console.log("Country Table has been created");
    });

    //Create Company Table
    var createCompanyTable =
    "CREATE TABLE IF NOT EXISTS Company(CompanyID INT NOT NULL AUTO_INCREMENT PRIMARY KEY, PartyID INT NOT NULL," +
    "FOREIGN KEY (PartyID) REFERENCES Party(PartyID)," + 

    "CountryID INT NOT NULL," + 
    "FOREIGN KEY (CountryID) REFERENCES Country(CountryID)," + 

    "CompanyName varchar(256),  Buy INT, Sell INT);"
    con.query(createCompanyTable, (err, result) =>{
        if(err) throw err;
            console.log("Company Table has been created");
    });
});

app.use("/insertData", (req, res) => {
    //Get csv file and INSERT the csv data into MYSQL.
    var csvData = [];
    fs.createReadStream("TradePrices.csv")

    //skip the first row from the csv file
    //https://stackoverflow.com/questions/21040675/how-to-skip-first-lines-of-the-file-with-node-csv-parser
    .pipe(parse({from_line: 2}))
    .on("data", row => {
        //Push all the row into the csvData (2 multidimensional array)
        csvData.push(row);
        
    }).on('end', () => {
        const arrayData = csvData.map(eachText => eachText);

        //lists of countries and how many types of party names are they available.
        countryList = []
        partyTypeList = []

        arrayData.forEach((eachData, count) => {
            const [partyType, country] = eachData;

            if(!countryList.includes(country)){
                countryList.push(country)
            }

            if(!partyTypeList.includes(partyType)){
                partyTypeList.push(partyType)
            }
        });

        //Use INSERT Commands:
        //INSERT 2 tables first before the Company Table.

        countryList.forEach(eachCountry => {
            // INSERT Country Table:
            var insertCountries = 
            `INSERT INTO Country(CountryName) VALUES ('${eachCountry}');`
            con.query(insertCountries, (err, result) => {
                if(err) throw err;
                console.log("Country data inserted.");
            });
        });

        partyTypeList.forEach(eachParty => {
            // INSERT Party Table:
            var insertParty = 
            `INSERT INTO Party(PartyName) VALUES ('${eachParty}');`
            con.query(insertParty, (err, result) => {
                if(err) throw err;
                console.log("Party data inserted.");
            });
        });

        //INSERT Company Table:
        arrayData.forEach(eachData => {
            const [partyType, companyName, country, buy, sell] = eachData;
            partyID = 0;
            countryID = 0;

            switch (partyType){
                case "Farmer":
                    partyID = 1;
                    break
                case "Miller":
                    partyID = 2;
                    break
                case "Roaster":
                    partyID = 3;
                    break
                case "Merchant":
                    partyID = 4;
                    break
            }
            
            //Assuming there is only 4 countries and not adding more data
            switch (country){
                case "Brazil":
                    countryID = 1;
                    break
                case "Columbia":
                    countryID = 2;
                    break
                case "Kenya":
                    countryID = 3;
                    break
                case "Mexico":
                    countryID = 4;
                    break
            }

            var insertCompany = 
            `INSERT INTO Company(PartyID, CountryID, CompanyName, Buy, Sell) 
            VALUES (${partyID}, ${countryID}, '${companyName}', ${buy == '' ? 0 : buy}, ${sell == '' ? 0 : sell} );`
            con.query(insertCompany, (err, result) => {
                if(err) throw err;
                console.log("Company Data inserted.");
            });
        });
    })
});

//start the index.html file main page
app.get("/", res => {
    res.sendFile(__dirname + "/index.html")
});


//If the user has pressed search then search in the database and extract the results:

app.post("/", (req, res) => {
    const search = req.body.search;
    // console.log(`search: ${search}`);
    
    var useDatabase = 
    `USE coffee`
    con.query(useDatabase, err => {
        if(err) throw err;
        console.log("Used.");
    });

    var selectCountryResults = [];
    var selectCountryQuery = 
    // `SELECT Party.PartyName,
    // Company.CompanyName, Company.Buy, Company.Sell,
    // Country.CountryName
    // FROM Party
    // INNER JOIN Company ON Party.PartyID =  Company.PartyID
    // INNER JOIN Country ON Company.CountryID = Country.CountryID
    // WHERE Party.PartyName = "${search}";`

    `SELECT Party.PartyName,
    Company.CompanyName, Company.Buy, Company.Sell,
    Country.CountryName
    FROM Party
    INNER JOIN Company ON Party.PartyID =  Company.PartyID
    INNER JOIN Country ON Company.CountryID = Country.CountryID
    WHERE Country.CountryName = "${search}";`
    con.query(selectCountryQuery, (err, result) =>{
        if(err) throw err;

        for(var i=0; i < result.length; i++) {
            //write your code for each object in the results here
            var companyName = result[i];
            //console.log(countryID);
            selectCountryResults.push(companyName);
        }
        
        if(selectCountryResults.length > 0){
            res.render("search", {x: 1, type: "Party Type", searchType: "Search results for " + search, num: selectCountryResults.length, newListItems: selectCountryResults})
        }

        console.log("Got Country query from DB");
    });

    //specific parties only
    //eg display all companies that has farmers
    var companyPartyResults = [];
    var selectCompanyNameQuery = 
    `SELECT Party.PartyName,
    Company.CompanyName, Company.Buy, Company.Sell,
    Country.CountryName
    FROM Party
    INNER JOIN Company ON Party.PartyID =  Company.PartyID
    INNER JOIN Country ON Company.CountryID = Country.CountryID
    WHERE Party.PartyName = "${search}";`
    con.query(selectCompanyNameQuery, (err, result) =>{
        if(err) throw err;

        for(var i=0; i < result.length; i++) {
            //write your code for each object in the results here
            var companyName = result[i];
            //console.log(companyName);
            companyPartyResults.push(companyName);
        }

        //parse the values to the search.ejs results:
        if(companyPartyResults.length > 0){
            res.render("search", {x: 2, type: "Country", searchType: "Search results for " + search, num: companyPartyResults.length, newListItems: companyPartyResults})
        }else{
            res.render("search", {x: 3, type: "☹️", searchType: "No results", num: 0, newListItems: companyPartyResults})
        }
        console.log("Got Party query from DB");
    });
});

app.listen(process.env.PORT, () => console.log(`Port listening at ${process.env.PORT}`));