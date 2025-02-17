const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

function getItemData(item){
    return new Promise((resolve,reject)=>{
        try {
            resolve(item);
        } catch(err) {
            reject(err);
        }
    })
}

public_users.post("/register",function (req,res) {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({"username":username,"password":password});
            return res.status(200).json({message: "User successfully registred. Now you can login"});
        } else {
        return res.status(404).json({message: "User already exists!"});
        }
    } else {
        return res.status(404).json({message: "Unable to register user."});
    }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    getItemData(books).then(
        (books) => res.send(JSON.stringify(books,null,4)),
        (err) => console.log('Error getting book list')
    )    
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    getItemData(book).then(
        (book) => (book) ? res.send(book) : res.send("Unable to find book!"),
        (err) => console.log("Error getting book data")
    )    
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const booksByAuthor = Object.values(books).filter((book) => book.author === author);
    getItemData(booksByAuthor).then(
        (booksByAuthor) => (booksByAuthor.length > 0) ? res.send(booksByAuthor) : res.send("Unable to find book!"),
        (err) => console.log("Error getting books by author data")
    )
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const booksByTitle = Object.values(books).filter((book) => book.title === title);
    getItemData(booksByTitle).then(
        (booksByTitle) => (booksByTitle.length > 0) ? res.send(booksByTitle) : res.send("Unable to find book!"),
        (err) => console.log("Error getting books by author data")
    )
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book){
        const reviews = book.reviews;
        res.send(reviews);
    } else {
        res.send("Unable to find book!");
    }
});

module.exports.general = public_users;
