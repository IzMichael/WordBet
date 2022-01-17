const fs = require('fs');

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

async function all() {
    var inp = fs.readFileSync('./public/assets/words.txt', {encoding: 'UTF-8'});
    inp = inp.split('\n');

    console.log(inp)
    var out = inp.filter(item => item.length == 5)
    shuffle(out)

    fs.writeFileSync('./public/assets/words.json', JSON.stringify(out))

    console.log(inp.length, out.length)
}

async function simple() {
    var inp = fs.readFileSync('./public/assets/simple.txt', {encoding: 'UTF-8'});
    inp = inp.split('\r\n');

    console.log(inp)
    var out = inp.filter(item => item.length == 5)
    shuffle(out)

    fs.writeFileSync('./public/assets/simple.json', JSON.stringify(out))

    console.log(inp.length, out.length)
}

// all()
simple()