const express = require("express");
const { UserModel, TodoModel} = require("./db");
const {auth, JWT_SECRET} = require("./auth");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const bcrypt = require("bcrypt");
const {z} = require("zod");

mongoose.connect("mongodb+srv://pawank050520k:Pawank050520k%40@cluster0.rs0up.mongodb.net/todo-database");

const app = express();
app.use(express.json());

app.post("/signup", async function(req, res){
    //check that the password has 1 uppercase char, 1 lowercase char, 1 special charcter
    const requirebody = z.object({
        email: z.string().min(3).max(100).email(),
        name: z.string().min(3).max(100),
        passsword: z.string().min(3).max(30)
    });
    const parsedDataWithSuccess = requirebody.safeParse(req.body);
    
    if (!parsedDataWithSuccess.success){
        res.json({
            message: "Incorrect format",
            error: parsedDataWithSuccess.error
        })
    }

    const email= req.body.email;
    const password= req.body.password;
    const name = req.body.name;

    const hashedPassword = await bcrypt.hash(password, 5);
    console.log(hashedPassword);

    await UserModel.create({
        email: email,
        password: hashedPassword,
        name: name
    })

    res.json({
        message: "You are signed up"
    })
});

app.post("/signin", async function(req, res){
    const email = req.body.email;
    const password = req.body.password;
    
    const response = await UserModel.findOne({
        email: email
    })

    if (!response) {
        res.status(403).json
    }
    const passwordMatch = await bcrypt.compare(password, response.password);

    console.log(response);

    if (passwordMatch){
        const token = jwt.sign({
            id: response._id
        }, JWT_SECRET);
        res.json({
            token: token
        })
    } else {
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }
});

app.post("/todo", auth, async function(req, res){
    const userId = req.userId;
    const title = req.body.title;
    const done = req.body.done;

    await TodoModel.create({
        userId,
        title,
        done
    })

    res.json({
        message: "Todo created"
    })
});

app.get("/todos", auth, async function(req, res){
    const userId = req.userId;

    const todos = await TodoModel.find({
        userId
    })

    res.json({
        todos
    })
});

app.listen(3000, () => {
    console.log("server is running on port 3000");
}); 