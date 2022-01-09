<script>
    export let value = '', word = '', role = 0, input = 'false', keys;
    let box;
    
    $: {
        if (box && input == 'false') {
            if (word[role] == value) {
                box.style.backgroundColor = '#12cc0f';
                keys.green = [...keys.green, value];
                keys.green = keys.green.filter(function(item, pos, self) {
                    return self.indexOf(item) == pos;
                });
                keys.green = keys.green;
            } else if (word.includes(value)) {
                box.style.backgroundColor = '#dfe246';
                keys.yellow = [...keys.yellow, value];
                keys.yellow = keys.yellow.filter(function(item, pos, self) {
                    return self.indexOf(item) == pos;
                });
                keys.yellow = keys.yellow;
            } else {
                box.style.backgroundColor = '#a8a8a8';
                keys.grey = [...keys.grey, value];
                keys.grey = keys.grey.filter(function(item, pos, self) {
                    return self.indexOf(item) == pos;
                });
                keys.grey = keys.grey;
            }
        }
    }
</script>

<h3 bind:this={box} class="flex flex-col items-center justify-center w-10 h-10 p-2 text-lg lg:text-3xl border border-gray-400" style="text-transform:uppercase">{value || ''}</h3>

<style>
    
</style>