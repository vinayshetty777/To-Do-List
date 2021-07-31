//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ =require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect('mongodb+srv://admin-vinay:test123@cluster0.hzcwl.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema= {
  name: String
};

const Item=mongoose.model("Item",itemSchema);

const item1=new Item({
  name: "Welcome to your to do list."
});

const item2=new Item({
  name: "Hit the + button to add new items."
});

const item3=new Item({
  name: "<-- hit this to delete this item."
});

const defaultItems = [item1, item2, item3];

const listSchema={
  name: String,
  items: [itemSchema]
}

const List=mongoose.model("List",listSchema);
// //
// Item.insertMany(defaultItems, function(err) {
//  if(err){
//    console.log(err);
//   }
//  else {
//    console.log("successfully created DB");
//
//   }
// });

// Item.deleteMany({name: "Hit the + button to add new items."}, function(err) {
//   if(err){
//     console.log(err);
//   }
//   else {
//     console.log("successfully deleted DB");
//
//   }
// });





app.get("/",function(req,res){
  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){

      Item.insertMany(defaultItems, function(err) {
       if(err){
         console.log(err);
        }
       else {
         console.log("successfully created DB");

        }
      });
      res.redirect("/");

    }
    else{

        res.render("list", {listTitle: "Today", newListItems: foundItems});

    }




});


});


app.get("/:customListName", function(req,res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){

    if(!err){
      if(!foundList){

        const list=new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+ customListName);

      }
      else{
         res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });




});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;

  const item=new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }


});


 
app.post("/delete", function(req, res){
  const delname = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(delname, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: delname}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }


});




app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started successfully");
});
