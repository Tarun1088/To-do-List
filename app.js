require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
const PORT = process.env.PORT || 3000;
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://" +
    process.env.SECRET_KEY +
    "@cluster0.a9ndabw.mongodb.net/todolistDB"
);

const itemSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemSchema);

const LitsSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("List", LitsSchema);

const item1 = new Item({
  name: "Wellcome to your todolist",
});
const item2 = new Item({
  name: "Hit the + button to add a new item.",
});
const item3 = new Item({
  name: "← hit this to delete an item",
});

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
  Item.find({})
    //(start of function)
    .then((foundItems) => {
      if (foundItems.length === 0) {
        return Item.insertMany(defaultItems);

        //(end of function if foundItems.length === 0)
        //from start to end function will return(what ever is inside the finction when ever it is called)
      } else {
        return foundItems;
      }
    })
    //so whatever (if) statement returns will rendered by below code:
    .then((foundItems) => {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    })
    .catch((err) => {
      console.log(err);
    });
});

//too understand below code go to code (tiger)
app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    item
      .save()
      .then(() => res.redirect("/"))
      .catch((err) => {
        console.log(err);
      });
  } else {
    List.findOne({ name: listName })
      .then((foundList) => {
        foundList.items.push(item);
        return foundList.save();
      })
      .then(() => res.redirect("/" + listName))
      .catch((err) => {
        console.log(err);
      });
  }
});

app.post("/delete", (req, res) => {
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkItemId)
      .then(() => res.redirect("/"))
      .catch((err) => {
        console.log(err);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkItemId } } }
    )
      .then(() => res.redirect("/" + listName))
      .catch((err) => {
        console.log(err);
      });
  }
});

//code: tiger
app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }).then(function (foundList) {
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      list.save().then(() => res.redirect("/" + customListName));
    } else {
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items,
      });
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
