typesuggest
===========
Auto suggest plugin for jQuery.

#how to use
`$(element).suggest(data, options);`

#options

###data
```
data: false,
```
Type: **Array**
Strings or Objects with data to be searched

###min_characters
```
min_characters: 2,
```
Typer : **Integer**
minimum characters before making a suggestion

###display_keys
```
display_keys: ['foo', 'bar'],
```
Type: **Array**
keys to display in suggest menu

###search_keys
```
search_keys: ['name'],
```
Type: **Array**
keys to compare with input value

###ajax
```
ajax: false,
```
Type: **Boolean**
whether or not to use ajax. If false, data key must be defined.

###url
```
url: '',
```
Type: **String**
ajax request URL

###param
```
param: 'q',
```
Type: **String**
ajax query param

###beforeSend
```
beforeSend: undefined,
```
Type: **Function**
function to run before ajax call

###callback
```
callback: undefined,
```
Type: **Function**
Params: **option** (selected option)
function to run when a selection is made

###results_key
```
results_key: 'results'
```
Type: **String**
key in response where search results live, (ex: `[ results: [ {...}, {...} ] ]`)