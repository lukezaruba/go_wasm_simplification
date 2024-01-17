# go_wasm_simplification

A simple example using Go via JavaScript with WASM for geospatial processing.

This example showcases the possibilities of bringing data processing to the client by exposing high performance Go code to JavaScript in the browser, via Web Assembly (WASM). Line simplification is done with the [orb](https://github.com/paulmach/orb) on input GeoJSON files containing line features. The implementation of Go-WASM-JavaScript interfacing is heavily inspired (and copied, for most of it) by [gpq](https://github.com/planetlabs/gpq)'s implementation.
