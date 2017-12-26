const express = require('express')
const router = express.Router();


//Bring in Models
let Article = require('../models/article')

let User = require('../models/user')



//Add Route
router.get('/add',ensureAuthenticated, function(req, res) {
  res.render('add_article', {
    title: "Add Articles"
  })
})


//Load Edit Form
router.get('/edit/:id',ensureAuthenticated, function(req, res) {
  Article.findById(req.params.id, function(err, article) {
    res.render('edit_article', {
      title: "Edit Article",
      article: article
    });
  });
});

//Submit Edited The Article
router.post('/edit/:id', function(req, res) {
  let article = {}
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;
  let query = {
    _id: req.params.id
  }

  Article.update(query, article, function(err) {
    if (err) {
      console.log(err);
    } else {
      req.flash('success', 'Article Updated')
      res.redirect('/')
    }
  })
  return;
});

//Delete Article
router.delete('/:id', function(req, res) {
  let query = {
    _id: req.params.id
  }

  Article.remove(query, function(err) {
    if (err) {
      console.log(err);
    }
    res.send('Success')

  })
})





//Add Submit Post Route
router.post('/add', function(req, res) {
  req.checkBody('title', 'Title is required').notEmpty();
  // req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();

  // Get Errors
  let errors = req.validationErrors();

  if (errors) {
    console.log(errors.msg);
    res.render('add_article', {
      title: 'Add Article',
      errors: errors
    })
  } else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save(function(err) {
      if (err) {
        console.log(err);
        return;
      } else {
        req.flash('success', 'Article Added')
        res.redirect('/')
      }
    })
  }
})
// Get Single Article___Just a note that this block should be put to the bottom
router.get('/:id', function(req, res) {
  Article.findById(req.params.id, function(err, article) {
    User.findById(article.author,function(err,user){
    res.render('article', {
      article: article,
      author:user.name})})
})
})

// Access control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next()
  }else{
    req.flash('danger', 'Please login')
    res.redirect('/users/login');
  }
}
//In order to access from outside
module.exports = router;
