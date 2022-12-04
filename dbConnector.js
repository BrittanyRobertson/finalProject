
//Connect DB to Application
const knex = require("knex")({
	client: "pg",
	connection: {
		// name : "familydb",
		host : "product-management-final.ccskqgut1dam.us-west-2.rds.amazonaws.com",
		user : "postgres",
		password : "334yh1i2rb",
		database : "familydb",
		port : 5432
	}
}); 

module.exports = knex
