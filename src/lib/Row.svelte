<script>
    import Square from './Square.svelte';

    export let word = '', value = '', input = 'false';
</script>

<div class="flex flex-row items-center w-full h-10 gap-2 justify-evenly">
    <Square bind:value={value[0]} word="{word}" role="0" input={input}></Square>
    <Square bind:value={value[1]} word="{word}" role="1" input={input}></Square>
    <Square bind:value={value[2]} word="{word}" role="2" input={input}></Square>
    <Square bind:value={value[3]} word="{word}" role="3" input={input}></Square>
    <Square bind:value={value[4]} word="{word}" role="4" input={input}></Square>
</div>

<style>
    
</style>