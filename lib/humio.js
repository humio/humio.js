var Humio = {};

Humio.init = function init(ingestToken) {
  Humio.ingestToken = ingestToken;
};

Humio.registerGlobalErrorHandler = function registerGlobalErrorHandler(parserId) {
  window.addEventListener("error", function(event) {
    if (!Humio.ingestToken) {
      console.error("No Humio.ingestToken configured.")
    }

    var url = "https://ops.humio.com/api/v1/dataspaces/humio/ingest-messages";

    var request = [
      {
        "type": parserId,
        "fields": {
          "url": event.filename,
          "message": event.message,
          "line": event.lineno.toString,
          "column": event.colno.toString,
          "stack": event.error.stack
        },
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

export default Humio;
