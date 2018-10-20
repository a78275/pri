var http = require('http')
var url = require('url')
var fs = require('fs')
var pug = require('pug')
var parser = require('xml2json')

var estilo = /w3\.css/
var index = /index/
var obra = /obra/

/* Gera o ficheiro de índice com a lista das obras (xml). */
fs.readdir('./obras/', (err, files) => {
    var h = '<?xml version="1.0" encoding="UTF-8"?>\n<obras>\n'
    fs.writeFile('./index.xml', h, (err) => {  
        if (err) throw err
    })
    files.forEach(file => {
        fs.readFile('./obras/'+file, (erro, dados)=>{
            if (erro) {
                console.log(erro)
            }
            else {
                var myObj = JSON.parse(dados);
                var lista = '\t<obra>\n\t\t<id>'+myObj._id+'</id>\n\t\t<nome>'+myObj.titulo+'</nome>\n\t</obra>\n'
                fs.appendFileSync('./index.xml', lista)
            }
        })
    })
    fs.appendFileSync('./index.xml', '</obras>')
})

http.createServer((req,res)=>{
    var purl = url.parse(req.url,true)
    console.log('Recebi um pedido: ' + purl.pathname)
    if (estilo.test(purl.pathname)) {
        res.writeHead(200,{'Content-Type': 'text/css'})
        fs.readFile('./estilo/w3.css', (erro, dados)=>{
            if (!erro) {
                res.write(dados)
            }
            else {
                res.write('<p><b>ERRO: </b> ' + erro + '</p>')
            }
            res.end()
        })
    }
    else if (obra.test(purl.pathname)) {
        var ficheiro = purl.pathname.split('/')[2] + '.json'
        console.log('Lendo o ficheiro: ' + ficheiro)
        res.writeHead(200,{'Content-Type': 'text/html'})
        fs.readFile('./obras/'+ficheiro, (erro, dados)=>{
            if (!erro) {
                var myObj = JSON.parse(dados)
                res.write(pug.renderFile('template.pug',{obr: myObj}))
            }
            else {
                res.write('<p><b>ERRO: </b> ' + erro + '</p>')
            }
            res.end()
        })
    }
    else if(index.test(purl.pathname)) {
        res.writeHead(200,{'Content-Type': 'text/html'})
        fs.readFile('./index.xml', (erro, dados)=>{
            if (!erro) {
                /* sem JSON. era uma string; assim é objeto */
                var myObj = JSON.parse(parser.toJson(dados))
                res.write(pug.renderFile('index.pug',{ind: myObj}))
            }
            else {
                res.write('<p><b>ERRO: </b> ' + erro + '</p>')
            }
            res.end()
        })
    }
    else {
        res.writeHead(200,{'Content-Type': 'text/html'})
        res.write('<p><b>ERRO: </b>' + purl.pathname + '</p>')
        res.write('<p>Rota desconhecida...</p>')
    }
}).listen(6600, ()=> {
    console.log('Servidor à escuta na porta 6600...')
})