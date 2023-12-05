const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const dotenv = require("dotenv");


const homeStartingContent = "Welcome to my personal Blog website!"
const aboutContent = "My name is Levi and i am a web developer. On this website, i write daily about my coding journey, the programming languages i use in these projects. The first language was HTML, after that came CSS and the later i started learning Javascript. It is amazing to be able to build beautiful websites. I practice everyday to become better at web development.";
const contactContent = "For any questions, please feel free to contact me using the email address below. I would gladly answer your emails regarding my coding experiences and tech-related posts. Email: example@example.com";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true});

const { ObjectId } = require('mongodb'); 



app.use(bodyParser.json());


const posts = [
  { _id: '65664d1a4cd3c1046b4eba44', field1: 'value1', field2: 'value2' },
  
];


app.get('/api/posts/:postId', (req, res) => {
  const requestedPostId = req.params.postId;
  const post = posts.find((p) => p._id === requestedPostId);

  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});


app.put('/api/posts/:postId', (req, res) => {
  const updatedPost = req.body;
  const postId = req.params.postId;
  const index = posts.findIndex((p) => p._id === postId);

  if (index !== -1) {
    
    posts[index] = { ...posts[index], ...updatedPost };
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});


const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);


const getPosts = async () => {
  try {
    return await Post.find({});
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};


const savePost = async (post) => {
  try {
    await post.save();
  } catch (error) {
    console.error("Error saving post:", error);
    throw error;
  }
};


const getPostById = async (postId) => {
  try {
    return await Post.findOne({_id: postId});
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    throw error;
  }
};

app.get("/", async (req, res) => {
  try {
    const posts = await getPosts();
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/compose", (req, res) => {
  res.render("compose");
});

app.post("/edit", async (req, res) => {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });
});


app.post("/compose", async (req, res) => {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  
  try {
    await savePost(post);
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/posts/:postId", async (req, res) => {
  const requestedPostId = req.params.postId;

  try {
    const post = await getPostById(requestedPostId);
    res.render("post", {
      title: post.title,
      content: post.content
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/about", (req, res) => {
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", (req, res) => {
  res.render("contact", {contactContent: contactContent});
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});