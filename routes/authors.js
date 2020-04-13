const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')


router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null || req.query.name != '') {
        searchOptions.name = RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors: authors,
            searchOptions: req.query
        })
    }
    catch{
        res.redirect('/')
    }
})

router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() })
})

router.post('/', (req, rsp) => {
    const author = new Author({
        name: req.body.authorName
    })
    author.save((err, newAuthor) => {
        if (err) {
            rsp.render('authors/new', {
                author: author,
                errorMessage: 'Error creating author'
            })
        }
        else {
            rsp.redirect(`authors/${newAuthor.id}`)
        }
    })

})

router.get('/:id', async (req, rsp) => {
  try{
    const author = await Author.findById(req.params.id)
    const books = await Book.find({author:author.id}).limit(10).exec()
    rsp.render('authors/show',{
        author: author,
        booksByAuthor: books
    })
  }
  catch{
    rsp.redirect('authors')
  }
})

router.get('/:id/edit', async (req, rsp) => {

    try {
        const author = await Author.findById(req.params.id);
        rsp.render('authors/edit', { author: author })
    }
    catch{
        rsp.redirect('/authors')
    }

})

router.put('/:id', async (req, rsp) => {
    let author
    try{
        author = await Author.findById(req.params.id)  
        author.name = req.body.authorName
        await author.save()
        rsp.redirect(`/authors/${req.params.id}`)
    }
    catch{
        if(author == null){
            rsp.redirect('/')
        }else{
            rsp.render('authors/edit', {
                author: author,
                errorMessage: 'Error updating author'
            })
        }
    }
})

router.delete('/:id', async (req, rsp) => {
    let author
    try{
        author = await Author.findById(req.params.id)  
        await author.remove()
        rsp.redirect('/authors')
    }
    catch(err){
        if(author == null){
            rsp.redirect('/')
        }else{
            rsp.redirect(`/authors/${author.id}`)
        }
    }
})

module.exports = router