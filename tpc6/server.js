var http = require('http')
var url = require('url')
var pug = require('pug')
var fs = require('fs')
var {parse} = require('querystring')
var jsonfile = require('jsonfile')

var mybd = "teses.json"

var myServer = http.createServer((req,res)=>{
    var purl = url.parse(req.url,true)
    var query = purl.query

    console.log("Recebi o pedido: " + req.url)
    console.log("Com o método : " + req.method)

    if (req.method == 'GET') {
        if(purl.pathname == '/paginicial') {
            res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
            res.write(pug.renderFile('templates/pag_inicial.pug'))
            res.end()
        }
        if(purl.pathname == '/registo') {
            res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
            res.write(pug.renderFile('templates/registo.pug'))
            res.end()
        }
        else if (purl.pathname == '/lista') {
            jsonfile.readFile(mybd, (erro, teses) => {
                res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
                if(!erro) {
                    res.write(pug.renderFile('templates/lista-teses.pug', {lista: teses}))
                }
                else {
                    res.write(pug.renderFile('templates/erro.pug', {e: erro}))
                }
                res.end()
            })
        }
        //processa pedidos diretamente pelo url
        else if (purl.pathname == '/processaForm') {
            res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
            res.write(pug.renderFile('templates/tese-recebida.pug', {tese: query}))
            res.end()
        }
        else if (purl.pathname == '/w3.css') {
            res.writeHead(200, {'Content-Type': 'text/css;charset=utf-8'})
            fs.readFile('stylesheets/w3.css', (erro,dados)=>{
                if(!erro)
                    res.write(dados)
                else    
                    res.write(pug.renderFile('templates/erro.pug', {e: erro}))
                res.end()
            }) 
        }
        else {
            res.writeHead(501, {'Content-Type': 'text/html;charset=utf-8'})
            res.end('ERRO: ' + purl.pathname + ' não está implementado...')
        }
    }
    else if (req.method == 'POST') {
        if (purl.pathname == '/processaForm') {
            recuperaInfo(req, resultado => {
                jsonfile.readFile(mybd, (erro,teses) => {
                    if (!erro) {
                        teses.push(resultado)
                        console.dir(teses)
                        jsonfile.writeFile(mybd, teses, erro2 => {
                            if (!erro2)
                                console.log("Registo gravado com sucesso!")
                            else
                                console.log("ERRO: " + erro2)
                        })
                    }
                    else 
                        console.log("ERRO: " + erro)
                })
                res.end(pug.renderFile('templates/tese-recebida.pug', {tese: resultado}))
            })
        }
        else {
            res.writeHead(501, {'Content-Type': 'text/html;charset=utf-8'})
            res.end('ERRO: ' + purl.pathname + ' não está implementado...')
        }
    }
    else {
        res.writeHead(503, {'Content-Type': 'text/html;charset=utf-8'})
        res.end('ERRO: ' + req.method + ' não é suportado...')
    }
})

myServer.listen(4006, ()=> {
    console.log('Servidor à escuta na porta 4006...')
})

function recuperaInfo(request, callback) {
    //método post pode enviar a informação do body de duas formas, url-encoded ou por vários pacotes
    const FORM_URLENCODED = 'application/x-www-form-urlencoded'
    if (request.headers['content-type'] == FORM_URLENCODED) {
        var body = ""
        request.on('data', chunk => {
            body += chunk.toString()
        }) 
        request.on('end', () => {
            callback(parse(body))
        })
    }
    else {
        callback(null)
    }
}