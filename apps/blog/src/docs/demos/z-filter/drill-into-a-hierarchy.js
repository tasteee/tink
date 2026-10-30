const tree = [{value:'work',label:'Work',children:[{value:'design',label:'Design'},{value:'engineering',label:'Engineering'}]},{value:'life',label:'Life',children:[{value:'travel',label:'Travel'}]}]

const filter = document.querySelector('#filter')
filter.options = tree
