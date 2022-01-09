<script>
    import Square from './Square.svelte';

    export let word = '', value = '', input = 'false', keys;
</script>

<div class="flex flex-row items-center justify-evenly w-full h-10 gap-2">
    <Square bind:value={value[0]} word="{word}" role="0" input={input} bind:keys></Square>
    <Square bind:value={value[1]} word="{word}" role="1" input={input} bind:keys></Square>
    <Square bind:value={value[2]} word="{word}" role="2" input={input} bind:keys></Square>
    <Square bind:value={value[3]} word="{word}" role="3" input={input} bind:keys></Square>
    <Square bind:value={value[4]} word="{word}" role="4" input={input} bind:keys></Square>
</div>

<style>
    
</style>