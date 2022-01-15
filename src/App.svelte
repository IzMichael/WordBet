<svelte:head>
    <title>WordBet - By IzMichael</title>
</svelte:head>

<script>
    import Row from './lib/Row.svelte';
    import { onMount } from 'svelte';

    let input = '     ',
    all, simple,
    allowinput, betinp;

    onMount(async () => {
        input = '';

        all = await fetch('/assets/words.json').then(res => {return res.json()});
        simple = await fetch('/assets/simple.json').then(res => {return res.json()});
        gamedata.word = simple[Math.floor(Math.random() * ((simple.length-1) - 0 + 1) + 0)].toUpperCase();
        allowinput = true;
    });
    
    function sleep(s) {
        return new Promise(resolve => setTimeout(resolve, (s * 1000)));
    }

    let alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    document.addEventListener('keydown', (e) => {
        if (allowinput == false) return;

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
        bet: 6,
        score: 0
    };
    $: window.localStorage.setItem('gamedata', JSON.stringify(gamedata));
    $: {
        if (betinp > 7) {
            betinp = 7;
        }
    }

    async function submit() {
        betinp.disabled = 'true';

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
                alert('you won!')

                gamedata.score += 5;

                gamedata.word = simple[Math.floor(Math.random() * ((simple.length-1) - 0 + 1) + 0)].toUpperCase();
                allowinput = true;
                betinp.disabled = 'false';
                gamedata.tries = [], gamedata.used = { green: [], yellow: [], grey: [] };
                [...document.querySelectorAll('.key')]
                .forEach(a => a.classList.remove('green', 'yellow', 'grey'));
            }
            
            input = '';
            await sleep(0.1);
            updateKeyboard();

            if (gamedata.tries.length >= gamedata.bet) {
                allowinput = false;
                input = gamedata.word;
            }
        } else {
            document.querySelector('.inputbg').style.borderColor = '#ee0000';
            await sleep(0.5)
            document.querySelector('.inputbg').style.borderColor = 'transparent';
            await sleep(0.5)
            document.querySelector('.inputbg').style.borderColor = '#ee0000';
            await sleep(0.5)
            document.querySelector('.inputbg').style.borderColor = 'transparent';
        }
    };

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
            console.log('GREY', letter)
            keys.filter(a => a.textContent == letter)[0].classList.add('grey')
        });
        await gamedata.used.yellow.forEach(letter => {
            console.log('YELLOW', letter)
            keys.filter(a => a.textContent == letter)[0].classList.add('yellow')
        });
        await gamedata.used.green.forEach(letter => {
            console.log('GREEN', letter)
            keys.filter(a => a.textContent == letter)[0].classList.add('green')
        });
    }
</script>

<div class="flex flex-col items-center justify-start w-full h-full max-h-screen px-5 py-5 mx-auto overflow-hidden lg:w-1/5 lg:px-0">
    <h1 class="text-3xl font-bold font-work">WordBet</h1>
    <p class="text-sm">Created by IzMichael</p>
    <p class="text-sm">Inspired by Wordle</p>

    <div class="flex flex-row items-center justify-start w-full p-1 mb-2 border border-gray-500">
        <div class="flex flex-row items-center justify-between flex-1">
            <p class="font-semibold whitespace-nowrap">Your Bet: </p>
            <input type="number" bind:value={gamedata.bet} bind:this={betinp} max=7 min=1 class="flex-1 pl-2">
        </div>

        <div class="flex flex-row items-center justify-between flex-1">
            <p class="flex-1 pr-2 font-semibold text-right whitespace-nowrap">Your Score: </p>
            <p>{gamedata.score}</p>
        </div>
    </div>

    <div class="relative flex flex-col items-center justify-start flex-1 w-full gap-2">
        <div class="w-full border inputbg" style="border-color: transparent;">
            <Row bind:word={gamedata.word} bind:value={input} input="true"></Row>
        </div>

        <hr class="w-full -my-1 transition-all duration-200 ease-linear border-gray-500" style="border-top-width: 0.125rem;">

        {#each gamedata.tries as attempt, i}
            <Row bind:word={gamedata.word} bind:value={attempt} bind:keys={gamedata.used} input="false"></Row>
        {/each}

        {#each {length: (gamedata.bet - gamedata.tries.length)} as _, i}
            <Row bind:word={gamedata.word} value="     " bind:keys={gamedata.used} input="true"></Row>
        {/each}

        <hr class="absolute top-0 w-full transition-all duration-200 ease-linear border-red-500" style="border-top-width: 0.125rem; margin-top: {3 * gamedata.bet + 2.95}rem;">
    </div>

    <div class="w-full mt-10">
        <div class="keyboard-base w-auto flex flex-col">
            <div class="flex flex-row justify-between max-w-full flex-1">
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
            <div class="flex flex-row justify-between max-w-full flex-1">
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
            <div class="flex flex-row justify-between max-w-full flex-1">
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
        font-size: 20px;
        text-align: center;
        padding: 0.55rem 0.5rem;
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
</style>