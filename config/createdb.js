const Sequelize = require("sequelize");
// load the database data from .env file
require("dotenv").config();
const sequelize = new Sequelize(process.env.dburl);

const normalize = {
	timestamps: false,
	freezeTableName: true,
};

sequelize
	.authenticate()
	.then(() => {
		console.log("Connection has been established successfully.");
		// print name of database
		console.log(sequelize.config.database);
	})
	.catch((err) => {
		console.error("Unable to connect to the database:", err);
	});

// user relation with role and ic_type as foreign key
const User = sequelize.define(
	"USER",
	{
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		email: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		password: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		ic: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		phone: {
			type: Sequelize.STRING,
			allowNull: false,
		},
	},
	normalize
);

const Role = sequelize.define(
	"ROLE",
	{
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: Sequelize.STRING,
			allowNull: false,
		},
	},
	normalize
);
const User_has_Role = sequelize.define("USER_has_ROLE", {}, normalize);

Role.belongsToMany(User, {
	through: User_has_Role,
	foreignKey: "role_id",
});
User.belongsToMany(Role, {
	through: User_has_Role,
	foreignKey: "user_id",
});

const IC_type = sequelize.define(
	"IDENTITY_CARD_TYPE",
	{
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: Sequelize.STRING,
			allowNull: false,
		},
	},
	normalize
);
User.belongsTo(IC_type, { foreignKey: "ic_type_id" });
IC_type.hasMany(User, { foreignKey: "ic_type_id" });

const Parking_lot = sequelize.define(
	"PARKING_LOT",
	{
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		address: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		capacity: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		total_parked: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		key_needed: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
		},
	},
	normalize
);
// Relation owner with parking lot
User.hasMany(Parking_lot, { foreignKey: "owner_id" });
Parking_lot.belongsTo(User, { foreignKey: "owner_id" });
// Relation Employee with parking Parking_lot
const Employee_works_in_Parking_lot = sequelize.define(
	"EMPLOYEE_works_in_PARKING_LOT",
	{},
	normalize
);
User.belongsToMany(Parking_lot, {
	through: Employee_works_in_Parking_lot,
	foreignKey: "employee_id",
});
Parking_lot.belongsToMany(User, {
	through: Employee_works_in_Parking_lot,
	foreignKey: "parking_lot_id",
});
// Driver can rate the parking lot and the parking lot can rate the Driver
const Rating = sequelize.define(
	"RATING",
	{
		comment_parking_lot: {
			type: Sequelize.STRING,
		},
		comment_driver: {
			type: Sequelize.STRING,
		},
		rating_parking_lot: {
			type: Sequelize.INTEGER,
		},
		rating_driver: {
			type: Sequelize.INTEGER,
		},
	},
	normalize
);
User.belongsToMany(Parking_lot, {
	through: Rating,
	foreignKey: "driver_id",
});
Parking_lot.belongsToMany(User, {
	through: Rating,
	foreignKey: "parking_lot_id",
});

const Vehicle_type = sequelize.define(
	"VEHICLE_TYPE",
	{
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: Sequelize.STRING,
			allowNull: false,
		},
	},
	normalize
);

const Vehicle = sequelize.define(
	"VEHICLE",
	{
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		plate_number: {
			type: Sequelize.STRING,
			allowNull: false,
		},
	},
	normalize
);
Vehicle.belongsTo(Vehicle_type, { foreignKey: "vehicle_type_id" });
Vehicle_type.hasMany(Vehicle, { foreignKey: "vehicle_type_id" });

const Parking_history = sequelize.define(
	"PARKING_HISTORY",
	{
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		booking_start_time: {
			type: Sequelize.DATE,
		},
		booking_end_time: {
			type: Sequelize.DATE,
		},
		start_time: {
			type: Sequelize.DATE,
			allowNull: false,
		},
		end_time: {
			type: Sequelize.DATE,
			allowNull: false,
		},
		parking_time: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		price: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
	},
	normalize
);
Vehicle.belongsToMany(Parking_lot, {
	through: Parking_history,
	foreignKey: "vehicle_id",
});
Parking_lot.belongsToMany(Vehicle, {
	through: Parking_history,
	foreignKey: "parking_lot_id",
});

sequelize.sync({ force: process.env.force_sync }).then(() => {
	console.log(`Database & tables created!`);
	Role.bulkCreate([
		{ name: "Employee" },
		{ name: "Driver" },
		{ name: "Owner" },
		{ name: "Admin" },
	]);
	IC_type.bulkCreate([
		{ name: "National ID" },
		{ name: "Passport" },
		{ name: "Driving License" },
	]);
	Vehicle_type.bulkCreate([
		{ name: "Car" },
		{ name: "Motorcycle" },
		{ name: "Bicycle" },
	]);
	User.bulkCreate([
		{
			username: "admin",
			password: "admin",
			email: "admin@gmail.com",
			role_id: 4,
			ic_type_id: 1,
			ic: "123456789",
			phone: "0123456789",
			address: "Jalan Bukit Bintang",
			name: "Admin",
		},
	]);
});
