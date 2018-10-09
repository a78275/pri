var http = require('http')
var url = require('url')
var fs = require('fs')

http.createServer((req, res)=>{
    res.writeHead(200, {'Content-Type': 'text/html'})
    var purl = url.parse(req.url, true)
    console.log(purl)
    var q = purl.query
    var file
    if (purl.path=='/obras')
        file = './website/index.html'
    else
        file = "./website/html/" + q.id + ".html" 
    fs.readFile(file, function(error, data) {
        if(!error) 
            res.write(data)
        else 
            res.write(error)
        res.end()
    })
}).listen(1150,()=>{
    console.log('Servidor está à escuta na porta 1150...')
})

/* */