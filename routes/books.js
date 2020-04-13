const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'images/gif']


router.get('/', async (req, res) => {
    let query = Book.find()
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try {
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    }
    catch{
        res.redirect('/')
    }

})

router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})

router.post('/', async (req, rsp) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    })
    saveCover(book, req.body.cover)
    try {
        const newBook = await book.save()
        rsp.redirect(`books/${newBook.id}`)
    }
    catch{
        renderNewPage(rsp, book, true)
    }
})

router.get('/:id', async (req, rsp) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec()
        rsp.render('books/show', {
            book: book
        })
    }
    catch{
        rsp.redirect('/')
    }
})

router.get('/:id/edit', async (req, rsp) => {
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(rsp, book)
    }
    catch{
        rsp.redirect('/')
    }
})

router.put('/:id', async (req, rsp) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        if(req.body.cover!=null && req.body.cover!=''){
            saveCover(book, req.body.cover)
        }
        await book.save()
        rsp.redirect(`/books/${book.id}`)
    }
    catch{
        if(book!=null){
            renderEditPage(rsp, book, true)
        }else{
            rsp.redirect('books')
        }
    }

    
})

router.delete('/:id', async (req, rsp) => {
    let book
    try{
        book = Book.findById(req.params.id)
        await book.remove()
        rsp.redirect('/books')
    }
    catch{
        if(book!=null){
            rsp.render('books/show',{
                book: book,
                errorMessage: 'Error deleting the book'
            })
        }
        else{
            rsp.redirect('/')
        }
    }
})

function renderNewPage(rsp, book, hasError) {
    renderFormPage(rsp, 'new', book)
}

function renderEditPage(rsp, book, hasError) {
    renderFormPage(rsp, 'edit', book)
}

async function renderFormPage(res, formType, book, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError){
            if(formType === 'edit'){
                params.errorMessage = 'Error Updating Book'
            }
            else{
                params.errorMessage = 'Error Creating Book'
            }
        } 
        res.render(`books/${formType}`, params)
    }
    catch{
        res.redirect('/books')
    }
}

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

module.exports = router