const fs = require('fs')

async function all() {
    var inp = fs.readFileSync('./public/assets/words.txt', {encoding: 'UTF-8'});
    inp = inp.split('\n');

    console.log(inp)
    var out = inp.filter(item => item.length == 5)

    fs.writeFileSync('./public/assets/words.json', JSON.stringify(out))

    console.log(inp.length, out.length)
}

async function simple() {
    var inp = fs.readFileSync('./public/assets/simple.txt', {encoding: 'UTF-8'});
    inp = inp.split('\r\n');

    console.log(inp)
    var out = inp.filter(item => item.length == 5)

    fs.writeFileSync('./public/assets/simple.json', JSON.stringify(out))

    console.log(inp.length, out.length)
}

all()
simple()