<svelte:head>
    <title>WordBet - By IzMichael</title>
</svelte:head>

<script>
    import { SvelteToast, toast } from '@zerodevx/svelte-toast'
    import Row from './lib/Row.svelte';
    import Square from './lib/Square.svelte';
    import { onMount } from 'svelte';

    let input = '     ',
    all, simple,
    allowinput, betinp,
    page = window.localStorage.getItem('played') == 'true' ? 'game' : 'intro';

    onMount(async () => {
        all = await fetch('/assets/words.json').then(res => {return res.json()});
        simple = await fetch('/assets/simple.json').then(res => {return res.json()});
        
        if (window.localStorage.getItem('played') !== 'true' || persistent.all[0].word == 'ABOUT') {
            persistent = {
                all: [],
                settings: {}
            };
            for (let i = 0; i < simple.length; i++) {
                const word = simple[i];
                persistent.all.push({
                    id: i+1,
                    word: word.toUpperCase(),
                    bet: 0,
                    played: false,
                    emojis: []
                })
            };
            persistent.settings = {
                order: 'random'
            };
            window.localStorage.setItem('gamescore', 0);
            window.localStorage.setItem('played', 'true');
        } else {
            if (!persistent.settings) {
                persistent.settings = {
                    order: 'random'
                };
            }
        };
        selectWord();
        allowinput = true;
        
        input = '';
    });

    async function selectWord(num) { 
        if (num) {
            gamedata.word = simple[parseInt(num)-1].toUpperCase();
        } else if (persistent.settings.order == 'sequence') {
            gamedata.word = simple[gamedata.wordid].toUpperCase();
        } else {                
            gamedata.word = simple[Math.floor(Math.random() * ((simple.length-1) - 0 + 1) + 0)].toUpperCase();
        }
        gamedata.wordid = [...persistent.all].filter(w => w.word == gamedata.word)[0].id;

        if (persistent.all[persistent.all.findIndex(w => w.word == gamedata.word)].played == true || persistent.all[persistent.all.findIndex(w => w.word == gamedata.word)].played == 'failed') {
            selectWord();
        };
    }
    
    function sleep(s) {
        return new Promise(resolve => setTimeout(resolve, (s * 1000)));
    }

    let alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    document.addEventListener('keydown', (e) => {
        if (allowinput == false) return;
        // input.replaceAll(' ', '')

        if (alpha.includes(e.key)) {
            input += e.key.toUpperCase();
            if (input.length > 5) {
                input = input.substring(0, 5);
            }
        };
        if (e.key == 'Backspace' || e.key == '←') {
            input = input.slice(0, -1);
        };
        if (e.key == 'Enter' || e.key == '⏎') {
            submit();
        }
    });
    
    let gamedata = {
        tries: [],
        used: {
            green: [],
            yellow: [],
            grey: []
        },
        word: '     ',
        wordid: 0,
        bet: 6,
        score: parseInt(window.localStorage.getItem('gamescore')) || 0
    };
    $: window.localStorage.setItem('gamedata', JSON.stringify(gamedata));
    $: window.localStorage.setItem('gamescore', parseInt(gamedata.score));
    $: if (gamedata.bet > 7) {
        gamedata.bet = 7;
    }

    let persistent = JSON.parse(window.localStorage.getItem('persistent')) || {all:[]};
    $: window.localStorage.setItem('persistent', JSON.stringify(persistent));

    async function submit() {
        betinp.disabled = true;

        if (all.includes(input.toLowerCase())) {
            gamedata.tries = [...gamedata.tries, input]

            for (let i = 0; i < input.length; i++) {
                if (gamedata.word[i] == input[i]) {
                    gamedata.used.green = [...gamedata.used.green, input[i]];
                    gamedata.used.green = gamedata.used.green.filter(function(item, pos, self) {
                        return self.indexOf(item) == pos;
                    });
                    gamedata.used.green = gamedata.used.green;
                } else if (gamedata.word.includes(input[i]) && !gamedata.word[i] == input[i]) {
                    gamedata.used.yellow = [...gamedata.used.yellow, input[i]];
                    gamedata.used.yellow = gamedata.used.yellow.filter(function(item, pos, self) {
                        return self.indexOf(item) == pos;
                    });
                    gamedata.used.yellow = gamedata.used.yellow;
                } else if (!gamedata.word.includes(input[i]) && !gamedata.word[i] == input[i]) {
                    gamedata.used.grey = [...gamedata.used.grey, input[i]];
                    gamedata.used.grey = gamedata.used.grey.filter(function(item, pos, self) {
                        return self.indexOf(item) == pos;
                    });
                    gamedata.used.grey = gamedata.used.grey;
                }
            }

            if (input == gamedata.word) {
                allowinput = false;
                toast.push(`<p class="font-bold">You Won!</p><p>+${(8 - gamedata.bet) * 5} Points</p>`, {
                    theme: {
                        '--toastBackground': 'lime',
                        '--toastColor': 'black',
                        '--toastBarBackground': 'green'
                    },
                    duration: 2500
                });

                gamedata.score += (8 - gamedata.bet) * 5;
                persistent.all[persistent.all.findIndex(w => w.word == gamedata.word)].bet = gamedata.bet;
                persistent.all[persistent.all.findIndex(w => w.word == gamedata.word)].played = true;
                persistent.all[persistent.all.findIndex(w => w.word == gamedata.word)].emojis = await toEmoji(gamedata.tries, gamedata.word);

                open();
            }
            
            input = '';
            await sleep(0.1);
            updateKeyboard();

            if (gamedata.tries.length >= gamedata.bet) {
                allowinput = false;       
                toast.push(`<p class="font-bold">You have run out of tries.</p><p>The correct word was: ${gamedata.word}.</p>`, {
                    theme: {
                        '--toastBackground': 'red',
                        '--toastColor': 'white',
                        '--toastBarBackground': 'darkred'
                    },
                    duration: 2500
                });

                persistent.all[persistent.all.findIndex(w => w.word == gamedata.word)].bet = gamedata.bet;
                persistent.all[persistent.all.findIndex(w => w.word == gamedata.word)].played = 'failed';
                persistent.all[persistent.all.findIndex(w => w.word == gamedata.word)].emojis = await toEmoji(gamedata.tries, gamedata.word);

                open();
            }
        } else {            
            toast.push(`<p class="font-bold">Not a word!</p><p>${input} is not a word.</p>`, {
                theme: {
                    '--toastBackground': 'red',
                    '--toastColor': 'white',
                    '--toastBarBackground': 'darkred'
                },
                duration: 2500
            });

            document.querySelector('.inputbg').style.borderColor = '#ee0000';
            await sleep(0.5)
            document.querySelector('.inputbg').style.borderColor = 'transparent';
            await sleep(0.5)
            document.querySelector('.inputbg').style.borderColor = '#ee0000';
            await sleep(0.5)
            document.querySelector('.inputbg').style.borderColor = 'transparent';
        }
    };    

    function next() {
        selectWord();
        
        allowinput = true;
        betinp.disabled = false;
        gamedata.tries = [], gamedata.used = { green: [], yellow: [], grey: [] };
        [...document.querySelectorAll('.key')]
        .forEach(a => a.classList.remove('green', 'yellow', 'grey'));

        isOpen = false;
    };

    async function toEmoji(tries, word) {
        let emojis = {
            green: '🟩',
            yellow: '🟨',
            grey: '⬜'
        };
        let output = [];

        for (let i = 0; i < tries.length; i++) {
            const attempt = tries[i].split('');
            let line = '';
            for (let i = 0; i < attempt.length; i++) {
                if (word[i] == attempt[i]) {
                    // Green
                    line += emojis.green;
                } else if (word.includes(attempt[i]) && word[i] !== attempt[i]) {
                    // Yellow
                    line += emojis.yellow;
                } else if (!word.includes(attempt[i])) {
                    // Grey
                    line += emojis.grey;
                }
            }
            output.push(line)
        }
        return output;
    }

    // Keyboard

    onMount(async () => {
        [...document.querySelectorAll('.key')]
            .filter(a => a.textContent)
            .forEach(a => {a.addEventListener('click', (e) => {
                document.dispatchEvent(new KeyboardEvent('keydown',{'key':a.textContent}));
            })})
    });

    async function updateKeyboard() {
        let keys = [...document.querySelectorAll('.key')].filter(a => a.textContent);
        
        await gamedata.used.grey.forEach(letter => {
            keys.filter(a => a.textContent == letter)[0].classList.add('grey')
        });
        await gamedata.used.yellow.forEach(letter => {
            keys.filter(a => a.textContent == letter)[0].classList.add('yellow')
        });
        await gamedata.used.green.forEach(letter => {
            keys.filter(a => a.textContent == letter)[0].classList.add('green')
        });
    };

    // Continue Dialog    
    import { DialogOverlay, DialogContent } from 'svelte-accessible-dialog';

    let isOpen;

    function open() {
        isOpen = true;
    };

    // Word List
    let wordlist;
    function searchwordlist(inp, slot) {
        let tr = wordlist.querySelectorAll('tr');
        for (let i = 0; i < tr.length; i++) {
            let td = tr[i].querySelectorAll('td')[slot];
            if (td) {
                if (td.innerHTML.toUpperCase().indexOf(inp.toUpperCase()) > -1) {
                    tr[i].style.display = '';
                } else {
                    tr[i].style.display = 'none'
                }
            }
        }
    }
