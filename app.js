//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://serhiiunhurian:bZC7jwTeTyqVZ1p1@cluster0.opoewic.mongodb.net/todolistDB");

const itmesSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itmesSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add an item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = ({
  name: String,
  items: [itmesSchema]
});

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
          if (!err) {
            console.log("Succesfully saved default items to database.");
          }
      });
      res.redirect("/");
    }
    else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

});


app.post("/delete", function(req, res) {

  const checkedItemId = req.body.checkedItem;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Succesfully removed checked item.");
        res.redirect("/");
      }
    });
  }
  else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }

});

app.get("/:customeListName", function(req, res) {

  const customListName = _.capitalize(req.params.customeListName);

  List.findOne({name: customListName}, function(err, foundListName) {
    if (!foundListName) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    }
    else {
      res.render("list", {listTitle: foundListName.name, newListItems: foundListName.items});
    }
  });


});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
