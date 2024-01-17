// Code for WASM/JS taken from https://github.com/planetlabs/gpq

package main

import (
	"syscall/js"

	"github.com/paulmach/orb"
	"github.com/paulmach/orb/geojson"
	"github.com/paulmach/orb/simplify"
)

// Helper funcs for returning errors/values
const (
	errorKey = "error"
	valueKey = "value"
)

func returnFromErrorMessage(message string) map[string]interface{} {
	return map[string]interface{}{errorKey: message}
}

func returnFromError(err error) map[string]interface{} {
	return returnFromErrorMessage(err.Error())
}

func returnFromValue(value interface{}) map[string]interface{} {
	return map[string]interface{}{valueKey: value}
}

// Line GeoJSON to Simplified Version
func ProcessGeoJSON(this js.Value, args []js.Value) any {

	numBytes := args[0].Length()
	data := make([]byte, numBytes)
	js.CopyBytesToGo(data, args[0])

	thresholdValue := args[1].Float()

	fc, err := geojson.UnmarshalFeatureCollection(data)
	if err != nil {
		return returnFromError(err)
	}

	simplifiedFC := geojson.NewFeatureCollection()

	for _, feature := range fc.Features {
		lineString := feature.Geometry.(orb.LineString)
		simplifiedLine := simplify.DouglasPeucker(thresholdValue).Simplify(lineString.Clone())
		simplifiedFeature := geojson.NewFeature(simplifiedLine)
		simplifiedFeature.Properties = feature.Properties
		simplifiedFC.Append(simplifiedFeature)
	}

	simplifiedRawJSON, err := simplifiedFC.MarshalJSON()
	if err != nil {
		return returnFromError(err)
	}

	return returnFromValue(string(simplifiedRawJSON))
}

func main() {
	js.Global().Set("ProcessGeoJSON", js.FuncOf(ProcessGeoJSON))

	<-make(chan struct{}, 0)
}
