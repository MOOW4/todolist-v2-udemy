//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });
const itemsSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
});
const Item = mongoose.model("Item", itemsSchema);

const item_1 = new Item({
	name: "Welcome to Your todolist!",
});
const item_2 = new Item({
	name: "Hit the + button to add a new item.",
});
const item_3 = new Item({
	name: "<-- Hit this to delete an item",
});
const defaultItems = [item_1, item_2, item_3];

const listSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	items: [itemsSchema],
});
const List = mongoose.model("List", listSchema);

//* /////////////////// ROUTES ///////////////////////////

app.get("/", function (req, res) {
	const day = date.getDate();

	Item.find({}).then((foundItems) => {
		if (foundItems.length == 0) {
			Item.insertMany(defaultItems)
				.then(() => {
					console.log("Succesfully saved");
				})
				.catch((error) => {
					console.log(error);
				});
			res.redirect("/");
		} else {
			res.render("list", { listTitle: day, newListItems: foundItems });
		}
	});
});

app.post("/", function (req, res) {
	const createdItem = new Item({
		name: req.body.newItem,
	});
	createdItem
		.save()
		.then((savedItem) => {
			console.log("Item saved:", savedItem);
		})
		.catch((error) => {
			console.error("Error saving item:", error);
		});

	res.redirect("/");
	/* 	if (req.body.list === "Work") {
		workItems.push(item);
		res.redirect("/work");
	} else {
		items.push(item);
		res.redirect("/");
	} */
});

app.post("/delete", (req, res) => {
	//console.log(req.body);
	const checkedItemId = req.body.checkbox;
	Item.findByIdAndDelete(checkedItemId)
		.then((removedtem) => {
			console.log("Item removed:", removedtem);
			res.redirect("/");
		})
		.catch((error) => {
			console.error("Error saving item:", error);
		});
});

/* app.get("/work", function (req, res) {
	res.render("list", { listTitle: "Work List", newListItems: workItems });
}); */

app.get("/:listName", (req, res) => {
	//const day = date.getDate();
	const customListName = req.params.listName;
	List.findOne({ name: customListName })
		.then((foundList) => {
			//# FOUND
			if (!foundList) {
				const list = new List({
					name: customListName,
					items: defaultItems,
				});
				list.save();
				console.log("Saved");
				res.redirect("/"+customListName);
			} 
			//! NOT FOUND
			else {
				console.log("Exists");
				res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
			}
		});
});

app.get("/about", function (req, res) {
	res.render("about");
});

app.listen(3000, function () {
	console.log("Server started on port 3000");
});
