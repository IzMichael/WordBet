<script>
    export let value = '', word = '', role = 0, input = 'false';
    let box;
    
    $: {
        if (box && input == 'false') {
            if (word[role] == value) {
                box.style.backgroundColor = '#12cc0f';
            } else if (word.includes(value)) {
                box.style.backgroundColor = '#dfe246';
            } else {
                box.style.backgroundColor = '#a8a8a8';
            }
        }
    }
</script>

<h3 bind:this={box} class="flex flex-col items-center justify-center w-10 h-10 p-2 text-lg border border-gray-400 lg:text-3xl" style="text-transform:uppercase">{value || ''}</h3>

<style>
    
</style>