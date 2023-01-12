
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
const { json } = require("body-parser");

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

    
app.get("/createData", (req, res) => {
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

        console.log(arrayData);

        arrayData.forEach((eachData, count) => {
            //destruct from an array.
            //order of the position is very important to insert data in the DB.
            const [partyType, companyName, country, buy, sell] = eachData;

            console.log(country);

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
    });
    res.sendFile(__dirname + "/create.html");
});

//start the index.html file main page
app.get("/", (req, res) => {
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
            res.render("search", {x: 1, y: 0, type: "Party Type", searchType: "Search results for " + search, num: selectCountryResults.length, newListItems: selectCountryResults})
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
            res.render("search", {x: 2, y: 0, type: "Country", searchType: "Search results for " + search, num: companyPartyResults.length, newListItems: companyPartyResults})
        }
        console.log("Got Party query from DB");
    });

    //company names only
    var companyResults = [];
    var selectCompanyQuery = `SELECT Company.CompanyName, Party.PartyName, Company.Buy, Company.Sell, Country.CountryName 
    FROM Company
    INNER JOIN Country ON Company.CountryID = Country.CountryID
    INNER JOIN Party ON Company.PartyID = Party.PartyID
    WHERE Company.CompanyName = "${search}";`
    con.query(selectCompanyQuery, (err, result) =>{
        if(err) throw err;

        for(var i=0; i < result.length; i++) {
            //write your code for each object in the results here
            var companyName = result[i];
            //console.log(countryID);
            companyResults.push(companyName);
        }
        
        if(companyResults.length > 0){
            res.render("search", {x: 3, y: 1, type: "Country", searchType: "Search results for " + search, num: companyResults.length, newListItems: companyResults})
        } else {
            res.render("search", {x: 4, y: 0, type: "☹️", searchType: "No results", num: 0, newListItems: companyPartyResults})
        }

        console.log("Got Country query from DB");
    });
});


app.get("/tax", (req, res) => {
    res.sendFile(__dirname + "/tax.html")
})

