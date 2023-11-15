const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let existingUsers = users.filter((user)=>{
        return user.username === username
    });

    if(existingUsers.length > 0){
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let authenticatedUsers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });

    if(authenticatedUsers.length > 0){
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", function (req,res) {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }

    if (authenticatedUser(username,password)) {
        let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = { accessToken,username };
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    };
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;     
    let book = books[isbn];
    if (book) {
        let userReview = req.body.review;
        if (userReview){
            const reviews = book.reviews;
            if (reviews){
                const review = reviews[username];
                reviews[username] = userReview;
                if (review){                    
                    return res.status(200).json({message: `User's ${username} review for the book with the isin ${isbn} has been updated.`});
                } else {                    
                    return res.status(200).json({message: `User's ${username} review for the book with the isin ${isbn} has been added.`});
                }
            }
        } else {
            res.send("Unable to add a review!");
        }
    } else {
        res.send("Unable to find book!");
    }
});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;     
    let book = books[isbn];
    if (book) {
        let reviews = book.reviews;
        const userReview = reviews[username];
        if (userReview){
            delete reviews[username];
            return res.status(200).json({message: `User's ${username} review for the book with the isin ${isbn} has been deleted.`});
        } else {
            res.send("Unable to find a review!");
        }
    } else {
        res.send("Unable to find book!");
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
