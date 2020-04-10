const express = require('express')
const router = express.Router()
const Author = require('../models/author')


router.get('/', async (req, res) => {
    let searchOptions = {}
    if(req.query.name!=null || req.query.name!=''){
        searchOptions.name = RegExp(req.query.name, 'i') 
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index',{
            authors:authors,
            searchOptions : req.query
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
            rsp.redirect('authors')
        }
    })

})

module.exports = router