//Logic of how to calculate
app.post("/tax", (req, res) => {
    const farmer = req.body.farmer;
    const merchant = req.body.merchant;
    const ton = Math.round(req.body.ton);

    var useDatabase = 
    `USE coffee`
    con.query(useDatabase, err => {
        if(err) throw err;
        console.log("Used.");
    });

    var companyFramerMillers = [];
    var companyRoasters = [];

    var profitFarmerMiller = {};
    var nestedMillersProfit = {};
    var merchantProfit = {};

    tax = 0.105;
    var selectFramerMillersQuery = 
    `SELECT Party.PartyName, Company.CompanyName, Company.Buy, Company.Sell, Country.CountryName
    FROM Company 
    INNER JOIN Party ON Company.PartyID = Party.PartyID
    INNER JOIN Country ON Company.CountryID = Country.CountryID
    WHERE (Company.CompanyName = "${farmer}" OR Party.PartyID BETWEEN 2 AND 3);`

    con.query(selectFramerMillersQuery, (err, result) =>{
        if(err) throw err;
        
        result.forEach(eachFarmerMillers => {
            var partyType = eachFarmerMillers.PartyName;
            if(partyType == "Farmer" || "Miller"){
                var farmerMillerData = eachFarmerMillers;
                companyFramerMillers.push(farmerMillerData);
            }else{
                var farmerRoasterData = eachFarmerMillers;
                companyRoasters.push(farmerRoasterData);
            }
        });

        var farmerSell = companyFramerMillers[0]["Sell"];
        var framerCountry = companyFramerMillers[0]["CountryName"];

        //make it more readable by using forEach loops:
        for(var i=1; i < companyFramerMillers.length; i++) {
            millerBuyMiller = companyFramerMillers[i]["Buy"];
            if(farmerSell <= millerBuyMiller){
                var millerCountry = companyFramerMillers[i]["CountryName"];

                if(framerCountry == millerCountry){
                    var millerBuy = companyFramerMillers[i]["Buy"];
                    
                    var netProfit = (ton * (millerBuy - (farmerSell + (farmerSell * tax))));
                    var name = companyFramerMillers[i]["CompanyName"];
                
                    profitFarmerMiller[name] = netProfit;
                }else{
                    var millerBuy = companyFramerMillers[i]["Buy"];
                    var netProfit = (millerBuy - farmerSell) * ton;
                    var name = companyFramerMillers[i]["CompanyName"];
                    
                    profitFarmerMiller[name] = netProfit;
                }
            }
        }

        //Check for every Roaster's buy price and calculate the net profit
        //from Millers
        //start the index by 1 since it begins a Miller Object.

        var millers = companyFramerMillers.slice(1);
        millers.forEach(eachMiller => {
            nestedMillersProfit[eachMiller.CompanyName] = {};
        });
        //console.log("nestedMillersProfit: " + nestedMillersProfit["Fresh Millers"]);

        companyRoasters.forEach(eachRoaster => {
            //console.log("eachRoaster: " + JSON.stringify(eachRoaster));
            millers.forEach(eachMiller => {
                var eachMillerCompany = eachMiller.CompanyName;
                var eachRoasterCompany = eachRoaster.CompanyName;

                var millerCountry = eachMiller.CountryName;
                var roasterCountry = eachRoaster.CountryName;

                var millerSellPrice = eachMiller.Sell;
                var roasterBuyPrice = eachRoaster.Buy;

                //console.log("row millerCountry: " + millerCountry + ". roasterCountry: " + roasterCountry);
                
                //Calculate net profit:
                if(millerSellPrice <= roasterBuyPrice){
                    //Country Tax
                    if(millerCountry == roasterCountry){
                        var netProfit = (ton * (roasterBuyPrice - (millerSellPrice + (millerSellPrice * tax))));
                        
                        var millerName = eachMillerCompany;
                        var roasterName = eachRoasterCompany;
                        
                        nestedMillersProfit[millerName][roasterName] = netProfit;
                        
                    }else{
                        var netProfit = (roasterBuyPrice - millerSellPrice) * ton;
                        
                        var millerName = eachMillerCompany;
                        var roasterName = eachRoasterCompany;
                        
                        nestedMillersProfit[millerName][roasterName] = netProfit;
                    }
                }

            })
        })
        //console.log("nestedMillersProfit: " + JSON.stringify(nestedMillersProfit));
    });

     //Merchant: 
     var merchantQuery = 
     `SELECT Party.PartyName, Company.CompanyName, Company.Buy, Company.Sell, Country.CountryName
     FROM Company 
     INNER JOIN Party ON Company.PartyID = Party.PartyID
     INNER JOIN Country ON Company.CountryID = Country.CountryID
     WHERE (Company.CompanyName = "${merchant}" OR Party.PartyID = 3);`
     
     con.query(merchantQuery, (err, result) =>{
        if(err) throw err;

        //continue code here
        var merchantBuy = 0;
        var merchantCountry = result[0].CountryName;

        result.reverse().forEach(merchantRoasters => {
            //check if the party name is a Merchant.
            //console.log(JSON.stringify(merchantRoasters));
            var partyName = merchantRoasters.PartyName;
            var country = merchantRoasters.CountryName;

            //console.log(JSON.stringify(partyName));
            if(partyName == "Merchant"){
                merchantBuy = merchantRoasters.Buy;
            }else{
                roasterSell = merchantRoasters.Sell;
                //console.log("Buy: " + merchantBuy + "Sell: " + roasterSell);
                if(country == merchantCountry){
                    var netProfit = (ton * (merchantBuy - (roasterSell + (roasterSell * tax))));
                    var roasterName = merchantRoasters.CompanyName;
                
                    merchantProfit[roasterName] = netProfit;
                }else{
                    var netProfit = (merchantBuy - roasterSell) * ton;
                    var roasterName = merchantRoasters.CompanyName;
                
                    merchantProfit[roasterName] = netProfit;
                }
            }
            //console.log("as: " + JSON.stringify(merchantProfit));
        });
        //summary of profits:
        console.log("profitFarmerMiller: " + JSON.stringify(profitFarmerMiller));
        console.log("nestedMillersProfit: " + JSON.stringify(nestedMillersProfit));
        console.log("merchantProfit: " + JSON.stringify(merchantProfit));
     });
    
    //if time, find the sell from farmer and buy from merchant
    console.log(companyFramerMillers[0]);
    res.render("tax", {ton: ton, farmer: farmer, merchant: merchant, sell: 400, buy: 1050})
})

app.listen(process.env.PORT, () => console.log(`Port listening at ${process.env.PORT}`));