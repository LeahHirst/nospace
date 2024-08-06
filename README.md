# nospace
Nospace is an [esoteric programming language](https://en.wikipedia.org/wiki/Esoteric_programming_language) which compiles to [Whitespace](https://esolangs.org/wiki/Whitespace). Unlike Whitespace, Nospace programs are zero-width and single-lined, replacing spaces with zero-width spaces (`​`), tabs with zero-width non-joiners (`‌`), and feed lines with zero-width joiners (`‍`).

A Nospace compiler written in Whitespace is provided within this repository, however note that in order to use the compiler the Whitespace interpreter must support reading of UTF-8 string inputs. It is possible to use other Nospace compilers, such as this one written with sed:

```
sed -e 's/\xe2\x80\x8b/ /g' -e 's/\xe2\x80\x8c/\t/g' -e 's/\xe2\x80\x8d/\n/g' hello_world.ns > hello_world.ws
```

## Hello world
The following is a simple hello world program in Nospace:

```
​​​‌​​‌​​​‍‌‍​​​​​‌‌​​‌​‌‍‌‍​​​​​‌‌​‌‌​​‍‌‍​​​​​‌‌​‌‌​​‍‌‍​​​​​‌‌​‌‌‌‌‍‌‍​​​​​‌​‌‌​​‍‌‍​​​​​‌​​​​​‍‌‍​​​​​‌‌‌​‌‌‌‍‌‍​​​​​‌‌​‌‌‌‌‍‌‍​​​​​‌‌‌​​‌​‍‌‍​​​​​‌‌​‌‌​​‍‌‍​​​​​‌‌​​‌​​‍‌‍​​‍‍‍
```

outputs: `Hello, world`

More examples can be found in the [examples directory](https://github.com/LeahHirst/nospace/tree/main/examples).
