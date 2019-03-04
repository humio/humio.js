var Humio = {};

Humio.init = function init(ingestToken) {
  Humio.ingestToken = ingestToken;
};

function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

Humio.registerGlobalErrorHandler = function registerGlobalErrorHandler(window, parserId, additionalFields) {
  additionalFields = additionalFields || {};
  window.addEventListener("error", function(event) {
    if (!Humio.ingestToken) {
      console.error("No Humio.ingestToken configured.")
    }

    var url = "https://cloud.humio.com/api/v1/dataspaces/humio/ingest-messages";

    var fields = {
      "url": window.location.href,
      "hostname": extractHostname(window.location.href),
      "message": event.message,
      "filename": event.filename,
      "line": (event.lineno && event.lineno.toString),
      "column": (event.colno && event.colno.toString),
      "stack": (event.error && event.error.stack),
    };

    Object.assign(fields, additionalFields);

    for (var f in fields) {
      if (typeof fields[f] !== "string") {
        delete fields[f];
      }
    }

    var request = [
      {
        "type": parserId,
        "fields": fields,
        "messages": [
          event.message
        ]
      }
    ]

    fetch(url, {
      method: 'POST',
      body: JSON.stringify(request),
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + Humio.ingestToken
      })
    }).catch(error => console.log('error:', error));
  });
}

module.exports = Humio;
