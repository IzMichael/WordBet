module.exports = {
    purge: {
        enabled: !process.env.ROLLUP_WATCH,
        content: ['./public/index.html', './src/**/*.svelte'],
        options: {
            defaultExtractor: content => [
                ...(content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []),
                ...(content.match(/(?<=class:)[^=>\/\s]*/g) || []),
            ],
        },
    },
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {},
        fontFamily: {
            'sans': ['Nunito Sans'],
            'work': ['Work Sans'],
            'mono': ['ui-monospace', 'SFMono-Regular', 'Consolas'],
            'serif': ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman'],
            'stnd': ['Roboto'],
            'hand': ['Patrick Hand'],
            'loop': ['Sacramento']
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
    mode: "jit",
}