</script>

<DialogOverlay {isOpen}>
    <DialogContent>
        <div class="flex flex-col items-center justify-center w-full h-full">
            <button on:click={next} class="p-2 px-10 bg-green-400 outline-none">Next Word</button>
        </div>
    </DialogContent>
</DialogOverlay>

<SvelteToast/>

<div class="flex flex-col items-center justify-start w-full h-full max-h-screen px-5 py-5 mx-auto lg:w-1/4 lg:px-0 {page == 'intro' ? '' : 'hidden'}">
    <h1 class="text-2xl font-bold text-center font-work">Welcome to WordBet!</h1>
    <p class="w-full mt-3 text-left text-md">The game is simple.<br>Your job is to find the hidden 5 letter word.</p>
    <p class="w-full my-2 text-left text-md">You can make guesses, but each guess must be a dictionary-listed 5 letter word.</p>
    <p class="w-full mb-3 text-left text-md">After a guess, the tiles' colour will reflect the position of that letter within the word.</p>
    
    <p class="w-full mt-2 font-bold text-center text-md">For example:</p>

    <p class="w-full my-1 text-sm text-left">A green tile means the letter is in the correct spot in the solution.</p>
    <div class="flex flex-row items-center w-full h-10 gap-2 justify-evenly">
        <Square value="W" word="WORDS" role="0" input="false"></Square>
        <Square value="A" word="WORDS" role="1" input="true"></Square>
        <Square value="L" word="WORDS" role="2" input="true"></Square>
        <Square value="T" word="WORDS" role="3" input="true"></Square>
        <Square value="Z" word="WORDS" role="4" input="true"></Square>
    </div>

    <p class="w-full my-1 text-sm text-left">A yellow tile means the letter is in the solution, but not this spot.</p>
    <div class="flex flex-row items-center w-full h-10 gap-2 justify-evenly">
        <Square value="F" word="WORDS" role="0" input="true"></Square>
        <Square value="R" word="WORDS" role="1" input="true"></Square>
        <Square value="O" word="WORDS" role="2" input="false"></Square>
        <Square value="Z" word="WORDS" role="3" input="true"></Square>
        <Square value="E" word="WORDS" role="4" input="true"></Square>
    </div>
    
    <p class="w-full my-1 text-sm text-left">A grey tile means the letter isn't in the solution at all.</p>
    <div class="flex flex-row items-center w-full h-10 gap-2 justify-evenly">
        <Square value="B" word="WORDS" role="0" input="true"></Square>
        <Square value="E" word="WORDS" role="1" input="true"></Square>
        <Square value="A" word="WORDS" role="2" input="true"></Square>
        <Square value="U" word="WORDS" role="3" input="true"></Square>
        <Square value="T" word="WORDS" role="4" input="false"></Square>
    </div>

    <button class="w-full p-2 px-5 mt-10 font-bold text-white bg-green-500 hover:bg-green-400 active:bg-green-500" on:click={() => page = 'game'}>Let's Play!</button>
