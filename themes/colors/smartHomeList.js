/** 
 * List the configured chargepoints and their key data
 * 
 */

class SmartHomeList {

  div;

  constructor() {
    var consumers = [];
  };

  // initialize after document is created
  init() {
    this.div = d3.select("div#smartHomeTable");
  }

  // update if data has changed
  update() {
    this.updateValues();
    this.div.selectAll("*").remove();

    if (this.consumers.length > 0) {
      d3.select("div#smartHomeWidget").classed("hide", false);
      var table = this.div.append("table")
        .attr("class", "table table-borderless table-condensed p-0 m-0");
      // table.attr("style", "border-spacing:0;")

      const headers = ["Gerät", "Verbrauch", "Laufzeit", "Modus"];
      const thead = table.append("thead")
        .selectAll("headers")
        .data(headers).enter()
        .append("th")
        .attr("style", (data, i) => (i == 0) ? "color:white;text-align:left;"
                                              : "color:white;text-align:center;")
        .attr("class", "tablecell ")
        .text((data) => data)
        ;

      const rows = table.append("tbody").selectAll("rows")
        .data(this.consumers).enter()
        .append("tr")
        .attr("style", row => this.calcColor(row));

      const cell = rows.append("td")
        .attr("class", "tablecell py-1 px-1")
        .attr("onClick", (row, i) => "shDeviceClicked(" + i + ")")
        .attr("id", (row, i) => "shbutton-" + i)
        .attr("style", "text-align:left; vertical-align:middle;");

        cell.append("span")
        .attr("class", (row) => row.isOn ? "fa fa-toggle-on text-green pr-2" : "fa fa-toggle-off text-red pr-2");
        
        cell.append("span")
        .text(row => row.name);
      
        
    
    /*     if (row.isEnabled) { 
          cell.append("span")
          .attr("class", "fa fa-toggle-on text-green px-2")
         } else {
          cell.append("span")
           .attr("class", "fa fa-toggle-off text-red px-2")
        } */
      rows.append("td")
        .attr("class", "tablecell py-1 px-1")
        .attr("style", "vertical-align: middle;")
        .text(row => formatWatt(row.power) + " (" + formatWattH (row.energy*1000) + ")");

      rows.append("td")
        .attr("class", "tablecell py-1 px-1")
        .attr("style", "vertical-align: middle;")
        .text(row => formatTime(row.runningTime))

      rows.append("td")
        .attr("class", "tablecell py-1 px-1")
        .append("button")
        .attr("id", (row, i) => "shmodebutton-" + i)
        .attr("class", row => this.modeClass(row))
        .attr("style", row => this.calcColor(row))
        .attr("onClick", (row, i) => "shModeClicked(" + i + ")")
        .classed("disabled", false)
        .text(row => row.isAutomatic ? "Automatik" : "Manuell");
    }
    else {
      d3.select("div#smartHomeWidget").classed("hide", true);
    }
  }
  calcColor(row) {
    return ("color:" + row.color + "; text-align:center");
  }

  buttonClass = "btn btn-sm";

  deviceClass(row) {
    return (this.buttonClass + (row.isOn ? " btn-outline-success" : " btn-outline-danger"));
  }

  modeClass(row) {
    return (this.buttonClass + (row.isAutomatic ? " btn-outline-info" : " btn-outline-warning"));

  }

  updateValues() {
    this.consumers = wbdata.shDevice.filter(dv => dv.configured);
  }
}

function shModeClicked(i) {
  // send mqtt set to enable/disable Device after click
  if (wbdata.shDevice[i].isAutomatic) {
    publish("1", "openWB/config/set/SmartHome/Devices/" + (+i + 1) + "/mode");
  } else {
    publish("0", "openWB/config/set/SmartHome/Devices/" + (+i + 1) + "/mode");
  }
  d3.select("button#shmodebutton-" + i)
    .classed("disabled", true);
};

function shDeviceClicked(i) {
  if (!wbdata.shDevice[i].isAutomatic) {
    if (wbdata.shDevice[i].isOn) {
      publish("0", "openWB/config/set/SmartHome/Device" + (+i + 1) + "/device_manual_control");
    } else {
      publish("1", "openWB/config/set/SmartHome/Device" + (+i + 1) + "/device_manual_control");
    }
    d3.select("button#shbutton-" + i)
      .classed("disabled", true)
  }
}

var smartHomeList = new SmartHomeList();



