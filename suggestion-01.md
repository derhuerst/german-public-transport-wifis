# german-public-transport-wifis

## Suggestion for vehicle access points

### ToDo:
- [ ] More vehicle types? Ships? Airplane?
- [ ] How trams can be officially documented?
- [ ] How operators can be described clearly/unique? So far I have only used a Wikidata ID.

---------------------

```json5
{
  "vehicle": {
    //train, tram or bus
    "type": "train",
    //optional
    "local_ref": "ET 601, Wagen 1",
    //required if type=train, otherwise optional
    "uic": {
      //required, integer
      "type_code": "xx",
      //required, integer
      "country_code": "xx",
      //required, integer
      "series_number": "xxxx",
      //required, integer
      "order_number": "xxx",
      //required, integer
      "check_number": "x",
      //required
      "operator_id": "D-DB"
    },
    //optional, recommended if type=bus
    "vin": "SUU12345678901234",
    //required if type=bus, otherwise optional
    "registration_plate": "H XX 123",
    "operator": {
      "wikidata": "Q265625"
    }
  },
  //list of access points assigned to this vehicle
  "access_point": [
    {
      //required
      "bssid": "xx:xx:xx:xx:xx:xx",
      //ToDo: Do we need this value? (mac)
      "mac": "xx:xx:xx:xx:xx:xx",
      //optional
      "ssid": "WIFI@VEHICLE",
      //optional, float
      "frequency": 5.18,
      //optional, integer
      "channel": 36,
      //optional, boolean
      "encrypted": false
    }
  ]
}
```