</div>

<div class="flex flex-col items-center justify-start w-full h-full max-h-screen px-5 py-5 mx-auto lg:w-1/4 lg:px-0 {page == 'game' ? '' : 'hidden'}">    
    <h1 class="text-3xl font-bold font-work ahov" on:click={() => {page = 'list'}}>WordBet #{gamedata.wordid}</h1>
    <p class="w-full text-sm italic text-center">Created by IzMichael - Inspired by Wordle</p>

    <div class="flex flex-row items-center justify-start w-full p-1 mb-2 border border-gray-500">
        <div class="flex flex-row items-center justify-between flex-1">
            <p class="font-semibold whitespace-nowrap">Your Bet: </p>
            <input type="number" bind:value={gamedata.bet} bind:this={betinp} max=7 min=1 class="flex-1 pl-2 border-b border-black">
        </div>

        <div class="flex flex-row items-center justify-between flex-1">
            <p class="flex-1 pr-2 font-semibold text-right whitespace-nowrap">Your Score: </p>
            <p>{gamedata.score}</p>
        </div>

        <img src="/assets/img/gear.svg" class="w-8 h-8 ml-2 cursor-pointer select-none" on:click={() => page = 'settings'} alt="Settings">
    </div>

    <div class="relative flex flex-col items-center justify-start flex-1 w-full gap-2">
        <div class="w-full border inputbg" style="border-color: transparent;">
            <Row bind:word={gamedata.word} bind:value={input} input="true"></Row>
        </div>

        <hr class="w-full -my-1 transition-all duration-200 ease-linear border-gray-500" style="border-top-width: 0.125rem;">

        {#each gamedata.tries as attempt, i}
            <Row bind:word={gamedata.word} bind:value={attempt} input="false"></Row>
        {/each}

        {#each {length: (gamedata.bet - gamedata.tries.length)} as _, i}
            <Row bind:word={gamedata.word} value="     " input="true"></Row>
        {/each}

        <hr class="absolute top-0 w-full transition-all duration-200 ease-linear border-red-500" style="border-top-width: 0.125rem; margin-top: {3 * gamedata.bet + 3}rem;">
    </div>

    <div class="w-full mt-10">
        <div class="flex flex-col w-auto lg:left-0 keyboard-base lg:absolute lg:bottom-0 lg:w-full">
            <div class="flex flex-row justify-between flex-1 max-w-full">
                <div class="key">Q</div>
                <div class="key">W</div>
                <div class="key">E</div>
                <div class="key">R</div>
                <div class="key">T</div>
                <div class="key">Y</div>
                <div class="key">U</div>
                <div class="key">I</div>
                <div class="key">O</div>
                <div class="key">P</div>
            </div>
            <div class="flex flex-row justify-between flex-1 max-w-full">
                <div class="key u"></div>
                <div class="key">A</div>
                <div class="key">S</div>
                <div class="key">D</div>
                <div class="key">F</div>
                <div class="key">G</div>
                <div class="key">H</div>
                <div class="key">J</div>
                <div class="key">K</div>
                <div class="key">L</div>
                <div class="key u green"></div>
            </div>
            <div class="flex flex-row justify-between flex-1 max-w-full">
                <div class="key">←</div>
                <div class="key u yellow"></div>
                <div class="key">Z</div>
                <div class="key">X</div>
                <div class="key">C</div>
                <div class="key">V</div>
                <div class="key">B</div>
                <div class="key">N</div>
                <div class="key">M</div>
                <div class="key u grey"></div>
                <div class="key">⏎</div>
            </div>
        </div>
    </div>
</div>

<div class="flex flex-col items-center justify-start w-full h-full max-h-screen px-5 py-5 mx-auto lg:w-1/4 lg:px-0 {page == 'list' ? '' : 'hidden'}">
    <h1 class="text-3xl font-bold font-work ahov" on:click={() => {page = 'game'}}>All Words</h1>
    <p class="w-full text-sm italic text-center">{persistent.all.filter(w => w.played == true).length} Played / {persistent.all.length - persistent.all.filter(w => w.played == true).length} Remaining</p>
    
    <div class="flex flex-row items-center justify-start w-full my-2 border border-gray-500">
        <input on:keyup={(e) => searchwordlist(e.target.value, 0)} class="w-1/4 p-1 border-r border-gray-500 outline-none" placeholder="ID">
        <input on:keyup={(e) => searchwordlist(e.target.value, 1)} class="w-3/4 p-1 outline-none" placeholder="Search for a word...">
    </div>
    <table class="w-full" bind:this={wordlist}>
        {#each persistent.all as w}                
            <tr on:click={async () => {
                if (w.played == true || w.played == 'failed') {
                    navigator.clipboard.writeText(`WordBet - Word #${w.id} - ${w.emojis.length}/${w.bet}\n\n` + w.emojis.join('\n'));
                    toast.push('Copied grid to clipboard.')
                } else {
                    next();
                    selectWord(w.id);
                    page = 'game';
                }
            }} class="ahov {w.played == true ? 'bg-green-200' : ''} {w.played == 'failed' ? 'bg-red-200' : ''}">
                <td class="p-2 text-left">#{w.id}</td>
                {#if w.played == true || w.played == 'failed'}
                    <td class="w-full p-2 text-right">{w.word}</td>
                {:else}
                    <td class="w-full p-2 text-right">_ _ _ _ _</td>
                {/if}
            </tr>
        {/each}
    </table>
</div>

<div class="flex flex-col items-center justify-start w-full h-full max-h-screen px-5 py-5 mx-auto lg:w-1/4 lg:px-0 {page == 'settings' ? '' : 'hidden'}">
    <h1 class="text-3xl font-bold font-work ahov" on:click={() => {page = 'game'}}>Settings</h1>
    
    <a href="https://izmichael.xyz" class="mx-auto mt-1 text-sm italic text-center ahov">WordBet was built and designed by IzMichael.</a>
    <a href="https://www.powerlanguage.co.uk/wordle/" class="mx-auto mt-1 text-sm italic text-center ahov">Origin and early inspiration by Josh Wardle.</a>  

    <h3 class="mt-5 text-lg font-bold">Word Order</h3>
    <div class="flex flex-row items-center justify-between w-full">
        <p class="flex-1 mr-3 text-sm text-right">Random:<br>284, 153, 85...</p>
        <label class="switch">
            <input type="checkbox" on:change={(e) => {persistent.settings.order = (e.target.checked ? 'sequence' : 'random')}}>
            <span class="slider"></span>
        </label>
        <p class="flex-1 ml-3 text-sm">Sequential:<br>1, 2, 3...</p>
    </div>

    <p class="mt-5">{persistent.all.filter(w => w.played == true).length} Played / {persistent.all.length - persistent.all.filter(w => w.played == true).length} Remaining</p>
    <button class="w-full p-2 px-5 my-1 font-bold text-white bg-red-500 hover:bg-red-400 active:bg-red-500" on:click={() => {window.localStorage.setItem('played', 'false'); window.localStorage.setItem('gamescore', 0); window.location = window.location;}}>Reset Data</button>
    <p class="text-sm italic font-bold text-center text-red-600">WARNING: This action will reset your score, completed words, and all progress.<br>THIS ACTION IS IRREVERSIBLE.</p>

    <a href="https://izmichael.xyz/" class="w-full mt-32 text-sm text-center">Built by IzMichael - &copy; IzMichael 2022</a>
</div>

<style global>
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    /* Keyboard */

    .keyboard-base {
        padding: 0.5rem;
        background-color: #e4e4e4;
    }

    .key {
        flex: 1 1 0%;
        font-size: 15px;
        text-align: center;
        padding: 0.55rem 0.3rem;
        cursor: pointer;
        user-select: none;
    }

    .key:hover {
        background-color: #d6d6d6;
    }

    .grey {
        background-color: #a8a8a8;
    }

    .yellow {
        background-color: #dfe246;
    }

    .green {
        background-color: #12cc0f;
    }

    .u {
        flex: 1 1 0%;
        visibility: hidden;
    }

    /* Toasts */
    ._toastBar {
        display: none;
    }    

    .ahov {
        position: relative;
        cursor: pointer;
        user-select: none;
    }

    .ahov:after {
        content: '';
        position: absolute;
        width: 100%;
        transform: scaleX(0);
        height: 2px;
        bottom: 0;
        left: 0;
        background-color: #0087ca;
        transform-origin: bottom right;
        transition: transform 0.25s ease-out;
        transform-origin: bottom left;
    }

    .ahov:hover:after {
        transform: scaleX(1);
    }

    /* Settings Slider */
    .switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 34px;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #2196F3;
        -webkit-transition: .4s;
        transition: .4s;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        -webkit-transition: .4s;
        transition: .4s;
    }

    input:checked + .slider:before {
        -webkit-transform: translateX(26px);
        -ms-transform: translateX(26px);
        transform: translateX(26px);
    }
</style>